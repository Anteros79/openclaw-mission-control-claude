import { createLiveAdapter } from "@/adapters/live-adapter";
import { createSeedAdapter } from "@/adapters/seed-adapter";
import type { MissionDataAdapter } from "@/adapters/types";

export const createDataAdapter = (): MissionDataAdapter => {
  // Use live adapter when gateway URL is configured; fall back to seed data
  if (process.env.NEXT_PUBLIC_USE_LIVE_DATA === "true") {
    return createLiveAdapter();
  }
  return createSeedAdapter();
};
