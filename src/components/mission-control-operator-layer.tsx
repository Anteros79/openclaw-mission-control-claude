"use client";

import { useEffect } from "react";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useMissionStore } from "@/stores/mission-store";

export const MissionControlOperatorLayer = () => {
  const requestedAction = useMissionStore((state) => state.requestedAction);
  const pendingActionId = useMissionStore((state) => state.pendingActionId);
  const lastActionResult = useMissionStore((state) => state.lastActionResult);
  const cancelRequestedAction = useMissionStore((state) => state.cancelRequestedAction);
  const clearLastActionResult = useMissionStore((state) => state.clearLastActionResult);
  const confirmRequestedAction = useMissionStore((state) => state.confirmRequestedAction);

  useEffect(() => {
    if (!lastActionResult) return;

    const timeout = setTimeout(() => {
      clearLastActionResult();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [clearLastActionResult, lastActionResult]);

  return (
    <>
      <ConfirmationDialog
        action={requestedAction}
        isSubmitting={pendingActionId === requestedAction?.id}
        onCancel={cancelRequestedAction}
        onConfirm={() => void confirmRequestedAction()}
      />

      {lastActionResult ? (
        <div className="fixed bottom-24 left-1/2 z-[60] w-[min(92vw,540px)] -translate-x-1/2 rounded-full border border-white/10 bg-black/72 px-5 py-3 text-sm text-white shadow-[0_0_24px_rgba(34,197,94,0.18)] backdrop-blur-xl lg:bottom-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-200/70">
            {lastActionResult.status}
          </span>
          <p className="mt-1 text-white/80">{lastActionResult.message}</p>
        </div>
      ) : null}
    </>
  );
};
