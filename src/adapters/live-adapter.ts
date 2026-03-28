import type { MissionDataAdapter } from "@/adapters/types";
import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";
import { applyControlAction } from "@/lib/mission-control-runtime";
import type {
  MissionAgentRun,
  MissionControlActionResult,
  MissionControlSnapshot,
  MissionCronJob,
  MissionNode,
  MissionService,
  MissionSession,
  StatusTone
} from "@/types/mission-control";

// ─── Gateway WS response shapes ──────────────────────────────────────────────

type GwSession = {
  key: string;
  label?: string;
  scope?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  contextTokens?: number;
  createdAt?: string;
  updatedAt?: string;
};

type GwSessionsList = {
  sessions?: GwSession[];
  defaults?: { model?: string; modelProvider?: string };
} | null;

type GwAgent = {
  id: string;
  name?: string;
  identity?: { name?: string };
};

type GwAgentsList = {
  agents?: GwAgent[];
  defaultId?: string;
} | null;

type GwCronJob = {
  id: string;
  name: string;
  schedule?: string;
  cron?: string;
  enabled?: boolean;
  state?: {
    lastStatus?: string;
    lastRunAt?: string;
    lastDurationMs?: number;
    failureReason?: string;
  };
};

type GwCronList = {
  jobs?: GwCronJob[];
  total?: number;
} | null;

type GwCronStatus = {
  enabled?: boolean;
  nextWakeAtMs?: number;
} | null;

type GwConfig = {
  gatewayName?: string;
  version?: string;
} | null;

type GatewayPayload = {
  sessions: GwSessionsList;
  agents: GwAgentsList;
  cronList: GwCronList;
  cronStatus: GwCronStatus;
  health: GwConfig;
  error?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stamp = () => new Date().toISOString().replace("T", " ").slice(0, 16);

const toTone = (status?: string | null): StatusTone => {
  if (!status) return "idle";
  const s = status.toLowerCase();
  if (s === "active" || s === "running" || s === "up") return "active";
  if (s === "healthy" || s === "ready" || s === "ok" || s === "recent" || s === "success") return "healthy";
  if (s === "warning" || s === "degraded") return "warning";
  if (s === "critical" || s === "down" || s === "offline" || s === "error" || s === "failed") return "critical";
  return "idle";
};

const formatTokens = (n?: number) => {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
};

const formatCost = (tokens?: number) => {
  if (tokens == null) return "—";
  // Rough estimate: $3/M input, $15/M output — use $8/M average
  const cost = (tokens / 1_000_000) * 8;
  return cost < 0.01 ? "<$0.01" : `$${cost.toFixed(2)}`;
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapGatewayToSnapshot(
  payload: GatewayPayload,
  seed: MissionControlSnapshot
): MissionControlSnapshot {
  const gwSessions = payload.sessions?.sessions ?? [];
  const gwAgents = payload.agents?.agents ?? [];
  const gwCronJobs = payload.cronList?.jobs ?? [];
  const cronEnabled = payload.cronStatus?.enabled ?? true;
  const gatewayName = payload.health?.gatewayName ?? "Giles";

  // ── Sessions ──
  const sessions: MissionSession[] = gwSessions.length > 0
    ? gwSessions.map((s) => ({
        id: s.key,
        label: s.label || s.key,
        startedAt: s.createdAt ?? stamp(),
        operator: s.scope ?? "Operator",
        scope: s.scope ?? "session",
        status: "active" as StatusTone,
        lastMessage: s.updatedAt ? `Updated ${s.updatedAt}` : "Active",
        tokens: formatTokens(s.totalTokens),
        cost: formatCost(s.totalTokens),
        actions: [],
        links: []
      }))
    : seed.sessions;

  // ── Agents ──
  const agents: MissionAgentRun[] = gwAgents.length > 0
    ? gwAgents.map((a) => {
        const name = a.identity?.name || a.name || a.id;
        const isDefault = a.id === payload.agents?.defaultId;
        return {
          id: a.id,
          name,
          status: "healthy" as StatusTone,
          ownerNodeId: "giles",
          model: payload.sessions?.defaults?.model ?? "default",
          tokens: "—",
          cost: "—",
          runtime: isDefault ? "Default agent" : "Agent",
          step: isDefault ? "Default" : "Configured",
          lastMessage: isDefault ? "Default agent — always available" : `Agent ${name} configured`,
          locality: "cloud" as const,
          actions: []
        };
      })
    : seed.agents;

  // ── Cron Jobs ──
  const cronJobs: MissionCronJob[] = gwCronJobs.length > 0
    ? gwCronJobs.map((j) => ({
        id: j.id,
        name: j.name,
        schedule: j.cron || j.schedule || "—",
        lastRun: j.state?.lastRunAt ?? "—",
        nextRun: cronEnabled ? "Scheduled" : "Paused",
        status: toTone(j.state?.lastStatus),
        ownerNodeId: "giles",
        model: payload.sessions?.defaults?.model ?? "default",
        duration: j.state?.lastDurationMs != null ? `${(j.state.lastDurationMs / 1000).toFixed(1)}s` : "—",
        failureReason: j.state?.failureReason,
        actions: []
      }))
    : seed.systems.cronJobs;

  // ── Nodes (always Giles as gateway) ──
  const nodes: MissionNode[] = [
    {
      id: "giles",
      name: gatewayName,
      role: "gateway",
      location: "Tailnet Edge",
      uptime: "Live",
      tone: "healthy"
    }
  ];

  // ── Services (derived from what's running) ──
  const services: MissionService[] = [
    {
      id: "svc-gateway",
      name: `${gatewayName} Gateway`,
      ownerNodeId: "giles",
      status: "healthy",
      runtime: "gateway",
      route: "https://giles.taile51c67.ts.net",
      routeLabel: "Open Gateway",
      cost: "—",
      actions: []
    },
    {
      id: "svc-cron",
      name: "Cron Scheduler",
      ownerNodeId: "giles",
      status: cronEnabled ? "healthy" : "warning",
      runtime: "scheduler",
      route: "/systems",
      routeLabel: "View Cron",
      cost: "—",
      actions: []
    }
  ];

  // ── Metrics ──
  const totalTokens = gwSessions.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0);
  const metrics = [
    {
      id: "gateway",
      label: "Gateway",
      value: "Online",
      delta: payload.health?.version ? `v${payload.health.version}` : undefined,
      tone: "healthy" as StatusTone
    },
    {
      id: "sessions",
      label: "Sessions",
      value: String(gwSessions.length || sessions.length),
      delta: gwSessions.length > 0 ? "live" : undefined,
      tone: (gwSessions.length > 0 ? "active" : "idle") as StatusTone
    },
    {
      id: "agents",
      label: "Agents",
      value: String(gwAgents.length || agents.length),
      tone: (gwAgents.length > 0 ? "healthy" : "idle") as StatusTone
    },
    {
      id: "cron",
      label: "Cron Jobs",
      value: String(gwCronJobs.length || cronJobs.length),
      delta: cronEnabled ? "enabled" : "paused",
      tone: (cronEnabled ? "healthy" : "warning") as StatusTone
    },
    {
      id: "tokens",
      label: "Total Tokens",
      value: formatTokens(totalTokens || undefined),
      delta: formatCost(totalTokens || undefined),
      tone: "healthy" as StatusTone
    }
  ];

  return {
    ...seed,
    lastUpdatedAt: stamp(),
    tagline: `Live from ${gatewayName} gateway`,
    gatewayName,
    metrics,
    nodes,
    services,
    registries: {
      nodes: nodes.map((n) => ({
        nodeId: n.id,
        nodeName: n.name,
        role: n.role,
        capabilities: [],
        serviceIds: services.filter((s) => s.ownerNodeId === n.id).map((s) => s.id),
        agentIds: agents.map((a) => a.id),
        sessionIds: sessions.map((s) => s.id),
        cronJobIds: cronJobs.map((c) => c.id)
      })),
      services: services.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        ownerNodeId: s.ownerNodeId,
        adapter: "gateway" as const,
        resolverPath: s.route,
        routeLabel: s.routeLabel,
        gatewaySafe: true
      }))
    },
    systems: {
      ...seed.systems,
      cronJobs,
      events: seed.systems.events
    },
    agents,
    sessions
  };
}

