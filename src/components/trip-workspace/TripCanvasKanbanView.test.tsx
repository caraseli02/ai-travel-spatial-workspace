// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { canvasCards, dayGroups } from "@/data/tripData";
import { TripCanvasKanbanView } from "./TripCanvasKanbanView";

const defaultProps = {
  days: dayGroups,
  cards: canvasCards,
  selectedCard: null,
  isLinkingActive: false,
  linkingOriginId: null,
  zoom: 1,
  onActiveDayChange: vi.fn(),
  onSelectCard: vi.fn(),
  onCreateCard: vi.fn(),
  onOpenMap: vi.fn(),
};

describe("TripCanvasKanbanView", () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("scrolls the selected desktop day column into view without jumping when selection clears", () => {
    const scrolledLabels: string[] = [];
    HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
      scrolledLabels.push(this.getAttribute("aria-label") ?? "");
    };

    const { rerender } = render(
      <TripCanvasKanbanView {...defaultProps} activeDay={null} />,
    );

    expect(scrolledLabels).toEqual([]);

    rerender(<TripCanvasKanbanView {...defaultProps} activeDay={7} />);

    expect(scrolledLabels).toEqual(["Day 7 — Departure"]);

    rerender(<TripCanvasKanbanView {...defaultProps} activeDay={null} />);

    expect(scrolledLabels).toEqual(["Day 7 — Departure"]);
  });

  it("keeps mobile active-day selection focused without desktop scrolling", () => {
    const scrolledLabels: string[] = [];
    HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
      scrolledLabels.push(this.getAttribute("aria-label") ?? "");
    };

    const { container } = render(
      <TripCanvasKanbanView {...defaultProps} activeDay={7} isMobile />,
    );

    const columnLabels = Array.from(container.querySelectorAll("section[aria-label]")).map((section) =>
      section.getAttribute("aria-label"),
    );

    expect(columnLabels).toEqual(["Day 7 — Departure"]);
    expect(scrolledLabels).toEqual([]);
  });
});
