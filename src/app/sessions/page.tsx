"use client";

import { SessionRow } from "@/components/sessions/session-row";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { SurfaceState } from "@/components/ui/surface-state";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);
  const connectionState = useMissionStore((state) => state.connectionState);
  const errorMessage = useMissionStore((state) => state.errorMessage);

  if (!snapshot) {
    return (
      <SurfaceState
        variant={connectionState === "degraded" ? "error" : "loading"}
        title={connectionState === "degraded" ? "Sessions unavailable" : "Loading sessions"}
        description={errorMessage ?? "Session history, links, and operator actions are loading."}
      />
    );
  }

  const sortedSessions = [...snapshot.sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading
          eyebrow="Session history"
          title="Operator sessions"
          description="All mission sessions with operator, scope, and linked entities sorted by most recent."
        />
        {sortedSessions.length > 0 ? (
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <SurfaceState
            variant="empty"
            title="No sessions recorded"
            description="Mission sessions and their linked context will appear here once operators start new work."
          />
        )}
      </Panel>
    </div>
  );
};

export default Page;
