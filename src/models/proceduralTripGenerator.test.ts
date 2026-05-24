import { describe, it, expect } from 'vitest';
import { generateTripFromMessage } from './proceduralTripGenerator';

describe('Procedural Trip Generator', () => {
  it('extracts destination and populates basic trip metadata from a Paris prompt', () => {
    const prompt = 'Plan a 5-day trip to Paris for 2 people';
    const trip = generateTripFromMessage(prompt);

    expect(trip.destination).toBe('Paris, France');
    expect(trip.country).toBe('France');
    expect(trip.travelers).toBe(2);
    expect(trip.budget).toContain('$');
    expect(trip.status).toBeUndefined();
    expect(trip.emoji).toBe('🗼');
    expect(trip.cards.length).toBeGreaterThan(0);
    expect(trip.dates).toBeDefined();
    if (trip.dates) {
      const start = new Date(trip.dates.start);
      const end = new Date(trip.dates.end);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(5);
    }
  });

  it('extracts travelers and duration from a Bali prompt', () => {
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
      expect(diffDays).toBe(7);
    }
  });

  it('preserves unknown destination names before traveler details', () => {
    const prompt = 'Plan a 6-day trip to Lisbon for 2 people';
    const trip = generateTripFromMessage(prompt);

    expect(trip.name).toBe('Trip to Lisbon');
    expect(trip.destination).toBe('Lisbon, Explore');
    expect(trip.country).toBe('Explore');
    expect(trip.travelers).toBe(2);
    expect(trip.cards[0]?.title).toBe('Flight to Lisbon');
    if (trip.dates) {
      const start = new Date(trip.dates.start);
      const end = new Date(trip.dates.end);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(6);
    }
  });
});
