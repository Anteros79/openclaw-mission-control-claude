"use client";

import { create } from "zustand";

import type { StatusTone } from "@/types/mission-control";

type FilterState = {
  searchQuery: string;
  statusFilter: StatusTone | "all";
  categoryFilter: string;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: StatusTone | "all") => void;
  setCategoryFilter: (category: string) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterState>()((set) => ({
  searchQuery: "",
  statusFilter: "all",
  categoryFilter: "all",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  resetFilters: () => set({ searchQuery: "", statusFilter: "all", categoryFilter: "all" })
}));
