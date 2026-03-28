import { StatusPill } from "@/components/ui/status-pill";
import type { MissionAlert } from "@/types/mission-control";

export const AlertCard = ({ alert }: { alert: MissionAlert }) => (
  <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-white">{alert.label}</p>
      <StatusPill tone={alert.tone}>{alert.tone}</StatusPill>
    </div>
    <p className="mt-3 text-sm leading-6 text-white/68">{alert.detail}</p>
  </div>
);
