import { describe, expect, test } from "vitest";

import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";
import {
  applyControlAction,
  injectMockActivity
} from "@/lib/mission-control-runtime";

describe("injectMockActivity", () => {
  test("increments unread chat state and appends a gateway event", () => {
    const snapshot = createSeedMissionControlSnapshot();
    const updated = injectMockActivity(snapshot);

    expect(updated.chat.unreadCount).toBe(snapshot.chat.unreadCount + 1);
    expect(updated.chat.threads[0]?.unreadCount).toBe(snapshot.chat.threads[0]!.unreadCount + 1);
    expect(updated.systems.events[0]?.kind).toBe("chat.activity");
  });
});

describe("applyControlAction", () => {
  test("updates a cron job and returns a scheduler event", () => {
    const snapshot = createSeedMissionControlSnapshot();
    const action = snapshot.systems.cronJobs[0]!.actions[0]!;

    const applied = applyControlAction(snapshot, {
      actionId: action.id,
      targetKind: action.targetKind,
      targetId: action.targetId,
      command: action.command
    });

    expect(
      applied.snapshot.systems.cronJobs.find((job) => job.id === action.targetId)?.status
    ).toBe("active");
    expect(applied.event.kind).toBe("scheduler.event");
    expect(applied.result.status).toBe("succeeded");
  });
});
