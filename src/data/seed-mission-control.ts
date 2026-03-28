import type {
  MissionControlAction,
  MissionControlCommand,
  MissionControlIntent,
  MissionControlSnapshot
} from "@/types/mission-control";

const entity = (
  kind: MissionControlSnapshot["projects"][number]["links"][number]["kind"],
  id: string,
  label: string,
  href: string
) => ({
  kind,
  id,
  label,
  href
});

const action = (
  id: string,
  targetKind: MissionControlAction["targetKind"],
  targetId: string,
  label: string,
  command: MissionControlCommand,
  intent: MissionControlIntent,
  description: string
): MissionControlAction => ({
  id,
  targetKind,
  targetId,
  label,
  command,
  description,
  intent,
  requiresConfirmation: intent !== "safe",
  gatewayRouted: true
});

export const createSeedMissionControlSnapshot = (): MissionControlSnapshot => ({
  lastUpdatedAt: "2026-03-28 04:18",
  tagline: "Unified operator command center for OpenClaw missions, systems, and autonomous work.",
  gatewayName: "Giles",
  metrics: [
    { id: "gateway", label: "Gateway Uptime", value: "14d 07h", delta: "+99.99%", tone: "healthy" },
    { id: "burn", label: "Model Burn", value: "$148.22", delta: "+12%", tone: "warning" },
    { id: "agents", label: "Active Agents", value: "9", delta: "+3", tone: "active" },
    { id: "blocked", label: "Blocked Work", value: "4", delta: "-2", tone: "warning" }
  ],
  nodes: [
    { id: "giles", name: "Giles", role: "gateway", location: "Tailnet Edge", uptime: "14d 07h", tone: "healthy" },
    { id: "nexus", name: "Nexus", role: "host", location: "Compute Bay A", uptime: "6d 11h", tone: "healthy" },
    { id: "icarus", name: "Icarus", role: "host", location: "Cloud Burst", uptime: "18h", tone: "active" }
  ],
  services: [
    {
      id: "svc-chat",
      name: "Conversation Fabric",
      ownerNodeId: "giles",
      status: "healthy",
      runtime: "node",
      route: "/chat",
      routeLabel: "Open chat fabric",
      cost: "$42.11",
      actions: [
        action(
          "act-svc-chat-restart",
          "service",
          "svc-chat",
          "Restart fabric",
          "restart",
          "high-impact",
          "Restart the Conversation Fabric through Giles."
        )
      ]
    },
    {
      id: "svc-scheduler",
      name: "Scheduler Grid",
      ownerNodeId: "nexus",
      status: "warning",
      runtime: "cron",
      route: "/systems?panel=scheduler",
      routeLabel: "Open scheduler grid",
      cost: "$8.07",
      actions: [
        action(
          "act-svc-scheduler-restart",
          "service",
          "svc-scheduler",
          "Restart scheduler",
          "restart",
          "high-impact",
          "Restart the Scheduler Grid on Nexus through Giles."
        ),
        action(
          "act-svc-scheduler-pause",
          "service",
          "svc-scheduler",
          "Pause scheduler",
          "pause",
          "destructive",
          "Pause scheduler execution through Giles."
        )
      ]
    },
    {
      id: "svc-agents",
      name: "Sub-agent Runtime",
      ownerNodeId: "icarus",
      status: "active",
      runtime: "workers",
      route: "/agents",
      routeLabel: "Open agent runtime",
      cost: "$71.44",
      actions: [
        action(
          "act-svc-agents-drain",
          "service",
          "svc-agents",
          "Drain runtime",
          "drain",
          "high-impact",
          "Drain new work from the Sub-agent Runtime through Giles."
        )
      ]
    }
  ],
  registries: {
    nodes: [
      {
        nodeId: "giles",
        nodeName: "Giles",
        role: "gateway",
        capabilities: ["gateway", "resolver", "control-plane"],
        serviceIds: ["svc-chat"],
        agentIds: ["agent-overlay"],
        sessionIds: ["session-8842"],
        cronJobIds: ["cron-cost-sample"]
      },
      {
        nodeId: "nexus",
        nodeName: "Nexus",
        role: "host",
        capabilities: ["scheduler", "research-indexer"],
        serviceIds: ["svc-scheduler"],
        agentIds: ["agent-scheduler"],
        sessionIds: ["session-2401"],
        cronJobIds: ["cron-nightly-compare", "cron-session-archive"]
      },
      {
        nodeId: "icarus",
        nodeName: "Icarus",
        role: "host",
        capabilities: ["worker-burst", "artifact-previews"],
        serviceIds: ["svc-agents"],
        agentIds: ["agent-library"],
        sessionIds: [],
        cronJobIds: ["cron-artifact-refresh"]
      }
    ],
    services: [
      {
        serviceId: "svc-chat",
        serviceName: "Conversation Fabric",
        ownerNodeId: "giles",
        adapter: "seed",
        resolverPath: "/chat",
        routeLabel: "Open chat fabric",
        gatewaySafe: true
      },
      {
        serviceId: "svc-scheduler",
        serviceName: "Scheduler Grid",
        ownerNodeId: "nexus",
        adapter: "seed",
        resolverPath: "/systems?panel=scheduler",
        routeLabel: "Open scheduler grid",
        gatewaySafe: true
      },
      {
        serviceId: "svc-agents",
        serviceName: "Sub-agent Runtime",
        ownerNodeId: "icarus",
        adapter: "seed",
        resolverPath: "/agents",
        routeLabel: "Open agent runtime",
        gatewaySafe: true
      }
    ]
  },
  systems: {
    alerts: [
      {
        id: "alert-1",
        label: "Scheduler drift",
        detail: "Nightly compare job missed its Giles window by 7m.",
        tone: "warning"
      },
      {
        id: "alert-2",
        label: "Research ingestion degraded",
        detail: "Prompt-pack indexer on Nexus retried 3 times.",
        tone: "critical"
      }
    ],
    inventory: [
      {
        id: "inv-web",
        name: "mission-control-web",
        kind: "app",
        ownerNodeId: "giles",
        placement: "Giles gateway",
        status: "healthy",
        href: "/"
      },
      {
        id: "inv-gateway",
        name: "gateway-proxy",
        kind: "gateway",
        ownerNodeId: "giles",
        placement: "Tailnet edge",
        status: "healthy",
        href: "/systems"
      },
      {
        id: "inv-agent",
        name: "agent-runner",
        kind: "worker",
        ownerNodeId: "icarus",
        placement: "Burst worker pool",
        status: "active",
        href: "/agents"
      },
      {
        id: "inv-research",
        name: "research-indexer",
        kind: "service",
        ownerNodeId: "nexus",
        placement: "Knowledge node",
        status: "warning",
        href: "/research"
      },
      {
        id: "inv-artifact",
        name: "artifact-store",
        kind: "service",
        ownerNodeId: "icarus",
        placement: "Artifact lane",
        status: "healthy",
        href: "/artifacts"
      },
      {
        id: "inv-scheduler",
        name: "scheduler-grid",
        kind: "service",
        ownerNodeId: "nexus",
        placement: "Scheduler rack",
        status: "warning",
        href: "/systems"
      }
    ],
    cronJobs: [
      {
        id: "cron-nightly-compare",
        name: "Nightly compare",
        schedule: "0 2 * * *",
        lastRun: "2026-03-28 02:07",
        nextRun: "2026-03-29 02:00",
        status: "warning",
        ownerNodeId: "nexus",
        model: "gpt-5.2-mini",
        duration: "7m",
        failureReason: "Gateway callback timeout",
        actions: [
          action(
            "act-cron-nightly-run",
            "cron",
            "cron-nightly-compare",
            "Run now",
            "run_now",
            "high-impact",
            "Trigger Nightly compare immediately through Giles."
          )
        ]
      },
      {
        id: "cron-cost-sample",
        name: "Hourly cost sample",
        schedule: "0 * * * *",
        lastRun: "2026-03-28 04:00",
        nextRun: "2026-03-28 05:00",
        status: "healthy",
        ownerNodeId: "giles",
        model: "gpt-5.2",
        duration: "34s",
        actions: [
          action(
            "act-cron-cost-run",
            "cron",
            "cron-cost-sample",
            "Run sample",
            "run_now",
            "high-impact",
            "Trigger the cost sampling job through Giles."
          )
        ]
      },
      {
        id: "cron-session-archive",
        name: "Session archive sweep",
        schedule: "*/30 * * * *",
        lastRun: "2026-03-28 03:30",
        nextRun: "2026-03-28 04:30",
        status: "healthy",
        ownerNodeId: "nexus",
        model: "gpt-4.1",
        duration: "1m 12s",
        actions: [
          action(
            "act-cron-session-archive-run",
            "cron",
            "cron-session-archive",
            "Run archive",
            "run_now",
            "high-impact",
            "Trigger the session archive sweep through Giles."
          )
        ]
      },
      {
        id: "cron-artifact-refresh",
        name: "Artifact preview refresh",
        schedule: "15 * * * *",
        lastRun: "2026-03-28 03:15",
        nextRun: "2026-03-28 04:15",
        status: "active",
        ownerNodeId: "icarus",
        model: "gpt-4.1-mini",
        duration: "2m 03s",
        actions: [
          action(
            "act-cron-artifact-refresh-run",
            "cron",
            "cron-artifact-refresh",
            "Refresh previews",
            "run_now",
            "high-impact",
            "Trigger the artifact preview refresh through Giles."
          )
        ]
      }
    ],
    usage: [
      {
        id: "usage-global",
        scopeKind: "global",
        scopeId: "giles",
        label: "Global overview",
        model: "gpt-5.2 / mixed",
        tokens: "149k",
        cost: "$148.22",
        trend: "+12% vs yesterday",
        status: "warning"
      },
      {
        id: "usage-agent-overlay",
        scopeKind: "agent",
        scopeId: "agent-overlay",
        label: "Overlay Agent",
        model: "gpt-5.2",
        tokens: "84k",
        cost: "$14.20",
        trend: "+3 tasks",
        status: "active"
      },
      {
        id: "usage-project-shell",
        scopeKind: "project",
        scopeId: "proj-shell",
        label: "Shell Unification",
        model: "gpt-5.2",
        tokens: "41k",
        cost: "$22.44",
        trend: "2 blockers left",
        status: "warning"
      },
      {
        id: "usage-session-8842",
        scopeKind: "session",
        scopeId: "session-8842",
        label: "Session MC-8842",
        model: "gpt-5.2",
        tokens: "58k",
        cost: "$18.34",
        trend: "Live",
        status: "active"
      }
    ],
    events: [
      {
        id: "evt-service-scheduler",
        kind: "service.health",
        entityKind: "service",
        entityId: "svc-scheduler",
        label: "Scheduler Grid",
        detail: "Scheduler Grid reported degraded callback timings on Nexus.",
        tone: "warning",
        occurredAt: "2026-03-28 04:07"
      },
      {
        id: "evt-chat-thread",
        kind: "chat.activity",
        entityKind: "session",
        entityId: "session-8842",
        label: "Operator mainline",
        detail: "Phoenix Assistant posted a new blocked-work summary.",
        tone: "active",
        occurredAt: "2026-03-28 04:13"
      },
      {
        id: "evt-usage-global",
        kind: "usage.sample",
        entityKind: "service",
        entityId: "svc-agents",
        label: "Model burn sample",
        detail: "Agent runtime spend climbed 12% over the prior window.",
        tone: "warning",
        occurredAt: "2026-03-28 04:00"
      }
    ]
  },
  chat: {
    unreadCount: 5,
    threads: [
      {
        id: "thread-ops",
        title: "Operator mainline",
        sessionLabel: "Session MC-8842",
        unreadCount: 3,
        lastMessagePreview: "Immediate blockers updated from Giles.",
        messages: [
          {
            id: "m1",
            role: "operator",
            author: "Chief Operator",
            sentAt: "04:12 UTC",
            content: "Pull together the current agent failures and line them up against blocked project work."
          },
          {
            id: "m2",
            role: "assistant",
            author: "Phoenix Assistant",
            sentAt: "04:13 UTC",
            content:
              "## Immediate blockers\n- `Scheduler Grid` is delaying nightly compare execution.\n- `Mission Board unification` is blocked on mock review closure.\n- `Artifact import` needs gateway-safe previews before release."
          }
        ]
      },
      {
        id: "thread-research",
        title: "Research sync",
        sessionLabel: "Session RS-2401",
        unreadCount: 2,
        lastMessagePreview: "Comparative telemetry notes attached.",
        messages: [
          {
            id: "m3",
            role: "assistant",
            author: "Phoenix Assistant",
            sentAt: "03:48 UTC",
            content: "Attached the latest comparative notes for agent telemetry surfaces.",
            attachments: [
              {
                id: "a1",
                name: "telemetry-comparison.md",
                kind: "markdown",
                sizeLabel: "14 KB"
              }
            ]
          }
        ]
      }
    ]
  },
  kanban: [
    {
      id: "backlog",
      title: "Backlog",
      cards: [
        {
          id: "task-1",
          title: "Proxy inventory deep links through Giles",
          owner: "Ops",
          severity: "P1",
          metadata: ["Gateway-safe", "Systems"],
          links: [
            entity("service", "svc-scheduler", "Scheduler Grid", "/systems#svc-scheduler")
          ]
        }
      ]
    },
    {
      id: "planned",
      title: "Planned",
      cards: [
        {
          id: "task-2",
          title: "Lock responsive shell spacing",
          owner: "Design",
          severity: "P2",
          metadata: ["Mobile", "Shell"],
          links: [entity("project", "proj-shell", "Shell Unification", "/projects#proj-shell")]
        }
      ]
    },
    {
      id: "in-progress",
      title: "In Progress",
      cards: [
        {
          id: "task-3",
          title: "Implement assistant overlay persistence",
          owner: "Frontend",
          severity: "P0",
          metadata: ["Chat", "State"],
          links: [
            entity("agent", "agent-overlay", "Overlay Agent", "/agents#agent-overlay"),
            entity("project", "proj-chat", "Chat Workspace", "/projects#proj-chat")
          ]
        }
      ]
    },
    {
      id: "blocked",
      title: "Blocked",
      cards: [
        {
          id: "task-4",
          title: "Finalize mockup approval gate",
          owner: "Product",
          severity: "P1",
          metadata: ["Approval"],
          links: [
            entity("research", "research-shell", "Shell Review Notes", "/research#research-shell")
          ]
        }
      ]
    },
    {
      id: "done",
      title: "Done",
      cards: [
        {
          id: "task-5",
          title: "Create canonical EARS ledger",
          owner: "Codex",
          severity: "P0",
          metadata: ["Planning"],
          links: [
            entity("artifact", "artifact-ledger", "Master Ledger", "/artifacts#artifact-ledger")
          ]
        }
      ]
    }
  ],
  agents: [
    {
      id: "agent-overlay",
      name: "Overlay Agent",
      status: "active",
      ownerNodeId: "giles",
      sessionId: "session-8842",
      model: "gpt-5.2",
      tokens: "84k",
      cost: "$14.20",
      runtime: "18m",
      step: "Persisting route context",
      lastMessage: "Assistant overlay store synchronized.",
      locality: "local",
      actions: [
        action(
          "act-agent-overlay-drain",
          "agent",
          "agent-overlay",
          "Drain agent",
          "drain",
          "high-impact",
          "Drain new work from Overlay Agent through Giles."
        )
      ]
    },
    {
      id: "agent-scheduler",
      name: "Scheduler Auditor",
      status: "warning",
      ownerNodeId: "nexus",
      sessionId: "session-2401",
      model: "gpt-5.2-mini",
      tokens: "42k",
      cost: "$4.31",
      runtime: "1h 09m",
      step: "Investigating cron drift",
      lastMessage: "Missed window on Nexus detected.",
      failureReason: "Gateway callback timeout",
      locality: "cloud",
      actions: [
        action(
          "act-agent-scheduler-retry",
          "agent",
          "agent-scheduler",
          "Retry agent",
          "retry",
          "high-impact",
          "Retry Scheduler Auditor through Giles."
        ),
        action(
          "act-agent-scheduler-terminate",
          "agent",
          "agent-scheduler",
          "Terminate agent",
          "terminate",
          "destructive",
          "Terminate Scheduler Auditor through Giles."
        )
      ]
    },
    {
      id: "agent-library",
      name: "Library Curator",
      status: "healthy",
      ownerNodeId: "icarus",
      model: "gpt-4.1",
      tokens: "23k",
      cost: "$2.18",
      runtime: "12m",
      step: "Tagging imported artifacts",
      lastMessage: "Gallery metadata enriched.",
      locality: "local",
      actions: [
        action(
          "act-agent-library-drain",
          "agent",
          "agent-library",
          "Drain agent",
          "drain",
          "high-impact",
          "Drain Library Curator through Giles."
        )
      ]
    }
  ],
  projects: [
    {
      id: "proj-shell",
      name: "Shell Unification",
      status: "active",
      milestone: "Responsive shell alpha",
      dependencySummary: "Depends on mock review closure",
      blockedSummary: "Tablet context rail spacing",
      links: [entity("task", "task-2", "Lock responsive shell spacing", "/operations#task-2")]
    },
    {
      id: "proj-chat",
      name: "Chat Workspace",
      status: "warning",
      milestone: "Persistent assistant panel",
      dependencySummary: "Depends on overlay state store",
      blockedSummary: "Attachment persistence polish",
      links: [entity("agent", "agent-overlay", "Overlay Agent", "/agents#agent-overlay")]
    },
    {
      id: "proj-systems",
      name: "Systems Surface",
      status: "healthy",
      milestone: "Gateway-safe telemetry",
      dependencySummary: "Depends on registry adapters",
      blockedSummary: "None",
      links: [entity("service", "svc-chat", "Conversation Fabric", "/systems#svc-chat")]
    }
  ],
  research: [
    {
      id: "research-shell",
      title: "Mission shell density study",
      category: "comparison",
      summary:
        "Balanced operator density outperformed dense console layouts for cross-device scannability.",
      links: [entity("project", "proj-shell", "Shell Unification", "/projects#proj-shell")]
    },
    {
      id: "research-gateway",
      title: "Gateway-safe link policy",
      category: "finding",
      summary: "All share targets should be generated from route descriptors and the Giles origin only.",
      links: [entity("service", "svc-chat", "Conversation Fabric", "/systems#svc-chat")]
    },
    {
      id: "research-prompts",
      title: "Operator prompt pack",
      category: "prompt-pack",
      summary:
        "Reusable prompts for mission triage, library classification, and service health reviews.",
      links: [entity("project", "proj-chat", "Chat Workspace", "/projects#proj-chat")]
    }
  ],
  artifacts: [
    {
      id: "artifact-ledger",
      name: "Master Ledger",
      type: "markdown",
      summary: "Canonical EARS plan and execution status.",
      usage: "Project planning"
    },
    {
      id: "artifact-brand-hero",
      name: "PhoenixClaw Hero Banner",
      type: "banner",
      previewPath: "/brand/phoenixclaw-mission-control.jpg",
      summary: "Primary mission-control hero artwork.",
      usage: "Overview and shell branding"
    },
    {
      id: "artifact-brand-mark",
      name: "PhoenixClaw Mark",
      type: "image",
      previewPath: "/brand/phoenixclaw.png",
      summary: "Primary emblem and application mark.",
      usage: "Shell identity and assistant bubble"
    },
    {
      id: "artifact-favicon",
      name: "PhoenixClaw Favicon",
      type: "favicon",
      previewPath: "/brand/favicon-256x256.png",
      summary: "Square favicon set for app metadata.",
      usage: "Browser chrome"
    }
  ],
  sessions: [
    {
      id: "session-8842",
      label: "Session MC-8842",
      startedAt: "2026-03-28 03:58",
      operator: "Chief Operator",
      scope: "Unified mission-control implementation",
      status: "active",
      lastMessage: "Blocked work summary delivered to operator mainline.",
      tokens: "58k",
      cost: "$18.34",
      actions: [
        action(
          "act-session-8842-archive",
          "session",
          "session-8842",
          "Archive session",
          "archive",
          "destructive",
          "Archive Session MC-8842 through Giles."
        )
      ],
      links: [
        entity("project", "proj-shell", "Shell Unification", "/projects#proj-shell"),
        entity("agent", "agent-overlay", "Overlay Agent", "/agents#agent-overlay")
      ]
    },
    {
      id: "session-2401",
      label: "Session RS-2401",
      startedAt: "2026-03-28 02:41",
      operator: "Research Ops",
      scope: "Telemetry comparison review",
      status: "healthy",
      lastMessage: "Comparative telemetry notes published to research sync.",
      tokens: "17k",
      cost: "$5.27",
      actions: [
        action(
          "act-session-2401-resume",
          "session",
          "session-2401",
          "Resume session",
          "resume",
          "high-impact",
          "Resume Session RS-2401 through Giles."
        )
      ],
      links: [
        entity("research", "research-shell", "Mission shell density study", "/research#research-shell")
      ]
    }
  ]
});
