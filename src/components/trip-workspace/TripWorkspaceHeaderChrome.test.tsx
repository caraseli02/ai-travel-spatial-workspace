// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
});
