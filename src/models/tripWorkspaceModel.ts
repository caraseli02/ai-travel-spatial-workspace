import type { CanvasCard, InboxItem, Connection, DayGroup, DayLabel, Trip } from '@/models/trip';
import { buildTripAgentContext } from '@/models/tripAgentContext';
import { mockAgentPlanner, type AgentPlannerOutcome } from '@/models/tripAgentPlanner';
import { dayLabelConfig } from '@/models/trip';

export type { Connection, DayGroup, DayLabel };
export { dayLabelConfig };

export type CardType = CanvasCard['type'];

export interface TripWorkspaceState {
  activeDay: number | null;
  days: DayGroup[];
  dayLabels: DayLabel[];
  cards: CanvasCard[];
  connections: Connection[];
  items: InboxItem[];
  selectedCard: CanvasCard | null;
  isAiThinking: boolean;
  showCreateModal: boolean;
  createModalCoords: { x: number; y: number } | null;
  showAddDayModal: boolean;
  showOverflow: boolean;
}

export const cardTypeOptions = [
  { value: 'sticky', label: '📌 Sticky Note' },
  { value: 'polaroid', label: '🖼️ Polaroid Location' },
  { value: 'hotel', label: '🏨 Hotel Accommodation' },
  { value: 'flight', label: '✈️ Flight Ticket' },
  { value: 'article', label: '📄 Saved Article' },
  { value: 'note', label: '📝 Quick Note' },
] satisfies { value: CardType; label: string }[];

export const dayColorPresets = [
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#14b8a6',
];

export const cardDimensions: Record<string, { w: number; h: number }> = {
  polaroid: { w: 220, h: 230 },
  sticky: { w: 200, h: 120 },
  article: { w: 260, h: 220 },
  flight: { w: 280, h: 180 },
  hotel: { w: 260, h: 240 },
  note: { w: 210, h: 110 },
};

export function getCardCenter(card: CanvasCard) {
  const dim = cardDimensions[card.type] || { w: 200, h: 150 };
  const w = card.width || dim.w;
  const h = dim.h;
  return {
    x: card.x + w / 2,
    y: card.y + h / 2,
  };
}

export function isCardType(value: string): value is CardType {
  return cardTypeOptions.some(option => option.value === value);
}

export function buildInboxItem(content: string, now = Date.now): InboxItem {
  let type: InboxItem['type'] = 'note';
  let source = 'Inbox Clip';
  let avatar: string | undefined = undefined;

  const lower = content.toLowerCase();
  if (lower.includes('flight') || lower.includes('jl') || lower.includes('ana') || lower.includes('sfo-') || lower.includes('kix')) {
    type = 'flight';
    source = 'Flight Parser';
  } else if (lower.includes('hotel') || lower.includes('ryokan') || lower.includes('booking') || lower.includes('stay') || lower.includes('airbnb') || lower.includes('hoshinoya') || lower.includes('hostel')) {
    type = 'hotel';
    source = 'Hotel Scanner';
  } else if (lower.includes('http') || lower.includes('.com') || lower.includes('reddit') || lower.includes('eater') || lower.includes('blog')) {
    type = 'link';
    source = 'Web Parser';
  } else if (lower.includes('chat') || lower.includes('says') || lower.includes(':') || lower.includes('mom') || lower.includes('yuki') || lower.includes('friend')) {
    type = 'whatsapp';
    source = 'WhatsApp Sync';
    avatar = '💬';
  }

  return {
    id: `i_spawn_${now()}`,
    type,
    source,
    content,
    timestamp: 'Just now',
    processed: false,
    avatar,
  };
}

