import { describe, it, expect } from 'vitest';
import type { Trip } from '../models/trip';
import {
  deriveTripStatus,
  deriveTripCountry,
  deriveTripImage,
  deriveTripTravelers,
  deriveTripBudget,
  deriveTripActivities,
} from './tripCardHelpers';

// A mock function to help build a minimal trip for tests
function makeMockTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'test-trip',
    name: 'Test Trip',
    destination: 'Test Destination',
    emoji: '✈️',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cards: [],
    connections: [],
    inboxItems: [],
    days: [],
    dayLabels: [],
    ...overrides,
  };
}

describe('Trip Card Helpers', () => {
  describe('deriveTripStatus', () => {
    it('returns planning when no dates are specified', () => {
      const trip = makeMockTrip({ dates: undefined });
      expect(deriveTripStatus(trip)).toBe('planning');
    });

    it('returns the explicit status if it is pre-defined on the trip object', () => {
      const trip = makeMockTrip({ status: 'completed' });
      expect(deriveTripStatus(trip)).toBe('completed');
    });

    it('returns upcoming when start date is in the future', () => {
      const start = new Date();
      start.setDate(start.getDate() + 5);
      const end = new Date();
      end.setDate(end.getDate() + 10);

      const trip = makeMockTrip({
        dates: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      });
      expect(deriveTripStatus(trip)).toBe('upcoming');
    });

    it('returns completed when end date is in the past', () => {
      const start = new Date();
      start.setDate(start.getDate() - 10);
      const end = new Date();
      end.setDate(end.getDate() - 5);

      const trip = makeMockTrip({
        dates: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      });
      expect(deriveTripStatus(trip)).toBe('completed');
    });

    it('returns ongoing when current date is between start and end dates', () => {
      const start = new Date();
      start.setDate(start.getDate() - 2);
      const end = new Date();
      end.setDate(end.getDate() + 2);

      const trip = makeMockTrip({
        dates: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      });
      expect(deriveTripStatus(trip)).toBe('ongoing');
    });
  });

  describe('deriveTripCountry', () => {
    it('returns explicit country if pre-defined', () => {
      const trip = makeMockTrip({ country: 'Spain' });
      expect(deriveTripCountry(trip)).toBe('Spain');
    });

    it('extracts country name from destination if it has a comma', () => {
      const trip = makeMockTrip({ destination: 'Kyoto, Japan' });
      expect(deriveTripCountry(trip)).toBe('Japan');
    });

    it('returns Explore if destination has no comma and country is not pre-defined', () => {
      const trip = makeMockTrip({ destination: 'Barcelona' });
      expect(deriveTripCountry(trip)).toBe('Explore');
    });
  });

  describe('deriveTripImage', () => {
    it('returns explicit image if pre-defined', () => {
      const trip = makeMockTrip({ image: '/custom/path.jpg' });
      expect(deriveTripImage(trip)).toBe('/custom/path.jpg');
    });

    it('returns kyoto-hero image if destination includes Kyoto', () => {
      const trip = makeMockTrip({ destination: 'Kyoto, Japan' });
      expect(deriveTripImage(trip)).toBe('/images/kyoto-hero.jpg');
    });

    it('returns first card image if present and destination is not Kyoto', () => {
      const trip = makeMockTrip({
        destination: 'Paris',
        cards: [
          { id: 'c1', type: 'sticky', x: 0, y: 0, rotation: 0, title: 'No image' },
          { id: 'c2', type: 'polaroid', x: 0, y: 0, rotation: 0, title: 'Eiffel', image: '/images/eiffel.jpg' }
        ]
      });
      expect(deriveTripImage(trip)).toBe('/images/eiffel.jpg');
    });

    it('returns a premium default image URL if no image is found', () => {
      const trip = makeMockTrip({ destination: 'Paris', cards: [] });
      expect(deriveTripImage(trip)).toContain('unsplash.com');
    });
  });

  describe('deriveTripTravelers', () => {
    it('returns explicit travelers count if pre-defined', () => {
      const trip = makeMockTrip({ travelers: 3 });
      expect(deriveTripTravelers(trip)).toBe(3);
    });

    it('returns default of 1 if not defined', () => {
      const trip = makeMockTrip({});
      expect(deriveTripTravelers(trip)).toBe(1);
    });
  });

  describe('deriveTripBudget', () => {
    it('returns explicit budget if pre-defined', () => {
      const trip = makeMockTrip({ budget: '$2,500' });
      expect(deriveTripBudget(trip)).toBe('$2,500');
    });

    it('returns default of Flexible if not defined', () => {
      const trip = makeMockTrip({});
      expect(deriveTripBudget(trip)).toBe('Flexible');
    });
  });

  describe('deriveTripActivities', () => {
    it('returns explicit activities if pre-defined', () => {
      const trip = makeMockTrip({ activities: ['Surfing', 'Hiking'] });
      expect(deriveTripActivities(trip)).toEqual(['Surfing', 'Hiking']);
    });

    it('extracts top 3 card titles if activities not defined', () => {
      const trip = makeMockTrip({
        cards: [
          { id: 'c1', type: 'sticky', x: 0, y: 0, rotation: 0, title: 'Visit Temple' },
          { id: 'c2', type: 'polaroid', x: 0, y: 0, rotation: 0, title: 'Sushi Dinner' },
          { id: 'c3', type: 'sticky', x: 0, y: 0, rotation: 0, title: 'Bamboo Forest' },
          { id: 'c4', type: 'flight', x: 0, y: 0, rotation: 0, title: 'Flight Back' },
        ]
      });
      expect(deriveTripActivities(trip)).toEqual(['Visit Temple', 'Sushi Dinner', 'Bamboo Forest']);
    });

    it('returns empty array if no activities and no cards', () => {
      const trip = makeMockTrip({ cards: [] });
      expect(deriveTripActivities(trip)).toEqual([]);
    });
  });
});
