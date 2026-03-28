import { createApiAdapter } from "@/adapters/api-adapter";
import type { MissionDataAdapter } from "@/adapters/types";

export const createDataAdapter = (): MissionDataAdapter => createApiAdapter();
