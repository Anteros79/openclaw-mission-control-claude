import { mkdtemp, rm } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { afterEach, expect, test } from "vitest";

import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";
import {
  appendChatMessageToSnapshot,
  moveTaskCardInSnapshot,
  readMissionSnapshot,
  updateMissionSnapshot
} from "@/lib/mission-control-repository";

const originalDataFile = process.env.MISSION_CONTROL_DATA_FILE;
const tempDirs: string[] = [];

afterEach(async () => {
  process.env.MISSION_CONTROL_DATA_FILE = originalDataFile;

  await Promise.all(
    tempDirs.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        recursive: true
      })
    )
  );
});

test("persists mission snapshots to the configured state file", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "mission-control-"));
  tempDirs.push(directory);
  process.env.MISSION_CONTROL_DATA_FILE = path.join(directory, "state.json");

  const seed = await readMissionSnapshot();
  expect(seed.gatewayName).toBe("Giles");

  await updateMissionSnapshot((snapshot) => ({
    ...snapshot,
    tagline: "Persisted operator state"
  }));

  const persisted = await readMissionSnapshot();
  expect(persisted.tagline).toBe("Persisted operator state");
});

test("moves task cards and appends operator chat messages to the snapshot", () => {
  const seed = createSeedMissionControlSnapshot();
  const moved = moveTaskCardInSnapshot(seed, {
    cardId: "task-3",
    sourceColumnId: "in-progress",
    targetColumnId: "done"
  });

  expect(moved.kanban.find((column) => column.id === "done")?.cards.some((card) => card.id === "task-3")).toBe(true);
  expect(
    moved.kanban.find((column) => column.id === "in-progress")?.cards.some((card) => card.id === "task-3")
  ).toBe(false);

  const chatted = appendChatMessageToSnapshot(moved, {
    threadId: "thread-ops",
    content: "Persist this operator note.",
    attachments: []
  });

  expect(chatted.chat.threads[0]?.messages.at(-1)?.content).toBe("Persist this operator note.");
  expect(chatted.chat.threads[0]?.lastMessagePreview).toBe("Persist this operator note.");
});
