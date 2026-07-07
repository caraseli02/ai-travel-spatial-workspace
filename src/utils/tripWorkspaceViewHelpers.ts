import type { CanvasCard, DayGroup } from "../models/trip";

export interface KanbanCanvasColumn {
  day: number;
  label: string;
  color: string;
  cards: CanvasCard[];
}

export const cardTypeOrder: Record<CanvasCard["type"], number> = {
  flight: 0,
  hotel: 1,
  polaroid: 2,
  article: 3,
  sticky: 4,
  note: 5,
};

export const mapPositions: Record<string, [number, number]> = {
  c2: [35.0104, 135.7621],
  c4: [34.9671, 135.7727],
  c6: [35.005, 135.7649],
  c7: [35.017, 135.6719],
  c9: [35.0159, 135.674],
  c10: [35.0038, 135.7786],
  c11: [35.0132, 135.7939],
  c14: [35.0003, 135.7817],
};

export type RouteTimeOfDay = "Morning" | "Afternoon" | "Evening";

export interface RouteTimeSection {
  label: RouteTimeOfDay;
  cards: CanvasCard[];
}

const routeTimeSlots = ["8:30 AM", "10:45 AM", "1:30 PM", "4:15 PM", "7:00 PM"] as const;
const routeTimeOfDayLabels: RouteTimeOfDay[] = ["Morning", "Morning", "Afternoon", "Afternoon", "Evening"];

function routeCardHaystack(card: CanvasCard) {
  return [card.title, card.subtitle, card.tag].filter(Boolean).join(" ").toLowerCase();
}

export function inferRouteTimeOfDay(card: CanvasCard, fallbackIndex = 0): RouteTimeOfDay {
  const haystack = routeCardHaystack(card);
  if (/\b(dinner|dusk|evening|kaiseki|night)\b/.test(haystack)) return "Evening";
  if (/\bafternoon\b/.test(haystack)) return "Afternoon";
  if (/\b(5am|morning|early|beat the crowds|arrival|flight)\b/.test(haystack)) return "Morning";
  if (/\b(hotel|ryokan)\b/.test(haystack)) return "Morning";
  return routeTimeOfDayLabels[fallbackIndex % routeTimeOfDayLabels.length];
}

export function getRouteTimeSlot(index: number) {
  return routeTimeSlots[index % routeTimeSlots.length];
}

export function getRouteTimeSlotForCard(card: CanvasCard, fallbackIndex: number) {
  const haystack = routeCardHaystack(card);
  if (/\b5am\b/.test(haystack)) return "5:00 AM";
  if (/\bearly morning\b/.test(haystack)) return "7:00 AM";
  if (/\bdusk\b/.test(haystack)) return "6:30 PM";
  if (/\bdinner\b/.test(haystack)) return "7:00 PM";
  if (/\bafternoon\b/.test(haystack)) return "1:30 PM";
  if (/\b(hotel|ryokan|flight)\b/.test(haystack)) return "8:30 AM";

  const timeOfDay = inferRouteTimeOfDay(card, fallbackIndex);
  if (timeOfDay === "Evening") return "7:00 PM";
  if (timeOfDay === "Afternoon") return "1:30 PM";
  return "8:30 AM";
}

export function groupRouteCardsByTimeOfDay(cards: CanvasCard[]): RouteTimeSection[] {
  const sections = new Map<RouteTimeOfDay, CanvasCard[]>();
  cards.forEach((card, index) => {
    const label = inferRouteTimeOfDay(card, index);
    if (!sections.has(label)) sections.set(label, []);
    sections.get(label)?.push(card);
  });
  return (["Morning", "Afternoon", "Evening"] as const)
    .filter((label) => sections.has(label))
    .map((label) => ({ label, cards: sections.get(label) ?? [] }));
}

export function getKanbanCanvasColumns(days: DayGroup[], cards: CanvasCard[]): KanbanCanvasColumn[] {
  if (days.length === 0) {
    return [
      {
        day: 0,
        label: "Planning",
        color: "#78716c",
        cards: [...cards].sort(sortCardsForWorkspaceViews),
      },
    ];
  }

  const sortedDays = [...days].sort((a, b) => a.day - b.day);
  const knownDays = new Set(sortedDays.map((day) => day.day));
  const columns = sortedDays.map((day) => ({ ...day, cards: [] as CanvasCard[] }));
  const logisticsColumn = columns[columns.length - 1];

  for (const card of cards) {
    const matchingColumn =
      card.day && knownDays.has(card.day)
        ? columns.find((column) => column.day === card.day)
        : logisticsColumn;

    matchingColumn?.cards.push(card);
  }

  return columns.map((column) => ({
    ...column,
    cards: [...column.cards].sort(sortCardsForWorkspaceViews),
  }));
}

export function getMappedCards(cards: CanvasCard[]) {
  return cards
    .filter((card) => mapPositions[card.id])
    .map((card) => ({ card, position: mapPositions[card.id] }));
}

