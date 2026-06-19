import type { CanvasCard, InboxItem } from "../models/trip";

export const inboxItems: InboxItem[] = [
  {
    id: "i1",
    type: "whatsapp",
    source: "Yuki (local friend)",
    content:
      "You HAVE to go to Fushimi Inari at 5am before the crowds! And try the tofu kaiseki at Junsei near Nanzenji 🍜",
    timestamp: "2 hours ago",
    processed: true,
    resultingCardId: "c5",
    avatar: "🇯🇵",
  },
  {
    id: "i2",
    type: "flight",
    source: "Google Flights",
    content: "SFO → KIX · Dec 14 · 12h 40m · $743 · JAL JL69 · Nonstop",
    timestamp: "3 hours ago",
    processed: true,
    resultingCardId: "c1",
  },
  {
    id: "i3",
    type: "hotel",
    source: "Booking.com",
    content: "Hiiragiya Ryokan · Nakagyo Ward · Dec 14–21 · ¥45,000/night · Free cancellation",
    timestamp: "3 hours ago",
    processed: true,
    resultingCardId: "c2",
  },
  {
    id: "i4",
    type: "link",
    source: "Reddit r/JapanTravel",
    content:
      '"Top 7 hidden Kyoto temples most tourists skip" — Fushimi Inari, Kurama-dera, Jingo-ji...',
    timestamp: "5 hours ago",
    processed: false,
  },
  {
    id: "i5",
    type: "note",
    source: "My notes",
    content:
      "Remember: JR Pass needed? Check if Arashiyama day trip is covered. Also need pocket WiFi.",
    timestamp: "1 day ago",
    processed: false,
  },
  {
    id: "i6",
    type: "whatsapp",
    source: "Mom",
    content:
      "Don't forget to visit the Golden Pavilion (Kinkaku-ji)! And buy me some matcha kit-kats 🍵",
    timestamp: "1 day ago",
    processed: false,
  },
  {
    id: "i7",
    type: "link",
    source: "Eater Japan",
    content:
      "The 12 Essential Kyoto Restaurants: Kikunoi Honten, Mizai, Nakamura-ro at Yasaka Shrine...",
    timestamp: "2 days ago",
    processed: false,
  },
];

export const canvasCards: CanvasCard[] = [
  // Day 1 cluster — Arrival
  {
    id: "c1",
    type: "flight",
    x: 30,
    y: 72,
    rotation: -1.5,
    title: "JAL JL69 · SFO → KIX",
    subtitle: "Dec 14 · Departs 11:05am · 12h 40m nonstop",
    day: 1,
    details: ["Window seat 32A confirmed", "Meal: Japanese"],
    price: "$743",
    width: 280,
    promotedFromInboxId: "i2",
  },
  {
    id: "c2",
    type: "hotel",
    x: 365,
    y: 48,
    rotation: 1,
    title: "Hiiragiya Ryokan",
    subtitle: "Nakagyo Ward, Kyoto",
    tag: "Dec 14–21 · 7 nights",
    tagColor: "amber",
    day: 1,
    details: [
      "Traditional tatami rooms",
      "Kaiseki dinner included",
      "¥45,000/night",
      "Free cancellation",
    ],
    rating: 4.9,
    image: "/images/ryokan.jpg",
    width: 260,
    promotedFromInboxId: "i3",
  },
  {
    id: "c3",
    type: "sticky",
    x: 680,
    y: 60,
    rotation: 2,
    title: "Pack light!",
    subtitle: "Ryokan provides yukata & toiletries. Just bring camera + layers.",
    color: "#fef3c7",
    day: 1,
    width: 200,
  },

  // Day 2 cluster — Fushimi Inari
  {
    id: "c4",
    type: "polaroid",
    x: 20,
    y: 310,
    rotation: -2.5,
    title: "Fushimi Inari",
    subtitle: "5am · Beat the crowds",
    image: "/images/fushimi-inari.jpg",
    day: 2,
    width: 210,
  },
  {
    id: "c5",
    type: "sticky",
    x: 275,
    y: 290,
    rotation: 1.5,
    title: "Yuki says:",
    subtitle: '"Go at 5am!! The light through the torii is incredible and zero tourists 🌅"',
    color: "#fce7f3",
    day: 2,
    width: 195,
    promotedFromInboxId: "i1",
  },
  {
    id: "c6",
    type: "article",
    x: 510,
    y: 275,
    rotation: -1,
    title: "Nishiki Market",
    subtitle: '"Kyoto\'s Kitchen" — 126 stalls of fresh tofu, pickles & street snacks',
    tag: "Afternoon",
    tagColor: "orange",
    day: 2,
    details: ["Open 9am–6pm", "Try: Tako tamago skewers", "Near Gion district"],
    image: "/images/nishiki-market.jpg",
    width: 255,
  },

  // Day 3 cluster — Arashiyama
  {
    id: "c7",
    type: "polaroid",
    x: 30,
    y: 580,
    rotation: 1.8,
    title: "Arashiyama Bamboo",
    subtitle: "Early morning walk",
    image: "/images/arashiyama.jpg",
    day: 3,
    width: 220,
  },
  {
    id: "c8",
    type: "sticky",
    x: 305,
    y: 560,
    rotation: -1.5,
    title: "JR Pass ✓",
    subtitle: "Arashiyama is covered! Take the Sagano Scenic Railway. Rent a bike to Jojakko-ji.",
    color: "#d1fae5",
    day: 3,
    width: 195,
  },
  {
    id: "c9",
    type: "article",
    x: 538,
    y: 548,
    rotation: 2,
    title: "Tenryu-ji Garden",
    subtitle: "UNESCO World Heritage · Zen garden with Arashiyama mountain backdrop",
    tag: "Must-see",
    tagColor: "emerald",
    day: 3,
    details: ["¥500 entry", "Opens 8:30am", "Allow 1.5 hours"],
    width: 240,
  },

  // Day 4 cluster — Gion
  {
    id: "c10",
    type: "polaroid",
    x: 790,
    y: 280,
    rotation: -1,
    title: "Gion at Dusk",
    subtitle: "Traditional machiya district",
    image: "/images/gion.jpg",
    day: 4,
    width: 225,
  },
  {
    id: "c11",
    type: "sticky",
    x: 810,
    y: 530,
    rotation: 1.5,
    title: "Dinner: Junsei",
    subtitle: "Tofu kaiseki near Nanzenji. Book 2 weeks ahead! Yuki's top rec 🍜",
    color: "#ffe4e6",
    day: 4,
    width: 190,
  },
  {
    id: "c12",
    type: "note",
    x: 790,
    y: 72,
    rotation: -0.5,
    title: "Pocket WiFi",
    subtitle: "Pick up at KIX airport · ¥600/day · Pre-book online",
    tag: "Logistics",
    tagColor: "slate",
    day: 1,
    width: 210,
  },
  {
    id: "c13",
    type: "sticky",
    x: 295,
    y: 740,
    rotation: 1,
    title: "🍵 Matcha kit-kats",
    subtitle: "Mom's request! Get at Nishiki Market or the airport. Also grab mochi for Sarah.",
    color: "#d1fae5",
    day: 7,
    width: 200,
  },
  {
    id: "c14",
    type: "article",
    x: 538,
    y: 720,
    rotation: -1.5,
    title: "Kikunoi Honten",
    subtitle: "Michelin 3★ kaiseki · Book 1 month in advance · ¥33,000/person",
    tag: "Dinner",
    tagColor: "rose",
    day: 5,
    details: ["Reserve via official website", "Seasonal menu only", "Dress code: smart casual"],
    width: 245,
  },
];