export function buildProcessedCanvasCard({
  item,
  activeDay,
  dayLabels,
  cards,
  now = Date.now,
  random = Math.random,
}: {
  item: InboxItem;
  activeDay: number | null;
  dayLabels: DayLabel[];
  cards: CanvasCard[];
  now?: () => number;
  random?: () => number;
}) {
  const newCardId = `c_spawn_${now()}`;
  const processedItem = { ...item, processed: true, resultingCardId: newCardId };
  const associatedDay = activeDay || 2;
  const dayCfg = dayLabels.find(label => label.day === associatedDay) || dayLabels[0];
  const scatterX = Math.floor(random() * 80) - 40;
  const scatterY = Math.floor(random() * 80) - 40;
  const targetX = Math.min(Math.max(dayCfg.x + 180 + scatterX, 50), 1000);
  const targetY = Math.min(Math.max(dayCfg.y + scatterY, 50), 800);
  const rotation = (random() * 4) - 2;

  let newCard: CanvasCard;

  if (item.type === 'flight') {
    newCard = {
      id: newCardId,
      type: 'flight',
      x: targetX,
      y: targetY,
      rotation,
      title: 'New Flight Ticket',
      subtitle: item.content,
      tag: `Day ${associatedDay} · Flight`,
      tagColor: 'slate',
      day: associatedDay,
      details: ['Parsed from flight tracker', 'Ready for boarding confirmation'],
      width: 280,
    };
  } else if (item.type === 'hotel') {
    newCard = {
      id: newCardId,
      type: 'hotel',
      x: targetX,
      y: targetY,
      rotation,
      title: 'Hotel Accommodation',
      subtitle: item.content,
      tag: `Day ${associatedDay} · Stay`,
      tagColor: 'amber',
      day: associatedDay,
      details: ['Parsed from reservation', 'Address details verified'],
      rating: 4.8,
      width: 260,
    };
  } else if (item.id === 'i4') {
    newCard = {
      id: newCardId,
      type: 'polaroid',
      x: targetX,
      y: targetY,
      rotation,
      title: 'Hidden Temples',
      subtitle: 'Kurama-dera & Jingo-ji',
      image: '/images/ryokan.jpg',
      tag: 'Day 2 · Exploration',
      tagColor: 'orange',
      day: 2,
      width: 220,
    };
  } else if (item.id === 'i6') {
    newCard = {
      id: newCardId,
      type: 'polaroid',
      x: targetX,
      y: targetY,
      rotation,
      title: 'Golden Pavilion (Kinkaku-ji)',
      subtitle: "Mom's Match Rec 🍵",
      image: '/images/gion.jpg',
      tag: 'Day 2 · Sightseeing',
      tagColor: 'orange',
      day: 2,
      width: 220,
    };
  } else if (item.id === 'i7') {
    newCard = {
      id: newCardId,
      type: 'article',
      x: targetX,
      y: targetY,
      rotation,
      title: 'Mizai Restaurant',
      subtitle: 'Michelin 3★ Kaiseki near Maruyama Park',
      tag: 'Day 4 · Fine Dining',
      tagColor: 'rose',
      day: 4,
      details: ['Tasting menu only', 'Pre-payment required', 'Rated 4.9 on Eater'],
      width: 250,
    };
  } else {
    newCard = {
      id: newCardId,
      type: 'sticky',
      x: targetX,
      y: targetY,
      rotation,
      title: item.source || 'AI Parsed Clip',
      subtitle: item.content,
      color: item.type === 'whatsapp' ? '#fce7f3' : '#d1fae5',
      day: associatedDay,
      width: 200,
    };
  }

  newCard = {
    ...newCard,
    promotedFromInboxId: item.id,
  };

  const siblingCard = cards.find(card => card.day === associatedDay && card.id !== newCardId);
  const connection = siblingCard
    ? { from: siblingCard.id, to: newCardId, label: 'dynamic-link' }
    : undefined;

  return { processedItem, newCard, connection };
}

function mergeCanvasCardUpdate(existingCard: CanvasCard, updatedCard: CanvasCard): CanvasCard {
  return {
    ...existingCard,
    ...updatedCard,
    promotedFromInboxId: updatedCard.promotedFromInboxId ?? existingCard.promotedFromInboxId,
  };
}

export function applyAiPromptToTripWorkspace({
  query,
  activeDay,
  days,
  dayLabels,
  cards,
  connections,
  items = [],
  trip,
  now = Date.now,
  random = Math.random,
  ...rest
}: TripWorkspaceState & {
  query: string;
  trip?: Trip;
  now?: () => number;
  random?: () => number;
}): TripWorkspaceState {
  const plannerTrip = buildPlannerTrip({
    trip,
    cards,
    connections,
    items,
    days,
    dayLabels,
  });
  const context = buildTripAgentContext(plannerTrip);
  const outcome = mockAgentPlanner.plan(context, query);

  return applyAgentPlannerOutcomeToTripWorkspace({
    outcome,
    query,
    activeDay,
    days,
    dayLabels,
    cards,
    connections,
    items,
    now,
    random,
    ...rest,
  });
}

