"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MissionKanbanColumn, MissionTaskCard } from "@/types/mission-control";

type KanbanState = {
  columns: MissionKanbanColumn[];
  initialize: (columns: MissionKanbanColumn[]) => void;
  moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string) => void;
};

const findCard = (columns: MissionKanbanColumn[], cardId: string) => {
  for (const column of columns) {
    const match = column.cards.find((card) => card.id === cardId);

    if (match) {
      return {
        card: match,
        columnId: column.id
      };
    }
  }

  return null;
};

const removeCard = (cards: MissionTaskCard[], cardId: string) =>
  cards.filter((card) => card.id !== cardId);

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      columns: [],
      initialize: (columns) => {
        if (get().columns.length === 0) {
          set({ columns });
        }
      },
      moveCard: (cardId, sourceColumnId, targetColumnId) => {
        const match = findCard(get().columns, cardId);

        if (!match || sourceColumnId === targetColumnId) {
          return;
        }

        set((state) => ({
          columns: state.columns.map((column) => {
            if (column.id === sourceColumnId) {
              return {
                ...column,
                cards: removeCard(column.cards, cardId)
              };
            }

            if (column.id === targetColumnId) {
              return {
                ...column,
                cards: [match.card, ...column.cards]
              };
            }

            return column;
          })
        }));
      }
    }),
    {
      name: "phoenixclaw-kanban-store",
      partialize: (state) => ({
        columns: state.columns
      })
    }
  )
);
