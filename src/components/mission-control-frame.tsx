"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import { createDataAdapter } from "@/adapters";
import { AppShell } from "@/components/app-shell";
import { MissionControlOperatorLayer } from "@/components/mission-control-operator-layer";
import { SurfaceState } from "@/components/ui/surface-state";
import { useMissionStore } from "@/stores/mission-store";

const adapter = createDataAdapter();

export const MissionControlFrame = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const connect = useMissionStore((state) => state.connect);
  const connectionState = useMissionStore((state) => state.connectionState);
  const errorMessage = useMissionStore((state) => state.errorMessage);
  const snapshot = useMissionStore((state) => state.snapshot);

  useEffect(() => {
    return connect(adapter);
  }, [connect]);

  const activity = useMemo(
    () => ({
      chatUnreadCount: snapshot?.chat.unreadCount ?? 0,
      systemAlertCount: snapshot?.systems.alerts.length ?? 0
    }),
    [snapshot]
  );

  const assistantThreads = useMemo(
    () => snapshot?.chat.threads ?? [],
    [snapshot]
  );

  return (
    <>
      <AppShell
        activePath={pathname}
        activity={activity}
        assistantThreads={assistantThreads}
        connectionState={connectionState}
        lastUpdatedAt={snapshot?.lastUpdatedAt}
      >
        {connectionState === "degraded" && snapshot ? (
          <div className="mb-6">
            <SurfaceState
              compact
              variant="degraded"
              title="Gateway state degraded"
              description={
                errorMessage ??
                "Live control-plane data is delayed. Persisted mission state remains available while Giles recovers."
              }
            />
          </div>
        ) : null}
        {children}
      </AppShell>
      <MissionControlOperatorLayer />
    </>
  );
};
