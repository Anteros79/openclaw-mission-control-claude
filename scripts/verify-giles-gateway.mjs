import { execFileSync } from "node:child_process";

const expectedMarker =
  process.env.MISSION_CONTROL_EXPECTED_MARKER ?? "PhoenixClaw Mission Control";

const readTailnetStatus = () => {
  const raw = execFileSync("tailscale", ["status", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  return JSON.parse(raw);
};

const resolveGilesGatewayUrl = (status) => {
  const peers = Object.values(status.Peer ?? {});
  const gilesPeer = peers.find((peer) => String(peer.HostName).toLowerCase() === "giles");

  if (!gilesPeer?.DNSName) {
    throw new Error("Unable to resolve Giles from `tailscale status --json`.");
  }

  return `https://${String(gilesPeer.DNSName).replace(/\.$/, "")}`;
};

const extractTitle = (html) => html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "unknown";

const main = async () => {
  const status = readTailnetStatus();
  const gatewayUrl = resolveGilesGatewayUrl(status);
  const response = await fetch(gatewayUrl, { redirect: "follow" });
  const html = await response.text();

  if (!response.ok) {
    throw new Error(`Giles gateway responded with HTTP ${response.status} at ${gatewayUrl}.`);
  }

  if (!html.includes(expectedMarker)) {
    const title = extractTitle(html);

    throw new Error(
      `Giles gateway is reachable at ${gatewayUrl} but is serving unexpected content (${title}). Expected marker: ${expectedMarker}.`
    );
  }

  console.log(`Giles gateway verified at ${gatewayUrl}.`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