// ─── Factory ──────────────────────────────────────────────────────────────────

const createLiveAdapter = (): MissionDataAdapter => {
  let snapshot = createSeedMissionControlSnapshot();

  const getSnapshot = async (): Promise<MissionControlSnapshot> => {
    const seed = createSeedMissionControlSnapshot();

    try {
      const response = await fetch("/api/gateway/snapshot", { cache: "no-store" });

      if (!response.ok) return snapshot;

      const payload = (await response.json()) as GatewayPayload;

      if (payload.error) {
        console.warn("Gateway error:", payload.error);
        return snapshot;
      }

      snapshot = mapGatewayToSnapshot(payload, seed);
      return snapshot;
    } catch {
      return snapshot;
    }
  };

  const runControlAction = async (
    input: Parameters<MissionDataAdapter["runControlAction"]>[0]
  ) => {
    try {
      const response = await fetch("/api/gateway/control", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });

      if (!response.ok) throw new Error("control_failed");

      const body = (await response.json()) as {
        event?: MissionControlSnapshot["systems"]["events"][number];
        result?: { actionId: string; message: string; status: "failed" | "succeeded"; completedAt: string };
      };

      const refreshed = await getSnapshot();

      const result: MissionControlActionResult = body.result
        ? {
            actionId: body.result.actionId,
            targetKind: input.targetKind,
            targetId: input.targetId,
            status: body.result.status,
            message: body.result.message,
            completedAt: body.result.completedAt
          }
        : {
            actionId: input.actionId,
            targetKind: input.targetKind,
            targetId: input.targetId,
            status: "succeeded",
            message: `${input.command} routed through Giles.`,
            completedAt: stamp()
          };

      return { event: body.event, result, snapshot: refreshed };
    } catch {
      const applied = applyControlAction(snapshot, input);
      snapshot = applied.snapshot;
      return applied;
    }
  };

  return {
    getSnapshot,
    runControlAction,
    async moveTaskCard() {
      return getSnapshot();
    },
    async sendChatMessage() {
      return getSnapshot();
    }
  };
};

export { createLiveAdapter };
