import { EntityLinkList } from "@/components/ui/entity-link-list";
import { StatusPill } from "@/components/ui/status-pill";
import type { MissionProject, MissionUsageScope } from "@/types/mission-control";

export const ProjectCard = ({
  project,
  usage
}: {
  project: MissionProject;
  usage?: MissionUsageScope;
}) => (
  <div
    id={project.id}
    className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/34">Project</p>
        <p className="mt-2 text-lg text-white">{project.name}</p>
      </div>
      <StatusPill tone={project.status}>{project.status}</StatusPill>
    </div>

    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">Milestone</p>
        <p className="mt-1 text-sm text-white/75">{project.milestone}</p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/38">Dependencies</p>
        <p className="mt-1 text-sm text-white/75">{project.dependencySummary}</p>
      </div>

      {project.blockedSummary && project.blockedSummary !== "None" ? (
        <div className="rounded-2xl border border-amber-300/15 bg-amber-300/5 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200/60">Blocked</p>
          <p className="mt-1 text-sm text-amber-100/80">{project.blockedSummary}</p>
        </div>
      ) : null}

      {usage ? (
        <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-white/38">Telemetry</p>
          <p className="mt-1 text-sm text-white/75">
            {usage.cost} · {usage.tokens}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {usage.model} · {usage.trend}
          </p>
        </div>
      ) : null}
    </div>

    {project.links.length > 0 ? (
      <div className="mt-4">
        <EntityLinkList links={project.links} />
      </div>
    ) : null}
  </div>
);