function buildPlannerTrip({
  trip,
  cards,
  connections,
  items,
  days,
  dayLabels,
}: {
  trip?: Trip;
  cards: CanvasCard[];
  connections: Connection[];
  items: InboxItem[];
  days: DayGroup[];
  dayLabels: DayLabel[];
}): Trip {
  const now = new Date().toISOString();

  return {
    id: trip?.id ?? 'current-trip',
    name: trip?.name ?? 'Current Trip',
    destination: trip?.destination ?? 'Current destination',
    emoji: trip?.emoji ?? '🧭',
    dates: trip?.dates,
    createdAt: trip?.createdAt ?? now,
    updatedAt: trip?.updatedAt ?? now,
    country: trip?.country,
    status: trip?.status,
    image: trip?.image,
    travelers: trip?.travelers,
    budget: trip?.budget,
    activities: trip?.activities,
    cards,
    connections,
    inboxItems: items,
    days,
    dayLabels,
  };
}

function applyAgentPlannerOutcomeToTripWorkspace({
  outcome,
  query,
  activeDay,
  days,
  dayLabels,
  cards,
  connections,
  items,
  now,
  random,
  ...rest
}: Omit<TripWorkspaceState, 'isAiThinking'> & {
  outcome: AgentPlannerOutcome;
  query: string;
  now: () => number;
  random: () => number;
}): TripWorkspaceState {
  if (outcome.type === 'inbox-item-draft') {
    return {
      ...rest,
      activeDay,
      days,
      dayLabels,
      cards,
      connections,
      items: [
        {
          id: `i_ai_draft_${now()}`,
          type: outcome.draft.type,
          source: outcome.draft.source,
          content: outcome.draft.content,
          sourceUrl: outcome.draft.sourceUrl,
          rawContent: buildPlannerDraftRawContent(outcome.rationale, outcome.citations),
          timestamp: 'Just now',
          processed: false,
        },
        ...items,
      ],
      isAiThinking: false,
    };
  }

  if (outcome.type === 'canvas-card-draft') {
    return {
      ...rest,
      activeDay,
      days,
      dayLabels,
      cards,
      connections,
      items: [
        {
          id: `i_ai_card_draft_${now()}`,
          type: inboxTypeForCanvasDraft(outcome.draft.type),
          source: 'AI Planner Draft',
          content: formatCanvasDraftContent(outcome),
          rawContent: buildPlannerDraftRawContent(outcome.rationale, outcome.citations),
          timestamp: 'Just now',
          processed: false,
        },
        ...items,
      ],
      isAiThinking: false,
    };
  }

  const requestedDay = extractRequestedDay(query);
  const responseDay = requestedDay && days.some(day => day.day === requestedDay)
    ? requestedDay
    : activeDay || 0;
  const message = outcome.type === 'reply' ? outcome.message : outcome.question;
  const responseCard: CanvasCard = {
    id: `c_ai_response_${now()}`,
    type: 'note',
    x: 480 + (random() * 60 - 30),
    y: 350 + (random() * 60 - 30),
    rotation: (random() * 4) - 2,
    title: outcome.type === 'reply' ? 'AI Planner Reply' : 'AI Planner Follow-up',
    subtitle: message,
    tag: outcome.type === 'reply' ? 'AI reply' : 'AI follow-up',
    tagColor: 'slate',
    day: responseDay,
    details: formatPlannerCitations(outcome.citations),
    width: 240,
  };

  return {
    ...rest,
    activeDay: requestedDay && days.some(day => day.day === requestedDay)
      ? requestedDay
      : activeDay,
    days,
    dayLabels,
    cards: [...cards, responseCard],
    connections,
    items,
    isAiThinking: false,
  };
}

function buildPlannerDraftRawContent(
  rationale: string,
  citations: AgentPlannerOutcome['citations'],
): string {
  const citationLabels = citations.map(citation => citation.label);
  return [
    rationale,
    citationLabels.length > 0 ? `Citations: ${citationLabels.join(', ')}` : undefined,
  ].filter(Boolean).join('\n');
}

function formatCanvasDraftContent(
  outcome: Extract<AgentPlannerOutcome, { type: 'canvas-card-draft' }>,
): string {
  return [
    `Draft Canvas Card: ${outcome.draft.title}`,
    outcome.draft.subtitle,
    outcome.draft.day ? `Day ${outcome.draft.day}` : undefined,
    ...(outcome.draft.details ?? []),
  ].filter(Boolean).join('\n');
}

