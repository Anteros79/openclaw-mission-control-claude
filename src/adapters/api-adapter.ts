import type { MissionDataAdapter } from "@/adapters/types";
import type {
  MissionChatMessageInput,
  MissionControlActionResult,
  MissionControlSnapshot,
  MissionEventEnvelope,
  MissionMoveTaskInput
} from "@/types/mission-control";

const readJson = async <T>(response: Response) => {
  const body = (await response.json()) as T;
  return body;
};

export const createApiAdapter = (): MissionDataAdapter => ({
  async getSnapshot() {
    const response = await fetch("/api/gateway/state", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("snapshot_unavailable");
    }

    const body = await readJson<{ snapshot: MissionControlSnapshot }>(response);
    return body.snapshot;
  },
  async runControlAction(input) {
    const response = await fetch("/api/gateway/control", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error("control_failed");
    }

    const body = await readJson<{
      event?: MissionEventEnvelope;
      result: MissionControlActionResult;
      snapshot: MissionControlSnapshot;
    }>(response);

    return body;
  },
  async moveTaskCard(input: MissionMoveTaskInput) {
    const response = await fetch("/api/gateway/state", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "move_task",
        ...input
      })
    });

    if (!response.ok) {
      throw new Error("task_move_failed");
    }

    const body = await readJson<{ snapshot: MissionControlSnapshot }>(response);
    return body.snapshot;
  },
  async sendChatMessage(input: MissionChatMessageInput) {
    const response = await fetch("/api/gateway/state", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        type: "send_chat_message",
        ...input
      })
    });

    if (!response.ok) {
      throw new Error("chat_send_failed");
    }

    const body = await readJson<{ snapshot: MissionControlSnapshot }>(response);
    return body.snapshot;
  }
});