export const dayGroups = [
  { day: 1, label: "Day 1 — Arrival", color: "#f59e0b" },
  { day: 2, label: "Day 2 — Fushimi Inari + Gion", color: "#f97316" },
  { day: 3, label: "Day 3 — Arashiyama", color: "#10b981" },
  { day: 4, label: "Day 4 — Gion + Nanzenji", color: "#f43f5e" },
  { day: 5, label: "Day 5 — Kaiseki dinner", color: "#a855f7" },
  { day: 6, label: "Day 6 — Free day", color: "#6366f1" },
  { day: 7, label: "Day 7 — Departure", color: "#64748b" },
];

export const connections = [
  { from: "c4", to: "c5", label: "tip" },
  { from: "c6", to: "c10", label: "nearby" },
  { from: "c1", to: "c2", label: "same day" },
  { from: "c12", to: "c1", label: "logistics" },
];

// --- Demo Trip factory ---

import type { Trip } from "../models/trip";
import { DEMO_TRIP_ID, dayLabelConfig } from "../models/trip";

/**
 * Create the pre-loaded "7 Days in Kyoto" Demo Trip.
 * Wraps existing fixture data into a proper Trip entity.
 */
export const PARIS_FIXTURE_TRIP_ID = "fixture-paris";

/** Design-fixture trip matching Pencil Trip List (WApFW). */
export function createParisFixtureTrip(): Trip {
  const now = new Date().toISOString();
  return {
    id: PARIS_FIXTURE_TRIP_ID,
    name: "Paris Romance",
    destination: "Paris, France",
    emoji: "🇫🇷",
    country: "France",
    status: "planning",
    travelers: 2,
    budget: "$2,500",
    activities: ["Eiffel Tower", "Louvre", "Seine cruise"],
    image:
      "https://images.unsplash.com/photo-1641487940869-f47bd2d3f03f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    createdAt: now,
    updatedAt: now,
    cards: [],
    connections: [],
    inboxItems: [],
    days: [],
    dayLabels: [],
  };
}

export function createDemoTrip(): Trip {
  return {
    id: DEMO_TRIP_ID,
    name: "7 Days in Kyoto",
    destination: "Kyoto, Japan",
    emoji: "🇯🇵",
    country: "Japan",
    dates: { start: "2026-12-14", end: "2026-12-21" },
    travelers: 2,
    budget: "$3,200",
    activities: ["Fushimi Inari", "Arashiyama", "Nishiki Market"],
    image:
      "https://images.unsplash.com/photo-1558870832-c8db4b5b47d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
    cards: [...canvasCards],
    connections: [...connections],
    inboxItems: [...inboxItems],
    days: [...dayGroups],
    dayLabels: [...dayLabelConfig],
  };
}
