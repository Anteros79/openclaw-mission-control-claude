import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { AppShell } from "@/components/app-shell";
import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";

describe("AppShell", () => {
  test("renders the primary mission-control navigation and assistant bubble", () => {
    const snapshot = createSeedMissionControlSnapshot();

    render(
      <AppShell
        activePath="/"
        activity={{
          chatUnreadCount: snapshot.chat.unreadCount,
          systemAlertCount: snapshot.systems.alerts.length
        }}
        assistantThreads={snapshot.chat.threads}
        connectionState="live"
        lastUpdatedAt={snapshot.lastUpdatedAt}
      >
        <div>Workspace payload</div>
      </AppShell>
    );

    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /assistant/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /systems/i })).toBeInTheDocument();
    expect(screen.getByText("Workspace payload")).toBeInTheDocument();
  });
});
