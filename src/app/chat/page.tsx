"use client";

import { ChatWorkspace } from "@/components/chat-workspace";
import { useMissionStore } from "@/stores/mission-store";

const Page = () => {
  const snapshot = useMissionStore((state) => state.snapshot);

  if (!snapshot) return null;

  return <ChatWorkspace threads={snapshot.chat.threads} unreadCount={snapshot.chat.unreadCount} />;
};

export default Page;
