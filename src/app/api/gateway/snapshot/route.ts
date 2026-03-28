import { NextResponse } from "next/server";
import { fetchGatewayPayload } from "@/lib/gateway-state";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await fetchGatewayPayload();

  if (!payload) {
    return NextResponse.json({ error: "GILES_GATEWAY_URL not configured" }, { status: 503 });
  }

  if (payload.error) {
    return NextResponse.json({ error: payload.error }, { status: 502 });
  }

  return NextResponse.json(payload);
}
