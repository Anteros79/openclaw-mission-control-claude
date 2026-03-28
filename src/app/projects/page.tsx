"use client";

import { ProjectCard } from "@/components/projects/project-card";
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
        title={connectionState === "degraded" ? "Projects unavailable" : "Loading projects"}
        description={errorMessage ?? "Project cards, dependencies, and milestone telemetry are loading."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Project orchestration"
          title="Active projects"
          description="Milestones, dependencies, blockers, and cross-linked agents, artifacts, and research in one view."
        />
        {snapshot.projects.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {snapshot.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                usage={snapshot.systems.usage.find(
                  (item) => item.scopeKind === "project" && item.scopeId === project.id
                )}
              />
            ))}
          </div>
        ) : (
          <SurfaceState
            variant="empty"
            title="No projects registered"
            description="Project cards will appear here once the orchestration layer has active mission work."
          />
        )}
      </Panel>
    </div>
  );
};

export default Page;
