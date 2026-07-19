// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoTrip, dayGroups } from "@/data/tripData";
import { TripWorkspaceHeaderChrome } from "./TripWorkspaceHeaderChrome";

const defaultProps = {
  trip: createDemoTrip(),
  navigate: vi.fn(),
  days: dayGroups,
  activeDay: null as number | null,
  onActiveDayChange: vi.fn(),
  onOpenAddDayModal: vi.fn(),
  inboxOpen: false,
  onToggleInbox: vi.fn(),
  inboxItems: createDemoTrip().inboxItems,
  showOverflow: false,
  onToggleOverflow: vi.fn(),
  onShareTrip: vi.fn(),
  onExportTrip: vi.fn(),
  workspaceView: "canvas" as const,
  onWorkspaceViewChange: vi.fn(),
};

describe("TripWorkspaceHeaderChrome", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps the trip title truncatable and inbox action in the header toolbar on narrow mobile", () => {
    render(<TripWorkspaceHeaderChrome {...defaultProps} />);

    const tripTitle = screen.getByRole("heading", { level: 1, name: "7 Days in Kyoto" });
    expect(tripTitle.className).toContain("truncate");

    const tripIdentity = tripTitle.parentElement;
    expect(tripIdentity?.className).toContain("min-w-0");

    const toolbarRow = tripIdentity?.parentElement;
    expect(toolbarRow?.className).toContain("overflow-hidden");

    expect(
      screen.getByRole("button", { name: /open inbox, \d+ items to organize/i }),
    ).toBeTruthy();
  });

  it("shows the mobile day pill strip and view switcher by default", () => {
    render(<TripWorkspaceHeaderChrome {...defaultProps} />);

    // "Add Day" (mobile strip) is distinct from the desktop row's "Add Custom Day".
    expect(screen.getByTitle("Add Day")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Map view" })).toBeInTheDocument();
  });

  it("hides the mobile day pill strip and view switcher while the Inbox is open", () => {
    render(<TripWorkspaceHeaderChrome {...defaultProps} inboxOpen />);

    expect(screen.queryByTitle("Add Day")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Map view" })).not.toBeInTheDocument();
  });

  it("hides the mobile day pill strip and view switcher while a card's detail is open", () => {
    render(<TripWorkspaceHeaderChrome {...defaultProps} hasSelectedCard />);

    expect(screen.queryByTitle("Add Day")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Map view" })).not.toBeInTheDocument();
  });

  it("hides the redundant inbox count badge once the Inbox panel is already open", () => {
    const inboxItems = createDemoTrip().inboxItems;
    const unprocessedCount = inboxItems.filter((item) => !item.processed).length;
    expect(unprocessedCount).toBeGreaterThan(0);

    render(<TripWorkspaceHeaderChrome {...defaultProps} inboxItems={inboxItems} inboxOpen={false} />);
    expect(screen.getByText(String(unprocessedCount))).toBeInTheDocument();

    cleanup();

    render(<TripWorkspaceHeaderChrome {...defaultProps} inboxItems={inboxItems} inboxOpen />);
    expect(screen.queryByText(String(unprocessedCount))).not.toBeInTheDocument();
  });
});
