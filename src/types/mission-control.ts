export type MissionSection =
  | "overview"
  | "chat"
  | "operations"
  | "agents"
  | "projects"
  | "research"
  | "artifacts"
  | "systems"
  | "sessions";

export type EntityKind =
  | "agent"
  | "artifact"
  | "cron"
  | "node"
  | "project"
  | "research"
  | "service"
  | "session"
  | "task";

export type EntityRef = {
  kind: EntityKind;
  id: string;
  label: string;
  href: string;
};

export type StatusTone = "healthy" | "warning" | "critical" | "idle" | "active";

export type MissionControlIntent = "safe" | "high-impact" | "destructive";

export type MissionControlTargetKind = "agent" | "cron" | "service" | "session";

export type MissionControlCommand =
  | "archive"
  | "drain"
  | "pause"
  | "restart"
  | "resume"
  | "retry"
  | "run_now"
  | "terminate";

export type MissionControlAction = {
  id: string;
  targetKind: MissionControlTargetKind;
  targetId: string;
  label: string;
  command: MissionControlCommand;
  description: string;
  intent: MissionControlIntent;
  requiresConfirmation: boolean;
  gatewayRouted: boolean;
};

export type MissionControlActionInput = {
  actionId: string;
  targetKind: MissionControlTargetKind;
  targetId: string;
  command: MissionControlCommand;
  confirmationNote?: string;
};

export type MissionControlActionResult = {
  actionId: string;
  targetKind: MissionControlTargetKind;
  targetId: string;
  status: "succeeded" | "failed";
  message: string;
  completedAt: string;
};

export type MissionUsageScope = {
  id: string;
  scopeKind: "agent" | "global" | "project" | "session";
  scopeId: string;
  label: string;
  model: string;
  tokens: string;
  cost: string;
  trend: string;
  status: StatusTone;
};

export type MissionEventEnvelope = {
  id: string;
  kind:
    | "agent.status"
    | "chat.activity"
    | "control.result"
    | "scheduler.event"
    | "service.health"
    | "session.change"
    | "task.update"
    | "usage.sample";
  entityKind: EntityKind;
  entityId: string;
  label: string;
  detail: string;
  tone: StatusTone;
  occurredAt: string;
};

export type MissionMetric = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone: StatusTone;
};

export type MissionAlert = {
  id: string;
  label: string;
  detail: string;
  tone: Exclude<StatusTone, "active">;
};

export type MissionNode = {
  id: string;
  name: string;
  role: "gateway" | "host";
  location: string;
  uptime: string;
  tone: StatusTone;
};

export type MissionService = {
  id: string;
  name: string;
  ownerNodeId: string;
  status: StatusTone;
  runtime: string;
  route: string;
  routeLabel: string;
  cost: string;
  actions: MissionControlAction[];
};

export type MissionChatAttachment = {
  id: string;
  name: string;
  kind: "image" | "pdf" | "markdown" | "config";
  sizeLabel: string;
};

export type MissionChatMessage = {
  id: string;
  role: "assistant" | "operator" | "system";
  author: string;
  sentAt: string;
  content: string;
  attachments?: MissionChatAttachment[];
};

export type MissionChatThread = {
  id: string;
  title: string;
  sessionLabel: string;
  unreadCount: number;
  lastMessagePreview: string;
  messages: MissionChatMessage[];
};

export type MissionTaskCard = {
  id: string;
  title: string;
  owner: string;
  severity: "P0" | "P1" | "P2";
  metadata: string[];
  links: EntityRef[];
};

export type MissionKanbanColumn = {
  id: string;
  title: string;
  cards: MissionTaskCard[];
};

export type MissionAgentRun = {
  id: string;
  name: string;
  status: StatusTone;
  ownerNodeId: string;
  sessionId?: string;
  model: string;
  tokens: string;
  cost: string;
  runtime: string;
  step: string;
  lastMessage: string;
  failureReason?: string;
  locality: "local" | "cloud";
  actions: MissionControlAction[];
};

export type MissionProject = {
  id: string;
  name: string;
  status: StatusTone;
  milestone: string;
  dependencySummary: string;
  blockedSummary: string;
  links: EntityRef[];
};

export type MissionResearchItem = {
  id: string;
  title: string;
  category: "summary" | "comparison" | "finding" | "prompt-pack";
  summary: string;
  links: EntityRef[];
};

export type MissionArtifact = {
  id: string;
  name: string;
  type: "image" | "banner" | "favicon" | "pdf" | "markdown" | "config" | "model-output";
  previewPath?: string;
  summary: string;
  usage: string;
};

export type MissionSession = {
  id: string;
  label: string;
  startedAt: string;
  operator: string;
  scope: string;
  status: StatusTone;
  lastMessage: string;
  tokens: string;
  cost: string;
  actions: MissionControlAction[];
  links: EntityRef[];
};

export type MissionCronJob = {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: StatusTone;
  ownerNodeId: string;
  model: string;
  duration: string;
  failureReason?: string;
  actions: MissionControlAction[];
};

export type MissionInventoryItem = {
  id: string;
  name: string;
  kind: "app" | "gateway" | "service" | "worker";
  ownerNodeId: string;
  placement: string;
  status: StatusTone;
  href: string;
};

export type MissionNodeRegistryEntry = {
  nodeId: string;
  nodeName: string;
  role: "gateway" | "host";
  capabilities: string[];
  serviceIds: string[];
  agentIds: string[];
  sessionIds: string[];
  cronJobIds: string[];
};

export type MissionServiceRegistryEntry = {
  serviceId: string;
  serviceName: string;
  ownerNodeId: string;
  adapter: "gateway" | "seed";
  resolverPath: string;
  routeLabel: string;
  gatewaySafe: boolean;
};

export type MissionControlSnapshot = {
  lastUpdatedAt: string;
  tagline: string;
  gatewayName: string;
  metrics: MissionMetric[];
  nodes: MissionNode[];
  services: MissionService[];
  registries: {
    nodes: MissionNodeRegistryEntry[];
    services: MissionServiceRegistryEntry[];
  };
  systems: {
    alerts: MissionAlert[];
    inventory: MissionInventoryItem[];
    cronJobs: MissionCronJob[];
    usage: MissionUsageScope[];
    events: MissionEventEnvelope[];
  };
  chat: {
    unreadCount: number;
    threads: MissionChatThread[];
  };
  kanban: MissionKanbanColumn[];
  agents: MissionAgentRun[];
  projects: MissionProject[];
  research: MissionResearchItem[];
  artifacts: MissionArtifact[];
  sessions: MissionSession[];
};
