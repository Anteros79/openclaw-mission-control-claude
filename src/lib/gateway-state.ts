import { getGatewayClient } from "@/lib/gateway-ws-client";
import type {
  MissionAgentRun,
  MissionControlSnapshot,
  MissionCronJob,
  MissionNode,
  MissionService,
  MissionSession,
  StatusTone
} from "@/types/mission-control";

export type GatewaySession = {
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

export type GatewaySessionsList = {
  sessions?: GatewaySession[];
  defaults?: { model?: string; modelProvider?: string };
} | null;

export type GatewayAgent = {
  id: string;
  name?: string;
  identity?: { name?: string };
};

export type GatewayAgentsList = {
  agents?: GatewayAgent[];
  defaultId?: string;
} | null;

export type GatewayCronJob = {
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

export type GatewayCronList = {
  jobs?: GatewayCronJob[];
  total?: number;
} | null;

export type GatewayCronStatus = {
  enabled?: boolean;
  nextWakeAtMs?: number;
} | null;

export type GatewayConfig = {
  gatewayName?: string;
  version?: string;
} | null;

export type GatewayPayload = {
  sessions: GatewaySessionsList;
  agents: GatewayAgentsList;
  cronList: GatewayCronList;
  cronStatus: GatewayCronStatus;
  health: GatewayConfig;
  error?: string;
};

const stamp = () => new Date().toISOString().replace("T", " ").slice(0, 16);

const toTone = (status?: string | null): StatusTone => {
  if (!status) return "idle";
  const normalized = status.toLowerCase();
  if (normalized === "active" || normalized === "running" || normalized === "up") return "active";
  if (normalized === "healthy" || normalized === "ready" || normalized === "ok") return "healthy";
  if (normalized === "warning" || normalized === "degraded") return "warning";
  if (normalized === "critical" || normalized === "down" || normalized === "offline" || normalized === "failed") {
    return "critical";
  }
  return "idle";
};

const formatTokens = (value?: number) => {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
};

const formatCost = (tokens?: number) => {
  if (tokens == null) return "—";
  const estimate = (tokens / 1_000_000) * 8;
  return estimate < 0.01 ? "<$0.01" : `$${estimate.toFixed(2)}`;
};

export const fetchGatewayPayload = async (): Promise<GatewayPayload | null> => {
  const client = getGatewayClient();

  if (!client) {
    return null;
  }

  try {
    const [sessions, agents, cronList, cronStatus, health] = await Promise.all([
      client.request<GatewaySessionsList>("sessions.list", {}).catch(() => null),
      client.request<GatewayAgentsList>("agents.list", {}).catch(() => null),
      client
        .request<GatewayCronList>("cron.list", { includeDisabled: true, limit: 50, offset: 0 })
        .catch(() => null),
      client.request<GatewayCronStatus>("cron.status", {}).catch(() => null),
      client.request<GatewayConfig>("config.get", {}).catch(() => null)
    ]);

    return { sessions, agents, cronList, cronStatus, health };
  } catch (error) {
    return {
      sessions: null,
      agents: null,
      cronList: null,
      cronStatus: null,
      health: null,
      error: error instanceof Error ? error.message : "gateway error"
    };
  }
};

export const mergeGatewayPayloadIntoSnapshot = (
  payload: GatewayPayload,
  snapshot: MissionControlSnapshot
): MissionControlSnapshot => {
  if (payload.error) {
    return snapshot;
  }

  const sessions: MissionSession[] =
    payload.sessions?.sessions?.map((session) => ({
      id: session.key,
      label: session.label || session.key,
      startedAt: session.createdAt ?? stamp(),
      operator: session.scope ?? "Operator",
      scope: session.scope ?? "session",
      status: "active",
      lastMessage: session.updatedAt ? `Updated ${session.updatedAt}` : "Active",
      tokens: formatTokens(session.totalTokens),
      cost: formatCost(session.totalTokens),
      actions: snapshot.sessions.find((item) => item.id === session.key)?.actions ?? [],
      links: snapshot.sessions.find((item) => item.id === session.key)?.links ?? []
    })) ?? snapshot.sessions;

  const agents: MissionAgentRun[] =
    payload.agents?.agents?.map((agent) => {
      const name = agent.identity?.name || agent.name || agent.id;
      const existing = snapshot.agents.find((item) => item.id === agent.id);

      return {
        id: agent.id,
        name,
        status: "healthy",
        ownerNodeId: existing?.ownerNodeId ?? "giles",
        sessionId: existing?.sessionId,
        model: payload.sessions?.defaults?.model ?? existing?.model ?? "default",
        tokens: existing?.tokens ?? "—",
        cost: existing?.cost ?? "—",
        runtime: existing?.runtime ?? "Agent",
        step: existing?.step ?? "Configured",
        lastMessage: existing?.lastMessage ?? `Agent ${name} configured`,
        failureReason: existing?.failureReason,
        locality: existing?.locality ?? "cloud",
        actions: existing?.actions ?? []
      };
    }) ?? snapshot.agents;

  const cronJobs: MissionCronJob[] =
    payload.cronList?.jobs?.map((job) => {
      const existing = snapshot.systems.cronJobs.find((item) => item.id === job.id);

      return {
        id: job.id,
        name: job.name,
        schedule: job.cron || job.schedule || "—",
        lastRun: job.state?.lastRunAt ?? existing?.lastRun ?? "—",
        nextRun: payload.cronStatus?.enabled === false ? "Paused" : existing?.nextRun ?? "Scheduled",
        status: toTone(job.state?.lastStatus),
        ownerNodeId: existing?.ownerNodeId ?? "giles",
        model: existing?.model ?? payload.sessions?.defaults?.model ?? "default",
        duration:
          job.state?.lastDurationMs != null
            ? `${(job.state.lastDurationMs / 1000).toFixed(1)}s`
            : existing?.duration ?? "—",
        failureReason: job.state?.failureReason ?? existing?.failureReason,
        actions: existing?.actions ?? []
      };
    }) ?? snapshot.systems.cronJobs;

  const gatewayName = payload.health?.gatewayName ?? snapshot.gatewayName;
  const nodes: MissionNode[] = snapshot.nodes.map((node) =>
    node.id === "giles"
      ? {
          ...node,
          name: gatewayName,
          location: "Tailnet Edge",
          uptime: "Live",
          tone: "healthy"
        }
      : node
  );

  const services: MissionService[] = snapshot.services.map((service) =>
    service.id === "svc-chat"
      ? {
          ...service,
          name: `${gatewayName} Gateway`,
          ownerNodeId: "giles",
          runtime: "gateway"
        }
      : service
  );

  const totalTokens = (payload.sessions?.sessions ?? []).reduce(
    (sum, session) => sum + (session.totalTokens ?? 0),
    0
  );

  const metrics = snapshot.metrics.map((metric) => {
    if (metric.id === "gateway") {
      return {
        ...metric,
        value: gatewayName,
        delta: payload.health?.version ? `v${payload.health.version}` : metric.delta,
        tone: "healthy" as const
      };
    }

    if (metric.id === "agents") {
      return {
        ...metric,
        value: String(agents.length),
        tone: agents.length > 0 ? ("active" as const) : ("idle" as const)
      };
    }

    if (metric.id === "burn") {
      return {
        ...metric,
        value: formatCost(totalTokens),
        delta: totalTokens > 0 ? `${formatTokens(totalTokens)} tokens` : metric.delta
      };
    }

    return metric;
  });

  return {
    ...snapshot,
    lastUpdatedAt: stamp(),
    tagline: `Live from ${gatewayName} gateway`,
    gatewayName,
    metrics,
    nodes,
    services,
    agents,
    sessions,
    systems: {
      ...snapshot.systems,
      cronJobs
    },
    registries: {
      nodes: snapshot.registries.nodes.map((entry) =>
        entry.nodeId === "giles"
          ? {
              ...entry,
              nodeName: gatewayName,
              sessionIds: sessions.map((session) => session.id),
              agentIds: agents.map((agent) => agent.id),
              cronJobIds: cronJobs.map((job) => job.id)
            }
          : entry
      ),
      services: snapshot.registries.services
    }
  };
};
