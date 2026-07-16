// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoTrip, dayGroups } from "@/data/tripData";
import { TripCanvasKanbanView } from "./TripCanvasKanbanView";

vi.mock("@/components/CanvasCards", () => ({
  CanvasCardRenderer: ({ card }: { card: { title: string } }) => (
    <div data-testid={`card-${card.title}`}>{card.title}</div>
  ),
}));

vi.mock("./KanbanMiniMap", () => ({
  KanbanMiniMap: () => null,
}));

const defaultProps = {
  days: dayGroups,
  cards: createDemoTrip().cards,
  activeDay: null as number | null,
  selectedCard: null,
  isLinkingActive: false,
  linkingOriginId: null,
  zoom: 1,
  isMobile: false,
  onActiveDayChange: vi.fn(),
  onSelectCard: vi.fn(),
  onCreateCard: vi.fn(),
  onOpenMap: vi.fn(),
};

describe("TripCanvasKanbanView day filter", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a dismissible day filter hint on desktop when a day is selected", async () => {
    const user = userEvent.setup();
    render(<TripCanvasKanbanView {...defaultProps} activeDay={2} />);

    const hint = screen.getByRole("status");
    expect(hint).toHaveTextContent("Showing");
    expect(hint).toHaveTextContent("All days");
    expect(hint).toHaveTextContent("to edit other cards");

    await user.click(screen.getByRole("button", { name: "Dismiss day filter hint" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("clears the dismissed hint when the active day changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TripCanvasKanbanView {...defaultProps} activeDay={2} />);

    await user.click(screen.getByRole("button", { name: "Dismiss day filter hint" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    rerender(<TripCanvasKanbanView {...defaultProps} activeDay={3} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("blocks pointer events on dimmed columns while keeping the active column interactive", () => {
    render(<TripCanvasKanbanView {...defaultProps} activeDay={2} />);

    const dayOneColumn = screen.getByRole("region", { name: /Day 1/i });
    const dayTwoColumn = screen.getByRole("region", { name: /Day 2/i });

    expect(dayOneColumn.className).toContain("pointer-events-none");
    expect(dayTwoColumn.className).not.toContain("pointer-events-none");
    expect(dayTwoColumn.className).toContain("z-10");
  });

  it("does not show the day filter hint on mobile", () => {
    render(<TripCanvasKanbanView {...defaultProps} activeDay={2} isMobile />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
