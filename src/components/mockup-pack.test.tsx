import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { MockupPack } from "@/components/mockup-pack";
import { createSeedMissionControlSnapshot } from "@/data/seed-mission-control";

describe("MockupPack", () => {
  test("renders the review boards for shell, core screens, overlays, and responsive states", () => {
    render(<MockupPack snapshot={createSeedMissionControlSnapshot()} />);

    expect(screen.getByRole("heading", { name: /screen mockups/i })).toBeInTheDocument();
    expect(screen.getByText("01 Shell / Desktop")).toBeInTheDocument();
    expect(screen.getByText("04 Operations / Kanban")).toBeInTheDocument();
    expect(screen.getByText("08 Systems / Sessions")).toBeInTheDocument();
    expect(screen.getByText("Responsive Triptych")).toBeInTheDocument();
    expect(screen.getByText("Overlay + State Boards")).toBeInTheDocument();
  });
});
