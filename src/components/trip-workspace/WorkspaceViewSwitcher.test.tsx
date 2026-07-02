import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkspaceViewSwitcher } from "./WorkspaceViewSwitcher";

describe("WorkspaceViewSwitcher", () => {
  it("renders canvas and map view options with the active view pressed", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceViewSwitcher value="map" onValueChange={() => undefined} />,
    );

    expect(markup).toContain('aria-label="Workspace view"');
    expect(markup).toContain('aria-label="Canvas view"');
    expect(markup).toContain('aria-label="Map view"');
    expect(markup).toContain('aria-pressed="true"');
  });
});
