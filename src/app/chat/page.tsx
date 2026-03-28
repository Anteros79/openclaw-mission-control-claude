"use client";

import { ChatWorkspace } from "@/components/chat-workspace";
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
        title={connectionState === "degraded" ? "Chat workspace unavailable" : "Loading chat workspace"}
        description={errorMessage ?? "Assistant threads and session context are being restored."}
      />
    );
  }

  if (snapshot.chat.threads.length === 0) {
    return (
      <SurfaceState
        variant="empty"
        title="No chat threads available"
        description="Assistant sessions, operator conversations, and attachment context will appear here when available."
      />
    );
  }

  return <ChatWorkspace threads={snapshot.chat.threads} unreadCount={snapshot.chat.unreadCount} />;
};

export default Page;
