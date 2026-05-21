import type { CanvasCard, InboxItem } from '../data/tripData';

export type CardType = CanvasCard['type'];

export interface DayLabel {
  day: number;
  x: number;
  y: number;
  color: string;
  bg: string;
  border: string;
}

export interface Connection {
  from: string;
  to: string;
  label: string;
}

export interface DayGroup {
  day: number;
  label: string;
  color: string;
}

export interface TripWorkspaceState {
  activeDay: number | null;
  days: DayGroup[];
  dayLabels: DayLabel[];
  cards: CanvasCard[];
  connections: Connection[];
}

export const cardTypeOptions = [
  { value: 'sticky', label: '📌 Sticky Note' },
  { value: 'polaroid', label: '🖼️ Polaroid Location' },
  { value: 'hotel', label: '🏨 Hotel Accommodation' },
  { value: 'flight', label: '✈️ Flight Ticket' },
  { value: 'article', label: '📄 Saved Article' },
  { value: 'note', label: '📝 Quick Note' },
] satisfies { value: CardType; label: string }[];

export const dayLabelConfig: DayLabel[] = [
  { day: 1, x: 38, y: 46, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  { day: 2, x: 38, y: 285, color: '#f97316', bg: '#ffedd5', border: '#fed7aa' },
  { day: 3, x: 38, y: 555, color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' },
  { day: 4, x: 775, y: 255, color: '#f43f5e', bg: '#ffe4e6', border: '#fecdd3' },
];

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

