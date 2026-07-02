export function filterPreviewTrips<T extends { status: string }>(
  trips: readonly T[],
  activeFilter: string | null,
): T[] {
  return trips.filter((trip) => activeFilter === null || trip.status === activeFilter);
}
