"use client";

import { create } from "zustand";

import type { EntityKind } from "@/types/mission-control";

type DrawerState = {
  isOpen: boolean;
  entityKind: EntityKind | null;
  entityId: string | null;
  openDrawer: (kind: EntityKind, id: string) => void;
  closeDrawer: () => void;
};

export const useDrawerStore = create<DrawerState>()((set) => ({
  isOpen: false,
  entityKind: null,
  entityId: null,
  openDrawer: (kind, id) => set({ isOpen: true, entityKind: kind, entityId: id }),
  closeDrawer: () => set({ isOpen: false, entityKind: null, entityId: null })
}));
