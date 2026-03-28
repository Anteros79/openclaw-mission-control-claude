import { AlertCard } from "@/components/ui/alert-card";
import type { MissionAlert } from "@/types/mission-control";

export const SystemsAlertPanel = ({ alerts }: { alerts: MissionAlert[] }) => (
  <div className="space-y-3">
    {alerts.length > 0 ? (
      alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
    ) : (
      <p className="py-4 text-center text-sm text-white/40">No active alerts.</p>
    )}
  </div>
);
