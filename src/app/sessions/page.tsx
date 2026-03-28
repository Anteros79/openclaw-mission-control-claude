"use client";

import { SessionRow } from "@/components/sessions/session-row";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);

  if (!snapshot) return null;

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
        <div className="space-y-4">
          {sortedSessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default Page;
