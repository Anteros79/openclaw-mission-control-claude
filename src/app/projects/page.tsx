"use client";

import { ProjectCard } from "@/components/projects/project-card";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Project orchestration"
          title="Active projects"
          description="Milestones, dependencies, blockers, and cross-linked agents, artifacts, and research in one view."
        />
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
      </Panel>
    </div>
  );
};

export default Page;
