import Image from "next/image";

import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import type { MissionControlSnapshot } from "@/types/mission-control";

type MockupPackProps = {
  snapshot: MissionControlSnapshot;
};

type BoardProps = {
  id: string;
  index: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const Board = ({ id, index, title, description, children }: BoardProps) => (
  <Panel id={id} className="scroll-mt-6 print:break-inside-avoid">
    <SectionHeading
      eyebrow="Review board"
      title={`${index} ${title}`}
      description={description}
      action={<StatusPill tone="idle">High fidelity</StatusPill>}
    />
    {children}
  </Panel>
);

const PreviewFrame = ({
  device,
  children
}: {
  device: string;
  children: React.ReactNode;
}) => (
  <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(4,12,9,0.96),rgba(4,8,10,0.9))] shadow-[0_0_40px_rgba(34,197,94,0.08)]">
    <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">
        {device}
      </p>
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/60" />
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const MicroTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
    <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{label}</p>
    <p className="mt-3 font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.06em] text-white">
      {value}
    </p>
  </div>
);

export const MockupPack = ({ snapshot }: MockupPackProps) => (
  <div className="space-y-6">
    <Panel className="overflow-hidden">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="py-2">
          <SectionHeading
            eyebrow="Design review"
            title="Screen mockups"
            description="Static review boards for desktop, tablet, mobile, and overlay states. These are the approval source of truth for look, feel, and layout."
            action={<StatusPill tone="active">Review pack</StatusPill>}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <MicroTile label="Boards" value="10" />
            <MicroTile label="Viewports" value="3" />
            <MicroTile label="Overlay states" value="6" />
          </div>
        </div>
        <div className="relative min-h-64 overflow-hidden rounded-[32px] border border-emerald-300/20 bg-black/35">
          <Image
            src="/brand/phoenixclaw-mission-control.jpg"
            alt="PhoenixClaw Mission Control brand banner"
            fill
            className="object-cover opacity-85"
            sizes="(max-width: 1280px) 100vw, 40vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(1,6,5,0.2),rgba(2,8,10,0.82))]" />
        </div>
      </div>
    </Panel>

    <Board
      id="board-shell"
      index="01"
      title="Shell / Desktop"
      description="Primary desktop shell with left navigation, command bar, large workspace, and context rail."
    >
      <PreviewFrame device="Desktop shell">
        <div className="grid min-h-72 gap-4 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
          <div className="space-y-3 rounded-[28px] border border-white/8 bg-white/5 p-4">
            {["Overview", "Chat", "Operations", "Agents", "Projects", "Research", "Artifacts", "Systems", "Sessions"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-black/22 px-4 py-3 text-sm text-white/78">
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-4 rounded-[28px] border border-white/8 bg-white/5 p-4">
            <div className="grid gap-3 md:grid-cols-4">
              {snapshot.metrics.map((metric) => (
                <MicroTile key={metric.id} label={metric.label} value={metric.value} />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/72">
                Gateway, node health, service inventory, and scheduler alerts stack in one telemetry grid.
              </div>
              <div className="rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/72">
                Command center overview keeps active agents, blocked work, and cost burn above the fold.
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-[28px] border border-white/8 bg-white/5 p-4">
            <div className="rounded-2xl border border-white/8 bg-black/22 p-4 text-sm text-white/70">
              Context rail for active alerts and current operator intent.
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/22 p-4 text-sm text-white/70">
              Persistent assistant bubble anchored outside the workspace.
            </div>
          </div>
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-overview"
      index="02"
      title="Overview / Telemetry"
      description="High-signal summary layout that balances gateway health, burn, active agents, and session pulse."
    >
      <PreviewFrame device="Desktop overview">
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-4">
              {snapshot.metrics.map((metric) => (
                <MicroTile key={metric.id} label={metric.label} value={metric.value} />
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {snapshot.nodes.map((node) => (
                <div key={node.id} className="rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/72">
                  <div className="flex items-center justify-between gap-3">
                    <span>{node.name}</span>
                    <StatusPill tone={node.tone}>{node.role}</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {snapshot.systems.alerts.map((alert) => (
              <div key={alert.id} className="rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/72">
                <div className="flex items-center justify-between gap-3">
                  <span>{alert.label}</span>
                  <StatusPill tone={alert.tone}>{alert.tone}</StatusPill>
                </div>
                <p className="mt-2 text-white/55">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-chat"
      index="03"
      title="Chat / Assistant"
      description="Thread list, focused conversation pane, attachment composer, and session context rail."
    >
      <PreviewFrame device="Desktop chat">
        <div className="grid min-h-72 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_240px]">
          <div className="space-y-3">
            {snapshot.chat.threads.map((thread) => (
              <div key={thread.id} className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-white/78">
                {thread.title}
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/5 p-4">
            <p className="text-sm text-white/78">{snapshot.chat.threads[0]?.messages[0]?.content}</p>
            <div className="mt-4 rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/60">
              Composer with markdown-safe reply area and attachment chips.
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/65">
              Session binding
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/22 p-4 text-sm text-white/65">
              Unread and context summary
            </div>
          </div>
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-operations"
      index="04"
      title="Operations / Kanban"
      description="Five-lane board, linked work cards, and adjacent orchestration context."
    >
      <PreviewFrame device="Desktop operations">
        <div className="grid gap-4 xl:grid-cols-5">
          {snapshot.kanban.map((column) => (
            <div key={column.id} className="rounded-[24px] border border-white/8 bg-white/5 p-4">
              <p className="font-[family-name:var(--font-display)] text-lg uppercase tracking-[0.08em] text-white">
                {column.title}
              </p>
              <div className="mt-4 space-y-3">
                {column.cards.map((card) => (
                  <div key={card.id} className="rounded-2xl border border-white/8 bg-black/22 p-3 text-sm text-white/74">
                    {card.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-agents"
      index="05"
      title="Agents / Runtime"
      description="Dense runtime matrix with cost, tokens, locality, last step, and failure visibility."
    >
      <PreviewFrame device="Desktop agents">
        <div className="space-y-3">
          {snapshot.agents.map((agent) => (
            <div key={agent.id} className="grid gap-4 rounded-[24px] border border-white/8 bg-white/5 p-4 md:grid-cols-[1fr_0.9fr]">
              <div className="text-sm text-white/78">{agent.name}</div>
              <div className="grid gap-3 sm:grid-cols-4">
                <MicroTile label="Model" value={agent.model} />
                <MicroTile label="Tokens" value={agent.tokens} />
                <MicroTile label="Cost" value={agent.cost} />
                <MicroTile label="Runtime" value={agent.runtime} />
              </div>
            </div>
          ))}
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-projects"
      index="06"
      title="Projects / Orchestration"
      description="Portfolio cards emphasize milestone momentum, dependencies, blocked items, and linked context."
    >
      <PreviewFrame device="Desktop projects">
        <div className="grid gap-4 xl:grid-cols-3">
          {snapshot.projects.map((project) => (
            <div key={project.id} className="rounded-[24px] border border-white/8 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-white">{project.name}</span>
                <StatusPill tone={project.status}>{project.status}</StatusPill>
              </div>
              <p className="mt-3 text-sm text-white/60">{project.milestone}</p>
            </div>
          ))}
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-libraries"
      index="07"
      title="Research / Artifacts"
      description="Knowledge and asset surfaces share one gallery/detail grammar, with visible cross-links into work."
    >
      <PreviewFrame device="Desktop libraries">
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            {snapshot.research.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm text-white/74">
                {item.title}
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {snapshot.artifacts.map((artifact) => (
              <div key={artifact.id} className="rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm text-white/74">
                {artifact.name}
              </div>
            ))}
          </div>
        </div>
      </PreviewFrame>
    </Board>

    <Board
      id="board-systems"
      index="08"
      title="Systems / Sessions"
      description="Operational telemetry and session history stay adjacent so recovery and resumption happen from one place."
    >
      <PreviewFrame device="Desktop systems">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {snapshot.services.map((service) => (
              <div key={service.id} className="rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm text-white/74">
                {service.name}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {snapshot.sessions.map((session) => (
              <div key={session.id} className="rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm text-white/74">
                {session.label}
              </div>
            ))}
          </div>
        </div>
      </PreviewFrame>
    </Board>

    <Panel id="board-responsive" className="scroll-mt-6 print:break-inside-avoid">
      <SectionHeading
        eyebrow="Responsive review"
        title="Responsive Triptych"
        description="The same command-center hierarchy translated into desktop, tablet, and mobile compositions."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <PreviewFrame device="Desktop">
          <div className="grid min-h-64 place-items-center rounded-[24px] border border-white/8 bg-black/22 text-sm text-white/72">
            Full telemetry shell, wide workspace, and right context rail.
          </div>
        </PreviewFrame>
        <PreviewFrame device="Tablet">
          <div className="grid min-h-64 place-items-center rounded-[24px] border border-white/8 bg-black/22 text-sm text-white/72">
            Condensed metrics, stacked content, collapsible context panel.
          </div>
        </PreviewFrame>
        <PreviewFrame device="Mobile">
          <div className="grid min-h-64 place-items-center rounded-[24px] border border-white/8 bg-black/22 text-sm text-white/72">
            Task-focused panels, bottom-sheet context, persistent assistant entry.
          </div>
        </PreviewFrame>
      </div>
    </Panel>

    <Panel id="board-overlays" className="scroll-mt-6 print:break-inside-avoid">
      <SectionHeading
        eyebrow="Overlay review"
        title="Overlay + State Boards"
        description="Critical overlays and system states that must be approved before production implementation hardens."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          "Assistant drawer open",
          "Entity detail drawer",
          "Activity notification strip",
          "Loading + degraded state",
          "Empty library state",
          "Confirmation dialog"
        ].map((item) => (
          <div key={item} className="rounded-[24px] border border-white/8 bg-white/5 p-5 text-sm text-white/74">
            {item}
          </div>
        ))}
      </div>
    </Panel>
  </div>
);