const MAP_OVERLAP_THRESHOLD = 0.012;

/** Fan out markers that share nearly the same coordinates so labels remain tappable. */
export function spreadMapMarkerPositions(
  items: { card: CanvasCard; position: [number, number] }[],
): Map<string, [number, number]> {
  const displayPositions = new Map<string, [number, number]>();
  const groups: { card: CanvasCard; position: [number, number] }[][] = [];

  for (const item of items) {
    const cluster = groups.find((group) => {
      const [lat, lng] = group[0].position;
      const [itemLat, itemLng] = item.position;
      return Math.hypot(itemLat - lat, itemLng - lng) < MAP_OVERLAP_THRESHOLD;
    });

    if (cluster) {
      cluster.push(item);
    } else {
      groups.push([item]);
    }
  }

  for (const group of groups) {
    if (group.length === 1) {
      displayPositions.set(group[0].card.id, group[0].position);
      continue;
    }

    const centerLat = group.reduce((sum, item) => sum + item.position[0], 0) / group.length;
    const centerLng = group.reduce((sum, item) => sum + item.position[1], 0) / group.length;
    const radius = 0.0035 + group.length * 0.0008;

    group.forEach((item, index) => {
      const angle = (2 * Math.PI * index) / group.length - Math.PI / 2;
      displayPositions.set(item.card.id, [
        centerLat + radius * Math.cos(angle),
        centerLng + radius * Math.sin(angle),
      ]);
    });
  }

  return displayPositions;
}

export function getRouteDay(activeDay: number | null) {
  return activeDay;
}

export function getKanbanScrollLeftToRevealColumn({
  currentScrollLeft,
  columnOffsetLeft,
  columnWidth,
  scrollerClientWidth,
  scrollerScrollWidth,
}: {
  currentScrollLeft: number;
  columnOffsetLeft: number;
  columnWidth: number;
  scrollerClientWidth: number;
  scrollerScrollWidth: number;
}): number {
  const columnRight = columnOffsetLeft + columnWidth;
  const visibleLeft = currentScrollLeft;
  const visibleRight = currentScrollLeft + scrollerClientWidth;

  if (columnOffsetLeft >= visibleLeft && columnRight <= visibleRight) {
    return currentScrollLeft;
  }

  const targetScroll =
    columnOffsetLeft < visibleLeft
      ? columnOffsetLeft
      : columnRight - scrollerClientWidth;

  const maxScroll = Math.max(0, scrollerScrollWidth - scrollerClientWidth);
  return Math.min(maxScroll, Math.max(0, targetScroll));
}

export function scrollKanbanToActiveDayColumn(
  scroller: {
    scrollLeft: number;
    clientWidth: number;
    scrollWidth: number;
    scrollTo: (options: ScrollToOptions) => void;
    getBoundingClientRect: () => Pick<DOMRect, "left">;
  } | null,
  column: {
    getBoundingClientRect: () => Pick<DOMRect, "left" | "width">;
  } | null,
  activeDay: number | null,
  isMobile: boolean,
) {
  if (isMobile || activeDay === null || !scroller || !column) return;

  const scrollerRect = scroller.getBoundingClientRect();
  const columnRect = column.getBoundingClientRect();
  const columnOffsetLeft = columnRect.left - scrollerRect.left + scroller.scrollLeft;

  const scrollLeft = getKanbanScrollLeftToRevealColumn({
    currentScrollLeft: scroller.scrollLeft,
    columnOffsetLeft,
    columnWidth: columnRect.width,
    scrollerClientWidth: scroller.clientWidth,
    scrollerScrollWidth: scroller.scrollWidth,
  });

  scroller.scrollTo({ left: scrollLeft, behavior: "smooth" });
}

function sortCardsForWorkspaceViews(a: CanvasCard, b: CanvasCard) {
  const byType = cardTypeOrder[a.type] - cardTypeOrder[b.type];
  return byType || a.id.localeCompare(b.id);
}

const DAY_TAG_PREFIX = /^Day\s+\d+(?:\s*[·—-]\s*)?/i;

/** Kanban columns already show the day — strip redundant day labels from card tags. */
export function resolveKanbanCardTag(tag?: string): string | undefined {
  if (!tag?.trim()) return undefined;
  if (!DAY_TAG_PREFIX.test(tag)) return tag;
  const remainder = tag.replace(DAY_TAG_PREFIX, "").trim();
  return remainder || undefined;
}

/** Omit detail lines that repeat the card price shown in the footer. */
export function filterRedundantCardDetails(
  details: string[] | undefined,
  price?: string,
): string[] {
  if (!details?.length) return [];
  if (!price) return details;
  const normalizedPrice = price.toLowerCase();
  return details.filter((detail) => !detail.toLowerCase().includes(normalizedPrice));
}
