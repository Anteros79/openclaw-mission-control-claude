"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import { createDataAdapter } from "@/adapters";
import { AppShell } from "@/components/app-shell";
import { MissionControlOperatorLayer } from "@/components/mission-control-operator-layer";
import { useMissionStore } from "@/stores/mission-store";

const adapter = createDataAdapter();

export const MissionControlFrame = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const connect = useMissionStore((state) => state.connect);
  const connectionState = useMissionStore((state) => state.connectionState);
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
        {children}
      </AppShell>
      <MissionControlOperatorLayer />
    </>
  );
};
