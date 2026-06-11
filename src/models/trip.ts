export interface InboxItem {
  id: string;
  type: 'whatsapp' | 'link' | 'note' | 'flight' | 'hotel';
  source: string;
  content: string;
  timestamp: string;
  processed: boolean;
  resultingCardId?: string;
  avatar?: string;
}

export interface CanvasCard {
  id: string;
  type: 'polaroid' | 'sticky' | 'article' | 'flight' | 'hotel' | 'note';
  x: number;
  y: number;
  rotation: number;
  title: string;
  subtitle?: string;
  image?: string;
  color?: string;
  tag?: string;
  tagColor?: string;
  day?: number;
  details?: string[];
  price?: string;
  rating?: number;
  width?: number;
  promotedFromInboxId?: string;
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

export interface DayLabel {
  day: number;
  x: number;
  y: number;
  color: string;
  bg: string;
  border: string;
}

export const dayLabelConfig: DayLabel[] = [
  { day: 1, x: 38, y: 46, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  { day: 2, x: 38, y: 285, color: '#f97316', bg: '#ffedd5', border: '#fed7aa' },
  { day: 3, x: 38, y: 555, color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' },
  { day: 4, x: 775, y: 255, color: '#f43f5e', bg: '#ffe4e6', border: '#fecdd3' },
];

/**
 * A single travel plan scoped to one destination.
 * A Trip owns a Trip Workspace and all its contents.
 */
export interface Trip {
  id: string;
  name: string;
  destination: string;
  emoji: string;
  dates?: { start: string; end: string };
  createdAt: string;
  updatedAt: string;
  // Domain data (persisted with the trip):
  cards: CanvasCard[];
  connections: Connection[];
  inboxItems: InboxItem[];
  days: DayGroup[];
  dayLabels: DayLabel[];
  // Optional metadata to support rich cards:
  status?: 'upcoming' | 'ongoing' | 'completed' | 'planning';
  image?: string;
  country?: string;
  travelers?: number;
  budget?: string;
  activities?: string[];
}

/** Well-known ID for the pre-loaded Kyoto demo trip. */
export const DEMO_TRIP_ID = 'demo-kyoto';

/** Generate a unique trip ID. */
export function generateTripId(): string {
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Create a new empty Trip with sensible defaults. */
export function createEmptyTrip(
  name: string,
  destination: string,
  emoji: string,
  dates?: { start: string; end: string },
): Trip {
  const now = new Date().toISOString();
  return {
    id: generateTripId(),
    name,
    destination,
    emoji,
    dates,
    createdAt: now,
    updatedAt: now,
    cards: [],
    connections: [],
    inboxItems: [],
    days: [],
    dayLabels: [],
  };
}
