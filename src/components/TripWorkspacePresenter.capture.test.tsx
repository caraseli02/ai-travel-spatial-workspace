// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoTrip } from "@/data/tripData";
import TripWorkspacePresenter from "@/components/TripWorkspacePresenter";

vi.mock("@/components/TripWorkspaceViews", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/TripWorkspaceViews")>();
  return {
    ...actual,
    TripCanvasKanbanView: () => <div data-testid="canvas-view" />,
    TripMapView: () => <div data-testid="map-view" />,
  };
});

vi.mock("@/components/CardDetailPanel", () => ({
  default: () => null,
}));

vi.mock("@/models/tripRepository", () => ({
  localTripRepository: {
    save: vi.fn(),
  },
}));

const navigate = vi.fn();

const defaultProps = {
  trip: createDemoTrip(),
  isMobile: false,
  inboxOpen: true,
  setInboxOpen: vi.fn(),
  navigate,
  showOnboardingToast: false,
};

describe("TripWorkspacePresenter desktop capture", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("captures Trip Material via Ask AI without the inbox paste area", async () => {
    const user = userEvent.setup();
    const setInboxOpen = vi.fn();
    const sourceUrl = "https://example.com/opaque-path-xyz123";

    render(<TripWorkspacePresenter {...defaultProps} setInboxOpen={setInboxOpen} />);

    expect(screen.queryByTestId("inbox-capture-input")).not.toBeInTheDocument();

    const prompt = screen.getByPlaceholderText(/paste a link or note to save/i);
    await user.type(prompt, sourceUrl);
    await user.click(screen.getByRole("button", { name: "Send AI prompt" }));

    const feedback = screen.getByRole("status");
    expect(feedback).toHaveTextContent("Saved to Inbox");
    expect(feedback).toHaveTextContent("example.com");
    expect(setInboxOpen).toHaveBeenCalledWith(true);

    const inboxPanel = screen.getByRole("heading", { name: "Inbox" }).closest("div")!;
    expect(inboxPanel).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open original source" })).toHaveAttribute(
      "href",
      sourceUrl,
    );
  });
});