function formatPlannerCitations(
  citations: AgentPlannerOutcome['citations'],
): string[] | undefined {
  if (citations.length === 0) {
    return undefined;
  }

  return [`Citations: ${citations.map(citation => citation.label).join(', ')}`];
}

function inboxTypeForCanvasDraft(type: CanvasCard['type']): InboxItem['type'] {
  if (type === 'hotel' || type === 'flight') {
    return type;
  }

  if (type === 'article') {
    return 'link';
  }

  return 'note';
}

function extractRequestedDay(query: string): number | undefined {
  const dayMatch = query.match(/\bday\s+(\d+)\b/i);
  return dayMatch ? Number(dayMatch[1]) : undefined;
}

export function buildManualCanvasCard({
  cardData,
  coords = { x: 450, y: 250 },
  now = Date.now,
  random = Math.random,
}: {
  cardData: Omit<CanvasCard, 'id' | 'x' | 'y' | 'rotation'>;
  coords?: { x: number; y: number };
  now?: () => number;
  random?: () => number;
}): CanvasCard {
  return {
    id: `c_manual_${now()}`,
    x: coords.x,
    y: coords.y,
    rotation: (random() * 4) - 2,
    ...cardData,
  };
}

export function buildCustomDay(days: DayGroup[], dayNum: number, labelText: string) {
  const color = dayColorPresets[dayNum % dayColorPresets.length];
  const newDay = { day: dayNum, label: `Day ${dayNum} — ${labelText}`, color };
  const isRight = days.length % 2 === 1;
  const newX = isRight ? 775 : 38;
  const newY = 46 + Math.floor(days.length / 2) * 260;
  const newLabel = {
    day: dayNum,
    x: newX,
    y: newY,
    color,
    bg: color + '12',
    border: color + '30',
  };

  return { newDay, newLabel };
}

export function canConnectCards(
  connections: Connection[],
  fromId: string,
  toId: string
): boolean {
  if (!fromId || !toId) return false;
  if (fromId === toId) return false;

  // Check if a connection already exists bidirectionally
  const alreadyConnected = connections.some(
    conn =>
      (conn.from === fromId && conn.to === toId) ||
      (conn.from === toId && conn.to === fromId)
  );

  return !alreadyConnected;
}

export function connectCards(
  state: TripWorkspaceState,
  fromId: string,
  toId: string
): TripWorkspaceState {
  if (!canConnectCards(state.connections, fromId, toId)) {
    return state;
  }

  const newConnection: Connection = {
    from: fromId,
    to: toId,
    label: 'custom-link',
  };

  return {
    ...state,
    connections: [...state.connections, newConnection],
  };
}

export function deleteCanvasCardFromWorkspace(
  state: TripWorkspaceState,
  cardId: string,
): TripWorkspaceState {
  const nextCards = state.cards.filter(card => card.id !== cardId);
  const nextConnections = state.connections.filter(
    connection => connection.from !== cardId && connection.to !== cardId,
  );
  const nextSelectedCard =
    state.selectedCard?.id === cardId ? null : state.selectedCard;

  return {
    ...state,
    cards: nextCards,
    connections: nextConnections,
    selectedCard: nextSelectedCard,
  };
}

export type TripWorkspaceAction =
  | { type: 'ADD_INBOX_ITEM'; content: string }
  | { type: 'PROCESS_INBOX_ITEM'; id: string }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'UPDATE_CARD'; card: CanvasCard }
  | { type: 'ADD_CONNECTION'; fromId: string; toId: string }
  | { type: 'ADD_CUSTOM_DAY'; dayNum: number; label: string }
  | { type: 'AI_PROMPT_START' }
  | { type: 'AI_PROMPT_SUCCESS'; query: string; trip?: Trip }
  | { type: 'SET_SELECTED_CARD'; card: CanvasCard | null }
  | { type: 'OPEN_CREATE_MODAL'; coords: { x: number; y: number } | null }
  | { type: 'CLOSE_CREATE_MODAL' }
  | { type: 'OPEN_ADD_DAY_MODAL' }
  | { type: 'CLOSE_ADD_DAY_MODAL' }
  | { type: 'TOGGLE_OVERFLOW'; show?: boolean }
  | { type: 'UPDATE_CARD_POSITION'; id: string; x: number; y: number }
  | { type: 'SET_ACTIVE_DAY'; day: number | null | ((prev: number | null) => number | null) }
  | { type: 'CREATE_MANUAL_CARD'; cardData: Omit<CanvasCard, 'id' | 'x' | 'y' | 'rotation'> };

