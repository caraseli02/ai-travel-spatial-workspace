import type { CanvasCard, DayGroup, InboxItem, Trip } from './trip';
import { resolveCardSourceMemory } from './tripMaterialMemory';

export interface AgentInboxItemSummary {
  id: string;
  type: InboxItem['type'];
  sourceLabel: string;
  content: string;
  rawContent: string;
  sourceUrl?: string;
  timestamp: string;
  processed: boolean;
  resultingCardId?: string;
  citationRef: string;
}

export type AgentCanvasCardSource =
  | {
      kind: 'source-backed';
      inboxItemId: string;
      sourceType: InboxItem['type'];
      sourceLabel: string;
      rawContent: string;
      sourceUrl?: string;
      resultingCardId?: string;
      citationRef: string;
    }
  | {
      kind: 'manual';
    };

export interface AgentCanvasCardSummary {
  id: string;
  type: CanvasCard['type'];
  title: string;
  subtitle?: string;
  day?: number;
  dayGroupLabel?: string;
  source: AgentCanvasCardSource;
  citationRef: string;
}

export interface AgentDayGroupSummary {
  day: number;
  label: string;
  color: string;
  cardIds: string[];
}

export interface AgentConnectionSummary {
  from: string;
  to: string;
  label: string;
  fromTitle?: string;
  toTitle?: string;
}

export interface AgentCitationReference {
  id: string;
  kind: 'inbox-item' | 'canvas-card';
  label: string;
}

export interface TripAgentContext {
  trip: {
    id: string;
    name: string;
    destination: string;
    emoji: string;
    dates?: Trip['dates'];
    country?: string;
    status?: Trip['status'];
    travelers?: number;
    budget?: string;
    activities?: string[];
  };
  inboxItems: AgentInboxItemSummary[];
  canvasCards: AgentCanvasCardSummary[];
  dayGroups: AgentDayGroupSummary[];
  connections: AgentConnectionSummary[];
  citationReferences: AgentCitationReference[];
}

export function buildTripAgentContext(trip: Trip): TripAgentContext {
  const inboxItems = trip.inboxItems.map((item) => summarizeInboxItem(item));
  const canvasCards = trip.cards.map((card) => summarizeCanvasCard(card, trip));

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      emoji: trip.emoji,
      dates: trip.dates,
      country: trip.country,
      status: trip.status,
      travelers: trip.travelers,
      budget: trip.budget,
      activities: trip.activities,
    },
    inboxItems,
    canvasCards,
    dayGroups: trip.days.map((dayGroup) => summarizeDayGroup(dayGroup, trip.cards)),
    connections: trip.connections.map((connection) => {
      const fromCard = trip.cards.find((card) => card.id === connection.from);
      const toCard = trip.cards.find((card) => card.id === connection.to);

      return withoutUndefined({
        from: connection.from,
        to: connection.to,
        label: connection.label,
        fromTitle: fromCard?.title,
        toTitle: toCard?.title,
      });
    }),
    citationReferences: [
      ...inboxItems.map((item) => ({
        id: item.citationRef,
        kind: 'inbox-item' as const,
        label: item.sourceLabel,
      })),
      ...canvasCards.map((card) => ({
        id: card.citationRef,
        kind: 'canvas-card' as const,
        label: card.title,
      })),
    ],
  };
}

function summarizeInboxItem(item: InboxItem): AgentInboxItemSummary {
  return withoutUndefined({
    id: item.id,
    type: item.type,
    sourceLabel: item.source,
    content: item.content,
    rawContent: item.rawContent ?? item.content,
    sourceUrl: item.sourceUrl,
    timestamp: item.timestamp,
    processed: item.processed,
    resultingCardId: item.resultingCardId,
    citationRef: `inbox:${item.id}`,
  });
}

function summarizeDayGroup(dayGroup: DayGroup, cards: CanvasCard[]): AgentDayGroupSummary {
  return {
    day: dayGroup.day,
    label: dayGroup.label,
    color: dayGroup.color,
    cardIds: cards.filter((card) => card.day === dayGroup.day).map((card) => card.id),
  };
}

function summarizeCanvasCard(card: CanvasCard, trip: Trip): AgentCanvasCardSummary {
  const dayGroup = card.day
    ? trip.days.find((group) => group.day === card.day)
    : undefined;

  return withoutUndefined({
    id: card.id,
    type: card.type,
    title: card.title,
    subtitle: card.subtitle,
    day: card.day,
    dayGroupLabel: dayGroup?.label,
    source: summarizeCardSource(card, trip),
    citationRef: `card:${card.id}`,
  });
}

function summarizeCardSource(card: CanvasCard, trip: Trip): AgentCanvasCardSource {
  const sourceMemory = resolveCardSourceMemory(card, trip.inboxItems);
  if (sourceMemory.kind === 'manual') {
    return { kind: 'manual' };
  }

  return withoutUndefined({
    kind: 'source-backed',
    inboxItemId: sourceMemory.inboxItemId,
    sourceType: sourceMemory.sourceType,
    sourceLabel: sourceMemory.sourceLabel,
    rawContent: sourceMemory.rawContent,
    sourceUrl: sourceMemory.sourceUrl,
    resultingCardId: sourceMemory.resultingCardId,
    citationRef: `inbox:${sourceMemory.inboxItemId}`,
  });
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}
