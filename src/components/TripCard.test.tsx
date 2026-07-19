// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Trip } from "@/models/trip";
import TripCard from "./TripCard";

const trip = {
  id: "trip-1",
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

describe("TripCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a compact row (not the full photo card) when isMobile is true", () => {
    render(
      <TripCard trip={trip} index={0} isMobile onOpen={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByTestId("trip-card-compact")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open trip workspace for Summer Escape" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Barcelona, Spain" })).not.toBeInTheDocument();
  });

  it("opens the trip when the compact row is activated", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(<TripCard trip={trip} index={0} isMobile onOpen={onOpen} onDelete={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Open trip workspace for Summer Escape" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before deleting from the compact row", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TripCard trip={trip} index={0} isMobile onOpen={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete trip Summer Escape" }));
    expect(screen.getByText(/Delete .Summer Escape.\?/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("renders the full photo card when isMobile is false", () => {
    render(<TripCard trip={trip} index={0} onOpen={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByTestId("trip-card-compact")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Barcelona, Spain" })).toBeInTheDocument();
  });
});
