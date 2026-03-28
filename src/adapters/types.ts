import type {
  MissionChatMessageInput,
  MissionControlActionInput,
  MissionControlActionResult,
  MissionMoveTaskInput,
  MissionControlSnapshot,
  MissionEventEnvelope
} from "@/types/mission-control";

export type MissionDataAdapter = {
  getSnapshot: () => Promise<MissionControlSnapshot>;
  runControlAction: (input: MissionControlActionInput) => Promise<{
    event?: MissionEventEnvelope;
    result: MissionControlActionResult;
    snapshot: MissionControlSnapshot;
  }>;
  moveTaskCard: (input: MissionMoveTaskInput) => Promise<MissionControlSnapshot>;
  sendChatMessage: (input: MissionChatMessageInput) => Promise<MissionControlSnapshot>;
};
