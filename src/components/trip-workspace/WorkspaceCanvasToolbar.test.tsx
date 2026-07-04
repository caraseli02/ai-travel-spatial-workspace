import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceCanvasToolbar } from "./WorkspaceCanvasToolbar";

describe("WorkspaceCanvasToolbar", () => {
  it("renders zoom controls and percentage in interactive mode", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceCanvasToolbar
        zoomPercent={100}
        onZoomIn={() => undefined}
        onZoomOut={() => undefined}
        onReset={() => undefined}
      />,
    );

    expect(markup).toContain('title="Zoom in"');
    expect(markup).toContain('title="Zoom out"');
    expect(markup).toContain('title="Reset view"');
    expect(markup).toContain("100%");
  });

  it("renders disabled controls without handlers in preview mode", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceCanvasToolbar zoomPercent={100} preview />,
    );

    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("100%");
  });
});
