// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@/models/trip";
import { TripGrid } from "./TripGrid";

const upcomingTrip = {
  id: "trip-upcoming",
  name: "Summer Escape",
  destination: "Barcelona, Spain",
  emoji: "🌴",
  dates: { start: "2026-06-01", end: "2026-06-10" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  cards: [],
  connections: [],
  inboxItems: [],
  days: [],
  dayLabels: [],
} as Trip;

describe("TripGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render trip cards when a status filter has zero matches", () => {
    render(
      <TripGrid
        trips={[upcomingTrip]}
        filteredTrips={[]}
        selectedFilter="ongoing"
        onCreateTrip={vi.fn()}
        onShowAllTrips={vi.fn()}
        onOpenTrip={vi.fn()}
        onDeleteTrip={vi.fn()}
      />,
    );

    expect(screen.getByTestId("trip-list-filter-empty-state")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No ongoing trips" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open trip workspace for Summer Escape" }),
    ).not.toBeInTheDocument();
  });

  it("renders the dashed New Trip card on desktop", () => {
    render(
      <TripGrid
        trips={[upcomingTrip]}
        filteredTrips={[upcomingTrip]}
        selectedFilter="all"
        onCreateTrip={vi.fn()}
        onShowAllTrips={vi.fn()}
        onOpenTrip={vi.fn()}
        onDeleteTrip={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Create a new trip" })).toBeInTheDocument();
  });

  it("omits the duplicate New Trip card on mobile and renders compact rows", () => {
    render(
      <TripGrid
        trips={[upcomingTrip]}
        filteredTrips={[upcomingTrip]}
        selectedFilter="all"
        isMobile
        onCreateTrip={vi.fn()}
        onShowAllTrips={vi.fn()}
        onOpenTrip={vi.fn()}
        onDeleteTrip={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Create a new trip" })).not.toBeInTheDocument();
    expect(screen.getByTestId("trip-card-compact")).toBeInTheDocument();
  });
});
