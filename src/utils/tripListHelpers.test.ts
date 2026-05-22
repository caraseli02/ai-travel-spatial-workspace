import { describe, it, expect } from 'vitest';
import type { Trip } from '../models/trip';
import { computeStatusCounts, filterTripsByStatus, generateTripFromMessage } from './tripListHelpers';

describe('tripListHelpers - computeStatusCounts', () => {
  it('should return correct counts when trips array is empty', () => {
    const trips: Trip[] = [];
    const counts = computeStatusCounts(trips);
    expect(counts).toEqual({
      all: 0,
      upcoming: 0,
      ongoing: 0,
      planning: 0,
      completed: 0,
    });
  });

  it('should compute status frequencies correctly based on dates', () => {
    const trips = [
      {
        id: '1',
        dates: { start: '2026-06-01', end: '2026-06-10' }, // Future (Upcoming)
      },
      {
        id: '2',
        dates: { start: '2026-05-15', end: '2026-05-30' }, // Currently ongoing
      },
      {
        id: '3',
        dates: { start: '2026-04-01', end: '2026-04-10' }, // Past (Completed)
      },
      {
        id: '4', // No dates (Planning)
      },
      {
        id: '5', // No dates (Planning)
      },
    ] as unknown as Trip[];

    const counts = computeStatusCounts(trips);
    expect(counts).toEqual({
      all: 5,
      upcoming: 1,
      ongoing: 1,
      planning: 2,
      completed: 1,
    });
  });
});

describe('tripListHelpers - filterTripsByStatus', () => {
  const mockTrips = [
    { id: '1', name: 'Trip 1', dates: { start: '2026-06-01', end: '2026-06-10' } }, // upcoming
    { id: '2', name: 'Trip 2', dates: { start: '2026-05-15', end: '2026-05-30' } }, // ongoing
    { id: '3', name: 'Trip 3', dates: { start: '2026-04-01', end: '2026-04-10' } }, // completed
    { id: '4', name: 'Trip 4' }, // planning
  ] as unknown as Trip[];

  it('should return all trips when status filter is "all"', () => {
    const filtered = filterTripsByStatus(mockTrips, 'all');
    expect(filtered.length).toBe(4);
    expect(filtered).toEqual(mockTrips);
  });

  it('should filter by upcoming status', () => {
    const filtered = filterTripsByStatus(mockTrips, 'upcoming');
    expect(filtered.map(t => t.id)).toEqual(['1']);
  });

  it('should filter by ongoing status', () => {
    const filtered = filterTripsByStatus(mockTrips, 'ongoing');
    expect(filtered.map(t => t.id)).toEqual(['2']);
  });

  it('should filter by planning status', () => {
    const filtered = filterTripsByStatus(mockTrips, 'planning');
    expect(filtered.map(t => t.id)).toEqual(['4']);
  });

  it('should filter by completed status', () => {
    const filtered = filterTripsByStatus(mockTrips, 'completed');
    expect(filtered.map(t => t.id)).toEqual(['3']);
  });
});

describe('tripListHelpers - generateTripFromMessage', () => {
  it('should extract destination and populate basic trip metadata from a Paris prompt', () => {
    const prompt = 'Plan a 5-day trip to Paris for 2 people';
    const trip = generateTripFromMessage(prompt);
    
    expect(trip.destination).toBe('Paris, France');
    expect(trip.country).toBe('France');
    expect(trip.travelers).toBe(2);
    expect(trip.budget).toContain('$');
    expect(trip.status).toBeUndefined();
    expect(trip.emoji).toBe('🗼');
    expect(trip.cards.length).toBeGreaterThan(0); // Itinerary cards pre-populated!
    expect(trip.dates).toBeDefined();
    if (trip.dates) {
      const start = new Date(trip.dates.start);
      const end = new Date(trip.dates.end);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(5); // 5-day duration
    }
  });

  it('should extract travelers and duration from a Bali prompt', () => {
    const prompt = 'Create a beach vacation to Bali for 4 guests for 7 days';
    const trip = generateTripFromMessage(prompt);
    
    expect(trip.destination).toBe('Bali, Indonesia');
    expect(trip.country).toBe('Indonesia');
    expect(trip.travelers).toBe(4);
    expect(trip.emoji).toBe('🌴');
    if (trip.dates) {
      const start = new Date(trip.dates.start);
      const end = new Date(trip.dates.end);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7); // 7-day duration
    }
  });
});
