import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/mission-control";

type ProgressBarProps = {
  value: number;
  tone?: StatusTone;
  label?: string;
};

const toneColor: Record<StatusTone, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-rose-400",
  idle: "bg-white/30",
  active: "bg-cyan-400"
};

export const ProgressBar = ({ value, tone = "healthy", label }: ProgressBarProps) => (
  <div>
    {label ? (
      <div className="mb-2 flex items-center justify-between text-xs text-white/50">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
    ) : null}
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <div
        className={cn("h-full rounded-full transition-all", toneColor[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);
