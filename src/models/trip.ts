import type { CanvasCard, InboxItem } from '../data/tripData';
import type { Connection, DayGroup, DayLabel } from './tripWorkspaceModel';

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
