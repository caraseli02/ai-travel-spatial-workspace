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

export function getRouteTimeSlot(index: number) {
  return routeTimeSlots[index % routeTimeSlots.length];
}

export function groupRouteCardsByTimeOfDay(cards: CanvasCard[]): RouteTimeSection[] {
  const sections = new Map<RouteTimeOfDay, CanvasCard[]>();
  cards.forEach((card, index) => {
    const label = routeTimeOfDayLabels[index % routeTimeOfDayLabels.length];
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

export function getRouteDay(activeDay: number | null) {
  return activeDay ?? 2;
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
