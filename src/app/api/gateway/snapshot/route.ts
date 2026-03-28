import { NextResponse } from "next/server";
import { getGatewayClient } from "@/lib/gateway-ws-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = getGatewayClient();

  if (!client) {
    return NextResponse.json({ error: "GILES_GATEWAY_URL not configured" }, { status: 503 });
  }

  try {
    const [sessions, agents, cronList, cronStatus, health] = await Promise.all([
      client.request("sessions.list", {}).catch(() => null),
      client.request("agents.list", {}).catch(() => null),
      client.request("cron.list", { includeDisabled: true, limit: 50, offset: 0 }).catch(() => null),
      client.request("cron.status", {}).catch(() => null),
      client.request("config.get", {}).catch(() => null)
    ]);

    return NextResponse.json({ sessions, agents, cronList, cronStatus, health });
  } catch (err) {
    const message = err instanceof Error ? err.message : "gateway error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
