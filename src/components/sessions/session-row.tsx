import { ControlActionGroup } from "@/components/ui/control-action-group";
import { EntityLinkList } from "@/components/ui/entity-link-list";
import { StatusPill } from "@/components/ui/status-pill";
import { useMissionStore } from "@/stores/mission-store";
import type { MissionSession } from "@/types/mission-control";

export const SessionRow = ({ session }: { session: MissionSession }) => {
  const pendingActionId = useMissionStore((state) => state.pendingActionId);
  const requestAction = useMissionStore((state) => state.requestAction);

  return (
    <div
      id={session.id}
      className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-lg text-white">{session.label}</p>
            <StatusPill tone={session.status}>{session.status}</StatusPill>
          </div>
          <p className="mt-2 text-sm text-white/68">{session.scope}</p>
          <p className="mt-2 text-sm text-white/55">{session.lastMessage}</p>
        </div>
        <div className="grid gap-3 text-xs uppercase tracking-[0.24em] text-white/38 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3">
            <span>{session.operator}</span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3">
            <span>{session.startedAt}</span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3">
            <span>{session.tokens}</span>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3">
            <span>{session.cost}</span>
          </div>
        </div>
      </div>
      {session.links.length > 0 ? (
        <div className="mt-4">
          <EntityLinkList links={session.links} />
        </div>
      ) : null}
      <div className="mt-4">
        <ControlActionGroup
          actions={session.actions}
          pendingActionId={pendingActionId}
          onAction={requestAction}
        />
      </div>
    </div>
  );
};
