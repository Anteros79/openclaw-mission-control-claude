"use client";

import { useMemo } from "react";

import { ResearchCard } from "@/components/research/research-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useFilterStore } from "@/stores/filter-store";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);
  const { searchQuery, categoryFilter, setSearchQuery, setCategoryFilter } = useFilterStore();

  const filteredResearch = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.research.filter((item) => {
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      return true;
    });
  }, [snapshot, searchQuery, categoryFilter]);

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search research..."
        filters={[
          {
            label: "Category",
            value: categoryFilter,
            options: [
              { value: "all", label: "All categories" },
              { value: "summary", label: "Summary" },
              { value: "comparison", label: "Comparison" },
              { value: "finding", label: "Finding" },
              { value: "prompt-pack", label: "Prompt pack" }
            ],
            onChange: setCategoryFilter
          }
        ]}
      />

      <Panel>
        <SectionHeading
          eyebrow="Research library"
          title="Notes, findings, and prompt packs"
          description="Summaries, comparisons, references, and reusable prompt packs linked back to tasks and projects."
        />
        <div className="space-y-4">
          {filteredResearch.map((item) => (
            <ResearchCard key={item.id} item={item} />
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default Page;
