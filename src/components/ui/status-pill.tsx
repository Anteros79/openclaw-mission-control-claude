import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/mission-control";

const toneClassName: Record<StatusTone, string> = {
  healthy: "bg-emerald-300/15 text-emerald-200 border-emerald-300/25",
  warning: "bg-amber-300/15 text-amber-100 border-amber-300/25",
  critical: "bg-rose-400/15 text-rose-200 border-rose-300/25",
  idle: "bg-white/8 text-white/65 border-white/10",
  active: "bg-cyan-300/15 text-cyan-100 border-cyan-300/25"
};

export const StatusPill = ({ tone, children }: { tone: StatusTone; children: React.ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      toneClassName[tone]
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
    {children}
  </span>
);
