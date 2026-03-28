import { Clock } from "lucide-react";

import { ControlActionGroup } from "@/components/ui/control-action-group";
import { StatusPill } from "@/components/ui/status-pill";
import { useMissionStore } from "@/stores/mission-store";
import type { MissionCronJob } from "@/types/mission-control";

export const SystemsCronTable = ({ cronJobs }: { cronJobs: MissionCronJob[] }) => {
  const pendingActionId = useMissionStore((state) => state.pendingActionId);
  const requestAction = useMissionStore((state) => state.requestAction);

  return (
    <div className="space-y-3">
      {cronJobs.map((job) => (
      <div
        key={job.id}
        className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
      >
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-4 w-4 text-white/35" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/75">{job.name}</p>
              <StatusPill tone={job.status}>{job.status}</StatusPill>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">
              {job.schedule} · owner {job.ownerNodeId} · next {job.nextRun}
            </p>
            <p className="mt-1 text-sm text-white/55">
              Last run {job.lastRun} · duration {job.duration} · model {job.model}
            </p>
            {job.failureReason ? (
              <p className="mt-2 text-sm text-rose-200/80">Failure: {job.failureReason}</p>
            ) : null}
            <div className="mt-3">
              <ControlActionGroup
                actions={job.actions}
                pendingActionId={pendingActionId}
                onAction={requestAction}
              />
            </div>
          </div>
        </div>
      </div>
      ))}
    </div>
  );
};
