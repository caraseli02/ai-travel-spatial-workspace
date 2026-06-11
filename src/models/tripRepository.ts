import type { Trip } from "./trip";
import { createDemoTrip, createParisFixtureTrip } from "../data/tripData";

const STORAGE_KEY = "wayfarer_trips";

/** Safe wrapper to get items from localStorage. */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`Failed to get item "${key}" from localStorage:`, err);
    return null;
  }
}

/** Safe wrapper to set items in localStorage. */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`Failed to set item "${key}" in localStorage:`, err);
  }
}

/** Read all trips from localStorage. */
function readAll(): Trip[] {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    const trips = raw ? JSON.parse(raw) : [];
    return Array.isArray(trips) ? trips.map(normalizeTrip) : [];
  } catch (err) {
    console.warn("Failed to parse trips from localStorage:", err);
    return [];
  }
}

function normalizeTrip(trip: Trip): Trip {
  return {
    ...trip,
    cards: Array.isArray(trip.cards) ? trip.cards : [],
    connections: Array.isArray(trip.connections) ? trip.connections : [],
    inboxItems: Array.isArray(trip.inboxItems) ? trip.inboxItems : [],
    days: Array.isArray(trip.days) ? trip.days : [],
    dayLabels: Array.isArray(trip.dayLabels) ? trip.dayLabels : [],
  };
}

/** Write all trips to localStorage. */
function writeAll(trips: Trip[]): void {
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.warn("Failed to serialize trips for localStorage:", err);
  }
}

const SEEDED_KEY = "wayfarer_demo_seeded";

/**
 * Seed the Demo Trip on first visit.
 * Called once during initialization — if no trips exist and we haven't seeded before,
 * the Kyoto demo trip is pre-loaded.
 */
function ensureDemoTrip(trips: Trip[]): Trip[] {
  if (safeGetItem(SEEDED_KEY) === "true") {
    return trips;
  }
  if (trips.length > 0) {
    safeSetItem(SEEDED_KEY, "true");
    return trips;
  }
  const demo = createDemoTrip();
  const paris = createParisFixtureTrip();
  writeAll([demo, paris]);
  safeSetItem(SEEDED_KEY, "true");
  return [demo, paris];
}

/** localStorage implementation of Trip persistence. */
export const localTripRepository = {
  list(): Trip[] {
    const trips = readAll();
    return ensureDemoTrip(trips);
  },

  load(id: string): Trip | null {
    const trips = this.list();
    return trips.find((t) => t.id === id) ?? null;
  },

  save(trip: Trip): void {
    const trips = readAll();
    const idx = trips.findIndex((t) => t.id === trip.id);
    const updated = { ...trip, updatedAt: new Date().toISOString() };

    if (idx >= 0) {
      trips[idx] = updated;
    } else {
      trips.push(updated);
    }
    writeAll(trips);
  },

  delete(id: string): void {
    const trips = readAll().filter((t) => t.id !== id);
    writeAll(trips);
  },
};
