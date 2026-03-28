import Link from "next/link";

import { ControlActionGroup } from "@/components/ui/control-action-group";
import { StatusPill } from "@/components/ui/status-pill";
import { useMissionStore } from "@/stores/mission-store";
import type { MissionService } from "@/types/mission-control";

export const ServiceRow = ({ service }: { service: MissionService }) => {
  const pendingActionId = useMissionStore((state) => state.pendingActionId);
  const requestAction = useMissionStore((state) => state.requestAction);

  return (
    <div className="grid gap-4 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr]">
        <div>
          <p className="text-sm text-white">{service.name}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/38">
            Owner {service.ownerNodeId}
          </p>
          <Link
            href={service.route}
            className="mt-3 inline-flex rounded-full border border-emerald-300/18 bg-emerald-300/8 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-emerald-200/75 transition hover:border-emerald-200/30 hover:text-emerald-100"
          >
            {service.routeLabel}
          </Link>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/34">Runtime</p>
          <p className="mt-2 text-sm text-white/68">{service.runtime}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/34">Cost</p>
          <p className="mt-2 text-sm text-white/68">{service.cost}</p>
        </div>
        <div className="flex items-start justify-end md:justify-start">
          <StatusPill tone={service.status}>{service.status}</StatusPill>
        </div>
      </div>
      <ControlActionGroup
        actions={service.actions}
        pendingActionId={pendingActionId}
        onAction={requestAction}
      />
    </div>
  );
};
