import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";
import { applyControlAction } from "@/lib/mission-control-runtime";
import type { MissionDataAdapter } from "@/adapters/types";
import type { MissionChatMessageInput, MissionMoveTaskInput } from "@/types/mission-control";

const moveTaskCard = (snapshot: ReturnType<typeof createSeedMissionControlSnapshot>, input: MissionMoveTaskInput) => {
  const match = snapshot.kanban
    .flatMap((column) => column.cards.map((card) => ({ card, columnId: column.id })))
    .find((entry) => entry.card.id === input.cardId);

  if (!match || input.sourceColumnId === input.targetColumnId) {
    return snapshot;
  }

  return {
    ...snapshot,
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
    })
  };
};

const sendChatMessage = (
  snapshot: ReturnType<typeof createSeedMissionControlSnapshot>,
  input: MissionChatMessageInput
) => ({
  ...snapshot,
  chat: {
    ...snapshot.chat,
    threads: snapshot.chat.threads.map((thread) =>
      thread.id === input.threadId
        ? {
            ...thread,
            unreadCount: 0,
            lastMessagePreview: input.content,
            messages: [
              ...thread.messages,
              {
                id: `msg-${Date.now()}`,
                role: "operator" as const,
                author: "Chief Operator",
                sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
                content: input.content,
                attachments: input.attachments.length > 0 ? input.attachments : undefined
              }
            ]
          }
        : thread
    )
  }
});

export const createSeedAdapter = (): MissionDataAdapter => {
  let snapshot = createSeedMissionControlSnapshot();

  return {
    async getSnapshot() {
      return snapshot;
    },
    async runControlAction(input) {
      const applied = applyControlAction(snapshot, input);
      snapshot = applied.snapshot;

      return applied;
    },
    async moveTaskCard(input) {
      snapshot = moveTaskCard(snapshot, input);
      return snapshot;
    },
    async sendChatMessage(input) {
      snapshot = sendChatMessage(snapshot, input);
      return snapshot;
    }
  };
};
