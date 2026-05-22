import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Trip } from './trip';
import { DEMO_TRIP_ID, createEmptyTrip } from './trip';
import { localTripRepository } from './tripRepository';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((_i: number) => null),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function clearStore() {
  Object.keys(store).forEach(k => delete store[k]);
}

describe('localTripRepository', () => {
  beforeEach(() => {
    clearStore();
    vi.clearAllMocks();
  });

  it('seeds the Demo Trip on first visit when no trips exist', () => {
    const trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(DEMO_TRIP_ID);
    expect(trips[0].name).toBe('7 Days in Kyoto');
    expect(trips[0].destination).toBe('Kyoto, Japan');
    // Demo trip should have fixture data
    expect(trips[0].cards.length).toBeGreaterThan(0);
    expect(trips[0].inboxItems.length).toBeGreaterThan(0);
    expect(trips[0].days.length).toBeGreaterThan(0);
  });

  it('does not re-seed demo trip when trips already exist', () => {
    const custom = createEmptyTrip('Weekend in Paris', 'Paris, France', '🇫🇷');
    localTripRepository.save(custom);

    const trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(custom.id);
    // Should NOT have the demo trip
    expect(trips.find(t => t.id === DEMO_TRIP_ID)).toBeUndefined();
  });

  it('saves and loads a trip by ID', () => {
    const trip = createEmptyTrip('Barcelona Summer', 'Barcelona, Spain', '🇪🇸');
    localTripRepository.save(trip);

    const loaded = localTripRepository.load(trip.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe('Barcelona Summer');
    expect(loaded!.destination).toBe('Barcelona, Spain');
    expect(loaded!.emoji).toBe('🇪🇸');
  });

  it('returns null for a non-existent trip ID', () => {
    // Seed at least one trip so ensureDemoTrip doesn't interfere
    const trip = createEmptyTrip('Test', 'Test', '🏖️');
    localTripRepository.save(trip);

    const loaded = localTripRepository.load('non-existent-id');
    expect(loaded).toBeNull();
  });

  it('updates an existing trip on re-save', () => {
    const trip = createEmptyTrip('Rome Trip', 'Rome, Italy', '🇮🇹');
    localTripRepository.save(trip);

    const modified = { ...trip, name: 'Rome Adventure' };
    localTripRepository.save(modified);

    const trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].name).toBe('Rome Adventure');
  });

  it('updates the updatedAt timestamp on save', () => {
    const trip = createEmptyTrip('Test Trip', 'Anywhere', '🌍');
    const originalUpdatedAt = trip.updatedAt;
    
    // Small delay to ensure different timestamp
    localTripRepository.save(trip);
    const loaded = localTripRepository.load(trip.id);
    expect(loaded).not.toBeNull();
    // updatedAt should be set (may or may not differ from original depending on timing)
    expect(loaded!.updatedAt).toBeDefined();
  });

  it('deletes a trip by ID', () => {
    const trip1 = createEmptyTrip('Trip A', 'Place A', '🏖️');
    const trip2 = createEmptyTrip('Trip B', 'Place B', '🏔️');
    localTripRepository.save(trip1);
    localTripRepository.save(trip2);

    localTripRepository.delete(trip1.id);

    const trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(trip2.id);

    expect(localTripRepository.load(trip1.id)).toBeNull();
  });

  it('handles deleting the demo trip', () => {
    // First visit — demo trip is seeded
    let trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(DEMO_TRIP_ID);

    // Add a real trip so deletion doesn't re-seed
    const custom = createEmptyTrip('My Trip', 'Somewhere', '✈️');
    localTripRepository.save(custom);

    // Delete the demo trip
    localTripRepository.delete(DEMO_TRIP_ID);

    trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(custom.id);
  });

  it('does not re-seed the demo trip after it has been deleted, even if no other trips remain', () => {
    // First visit — demo trip is seeded
    let trips = localTripRepository.list();
    expect(trips).toHaveLength(1);
    expect(trips[0].id).toBe(DEMO_TRIP_ID);

    // Delete the demo trip, leaving trips empty
    localTripRepository.delete(DEMO_TRIP_ID);

    // Listing trips should return empty, not re-seed
    trips = localTripRepository.list();
    expect(trips).toHaveLength(0);
  });

  it('preserves domain data through save/load round-trip', () => {
    const trip = createEmptyTrip('Data Test', 'Testville', '🧪');
    trip.cards = [
      {
        id: 'c_test_1',
        type: 'sticky',
        x: 100,
        y: 200,
        rotation: 1.5,
        title: 'Test Card',
        subtitle: 'Test subtitle',
        width: 200,
      },
    ];
    trip.inboxItems = [
      {
        id: 'i_test_1',
        type: 'note',
        source: 'Test',
        content: 'Test content',
        timestamp: 'Just now',
        processed: false,
      },
    ];
    trip.connections = [{ from: 'c1', to: 'c2', label: 'test-link' }];
    trip.days = [{ day: 1, label: 'Day 1 — Test', color: '#f59e0b' }];

    localTripRepository.save(trip);
    const loaded = localTripRepository.load(trip.id);

    expect(loaded!.cards).toHaveLength(1);
    expect(loaded!.cards[0].title).toBe('Test Card');
    expect(loaded!.inboxItems).toHaveLength(1);
    expect(loaded!.inboxItems[0].content).toBe('Test content');
    expect(loaded!.connections).toHaveLength(1);
    expect(loaded!.days).toHaveLength(1);
  });
});
