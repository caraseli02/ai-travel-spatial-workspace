import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/LandingWorkspacePreview", () => ({
  default: () => <div data-testid="workspace-preview" />,
  FeatureKanbanPreview: () => <div data-testid="kanban-preview" />,
}));

import LandingPage from "../LandingPage";

describe("LandingPage", () => {
  it("renders primary landing sections and demo entry points", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(markup).toContain("Plan trips you can");
    expect(markup).toContain("From chaos to clarity in three steps");
    expect(markup).toContain("Your trip as a living moodboard");
    expect(markup).toContain("One calm home for every journey");
    expect(markup).toContain("Open Kyoto Demo");
    expect(markup).not.toContain("Open demo");
    expect(markup).not.toContain(">Start planning<");
  });
});
