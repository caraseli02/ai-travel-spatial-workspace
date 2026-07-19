// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDemoTrip } from "@/data/tripData";
import TripWorkspacePresenter from "@/components/TripWorkspacePresenter";

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

describe("TripWorkspacePresenter mobile day-first default", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("lands on the earliest day's vertical timeline instead of the All days board on mobile", () => {
    render(<TripWorkspacePresenter {...defaultProps} isMobile />);

    expect(screen.getByRole("region", { name: /Day 1/i })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Day 2/i })).not.toBeInTheDocument();
  });

  it("keeps the All days board as the desktop default", () => {
    render(<TripWorkspacePresenter {...defaultProps} isMobile={false} />);

    expect(screen.getByRole("region", { name: /Day 1/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /Day 2/i })).toBeInTheDocument();
  });
});
