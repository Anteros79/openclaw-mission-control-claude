import { StatusPill } from "@/components/ui/status-pill";
import type { MissionUsageScope } from "@/types/mission-control";

export const SystemsUsagePanel = ({ usage }: { usage: MissionUsageScope[] }) => {
  const globalUsage = usage.find((item) => item.scopeKind === "global");
  const scopedUsage = usage.filter((item) => item.scopeKind !== "global");

  return (
    <div className="space-y-3">
      {globalUsage ? (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                {globalUsage.label}
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
                {globalUsage.cost}
              </p>
            </div>
            <StatusPill tone={globalUsage.status}>{globalUsage.status}</StatusPill>
          </div>
          <p className="mt-2 text-sm text-white/68">
            {globalUsage.tokens} · {globalUsage.model} · {globalUsage.trend}
          </p>
        </div>
      ) : null}

      {scopedUsage.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
        >
          <div>
            <p className="text-sm text-white">{item.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
              {item.scopeKind} · {item.tokens} · {item.model}
            </p>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-display)] text-lg text-white">{item.cost}</p>
            <p className="mt-1 text-xs text-white/45">{item.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
