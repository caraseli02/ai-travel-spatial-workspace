// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
});
