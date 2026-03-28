import type {
  MissionChatMessage,
  MissionControlActionInput,
  MissionControlActionResult,
  MissionControlSnapshot,
  MissionEventEnvelope,
  MissionService,
  StatusTone
} from "@/types/mission-control";

const nowStamp = () => new Date().toISOString().replace("T", " ").slice(0, 16);

const eventToneForService = (service: MissionService): StatusTone => {
  if (service.status === "critical") return "critical";
  if (service.status === "warning") return "warning";
  if (service.status === "active") return "active";
  return "healthy";
};

const appendEvent = (
  snapshot: MissionControlSnapshot,
  event: MissionEventEnvelope
): MissionControlSnapshot["systems"]["events"] => [event, ...snapshot.systems.events].slice(0, 8);

const appendSystemMessage = (
  snapshot: MissionControlSnapshot,
  content: string
): MissionControlSnapshot["chat"] => {
  const thread = snapshot.chat.threads[0];

  if (!thread) {
    return snapshot.chat;
  }

  const message: MissionChatMessage = {
    id: `msg-${Date.now()}`,
    role: "system",
    author: "Giles Gateway",
    sentAt: nowStamp(),
    content
  };

  const updatedThread = {
    ...thread,
    unreadCount: thread.unreadCount + 1,
    lastMessagePreview: content,
    messages: [...thread.messages, message].slice(-8)
  };

  return {
    unreadCount: snapshot.chat.unreadCount + 1,
    threads: [updatedThread, ...snapshot.chat.threads.slice(1)]
  };
};

export const injectMockActivity = (
  snapshot: MissionControlSnapshot
): MissionControlSnapshot => {
  const next = structuredClone(snapshot);
  const service = next.services[0];
  const event: MissionEventEnvelope = {
    id: `evt-chat-${Date.now()}`,
    kind: "chat.activity",
    entityKind: "session",
    entityId: next.sessions[0]?.id ?? "session-live",
    label: "Operator thread activity",
    detail: `${service?.name ?? "Gateway"} reported fresh routing telemetry through Giles.`,
    tone: "active",
    occurredAt: nowStamp()
  };

  next.lastUpdatedAt = nowStamp();
  next.chat = appendSystemMessage(
    next,
    "### Live activity\nGateway telemetry sample arrived from Giles and unread state was refreshed."
  );
  next.systems.events = appendEvent(next, event);

  if (next.metrics[1]) {
    next.metrics[1] = {
      ...next.metrics[1],
      delta: "+3% live",
      tone: "warning"
    };
  }

  return next;
};

export const applyControlAction = (
  snapshot: MissionControlSnapshot,
  input: MissionControlActionInput
): {
  snapshot: MissionControlSnapshot;
  result: MissionControlActionResult;
  event: MissionEventEnvelope;
} => {
  const next = structuredClone(snapshot);
  const occurredAt = nowStamp();

  let event: MissionEventEnvelope = {
    id: `evt-${input.actionId}-${Date.now()}`,
    kind: "control.result",
    entityKind: input.targetKind,
    entityId: input.targetId,
    label: input.command,
    detail: `${input.command} routed through Giles.`,
    tone: "healthy",
    occurredAt
  };

  let message = `${input.command} completed through Giles.`;

  if (input.targetKind === "service") {
    next.services = next.services.map((service) => {
      if (service.id !== input.targetId) return service;

      const status =
        input.command === "restart"
          ? "active"
          : input.command === "pause"
            ? "warning"
            : input.command === "resume"
              ? "healthy"
              : service.status;

      message = `${service.name} ${input.command.replace("_", " ")} routed through Giles to ${service.ownerNodeId}.`;

      return {
        ...service,
        status,
        actions: service.actions
      };
    });

    const service = next.services.find((item) => item.id === input.targetId);
    if (service) {
      event = {
        ...event,
        kind: "service.health",
        label: service.name,
        detail: message,
        tone: eventToneForService(service)
      };
    }
  }

  if (input.targetKind === "cron") {
    next.systems.cronJobs = next.systems.cronJobs.map((job) => {
      if (job.id !== input.targetId) return job;

      message = `${job.name} queued immediately through Giles.`;

      return {
        ...job,
        lastRun: occurredAt,
        nextRun: "Queued now",
        status: "active",
        failureReason: undefined
      };
    });

    const job = next.systems.cronJobs.find((item) => item.id === input.targetId);
    if (job) {
      event = {
        ...event,
        kind: "scheduler.event",
        entityKind: "cron",
        label: job.name,
        detail: message,
        tone: job.status
      };
    }
  }

  if (input.targetKind === "agent") {
    next.agents = next.agents.map((agent) => {
      if (agent.id !== input.targetId) return agent;

      const status =
        input.command === "retry"
          ? "active"
          : input.command === "terminate"
            ? "idle"
            : input.command === "drain"
              ? "warning"
              : agent.status;

      message = `${agent.name} ${input.command.replace("_", " ")} routed through Giles to ${agent.ownerNodeId}.`;

      return {
        ...agent,
        status,
        lastMessage:
          input.command === "retry"
            ? "Recovery path dispatched from Giles."
            : input.command === "terminate"
              ? "Run terminated by operator."
              : "Drain requested by operator.",
        failureReason: input.command === "retry" ? undefined : agent.failureReason
      };
    });

    const agent = next.agents.find((item) => item.id === input.targetId);
    if (agent) {
      event = {
        ...event,
        kind: "agent.status",
        label: agent.name,
        detail: message,
        tone: agent.status
      };
    }
  }

  if (input.targetKind === "session") {
    next.sessions = next.sessions.map((session) => {
      if (session.id !== input.targetId) return session;

      const status =
        input.command === "archive"
          ? "idle"
          : input.command === "resume"
            ? "active"
            : session.status;

      message = `${session.label} ${input.command.replace("_", " ")} routed through Giles.`;

      return {
        ...session,
        status,
        lastMessage:
          input.command === "archive"
            ? "Session archived by operator."
            : "Session resumed for live coordination."
      };
    });

    const session = next.sessions.find((item) => item.id === input.targetId);
    if (session) {
      event = {
        ...event,
        kind: "session.change",
        label: session.label,
        detail: message,
        tone: session.status
      };
    }
  }

  next.chat = appendSystemMessage(next, `**Gateway action:** ${message}`);
  next.systems.events = appendEvent(next, event);
  next.lastUpdatedAt = occurredAt;

  return {
    snapshot: next,
    result: {
      actionId: input.actionId,
      targetKind: input.targetKind,
      targetId: input.targetId,
      status: "succeeded",
      message,
      completedAt: occurredAt
    },
    event
  };
};
