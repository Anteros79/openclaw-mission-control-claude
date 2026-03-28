import type { MissionService } from "@/types/mission-control";

export const SystemsCostPanel = ({ services }: { services: MissionService[] }) => {
  const totalCost = services.reduce((sum, svc) => {
    const numeric = parseFloat(svc.cost.replace("$", ""));
    return sum + (Number.isNaN(numeric) ? 0 : numeric);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">Total period cost</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
          ${totalCost.toFixed(2)}
        </p>
      </div>
      {services.map((service) => (
        <div key={service.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
          <div>
            <p className="text-sm text-white">{service.name}</p>
            <p className="mt-1 text-xs text-white/40">{service.ownerNodeId}</p>
          </div>
          <p className="font-[family-name:var(--font-display)] text-lg text-white">{service.cost}</p>
        </div>
      ))}
    </div>
  );
};
