// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("@/components/InboxPanel", () => ({
  default: () => <div data-testid="inbox-panel" />,
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
  inboxOpen: false,
  setInboxOpen: vi.fn(),
  navigate,
  showOnboardingToast: false,
};

describe("TripWorkspacePresenter AI prompting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("keeps the AI prompt bar visible in Map view", async () => {
    const user = userEvent.setup();
    render(<TripWorkspacePresenter {...defaultProps} />);

    await user.click(screen.getAllByRole("button", { name: "Map view" })[0]!);

    expect(screen.getByTestId("map-view")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask AI:/i)).toBeInTheDocument();
  });

  describe("AI prompt feedback", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("announces when an AI suggestion creates an Inbox draft", () => {
      const setInboxOpen = vi.fn();

      render(<TripWorkspacePresenter {...defaultProps} setInboxOpen={setInboxOpen} />);

      const prompt = screen.getAllByPlaceholderText(/Ask AI:/i)[0]!;
      fireEvent.focus(prompt);
      fireEvent.click(screen.getByRole("button", { name: "Find a restaurant near Gion" }));

      act(() => {
        vi.advanceTimersByTime(1200);
      });

      const feedback = screen.getByRole("status");
      expect(feedback).toHaveTextContent("AI draft saved to Inbox");
      expect(feedback).toHaveTextContent("Gion Sasaki");
      expect(setInboxOpen).toHaveBeenCalledWith(true);
    });
  });
});
