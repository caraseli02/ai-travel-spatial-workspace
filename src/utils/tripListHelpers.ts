import type { Trip } from '../models/trip';
import { deriveTripStatus } from './tripCardHelpers';
import type { CanvasCard } from '../models/trip';

export function computeStatusCounts(trips: Trip[]) {
  const counts = {
    all: trips.length,
    upcoming: 0,
    ongoing: 0,
    planning: 0,
    completed: 0,
  };

  trips.forEach((trip) => {
    const status = deriveTripStatus(trip);
    if (status in counts) {
      counts[status as keyof typeof counts]++;
    }
  });

  return counts;
}

export function filterTripsByStatus(
  trips: Trip[],
  status: 'all' | 'upcoming' | 'ongoing' | 'planning' | 'completed'
): Trip[] {
  if (status === 'all') {
    return trips;
  }
  return trips.filter((trip) => deriveTripStatus(trip) === status);
}
