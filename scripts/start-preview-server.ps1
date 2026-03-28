$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root "output"
$next = Join-Path $root "node_modules/.bin/next.cmd"

if (-not (Test-Path $next)) {
  throw "next.cmd not found. Run from the project root after dependencies are installed."
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$listener.Start()
$port = ($listener.LocalEndpoint).Port
$listener.Stop()

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$runId = (Get-Date -Format "yyyyMMdd-HHmmss")
$stdout = Join-Path $outputDir ("app-server-" + $runId + ".log")
$stderr = Join-Path $outputDir ("app-server-" + $runId + ".err.log")
$command = '"' + $next + '" dev --hostname 127.0.0.1 --port ' + $port

$process = Start-Process -FilePath "cmd.exe" `
  -ArgumentList @("/c", $command) `
  -WorkingDirectory $root `
  -RedirectStandardOutput $stdout `
  -RedirectStandardError $stderr `
  -WindowStyle Hidden `
  -PassThru

$deadline = (Get-Date).AddSeconds(60)
$ready = $false

while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -Uri ("http://127.0.0.1:" + $port) -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

if (-not $ready) {
  Write-Output ("PID={0} PORT={1} READY=false" -f $process.Id, $port)
  Get-Content $stdout -ErrorAction SilentlyContinue | Select-Object -Last 40
  Get-Content $stderr -ErrorAction SilentlyContinue | Select-Object -Last 40
  exit 1
}

Set-Content -Path (Join-Path $outputDir "live-server.json") -Value (@{
  pid = $process.Id
  port = $port
  url = "http://127.0.0.1:$port"
  stdout = $stdout
  stderr = $stderr
} | ConvertTo-Json -Compress)

Write-Output ("PID={0} PORT={1} READY=true" -f $process.Id, $port)
