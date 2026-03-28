import type {
  MissionControlActionInput,
  MissionControlActionResult,
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
};
