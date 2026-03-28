import { NextResponse } from "next/server";
import { z } from "zod";

import { fetchGatewayPayload, mergeGatewayPayloadIntoSnapshot } from "@/lib/gateway-state";
import {
  appendChatMessageToSnapshot,
  moveTaskCardInSnapshot,
  readMissionSnapshot,
  updateMissionSnapshot,
  writeMissionSnapshot
} from "@/lib/mission-control-repository";

export const dynamic = "force-dynamic";

const mutationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("move_task"),
    cardId: z.string().min(1),
    sourceColumnId: z.string().min(1),
    targetColumnId: z.string().min(1)
  }),
  z.object({
    type: z.literal("send_chat_message"),
    threadId: z.string().min(1),
    content: z.string(),
    attachments: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        kind: z.enum(["image", "pdf", "markdown", "config"]),
        sizeLabel: z.string().min(1)
      })
    )
  })
]);

export async function GET() {
  const storedSnapshot = await readMissionSnapshot();
  const payload = await fetchGatewayPayload();
  const snapshot = payload ? mergeGatewayPayloadIntoSnapshot(payload, storedSnapshot) : storedSnapshot;

  if (payload && !payload.error) {
    await writeMissionSnapshot(snapshot);
  }

  return NextResponse.json({ snapshot });
}

export async function POST(request: Request) {
  const mutation = mutationSchema.parse(await request.json());

  const snapshot = await updateMissionSnapshot((currentSnapshot) => {
    if (mutation.type === "move_task") {
      return moveTaskCardInSnapshot(currentSnapshot, mutation);
    }

    return appendChatMessageToSnapshot(currentSnapshot, mutation);
  });

  return NextResponse.json({ snapshot });
}
