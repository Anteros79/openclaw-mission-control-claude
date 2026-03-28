"use client";

import { create } from "zustand";

import type { MissionDataAdapter } from "@/adapters/types";
import { appConfig } from "@/lib/app-config";
import { injectMockActivity } from "@/lib/mission-control-runtime";
import type {
  MissionControlAction,
  MissionControlActionInput,
  MissionControlActionResult,
  MissionControlSnapshot
} from "@/types/mission-control";

export type MissionConnectionState = "degraded" | "idle" | "live" | "loading";

type MissionState = {
  snapshot: MissionControlSnapshot | null;
  connectionState: MissionConnectionState;
  pendingActionId: string | null;
  requestedAction: MissionControlAction | null;
  lastActionResult: MissionControlActionResult | null;
  connect: (adapter: MissionDataAdapter) => () => void;
  refresh: () => Promise<void>;
  requestAction: (action: MissionControlAction) => void;
  cancelRequestedAction: () => void;
  confirmRequestedAction: () => Promise<void>;
  clearLastActionResult: () => void;
};

let activeAdapter: MissionDataAdapter | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let telemetryTimer: ReturnType<typeof setInterval> | null = null;

const clearTimers = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }
};

const toActionInput = (action: MissionControlAction): MissionControlActionInput => ({
  actionId: action.id,
  targetKind: action.targetKind,
  targetId: action.targetId,
  command: action.command
});

export const useMissionStore = create<MissionState>()((set, get) => ({
  snapshot: null,
  connectionState: "idle",
  pendingActionId: null,
  requestedAction: null,
  lastActionResult: null,
  connect: (adapter) => {
    activeAdapter = adapter;
    clearTimers();

    const load = async () => {
      set((state) => ({
        connectionState: state.snapshot ? "live" : "loading"
      }));

      try {
        const snapshot = await adapter.getSnapshot();
        set({
          snapshot,
          connectionState: "live"
        });
      } catch {
        set({
          connectionState: "degraded"
        });
      }
    };

    void load();

    refreshTimer = setInterval(() => {
      void get().refresh();
    }, 20000);

    if (appConfig.featureFlags.mockTelemetry) {
      telemetryTimer = setInterval(() => {
        set((state) => ({
          snapshot: state.snapshot ? injectMockActivity(state.snapshot) : state.snapshot
        }));
      }, 45000);
    }

    return () => {
      clearTimers();
      activeAdapter = null;
    };
  },
  refresh: async () => {
    if (!activeAdapter) return;

    try {
      const snapshot = await activeAdapter.getSnapshot();
      set({
        snapshot,
        connectionState: "live"
      });
    } catch {
      set({
        connectionState: "degraded"
      });
    }
  },
  requestAction: (action) => {
    set({
      requestedAction: action
    });
  },
  cancelRequestedAction: () => {
    set({
      requestedAction: null
    });
  },
  confirmRequestedAction: async () => {
    if (!activeAdapter) return;

    const requestedAction = get().requestedAction;
    if (!requestedAction) return;

    set({
      pendingActionId: requestedAction.id
    });

    try {
      const response = await activeAdapter.runControlAction(toActionInput(requestedAction));
      set({
        snapshot: response.snapshot,
        requestedAction: null,
        pendingActionId: null,
        lastActionResult: response.result,
        connectionState: "live"
      });
    } catch {
      set({
        pendingActionId: null,
        requestedAction: null,
        lastActionResult: {
          actionId: requestedAction.id,
          targetKind: requestedAction.targetKind,
          targetId: requestedAction.targetId,
          status: "failed",
          message: `${requestedAction.label} failed before Giles acknowledged it.`,
          completedAt: new Date().toISOString().replace("T", " ").slice(0, 16)
        },
        connectionState: "degraded"
      });
    }
  },
  clearLastActionResult: () => {
    set({
      lastActionResult: null
    });
  }
}));
