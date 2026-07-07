import { describe, expect, it, vi } from "vitest";
import { canvasCards, dayGroups } from "../data/tripData";
import {
  filterRedundantCardDetails,
  getKanbanCanvasColumns,
  getKanbanScrollLeftToRevealColumn,
  getMappedCards,
  getRouteDay,
  groupRouteCardsByTimeOfDay,
  resolveKanbanCardTag,
  scrollKanbanToActiveDayColumn,
  spreadMapMarkerPositions,
} from "./tripWorkspaceViewHelpers";

describe("tripWorkspaceViewHelpers", () => {
  it("excludes logistics and unlocated cards from map pins", () => {
    const mapped = getMappedCards(canvasCards);

    expect(mapped.map(({ card }) => card.id)).toEqual(["c2", "c4", "c6", "c7", "c9", "c10", "c11", "c14"]);
    expect(mapped.some(({ card }) => card.id === "c12")).toBe(false);
  });

  it("groups the desktop canvas into seven day columns", () => {
    const columns = getKanbanCanvasColumns(dayGroups, canvasCards);

    expect(columns).toHaveLength(7);
    expect(columns.map((column) => column.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(columns[0].cards.map((card) => card.id)).toEqual(["c1", "c2", "c3", "c12"]);
    expect(columns[3].cards.map((card) => card.id)).toEqual(["c10", "c11"]);
    expect(columns[4].cards.map((card) => card.id)).toEqual(["c14"]);
    expect(columns[6].cards.map((card) => card.id)).toEqual(["c13"]);
  });

  it("uses a planning column when the Trip has no Day Groups yet", () => {
    const columns = getKanbanCanvasColumns([], canvasCards.slice(0, 2));

    expect(columns).toEqual([
      {
        day: 0,
        label: "Planning",
        color: "#78716c",
        cards: [canvasCards[0], canvasCards[1]],
      },
    ]);
  });

  it("keeps the map route panel aligned with the active day filter", () => {
    expect(getRouteDay(null)).toBeNull();
    expect(getRouteDay(4)).toBe(4);
  });

  it("groups route cards into morning, afternoon, and evening sections", () => {
    const routeCards = canvasCards.filter((card) => card.day === 2);
    const sections = groupRouteCardsByTimeOfDay(routeCards);

    expect(sections.map((section) => section.label)).toEqual(["Morning", "Afternoon"]);
    expect(sections[0]?.cards.map((card) => card.id)).toEqual(["c4", "c5"]);
    expect(sections[1]?.cards.map((card) => card.id)).toEqual(["c6"]);
  });

  it("places dusk and dinner cards in the evening section", () => {
    const routeCards = canvasCards.filter((card) => ["c10", "c11"].includes(card.id));
    const sections = groupRouteCardsByTimeOfDay(routeCards);

    expect(sections).toEqual([{ label: "Evening", cards: routeCards }]);
  });

  it("assigns route time slots from card content instead of list index", async () => {
    const { getRouteTimeSlotForCard } = await import("./tripWorkspaceViewHelpers");
    const gion = canvasCards.find((card) => card.id === "c10");
    const fushimi = canvasCards.find((card) => card.id === "c4");
    const market = canvasCards.find((card) => card.id === "c6");

    expect(gion && getRouteTimeSlotForCard(gion, 0)).toBe("6:30 PM");
    expect(fushimi && getRouteTimeSlotForCard(fushimi, 0)).toBe("5:00 AM");
    expect(market && getRouteTimeSlotForCard(market, 0)).toBe("1:30 PM");
  });

  it("wraps route time slots across long optimized sequences", async () => {
    const { getRouteTimeSlot } = await import("./tripWorkspaceViewHelpers");

    expect(getRouteTimeSlot(0)).toBe("8:30 AM");
    expect(getRouteTimeSlot(5)).toBe("8:30 AM");
  });

  it("strips redundant day labels from kanban card tags", () => {
    expect(resolveKanbanCardTag("Day 2 · Afternoon")).toBe("Afternoon");
    expect(resolveKanbanCardTag("Day 4")).toBeUndefined();
    expect(resolveKanbanCardTag("Logistics")).toBe("Logistics");
    expect(resolveKanbanCardTag("Dec 14–21 · 7 nights")).toBe("Dec 14–21 · 7 nights");
  });

  it("spreads overlapping map markers into a readable cluster", () => {
    const items = getMappedCards(canvasCards);
    const spread = spreadMapMarkerPositions(items);

    expect(spread.size).toBe(items.length);

    const c10 = spread.get("c10")!;
    const c11 = spread.get("c11")!;
    expect(Math.hypot(c10[0] - c11[0], c10[1] - c11[1])).toBeGreaterThan(0.004);
  });

  it("filters price lines out of flight card details", () => {
    expect(
      filterRedundantCardDetails(
        ["Window seat 32A confirmed", "$743 total"],
        "$743",
      ),
    ).toEqual(["Window seat 32A confirmed"]);
  });

  it("keeps card details when no price comparison is needed", () => {
    expect(filterRedundantCardDetails(undefined, "$10")).toEqual([]);
    expect(filterRedundantCardDetails(["Bring cash"], undefined)).toEqual(["Bring cash"]);
  });

  it("scrolls the kanban board right when an offscreen day column is selected", () => {
    const columnWidth = 255;
    const columnGap = 12;
    const scrollerPaddingLeft = 40;
    const daySevenOffsetLeft = scrollerPaddingLeft + 6 * (columnWidth + columnGap);

    const scrollLeft = getKanbanScrollLeftToRevealColumn({
      currentScrollLeft: 0,
      columnOffsetLeft: daySevenOffsetLeft,
      columnWidth,
      scrollerClientWidth: 1000,
      scrollerScrollWidth: 2500,
    });

    expect(scrollLeft).toBeGreaterThan(0);
    expect(scrollLeft + 1000).toBeGreaterThanOrEqual(daySevenOffsetLeft + columnWidth);
  });

  it("keeps kanban scroll position when the selected day column is already visible", () => {
    const scrollLeft = getKanbanScrollLeftToRevealColumn({
      currentScrollLeft: 120,
      columnOffsetLeft: 200,
      columnWidth: 255,
      scrollerClientWidth: 1000,
      scrollerScrollWidth: 2500,
    });

    expect(scrollLeft).toBe(120);
  });

  it("scrolls the desktop kanban scroller when a day chip selects an offscreen column", () => {
    const scrollTo = vi.fn();
    const scroller = {
      scrollLeft: 0,
      clientWidth: 1000,
      scrollWidth: 2500,
      scrollTo,
      getBoundingClientRect: () => ({ left: 0 }),
    };
    const column = {
      getBoundingClientRect: () => ({ left: 1642, width: 255 }),
    };

    scrollKanbanToActiveDayColumn(scroller, column, 7, false);

    expect(scrollTo).toHaveBeenCalledWith({ left: expect.any(Number), behavior: "smooth" });
    expect(scrollTo.mock.calls[0]?.[0]?.left).toBeGreaterThan(0);
  });

  it("does not scroll the kanban board on mobile day focus", () => {
    const scrollTo = vi.fn();
    const scroller = {
      scrollLeft: 0,
      clientWidth: 390,
      scrollWidth: 1200,
      scrollTo,
      getBoundingClientRect: () => ({ left: 0 }),
    };
    const column = {
      getBoundingClientRect: () => ({ left: 800, width: 255 }),
    };

    scrollKanbanToActiveDayColumn(scroller, column, 3, true);

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
