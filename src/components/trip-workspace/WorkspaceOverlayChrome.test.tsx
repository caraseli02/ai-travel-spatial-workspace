import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Calendar, MapPin } from "lucide-react";
import { WorkspaceOverlayChrome } from "./WorkspaceOverlayChrome";
import { WorkspaceTripStatsPill } from "./WorkspaceTripStatsPill";

describe("WorkspaceOverlayChrome", () => {
  it("renders view switcher and trip stats when canvas view is active", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceOverlayChrome
        view="canvas"
        onViewChange={() => undefined}
        toolbar={<div data-testid="toolbar">toolbar</div>}
        stats={
          <WorkspaceTripStatsPill
            items={[
              { icon: <Calendar size={11} />, label: "Dec 14–21, 2025" },
              { icon: <MapPin size={11} />, label: "Kyoto, Japan" },
            ]}
          />
        }
      />,
    );

    expect(markup).toContain('aria-label="Workspace view"');
    expect(markup).toContain("toolbar");
    expect(markup).toContain("Kyoto, Japan");
  });

  it("hides toolbar and stats on map view", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceOverlayChrome
        view="map"
        onViewChange={() => undefined}
        toolbar={<div data-testid="toolbar">toolbar</div>}
        stats={<div data-testid="stats">stats</div>}
      />,
    );

    expect(markup).toContain('aria-label="Workspace view"');
    expect(markup).not.toContain("toolbar");
    expect(markup).not.toContain("stats");
  });
});
