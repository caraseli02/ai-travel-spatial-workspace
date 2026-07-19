// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CanvasCard, DayGroup } from "@/models/trip";
import { RoutePanelOverlay } from "./RoutePanel";

const day: DayGroup = { day: 1, label: "Arrival", color: "#f59e0b" };

const cards: CanvasCard[] = [
  { id: "c1", type: "hotel", title: "Hiiragiya Ryokan", day: 1 } as CanvasCard,
  { id: "c2", type: "polaroid", title: "Fushimi Inari", day: 1 } as CanvasCard,
];

describe("RoutePanelOverlay", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts collapsed with only a next-stop preview, not the full carousel", () => {
    render(
      <RoutePanelOverlay
        activeDay={1}
        day={day}
        cards={cards}
        selectedCard={null}
        onSelectCard={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Expand route sheet" })).toBeInTheDocument();
    const peek = screen.getByTestId("route-sheet-peek");
    expect(within(peek).getByText("Next stop")).toBeInTheDocument();
    expect(within(peek).getByText("Hiiragiya Ryokan")).toBeInTheDocument();
    expect(screen.queryByTestId("route-sheet-carousel")).not.toBeInTheDocument();
  });

  it("expands to the full activity carousel when the handle is tapped", () => {
    render(
      <RoutePanelOverlay
        activeDay={1}
        day={day}
        cards={cards}
        selectedCard={null}
        onSelectCard={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand route sheet" }));

    expect(screen.getByRole("button", { name: "Collapse route sheet" })).toBeInTheDocument();
    expect(screen.queryByTestId("route-sheet-peek")).not.toBeInTheDocument();
    const carousel = screen.getByTestId("route-sheet-carousel");
    expect(within(carousel).getByText("Hiiragiya Ryokan")).toBeInTheDocument();
    expect(within(carousel).getByText("Fushimi Inari")).toBeInTheDocument();
  });

  it("reports expanded state changes to the parent map view", () => {
    const onExpandedChange = vi.fn();
    render(
      <RoutePanelOverlay
        activeDay={1}
        day={day}
        cards={cards}
        selectedCard={null}
        onSelectCard={vi.fn()}
        onExpandedChange={onExpandedChange}
      />,
    );

    expect(onExpandedChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Expand route sheet" }));

    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });

  it("only lists cards passed in for the active day (filtering happens upstream in the map view)", () => {
    render(
      <RoutePanelOverlay
        activeDay={1}
        day={day}
        cards={cards}
        selectedCard={null}
        onSelectCard={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand route sheet" }));

    const carousel = screen.getByTestId("route-sheet-carousel");
    expect(within(carousel).getAllByRole("button")).toHaveLength(cards.length);
  });
});