export function tripWorkspaceReducer(
  state: TripWorkspaceState,
  action: TripWorkspaceAction
): TripWorkspaceState {
  switch (action.type) {
    case 'ADD_INBOX_ITEM': {
      const newItem = buildInboxItem(action.content);
      return {
        ...state,
        items: [newItem, ...state.items],
      };
    }
    case 'PROCESS_INBOX_ITEM': {
      const item = state.items.find(i => i.id === action.id);
      if (!item) return state;

      const result = buildProcessedCanvasCard({
        item,
        activeDay: state.activeDay,
        dayLabels: state.dayLabels,
        cards: state.cards,
      });

      const nextConnections = result.connection
        ? [...state.connections, result.connection]
        : state.connections;

      return {
        ...state,
        items: state.items.map(i => i.id === action.id ? result.processedItem : i),
        cards: [...state.cards, result.newCard],
        connections: nextConnections,
      };
    }
    case 'DELETE_CARD': {
      return deleteCanvasCardFromWorkspace(state, action.id);
    }
    case 'ADD_CONNECTION': {
      return connectCards(state, action.fromId, action.toId);
    }
    case 'ADD_CUSTOM_DAY': {
      if (state.days.some(d => d.day === action.dayNum)) {
        return state;
      }
      const { newDay, newLabel } = buildCustomDay(state.days, action.dayNum, action.label);
      return {
        ...state,
        days: [...state.days, newDay],
        dayLabels: [...state.dayLabels, newLabel],
        showAddDayModal: false,
      };
    }
    case 'UPDATE_CARD': {
      const existingCard = state.cards.find(c => c.id === action.card.id);
      const nextCard = existingCard ? mergeCanvasCardUpdate(existingCard, action.card) : action.card;
      const nextSelectedCard =
        state.selectedCard?.id === action.card.id
          ? state.selectedCard.promotedFromInboxId && !nextCard.promotedFromInboxId
            ? { ...nextCard, promotedFromInboxId: state.selectedCard.promotedFromInboxId }
            : nextCard
          : state.selectedCard;
      return {
        ...state,
        cards: state.cards.map(c => c.id === action.card.id ? nextCard : c),
        selectedCard: nextSelectedCard,
      };
    }
    case 'UPDATE_CARD_POSITION': {
      const nextCards = state.cards.map(c =>
        c.id === action.id ? { ...c, x: action.x, y: action.y } : c
      );
      const nextSelectedCard =
        state.selectedCard?.id === action.id
          ? { ...state.selectedCard, x: action.x, y: action.y }
          : state.selectedCard;
      return {
        ...state,
        cards: nextCards,
        selectedCard: nextSelectedCard,
      };
    }
    case 'AI_PROMPT_START':
      return {
        ...state,
        isAiThinking: true,
      };
    case 'AI_PROMPT_SUCCESS': {
      const updatedState = applyAiPromptToTripWorkspace({
        ...state,
        query: action.query,
        trip: action.trip,
      });
      return {
        ...state,
        ...updatedState,
        isAiThinking: false,
      };
    }
    case 'SET_SELECTED_CARD':
      return {
        ...state,
        selectedCard: action.card,
      };
    case 'OPEN_CREATE_MODAL':
      return {
        ...state,
        showCreateModal: true,
        createModalCoords: action.coords,
      };
    case 'CLOSE_CREATE_MODAL':
      return {
        ...state,
        showCreateModal: false,
        createModalCoords: null,
      };
    case 'OPEN_ADD_DAY_MODAL':
      return {
        ...state,
        showAddDayModal: true,
      };
    case 'CLOSE_ADD_DAY_MODAL':
      return {
        ...state,
        showAddDayModal: false,
      };
    case 'TOGGLE_OVERFLOW':
      return {
        ...state,
        showOverflow: action.show !== undefined ? action.show : !state.showOverflow,
      };
    case 'SET_ACTIVE_DAY': {
      const nextActiveDay = typeof action.day === 'function' ? action.day(state.activeDay) : action.day;
      return {
        ...state,
        activeDay: nextActiveDay,
      };
    }
    case 'CREATE_MANUAL_CARD': {
      const coords = state.createModalCoords || { x: 450, y: 250 };
      const newCard = buildManualCanvasCard({ cardData: action.cardData, coords });
      return {
        ...state,
        cards: [...state.cards, newCard],
        showCreateModal: false,
        createModalCoords: null,
      };
    }
    default:
      return state;
  }
}
