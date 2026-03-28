import { NextResponse } from "next/server";
import { z } from "zod";
import { getGatewayClient } from "@/lib/gateway-ws-client";
import { applyPersistedControlAction } from "@/lib/mission-control-repository";

const controlSchema = z.object({
  actionId: z.string().min(1),
  targetKind: z.enum(["agent", "cron", "service", "session"]),
  targetId: z.string().min(1),
  command: z.enum([
    "archive",
    "drain",
    "pause",
    "restart",
    "resume",
    "retry",
    "run_now",
    "terminate"
  ]),
  confirmationNote: z.string().optional()
});

const stamp = () => new Date().toISOString().replace("T", " ").slice(0, 16);

export async function POST(request: Request) {
  const payload = controlSchema.parse(await request.json());
  const client = getGatewayClient();

  if (!client) {
    const applied = await applyPersistedControlAction(payload);

    return NextResponse.json({
      event: applied.event,
      result: {
        ...applied.result,
        message: `${payload.command} simulated locally because GILES_GATEWAY_URL is not configured.`
      },
      snapshot: applied.snapshot
    });
  }

  // Map our control actions to the gateway's WS methods
  const methodMap: Record<string, { method: string; params: Record<string, unknown> }> = {
    "cron:run_now": { method: "cron.run", params: { id: payload.targetId, mode: "manual" } },
    "cron:pause": { method: "cron.update", params: { id: payload.targetId, patch: { enabled: false } } },
    "cron:resume": { method: "cron.update", params: { id: payload.targetId, patch: { enabled: true } } },
    "session:archive": { method: "sessions.delete", params: { key: payload.targetId, deleteTranscript: false } },
    "session:resume": { method: "sessions.patch", params: { key: payload.targetId } }
  };

  const key = `${payload.targetKind}:${payload.command}`;
  const mapped = methodMap[key];

  if (!mapped) {
    const applied = await applyPersistedControlAction(payload);

    return NextResponse.json({
      event: applied.event,
      result: {
        ...applied.result,
        message: `${payload.command} acknowledged (no gateway mapping for ${key}).`
      },
      snapshot: applied.snapshot
    });
  }

  try {
    await client.request(mapped.method, mapped.params);
    const applied = await applyPersistedControlAction(payload);

    return NextResponse.json({
      event: applied.event,
      result: {
        ...applied.result,
        message: `${payload.command} routed through Giles via WebSocket.`
      },
      snapshot: applied.snapshot
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "gateway error";
    return NextResponse.json(
      {
        result: {
          actionId: payload.actionId,
          status: "failed",
          message: `Gateway rejected ${payload.command}: ${message}`,
          completedAt: stamp()
        }
      },
      { status: 502 }
    );
  }
}
