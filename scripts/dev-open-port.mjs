import { createServer } from "net";
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const PREFERRED = 3001;
const RANGE_START = 3001;
const RANGE_END = 3099;

function findOpenPort(preferred, start, end) {
  return new Promise((res, rej) => {
    const tryPort = (port) => {
      if (port > end) return rej(new Error("No open port found in range"));
      const srv = createServer();
      srv.once("error", () => tryPort(port + 1));
      srv.once("listening", () => srv.close(() => res(port)));
      srv.listen(port, "127.0.0.1");
    };
    tryPort(preferred);
  });
}

// Respect PORT env var (set by preview_start / autoPort), otherwise find one
const envPort = process.env.PORT ? Number(process.env.PORT) : null;
const port = envPort || (await findOpenPort(PREFERRED, RANGE_START, RANGE_END));

console.log(`\n  ► Starting Next.js dev on port ${port}\n`);

const child = spawn("npx", ["next", "dev", "--port", String(port)], {
  cwd: root,
  stdio: "inherit",
  shell: true
});

child.on("exit", (code) => process.exit(code ?? 0));
