import type { Trip } from "../models/trip";

export function deriveTripStatus(trip: Trip): "upcoming" | "ongoing" | "completed" | "planning" {
  if (trip.status) {
    return trip.status;
  }
  if (!trip.dates || !trip.dates.start || !trip.dates.end) {
    return "planning";
  }

  const todayStr = new Date().toISOString().split("T")[0];

  if (todayStr < trip.dates.start) {
    return "upcoming";
  }
  if (todayStr > trip.dates.end) {
    return "completed";
  }
  return "ongoing";
}

export function deriveTripCountry(trip: Trip): string {
  if (trip.country) {
    return trip.country;
  }
  if (trip.destination.includes(",")) {
    const parts = trip.destination.split(",");
    return parts[parts.length - 1].trim();
  }
  return "Explore";
}

export function deriveTripImage(trip: Trip): string {
  if (trip.image) {
    return trip.image;
  }
  if (trip.destination.toLowerCase().includes("kyoto")) {
    return "/images/kyoto-hero.jpg";
  }
  const cardWithImage = trip.cards.find((c) => c.image);
  if (cardWithImage && cardWithImage.image) {
    return cardWithImage.image;
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80";
}

export function deriveTripTravelers(trip: Trip): number {
  return trip.travelers ?? 1;
}

export function deriveTripBudget(trip: Trip): string {
  return trip.budget ?? "Flexible";
}

export function deriveTripActivities(trip: Trip): string[] {
  if (trip.activities) {
    return trip.activities;
  }
  return trip.cards.map((c) => c.title).filter((title) => !!title && !!title.trim());
}

export function formatTripDates(dates?: { start: string; end: string }): string {
  if (!dates || !dates.start || !dates.end) {
    return "Flexible";
  }
  try {
    const start = new Date(dates.start);
    const end = new Date(dates.end);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Flexible";
    }

    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });

    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (startMonth !== endMonth) {
      return `${startMonth} ${start.getDate()}–${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
    if (start.getDate() !== end.getDate()) {
      return `${startMonth} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
    }
    return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Flexible";
  }
}
