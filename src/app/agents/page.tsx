"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ControlActionGroup } from "@/components/ui/control-action-group";
import { FilterBar } from "@/components/ui/filter-bar";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfaceState } from "@/components/ui/surface-state";
import { useFilterStore } from "@/stores/filter-store";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);
  const connectionState = useMissionStore((state) => state.connectionState);
  const errorMessage = useMissionStore((state) => state.errorMessage);
  const pendingActionId = useMissionStore((state) => state.pendingActionId);
  const requestAction = useMissionStore((state) => state.requestAction);
  const { searchQuery, statusFilter, categoryFilter, setSearchQuery, setStatusFilter, setCategoryFilter } = useFilterStore();

  const filteredAgents = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.agents.filter((agent) => {
      if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== "all" && agent.status !== statusFilter) return false;
      if (categoryFilter !== "all" && agent.locality !== categoryFilter) return false;
      return true;
    });
  }, [snapshot, searchQuery, statusFilter, categoryFilter]);

  if (!snapshot) {
    return (
      <SurfaceState
        variant={connectionState === "degraded" ? "error" : "loading"}
        title={connectionState === "degraded" ? "Agent runtime unavailable" : "Loading agent runtime"}
        description={errorMessage ?? "Agent status, model burn, and control actions are loading."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search agents..."
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "healthy", label: "Healthy" },
              { value: "warning", label: "Warning" },
              { value: "critical", label: "Critical" },
              { value: "idle", label: "Idle" }
            ],
            onChange: (v) => setStatusFilter(v as "all" | "active" | "healthy" | "warning" | "critical" | "idle")
          },
          {
            label: "Locality",
            value: categoryFilter,
            options: [
              { value: "all", label: "All localities" },
              { value: "local", label: "Local" },
              { value: "cloud", label: "Cloud" }
            ],
            onChange: setCategoryFilter
          }
        ]}
      />

      <Panel>
        <SectionHeading
          eyebrow="Sub-agent runtime"
          title="Active and recent agents"
          description="Model, token, cost, runtime, step, last message, locality, and failure state stay visible in one operator surface."
        />
        {filteredAgents.length > 0 ? (
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                id={agent.id}
                className="grid gap-4 rounded-[24px] border border-white/8 bg-white/5 p-5 xl:grid-cols-[1.1fr_0.9fr]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg text-white">{agent.name}</p>
                    <StatusPill tone={agent.status}>{agent.status}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm text-white/70">{agent.lastMessage}</p>
                  {agent.failureReason ? (
                    <p className="mt-2 text-sm text-rose-200/90">Failure: {agent.failureReason}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/38">
                    <span>Node {agent.ownerNodeId}</span>
                    {agent.sessionId ? (
                      <Link href={`/sessions#${agent.sessionId}`} className="text-emerald-200/75 transition hover:text-emerald-100">
                        Session {agent.sessionId}
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">Model</p>
                    <p className="mt-2 text-sm text-white/75">{agent.model}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">Tokens</p>
                    <p className="mt-2 text-sm text-white/75">{agent.tokens}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">Cost</p>
                    <p className="mt-2 text-sm text-white/75">{agent.cost}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">Runtime</p>
                    <p className="mt-2 text-sm text-white/75">{agent.runtime}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">Step</p>
                    <p className="mt-2 text-sm text-white/75">{agent.step}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">Execution</p>
                    <p className="mt-2 text-sm text-white/75">{agent.locality}</p>
                  </div>
                </div>
                <div className="xl:col-span-2">
                  <ControlActionGroup
                    actions={agent.actions}
                    pendingActionId={pendingActionId}
                    onAction={requestAction}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SurfaceState
            variant="empty"
            title="No agents match the current filters"
            description="Clear or relax the active filters to restore the sub-agent runtime list."
          />
        )}
      </Panel>
    </div>
  );
};

export default Page;
