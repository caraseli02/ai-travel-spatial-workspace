import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/TripWorkspaceViews", () => ({
  TripMapView: () => <div data-testid="trip-map-view" />,
  WorkspaceViewSwitcher: () => <div data-testid="workspace-view-switcher" />,
}));

import { FeatureKanbanPreview } from "./FeatureKanbanPreview";

describe("FeatureKanbanPreview", () => {
  it("renders the feature kanban day columns for the spatial canvas section", () => {
    const markup = renderToStaticMarkup(<FeatureKanbanPreview />);

    expect(markup).toContain("Day 2 — Fushimi Inari + Gion");
    expect(markup).toContain("Day 3 — Arashiyama");
    expect(markup).not.toContain("Day 1 — Arrival");
  });
});
