"use client";

import type { MissionControlAction } from "@/types/mission-control";

type ConfirmationDialogProps = {
  action: MissionControlAction | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmationDialog = ({
  action,
  isSubmitting,
  onCancel,
  onConfirm
}: ConfirmationDialogProps) => {
  if (!action) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-x-4 top-1/2 z-[80] mx-auto w-[min(92vw,560px)] -translate-y-1/2 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,16,12,0.98),rgba(4,8,10,0.96))] p-6 shadow-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-emerald-200/70">
          Gateway-routed confirmation
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.1em] text-white">
          {action.label}
        </h3>
        <p className="mt-4 text-sm leading-6 text-white/72">{action.description}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-white/40">
          Target {action.targetKind} · {action.targetId} · via Giles
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/12 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/72 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-full border border-emerald-300/35 bg-emerald-300/12 px-4 py-2 text-xs uppercase tracking-[0.22em] text-emerald-100 transition hover:border-emerald-200/50 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Routing..." : "Confirm"}
          </button>
        </div>
      </div>
    </>
  );
};
