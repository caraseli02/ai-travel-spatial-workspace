import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createDemoTrip } from "@/data/tripData";

vi.mock("@/components/TripWorkspaceViews", () => ({
  TripMapView: () => <div data-testid="trip-map-view" />,
  WorkspaceViewSwitcher: () => <div data-testid="workspace-view-switcher" />,
}));

import { DesktopWorkspacePreview } from "./DesktopWorkspacePreview";
import { MobileWorkspacePreview } from "./MobileWorkspacePreview";

const demoTrip = createDemoTrip();
const previewProps = {
  view: "canvas" as const,
  onViewChange: () => undefined,
  selectedCard: null,
  onSelectCard: () => undefined,
  demoTrip,
};

describe("workspace preview canvas layout", () => {
  it("gives desktop day columns the available preview height and internal card scrolling", () => {
    const markup = renderToStaticMarkup(<DesktopWorkspacePreview {...previewProps} />);

    expect(markup).toContain("overflow-x-auto overflow-y-hidden px-10 pb-3 pt-2");
    expect(markup).toContain("h-full min-h-0");
    expect(markup).toContain("scrollbar-thin flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto");
    expect(markup).not.toContain("Tell Wayfarer");
  });

  it("gives mobile day columns the available preview height without a prompt bar", () => {
    const markup = renderToStaticMarkup(<MobileWorkspacePreview {...previewProps} />);

    expect(markup).toContain("h-full min-h-0 w-[300px]");
    expect(markup).toContain("scrollbar-thin flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto");
    expect(markup).not.toContain("Tell Wayfarer");
  });
});
