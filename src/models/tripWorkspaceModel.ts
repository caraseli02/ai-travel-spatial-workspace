import type { CanvasCard, InboxItem, Connection, DayGroup, DayLabel } from './trip';
import { dayLabelConfig } from './trip';

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
  const processedItem = { ...item, processed: true };
  const newCardId = `c_spawn_${now()}`;
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

  const siblingCard = cards.find(card => card.day === associatedDay && card.id !== newCardId);
  const connection = siblingCard
    ? { from: siblingCard.id, to: newCardId, label: 'dynamic-link' }
    : undefined;

  return { processedItem, newCard, connection };
}

export function applyAiPromptToTripWorkspace({
  query,
  activeDay,
  days,
  dayLabels,
  cards,
  connections,
  now = Date.now,
  random = Math.random,
  ...rest
}: TripWorkspaceState & {
  query: string;
  now?: () => number;
  random?: () => number;
}): TripWorkspaceState {
  const lower = query.toLowerCase();

  if (lower.includes('plan day 5') || lower.includes('suggest day 5') || lower.includes('day 5 itinerary')) {
    const curamaDera: CanvasCard = {
      id: 'c15',
      type: 'polaroid',
      x: 790,
      y: 520,
      rotation: 2.2,
      title: 'Kurama-dera Temple',
      subtitle: 'Mountain hike north of Kyoto',
      image: '/images/fushimi-inari.jpg',
      tag: 'Day 5 · Morning',
      tagColor: 'rose',
      day: 5,
      width: 220,
    };

    return {
      ...rest,
      activeDay: 5,
      days: days.some(day => day.day === 5)
        ? days
        : [...days, { day: 5, label: 'Day 5 — Kurama & Kaiseki', color: '#8b5cf6' }],
      dayLabels: dayLabels.some(label => label.day === 5)
        ? dayLabels
        : [...dayLabels, { day: 5, x: 775, y: 555, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' }],
      cards: [...cards.filter(card => card.id !== 'c15'), curamaDera],
      connections: [
        ...connections.filter(conn => !(conn.from === 'c15' && conn.to === 'c14') && !(conn.from === 'c14' && conn.to === 'c15')),
        { from: 'c15', to: 'c14', label: 'hiking to dining' },
      ],
    };
  }

  if (lower.includes('ryokan') || lower.includes('hoshinoya') || lower.includes('stay in arashiyama')) {
    const hoshinoya: CanvasCard = {
      id: 'c16',
      type: 'hotel',
      x: 290,
      y: 690,
      rotation: -1.2,
      title: 'Hoshinoya Kyoto',
      subtitle: 'Arashiyama River Luxury Ryokan',
      tag: 'Day 3 · Luxury Ryokan',
      tagColor: 'emerald',
      day: 3,
      details: ['Accessible only via wooden boat ride', 'Stunning river views', '¥110,000/night', 'Private pavilion standard'],
      rating: 5.0,
      image: '/images/ryokan.jpg',
      width: 260,
    };

    return {
      ...rest,
      activeDay: 3,
      days,
      dayLabels,
      cards: [...cards.filter(card => card.id !== 'c16'), hoshinoya],
      connections: [
        ...connections.filter(conn => !(conn.from === 'c7' && conn.to === 'c16') && !(conn.from === 'c16' && conn.to === 'c7')),
        { from: 'c7', to: 'c16', label: 'stay option' },
      ],
    };
  }

  if (lower.includes('restaurant') || lower.includes('gion food') || lower.includes('gion restaurant') || lower.includes('sasaki')) {
    const gionSasaki: CanvasCard = {
      id: 'c17',
      type: 'article',
      x: 1040,
      y: 280,
      rotation: 1.8,
      title: 'Gion Sasaki',
      subtitle: 'Michelin 3★ creative counter dining',
      tag: 'Day 4 · Splurge dinner',
      tagColor: 'rose',
      day: 4,
      details: ['Pre-book 2 months in advance', 'Counter seating only'],
      width: 260,
    };

    return {
      ...rest,
      activeDay: 4,
      days,
      dayLabels,
      cards: [...cards.filter(card => card.id !== 'c17'), gionSasaki],
      connections: [
        ...connections.filter(conn => !(conn.from === 'c10' && conn.to === 'c17') && !(conn.from === 'c17' && conn.to === 'c10')),
        { from: 'c10', to: 'c17', label: 'dinner option' },
      ],
    };
  }

  const notesId = `c_ai_sticky_${now()}`;
  const newSticky: CanvasCard = {
    id: notesId,
    type: 'note',
    x: 480 + (random() * 60 - 30),
    y: 350 + (random() * 60 - 30),
    rotation: (random() * 4) - 2,
    title: 'AI Helper Answer 🤖',
    subtitle: `Regarding "${query}": Based on local guides, I highly recommend visiting early morning. Make sure to check weather and transit times!`,
    tag: 'AI Assistant Answer',
    tagColor: 'slate',
    day: activeDay || 0,
    width: 230,
  };

  return {
    ...rest,
    activeDay,
    days,
    dayLabels,
    cards: [...cards, newSticky],
    connections,
  };
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

export type TripWorkspaceAction =
  | { type: 'ADD_INBOX_ITEM'; content: string }
  | { type: 'PROCESS_INBOX_ITEM'; id: string }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'UPDATE_CARD'; card: CanvasCard }
  | { type: 'ADD_CONNECTION'; fromId: string; toId: string }
  | { type: 'ADD_CUSTOM_DAY'; dayNum: number; label: string }
  | { type: 'AI_PROMPT_START' }
  | { type: 'AI_PROMPT_SUCCESS'; query: string }
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
      const nextCards = state.cards.filter(c => c.id !== action.id);
      const nextConnections = state.connections.filter(
        conn => conn.from !== action.id && conn.to !== action.id
      );
      const nextSelectedCard =
        state.selectedCard?.id === action.id ? null : state.selectedCard;

      return {
        ...state,
        cards: nextCards,
        connections: nextConnections,
        selectedCard: nextSelectedCard,
      };
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
      const nextSelectedCard =
        state.selectedCard?.id === action.card.id ? action.card : state.selectedCard;
      return {
        ...state,
        cards: state.cards.map(c => c.id === action.card.id ? action.card : c),
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

