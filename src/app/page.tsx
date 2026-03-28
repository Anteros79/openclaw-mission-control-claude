"use client";

import { AlertCard } from "@/components/ui/alert-card";
import { MetricCard } from "@/components/ui/metric-card";
import { NodeCard } from "@/components/ui/node-card";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceRow } from "@/components/ui/service-row";
import { StatusPill } from "@/components/ui/status-pill";
import { EntityLinkList } from "@/components/ui/entity-link-list";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);

  if (!snapshot) return null;

  const blockedCards = snapshot.kanban.find((col) => col.id === "blocked")?.cards ?? [];
  const activeAgents = snapshot.agents.filter((a) => a.status === "active" || a.status === "warning");
  const totalCost = snapshot.services.reduce((sum, svc) => {
    const numeric = parseFloat(svc.cost.replace("$", ""));
    return sum + (Number.isNaN(numeric) ? 0 : numeric);
  }, 0);
  const globalUsage = snapshot.systems.usage.find((item) => item.scopeKind === "global");

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <SectionHeading
            eyebrow="Gateway overview"
            title="Giles command surface"
            description={snapshot.tagline}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {snapshot.nodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Mission alerts"
            title="Watchlist"
            description="Operator-visible issues that need action without leaving the shell."
          />
          <div className="space-y-3">
            {snapshot.systems.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel>
          <SectionHeading
            eyebrow="Blocked work"
            title="Needs attention"
            description="Tasks stuck in the blocked column across all projects."
          />
          <div className="space-y-3">
            {blockedCards.length > 0 ? (
              blockedCards.map((card) => (
                <div key={card.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white">{card.title}</p>
                    <StatusPill tone="warning">{card.severity}</StatusPill>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/38">{card.owner}</p>
                  <div className="mt-3">
                    <EntityLinkList links={card.links} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/50">No blocked work.</p>
            )}
          </div>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Sub-agent pulse"
            title="Active agents"
            description="Agents currently running or in a warning state."
          />
          <div className="space-y-3">
            {activeAgents.map((agent) => (
              <div key={agent.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white">{agent.name}</p>
                  <StatusPill tone={agent.status}>{agent.status}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-white/68">{agent.step}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/42">
                  <span>{agent.model}</span>
                  <span>{agent.cost}</span>
                  <span>{agent.runtime}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Cost visibility"
            title="Global telemetry"
            description="Global model burn, token volume, and gateway-level trend."
          />
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/38">Global model burn</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl text-white">
                {globalUsage?.cost ?? `$${totalCost.toFixed(2)}`}
              </p>
              <p className="mt-2 text-sm text-white/68">
                {globalUsage?.tokens ?? "—"} · {globalUsage?.model ?? "mixed"} · {globalUsage?.trend ?? "Stable"}
              </p>
            </div>
            {snapshot.services.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <SectionHeading
            eyebrow="Session pulse"
            title="Recent sessions"
            description="Fast access to current operator sessions and mission context."
          />
          <div className="space-y-3">
            {snapshot.sessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-sm text-white">{session.label}</p>
                <p className="mt-2 text-sm text-white/68">{session.scope}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/38">
                  {session.operator} · {session.startedAt}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Research highlights"
            title="Latest findings"
            description="Recent research items linked to active projects."
          />
          <div className="space-y-3">
            {snapshot.research.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white">{item.title}</p>
                  <StatusPill tone="idle">{item.category}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-white/68">{item.summary}</p>
                <div className="mt-3">
                  <EntityLinkList links={item.links} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
};

export default Page;
