"use client";

import { SystemsAlertPanel } from "@/components/systems/systems-alert-panel";
import { SystemsCronTable } from "@/components/systems/systems-cron-table";
import { SystemsInventoryList } from "@/components/systems/systems-inventory-list";
import { SystemsNodeGrid } from "@/components/systems/systems-node-grid";
import { SystemsServiceTable } from "@/components/systems/systems-service-table";
import { SystemsUsagePanel } from "@/components/systems/systems-usage-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceState } from "@/components/ui/surface-state";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);
  const connectionState = useMissionStore((state) => state.connectionState);
  const errorMessage = useMissionStore((state) => state.errorMessage);

  if (!snapshot) {
    return (
      <SurfaceState
        variant={connectionState === "degraded" ? "error" : "loading"}
        title={connectionState === "degraded" ? "Systems surface unavailable" : "Loading systems surface"}
        description={errorMessage ?? "Gateway state, inventory, scheduler visibility, and telemetry are loading."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Infrastructure"
          title="Gateway and node health"
          description="Giles gateway and all registered nodes with uptime and status."
        />
        <SystemsNodeGrid nodes={snapshot.nodes} />
      </Panel>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionHeading
            eyebrow="Service grid"
            title="Registered services"
            description="All services with ownership, runtime, cost, and health status."
          />
          <SystemsServiceTable services={snapshot.services} />
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Active alerts"
            title="System watchlist"
            description="Warnings and critical issues requiring operator attention."
          />
          <SystemsAlertPanel alerts={snapshot.systems.alerts} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel>
          <SectionHeading
            eyebrow="Scheduler"
            title="Cron jobs"
            description="Recurring tasks managed by the scheduler grid."
          />
          <SystemsCronTable cronJobs={snapshot.systems.cronJobs} />
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Installed apps"
            title="Service inventory"
            description="All registered applications and runtimes."
          />
          <SystemsInventoryList inventory={snapshot.systems.inventory} />
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Cost visibility"
            title="Scoped model telemetry"
            description="Global, project, session, and agent usage routed through one telemetry rail."
          />
          <SystemsUsagePanel usage={snapshot.systems.usage} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <SectionHeading
            eyebrow="Gateway routing"
            title="Registry ownership"
            description="Node and service registries define what Giles can route, observe, and control."
          />
          <div className="space-y-4">
            {snapshot.registries.nodes.map((entry) => (
              <div key={entry.nodeId} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white">{entry.nodeName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/35">
                      {entry.role} · services {entry.serviceIds.length} · cron {entry.cronJobIds.length}
                    </p>
                  </div>
                  <StatusPill tone={entry.role === "gateway" ? "healthy" : "idle"}>
                    {entry.role}
                  </StatusPill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Recent events"
            title="Gateway event stream"
            description="Activity envelopes unify chat, service, scheduler, session, and control feedback."
          />
          <div className="space-y-3">
            {snapshot.systems.events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white">{event.label}</p>
                  <StatusPill tone={event.tone}>{event.kind}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-white/68">{event.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">
                  {event.entityKind} · {event.occurredAt}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
};

export default Page;
