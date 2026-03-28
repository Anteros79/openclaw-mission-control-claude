"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { MissionChatAttachment } from "@/types/mission-control";

type LocalAttachment = MissionChatAttachment & {
  id: string;
  name: string;
  sizeLabel: string;
};

const inferAttachmentKind = (fileName: string): MissionChatAttachment["kind"] => {
  const normalized = fileName.toLowerCase();

  if (normalized.endsWith(".png") || normalized.endsWith(".jpg") || normalized.endsWith(".jpeg") || normalized.endsWith(".gif") || normalized.endsWith(".webp")) {
    return "image";
  }

  if (normalized.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalized.endsWith(".md") || normalized.endsWith(".markdown")) {
    return "markdown";
  }

  return "config";
};

type AssistantState = {
  activeThreadId: string;
  draft: string;
  isOpen: boolean;
  pendingAttachments: LocalAttachment[];
  unreadCount: number;
  markAllRead: () => void;
  seedUnreadCount: (value: number) => void;
  syncUnreadCount: (value: number) => void;
  setActiveThreadId: (threadId: string) => void;
  setDraft: (value: string) => void;
  toggleOpen: () => void;
  close: () => void;
  addAttachment: (file: File) => void;
  clearPendingAttachments: () => void;
};

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      activeThreadId: "thread-ops",
      draft: "",
      isOpen: false,
      pendingAttachments: [],
      unreadCount: 0,
      markAllRead: () => set({ unreadCount: 0 }),
      seedUnreadCount: (value) => {
        if (get().unreadCount === 0) {
          set({ unreadCount: value });
        }
      },
      syncUnreadCount: (value) => set({ unreadCount: value }),
      setActiveThreadId: (threadId) => set({ activeThreadId: threadId }),
      setDraft: (value) => set({ draft: value }),
      toggleOpen: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          unreadCount: state.isOpen ? state.unreadCount : 0
        })),
      close: () => set({ isOpen: false }),
      addAttachment: (file) =>
        set((state) => ({
          pendingAttachments: [
            ...state.pendingAttachments,
            {
              id: `${file.name}-${file.size}-${Date.now()}`,
              name: file.name,
              kind: inferAttachmentKind(file.name),
              sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`
            }
          ]
        })),
      clearPendingAttachments: () => set({ pendingAttachments: [] })
    }),
    {
      name: "phoenixclaw-assistant-store",
      partialize: (state) => ({
        activeThreadId: state.activeThreadId,
        draft: state.draft,
        isOpen: state.isOpen,
        pendingAttachments: state.pendingAttachments,
        unreadCount: state.unreadCount
      })
    }
  )
);
