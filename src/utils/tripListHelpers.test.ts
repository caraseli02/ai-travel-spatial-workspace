import { describe, it, expect } from 'vitest';
import type { Trip } from '../models/trip';
import { computeStatusCounts, filterTripsByStatus } from './tripListHelpers';

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
