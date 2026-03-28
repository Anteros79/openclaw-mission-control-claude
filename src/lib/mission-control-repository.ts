import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";
import { applyControlAction } from "@/lib/mission-control-runtime";
import type {
  MissionChatMessage,
  MissionChatMessageInput,
  MissionControlActionInput,
  MissionControlSnapshot,
  MissionMoveTaskInput
} from "@/types/mission-control";

const DEFAULT_STATE_FILE = path.join(".mission-control", "mission-state.json");

let writeQueue = Promise.resolve();

const stamp = () => new Date().toISOString().replace("T", " ").slice(0, 16);

const resolveStateFile = () =>
  process.env.MISSION_CONTROL_DATA_FILE
    ? path.resolve(process.env.MISSION_CONTROL_DATA_FILE)
    : path.join(process.cwd(), DEFAULT_STATE_FILE);

const ensureDirectory = async (filePath: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

const normalizeSnapshot = (input: unknown) =>
  input as MissionControlSnapshot;

export const moveTaskCardInSnapshot = (
  snapshot: MissionControlSnapshot,
  input: MissionMoveTaskInput
): MissionControlSnapshot => {
  if (input.sourceColumnId === input.targetColumnId) {
    return snapshot;
  }

  const match = snapshot.kanban
    .flatMap((column) => column.cards.map((card) => ({ card, columnId: column.id })))
    .find((entry) => entry.card.id === input.cardId);

  if (!match) {
    return snapshot;
  }

  return {
    ...snapshot,
    lastUpdatedAt: stamp(),
    kanban: snapshot.kanban.map((column) => {
      if (column.id === input.sourceColumnId) {
        return {
          ...column,
          cards: column.cards.filter((card) => card.id !== input.cardId)
        };
      }

      if (column.id === input.targetColumnId) {
        return {
          ...column,
          cards: [match.card, ...column.cards]
        };
      }

      return column;
    }),
    systems: {
      ...snapshot.systems,
      events: [
        {
          id: `evt-task-${input.cardId}-${Date.now()}`,
          kind: "task.update" as const,
          entityKind: "task" as const,
          entityId: input.cardId,
          label: match.card.title,
          detail: `${match.card.title} moved from ${input.sourceColumnId} to ${input.targetColumnId}.`,
          tone: "active" as const,
          occurredAt: stamp()
        },
        ...snapshot.systems.events
      ].slice(0, 8)
    }
  };
};

export const appendChatMessageToSnapshot = (
  snapshot: MissionControlSnapshot,
  input: MissionChatMessageInput
): MissionControlSnapshot => {
  const trimmed = input.content.trim();

  if (!trimmed && input.attachments.length === 0) {
    return snapshot;
  }

  const threadIndex = snapshot.chat.threads.findIndex((thread) => thread.id === input.threadId);
  if (threadIndex === -1) {
    return snapshot;
  }

  const nextThreads = [...snapshot.chat.threads];
  const thread = nextThreads[threadIndex];

  const message: MissionChatMessage = {
    id: `msg-operator-${Date.now()}`,
    role: "operator",
    author: "Chief Operator",
    sentAt: stamp(),
    content: trimmed || "Attached files for review.",
    attachments: input.attachments.length > 0 ? input.attachments : undefined
  };

  const updatedThread = {
    ...thread,
    unreadCount: 0,
    lastMessagePreview: trimmed || input.attachments.map((attachment) => attachment.name).join(", "),
    messages: [...thread.messages, message].slice(-12)
  };

  nextThreads.splice(threadIndex, 1);

  return {
    ...snapshot,
    lastUpdatedAt: stamp(),
    chat: {
      unreadCount: Math.max(0, snapshot.chat.unreadCount - thread.unreadCount),
      threads: [updatedThread, ...nextThreads]
    },
    systems: {
      ...snapshot.systems,
      events: [
        {
          id: `evt-chat-send-${Date.now()}`,
          kind: "chat.activity" as const,
          entityKind: "session" as const,
          entityId: thread.sessionLabel,
          label: thread.title,
          detail: "Operator message persisted to the active assistant thread.",
          tone: "active" as const,
          occurredAt: stamp()
        },
        ...snapshot.systems.events
      ].slice(0, 8)
    }
  };
};

const readFromDisk = async (): Promise<MissionControlSnapshot | null> => {
  try {
    const filePath = resolveStateFile();
    const file = await readFile(filePath, "utf8");
    return normalizeSnapshot(JSON.parse(file));
  } catch {
    return null;
  }
};

export const writeMissionSnapshot = async (snapshot: MissionControlSnapshot) => {
  const filePath = resolveStateFile();

  writeQueue = writeQueue.then(async () => {
    await ensureDirectory(filePath);
    await writeFile(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  });

  await writeQueue;
  return snapshot;
};

export const readMissionSnapshot = async () => {
  const existing = await readFromDisk();
  if (existing) {
    return existing;
  }

  const seed = createSeedMissionControlSnapshot();
  await writeMissionSnapshot(seed);
  return seed;
};

export const updateMissionSnapshot = async (
  updater: (snapshot: MissionControlSnapshot) => MissionControlSnapshot
) => {
  const snapshot = await readMissionSnapshot();
  const updated = updater(snapshot);
  await writeMissionSnapshot(updated);
  return updated;
};

export const applyPersistedControlAction = async (input: MissionControlActionInput) => {
  let result = applyControlAction(await readMissionSnapshot(), input);

  result = {
    ...result,
    snapshot: {
      ...result.snapshot,
      lastUpdatedAt: stamp()
    }
  };

  await writeMissionSnapshot(result.snapshot);
  return result;
};
