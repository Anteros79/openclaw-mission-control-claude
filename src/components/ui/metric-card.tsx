import { cn } from "@/lib/utils";
import type { MissionMetric } from "@/types/mission-control";

const toneGlow: Record<MissionMetric["tone"], string> = {
  healthy: "shadow-[0_0_28px_rgba(34,197,94,0.12)]",
  warning: "shadow-[0_0_28px_rgba(245,158,11,0.12)]",
  critical: "shadow-[0_0_28px_rgba(251,113,133,0.12)]",
  idle: "shadow-none",
  active: "shadow-[0_0_28px_rgba(34,211,238,0.12)]"
};

export const MetricCard = ({ metric }: { metric: MissionMetric }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(9,20,18,0.95),rgba(6,12,14,0.88))] p-5 backdrop-blur-xl before:absolute before:inset-x-0 before:top-0 before:h-20 before:bg-[radial-gradient(circle_at_top_right,rgba(84,255,176,0.18),transparent_60%)] before:content-['']",
      toneGlow[metric.tone]
    )}
  >
    <p className="text-[11px] uppercase tracking-[0.3em] text-white/38">{metric.label}</p>
    <div className="mt-4 flex items-end justify-between gap-3">
      <p className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.08em] text-white">
        {metric.value}
      </p>
      {metric.delta ? (
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/62">
          {metric.delta}
        </span>
      ) : null}
    </div>
  </div>
);
