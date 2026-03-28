"use client";

import { useMemo, useState } from "react";
import { Grid3X3, List } from "lucide-react";

import { ArtifactCard } from "@/components/artifacts/artifact-card";
import { ArtifactTypeIcon } from "@/components/artifacts/artifact-type-icon";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceState } from "@/components/ui/surface-state";
import { useFilterStore } from "@/stores/filter-store";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);
  const connectionState = useMissionStore((state) => state.connectionState);
  const errorMessage = useMissionStore((state) => state.errorMessage);
  const { searchQuery, categoryFilter, setSearchQuery, setCategoryFilter } = useFilterStore();
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");

  const filteredArtifacts = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.artifacts.filter((artifact) => {
      if (searchQuery && !artifact.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== "all" && artifact.type !== categoryFilter) return false;
      return true;
    });
  }, [snapshot, searchQuery, categoryFilter]);

  if (!snapshot) {
    return (
      <SurfaceState
        variant={connectionState === "degraded" ? "error" : "loading"}
        title={connectionState === "degraded" ? "Artifact library unavailable" : "Loading artifact library"}
        description={errorMessage ?? "Brand assets, configs, and model outputs are loading."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search artifacts..."
            filters={[
              {
                label: "Type",
                value: categoryFilter,
                options: [
                  { value: "all", label: "All types" },
                  { value: "image", label: "Image" },
                  { value: "banner", label: "Banner" },
                  { value: "favicon", label: "Favicon" },
                  { value: "pdf", label: "PDF" },
                  { value: "markdown", label: "Markdown" },
                  { value: "config", label: "Config" },
                  { value: "model-output", label: "Model output" }
                ],
                onChange: setCategoryFilter
              }
            ]}
          />
        </div>
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.18))] p-1">
          <button
            type="button"
            onClick={() => setViewMode("gallery")}
            aria-label="Gallery view"
            className={`rounded-xl p-2 transition ${
              viewMode === "gallery"
                ? "bg-emerald-300/14 text-white shadow-[0_0_18px_rgba(34,197,94,0.12)]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`rounded-xl p-2 transition ${
              viewMode === "list"
                ? "bg-emerald-300/14 text-white shadow-[0_0_18px_rgba(34,197,94,0.12)]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Panel>
        <SectionHeading
          eyebrow="Artifact library"
          title="Images, documents, and outputs"
          description="Brand assets, configs, prompt packs, and model outputs with preview galleries."
        />

        {filteredArtifacts.length > 0 ? (
          viewMode === "gallery" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArtifacts.map((artifact) => (
                <ArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArtifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  id={artifact.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4"
                >
                  <ArtifactTypeIcon type={artifact.type} className="h-5 w-5 text-white/40" />
                  <div className="flex-1">
                    <p className="text-sm text-white">{artifact.name}</p>
                    <p className="mt-1 text-sm text-white/60">{artifact.summary}</p>
                  </div>
                  <Badge>{artifact.type}</Badge>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/38">{artifact.usage}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <SurfaceState
            variant="empty"
            title="No artifacts match the current filters"
            description="Clear the search or change the type filter to restore the artifact library view."
          />
        )}
      </Panel>
    </div>
  );
};

export default Page;
