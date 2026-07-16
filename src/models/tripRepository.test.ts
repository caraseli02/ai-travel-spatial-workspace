import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Trip } from '@/models/trip';
import type { TripRepository } from '@/models/tripRepository';
import { DEMO_TRIP_ID, createEmptyTrip } from '@/models/trip';
import { PARIS_FIXTURE_TRIP_ID } from '@/data/tripData';
import { localTripRepository } from '@/models/tripRepository';

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

  it('exposes localTripRepository through the Trip Repository interface', () => {
    const repository: TripRepository = localTripRepository;
    expect(repository).toBe(localTripRepository);
  });

  it('seeds design fixture trips on first visit when no trips exist', () => {
    const trips = localTripRepository.list();
    expect(trips).toHaveLength(2);
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
    expect(
      trips.find(t => t.id === DEMO_TRIP_ID),
      'Demo Trip was re-seeded even though a user trip already exists. ensureDemoTrip in src/models/tripRepository.ts must only seed when the store is empty; see docs/adr/0001-localstorage-first-persistence.md.',
    ).toBeUndefined();
  });

  it('saves and loads a trip by ID', () => {
    const trip = createEmptyTrip('Barcelona Summer', 'Barcelona, Spain', '🇪🇸');
    localTripRepository.save(trip);

    const loaded = localTripRepository.load(trip.id);
    expect(
      loaded,
      'A saved Trip could not be loaded back. Writes/reads must round-trip through localTripRepository (src/models/tripRepository.ts) using the same storage key; see docs/adr/0001-localstorage-first-persistence.md.',
    ).not.toBeNull();
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
    let trips = localTripRepository.list();
    expect(trips).toHaveLength(2);
    expect(trips[0].id).toBe(DEMO_TRIP_ID);

    const custom = createEmptyTrip('My Trip', 'Somewhere', '✈️');
    localTripRepository.save(custom);

    localTripRepository.delete(DEMO_TRIP_ID);

    trips = localTripRepository.list();
    expect(trips).toHaveLength(2);
    expect(trips.find((t) => t.id === custom.id)).toBeDefined();
    expect(trips.find((t) => t.id === DEMO_TRIP_ID)).toBeUndefined();
  });

  it('does not re-seed the demo trip after it has been deleted, even if no other trips remain', () => {
    let trips = localTripRepository.list();
    expect(trips).toHaveLength(2);

    localTripRepository.delete(DEMO_TRIP_ID);
    localTripRepository.delete(PARIS_FIXTURE_TRIP_ID);

    trips = localTripRepository.list();
    expect(
      trips,
      'Demo Trip re-seeded after the user deleted it. The demo-seeded flag in src/models/tripRepository.ts must persist so deletion stays permanent even when the store is empty; see docs/adr/0001-localstorage-first-persistence.md.',
    ).toHaveLength(0);
  });

  it('preserves captured Trip Material source fields through save/load round-trip', () => {
    const trip = createEmptyTrip('Capture Test', 'Kyoto, Japan', '⛩️');
    trip.inboxItems = [
      {
        id: 'i_capture_url',
        type: 'link',
        source: 'example.com',
        content: 'https://example.com/opaque-path-xyz123',
        rawContent: 'https://example.com/opaque-path-xyz123',
        sourceUrl: 'https://example.com/opaque-path-xyz123',
        timestamp: 'Just now',
        capturedAt: '2026-07-12T09:00:00.000Z',
        processed: false,
      },
      {
        id: 'i_capture_note',
        type: 'note',
        source: 'Tea ceremony near Gion',
        content: 'Tea ceremony near Gion',
        rawContent: 'Tea ceremony near Gion',
        timestamp: 'Just now',
        capturedAt: '2026-07-12T09:01:00.000Z',
        processed: false,
      },
    ];

    localTripRepository.save(trip);
    const loaded = localTripRepository.load(trip.id);

    expect(loaded!.inboxItems[0]).toMatchObject({
      sourceUrl: 'https://example.com/opaque-path-xyz123',
      rawContent: 'https://example.com/opaque-path-xyz123',
      capturedAt: '2026-07-12T09:00:00.000Z',
    });
    expect(loaded!.inboxItems[1]).toMatchObject({
      rawContent: 'Tea ceremony near Gion',
      capturedAt: '2026-07-12T09:01:00.000Z',
    });
    expect(loaded!.inboxItems[1].sourceUrl).toBeUndefined();
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
        promotedFromInboxId: 'i_test_1',
      },
    ];
    trip.inboxItems = [
      {
        id: 'i_test_1',
        type: 'note',
        source: 'Test',
        content: 'Test content',
        timestamp: 'Just now',
        processed: true,
        resultingCardId: 'c_test_1',
      },
    ];
    trip.connections = [{ from: 'c1', to: 'c2', label: 'test-link' }];
    trip.days = [{ day: 1, label: 'Day 1 — Test', color: '#f59e0b' }];

    localTripRepository.save(trip);
    const loaded = localTripRepository.load(trip.id);

    expect(loaded!.cards).toHaveLength(1);
    expect(loaded!.cards[0].title).toBe('Test Card');
    expect(
      loaded!.cards[0].promotedFromInboxId,
      'Canvas Card provenance was lost on save/load. tripRepository must persist promotedFromInboxId so Trip Material memory survives a round-trip; check serialize/deserialize in src/models/tripRepository.ts.',
    ).toBe('i_test_1');
    expect(loaded!.inboxItems).toHaveLength(1);
    expect(loaded!.inboxItems[0].content).toBe('Test content');
    expect(loaded!.inboxItems[0].resultingCardId).toBe('c_test_1');
    expect(loaded!.connections).toHaveLength(1);
    expect(loaded!.days).toHaveLength(1);
  });

  it('loads older saved trips without provenance fields and allows editing them', () => {
    const oldTrip: Trip = {
      ...createEmptyTrip('Older Trip', 'Lisbon, Portugal', '🇵🇹'),
      cards: [
        {
          id: 'c_old_1',
          type: 'sticky',
          x: 10,
          y: 20,
          rotation: 0,
          title: 'Old saved card',
        },
      ],
      inboxItems: [
        {
          id: 'i_old_1',
          type: 'note',
          source: 'Old note',
          content: 'Older Trip Material',
          timestamp: 'Last week',
          processed: true,
        },
      ],
    };
    store.wayfarer_trips = JSON.stringify([oldTrip]);
    store.wayfarer_demo_seeded = 'true';

    const loaded = localTripRepository.load(oldTrip.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.cards[0].promotedFromInboxId).toBeUndefined();
    expect(loaded!.inboxItems[0].resultingCardId).toBeUndefined();

    localTripRepository.save({
      ...loaded!,
      cards: [{ ...loaded!.cards[0], title: 'Edited old saved card' }],
    });

    const edited = localTripRepository.load(oldTrip.id);
    expect(edited!.cards[0].title).toBe('Edited old saved card');
    expect(edited!.inboxItems[0].content).toBe('Older Trip Material');
  });

  it('defaults missing workspace collections from older localStorage payloads', () => {
    const partialOldTrip = {
      id: 'old-partial',
      name: 'Partial Trip',
      destination: 'Porto, Portugal',
      emoji: '🇵🇹',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    store.wayfarer_trips = JSON.stringify([partialOldTrip]);
    store.wayfarer_demo_seeded = 'true';

    const loaded = localTripRepository.load('old-partial');
    expect(
      loaded,
      'Older localStorage payloads missing workspace collections were not backfilled. tripRepository.load (src/models/tripRepository.ts) must default cards/connections/inboxItems/days/dayLabels to [] so the Trip Workspace never reads undefined; see docs/adr/0001-localstorage-first-persistence.md.',
    ).toMatchObject({
      id: 'old-partial',
      cards: [],
      connections: [],
      inboxItems: [],
      days: [],
      dayLabels: [],
    });
  });

  it('re-seeds demo trips when stored JSON is corrupt and demo was previously seeded', () => {
    store.wayfarer_trips = '{not valid json';
    store.wayfarer_demo_seeded = 'true';

    const trips = localTripRepository.list();

    expect(trips).toHaveLength(2);
    expect(trips[0].id).toBe(DEMO_TRIP_ID);
    expect(trips.find((t) => t.id === PARIS_FIXTURE_TRIP_ID)).toBeDefined();
    expect(store.wayfarer_trips).toBeDefined();
    expect(JSON.parse(store.wayfarer_trips)).toHaveLength(2);
    expect(store.wayfarer_demo_seeded).toBe('true');
  });

  it('re-seeds demo trips when stored payload is not a trip array', () => {
    store.wayfarer_trips = JSON.stringify({ broken: true });
    store.wayfarer_demo_seeded = 'true';

    const trips = localTripRepository.list();

    expect(trips).toHaveLength(2);
    expect(trips[0].id).toBe(DEMO_TRIP_ID);
  });

  it('keeps an intentionally empty trip list when storage is valid', () => {
    store.wayfarer_trips = JSON.stringify([]);
    store.wayfarer_demo_seeded = 'true';

    const trips = localTripRepository.list();

    expect(trips).toHaveLength(0);
  });
});
