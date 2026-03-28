"use client";

import { KanbanBoard } from "@/components/kanban-board";
import { EntityLinkList } from "@/components/ui/entity-link-list";
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
        title={connectionState === "degraded" ? "Operations unavailable" : "Loading operations board"}
        description={errorMessage ?? "Kanban state, linked projects, and sub-agent runs are loading."}
      />
    );
  }

  const blockedProject = snapshot.projects.find((project) => project.status === "warning");

  return (
    <div className="space-y-6">
      <KanbanBoard columns={snapshot.kanban} />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <SectionHeading
            eyebrow="Project orchestration"
            title="Blocked focus"
            description="Projects, milestones, and dependency edges stay attached to active board work."
          />
          {blockedProject ? (
            <div className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <p className="text-xl text-white">{blockedProject.name}</p>
              <p className="mt-3 text-sm text-white/68">{blockedProject.blockedSummary}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/38">
                {blockedProject.dependencySummary}
              </p>
              <div className="mt-4">
                <EntityLinkList links={blockedProject.links} />
              </div>
            </div>
          ) : (
            <SurfaceState
              variant="empty"
              title="No blocked focus"
              description="Blocked project rollups will appear here when the mission board detects dependency pressure."
            />
          )}
        </Panel>

        <Panel>
          <SectionHeading
            eyebrow="Sub-agent watch"
            title="Runs tied to operational work"
            description="Active and recent agents stay visible alongside tasks they influence."
          />
          {snapshot.agents.length > 0 ? (
            <div className="space-y-3">
              {snapshot.agents.map((agent) => (
                <div key={agent.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white">{agent.name}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/42">{agent.locality}</p>
                  </div>
                  <p className="mt-3 text-sm text-white/68">{agent.step}</p>
                  <p className="mt-2 text-xs text-white/45">{agent.lastMessage}</p>
                </div>
              ))}
            </div>
          ) : (
            <SurfaceState
              variant="empty"
              title="No sub-agent runs"
              description="Live and recent agent runs will appear here when work is routed through Giles."
            />
          )}
        </Panel>
      </section>
    </div>
  );
};

export default Page;
