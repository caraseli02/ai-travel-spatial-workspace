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

  it("stacks day columns vertically on small screens and scrolls horizontally at lg", () => {
    const markup = renderToStaticMarkup(<FeatureKanbanPreview />);

    expect(markup).toContain("flex-col");
    expect(markup).toContain("lg:flex-row");
    expect(markup).toContain("overflow-y-auto");
    expect(markup).toContain("lg:overflow-x-auto");
    expect(markup).toContain("w-full shrink-0 lg:w-[255px]");
  });
});
