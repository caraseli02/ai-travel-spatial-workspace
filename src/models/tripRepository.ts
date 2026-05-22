import type { Trip } from './trip';
import { DEMO_TRIP_ID } from './trip';
import { createDemoTrip } from '../data/tripData';

const STORAGE_KEY = 'wayfarer_trips';

/**
 * Persistence interface for Trips.
 * Current implementation: localStorage.
 * Designed so a backend (e.g., Supabase) can be swapped in
 * without changing domain logic. See ADR 0001.
 */
export interface TripRepository {
  list(): Trip[];
  load(id: string): Trip | null;
  save(trip: Trip): void;
  delete(id: string): void;
}

/** Read all trips from localStorage. */
function readAll(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Write all trips to localStorage. */
function writeAll(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

/**
 * Seed the Demo Trip on first visit.
 * Called once during initialization — if no trips exist,
 * the Kyoto demo trip is pre-loaded.
 */
function ensureDemoTrip(trips: Trip[]): Trip[] {
  if (trips.length > 0) return trips;
  const demo = createDemoTrip();
  writeAll([demo]);
  return [demo];
}

/** localStorage implementation of TripRepository. */
export const localTripRepository: TripRepository = {
  list(): Trip[] {
    const trips = readAll();
    return ensureDemoTrip(trips);
  },

  load(id: string): Trip | null {
    const trips = this.list();
    return trips.find(t => t.id === id) ?? null;
  },

  save(trip: Trip): void {
    const trips = readAll();
    const idx = trips.findIndex(t => t.id === trip.id);
    const updated = { ...trip, updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      trips[idx] = updated;
    } else {
      trips.push(updated);
    }
    writeAll(trips);
  },

  delete(id: string): void {
    const trips = readAll().filter(t => t.id !== id);
    writeAll(trips);
  },
};
