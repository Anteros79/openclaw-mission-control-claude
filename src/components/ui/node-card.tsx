import { StatusPill } from "@/components/ui/status-pill";
import type { MissionNode } from "@/types/mission-control";

export const NodeCard = ({ node }: { node: MissionNode }) => (
  <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
    <div className="flex items-center justify-between gap-3">
      <p className="text-lg text-white">{node.name}</p>
      <StatusPill tone={node.tone}>{node.role}</StatusPill>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
        <p className="text-[10px] uppercase tracking-[0.26em] text-white/34">Location</p>
        <p className="mt-2 text-sm text-white/72">{node.location}</p>
      </div>
      <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
        <p className="text-[10px] uppercase tracking-[0.26em] text-white/34">Uptime</p>
        <p className="mt-2 text-sm text-white/72">{node.uptime}</p>
      </div>
    </div>
  </div>
);
