import { ServiceRow } from "@/components/ui/service-row";
import type { MissionService } from "@/types/mission-control";

export const SystemsServiceTable = ({ services }: { services: MissionService[] }) => (
  <div className="space-y-3">
    <div className="hidden gap-3 px-4 text-xs uppercase tracking-[0.24em] text-white/38 md:grid md:grid-cols-[1.2fr_0.8fr_0.8fr_0.6fr]">
      <span>Service</span>
      <span>Runtime</span>
      <span>Cost</span>
      <span>Status</span>
    </div>
    {services.map((service) => (
      <ServiceRow key={service.id} service={service} />
    ))}
  </div>
);
