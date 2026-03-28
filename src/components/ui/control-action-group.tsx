"use client";

import type { MissionControlAction } from "@/types/mission-control";

const intentClassName = (intent: MissionControlAction["intent"]) => {
  if (intent === "destructive") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100 hover:border-rose-200/50";
  }

  if (intent === "high-impact") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-100 hover:border-amber-200/45";
  }

  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/45";
};

type ControlActionGroupProps = {
  actions: MissionControlAction[];
  pendingActionId?: string | null;
  onAction: (action: MissionControlAction) => void;
};

export const ControlActionGroup = ({
  actions,
  pendingActionId,
  onAction
}: ControlActionGroupProps) => {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action)}
          disabled={pendingActionId === action.id}
          className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.22em] transition disabled:cursor-wait disabled:opacity-60 ${intentClassName(action.intent)}`}
        >
          {pendingActionId === action.id ? "Routing..." : action.label}
        </button>
      ))}
    </div>
  );
};
