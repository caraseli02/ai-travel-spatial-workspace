// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { CanvasCard } from "@/models/trip";
import {
  ArticleCard,
  FlightCard,
  HotelCard,
} from "./CanvasCards";

const flightCard: CanvasCard = {
  id: "c1",
  type: "flight",
  x: 0,
  y: 0,
  rotation: 0,
  title: "JAL JL69 · SFO → KIX",
  subtitle: "Dec 14 · Departs 11:05am · 12h 40m nonstop",
  details: ["Window seat 32A confirmed", "Meal: Japanese"],
  price: "$743",
};

const hotelCard: CanvasCard = {
  id: "c2",
  type: "hotel",
  x: 0,
  y: 0,
  rotation: 0,
  title: "Hiiragiya Ryokan",
  subtitle: "Nakagyo Ward, Kyoto",
  details: ["Traditional tatami rooms", "Kaiseki dinner included"],
  rating: 4.9,
};

const articleCard: CanvasCard = {
  id: "c3",
  type: "article",
  x: 0,
  y: 0,
  rotation: 0,
  title: "Nishiki Market",
  subtitle: "Kyoto's Kitchen",
  details: ["Open 9am–6pm", "Try: Tako tamago skewers"],
};

describe("CanvasCards embedded summary density", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps flight route, time/place essentials, and price visible when embedded", () => {
    render(<FlightCard card={flightCard} embedded />);

    expect(screen.getByText("SFO")).toBeInTheDocument();
    expect(screen.getByText("KIX")).toBeInTheDocument();
    expect(screen.getByText(flightCard.subtitle!)).toBeInTheDocument();
    expect(screen.getByText("$743")).toBeInTheDocument();
  });

  it("collapses flight booking bullets by default on mobile widths, expanding at md+", () => {
    render(<FlightCard card={flightCard} embedded />);

    const bullet = screen.getByText("Window seat 32A confirmed");
    const bulletContainer = bullet.parentElement;
    expect(bulletContainer?.className).toContain("hidden");
    expect(bulletContainer?.className).toContain("md:block");
  });

  it("shows full flight booking bullets on the freeform (non-embedded) canvas", () => {
    render(<FlightCard card={flightCard} />);

    const bullet = screen.getByText("Window seat 32A confirmed");
    const bulletContainer = bullet.parentElement;
    expect(bulletContainer?.className).not.toContain("hidden");
  });

  it("collapses hotel booking bullets on mobile widths when embedded, keeping title and place", () => {
    render(<HotelCard card={hotelCard} embedded />);

    expect(screen.getByText("Hiiragiya Ryokan")).toBeInTheDocument();
    expect(screen.getByText("Nakagyo Ward, Kyoto")).toBeInTheDocument();

    const bullet = screen.getByText("Traditional tatami rooms");
    const list = bullet.closest("ul");
    expect(list?.className).toContain("hidden");
    expect(list?.className).toContain("md:block");
  });

  it("collapses article booking bullets on mobile widths when embedded, keeping title and subtitle", () => {
    render(<ArticleCard card={articleCard} embedded />);

    expect(screen.getByText("Nishiki Market")).toBeInTheDocument();
    expect(screen.getByText("Kyoto's Kitchen")).toBeInTheDocument();

    const bullet = screen.getByText("Open 9am–6pm");
    const list = bullet.closest("ul");
    expect(list?.className).toContain("hidden");
    expect(list?.className).toContain("md:block");
  });
});
