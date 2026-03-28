import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";
import { applyControlAction } from "@/lib/mission-control-runtime";
import type { MissionDataAdapter } from "@/adapters/types";

export const createSeedAdapter = (): MissionDataAdapter => {
  let snapshot = createSeedMissionControlSnapshot();

  return {
    async getSnapshot() {
      return snapshot;
    },
    async runControlAction(input) {
      const applied = applyControlAction(snapshot, input);
      snapshot = applied.snapshot;

      return applied;
    }
  };
};
