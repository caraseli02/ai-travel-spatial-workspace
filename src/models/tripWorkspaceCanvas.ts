import type { CanvasCard, DayGroup, DayLabel, InboxItem } from "@/models/trip";

export type CardType = CanvasCard["type"];

export const cardTypeOptions = [
  { value: "sticky", label: "📌 Sticky Note" },
  { value: "polaroid", label: "🖼️ Polaroid Location" },
  { value: "hotel", label: "🏨 Hotel Accommodation" },
  { value: "flight", label: "✈️ Flight Ticket" },
  { value: "article", label: "📄 Saved Article" },
  { value: "note", label: "📝 Quick Note" },
] satisfies { value: CardType; label: string }[];

export const dayColorPresets = [
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#14b8a6",
];

export const cardDimensions: Record<string, { w: number; h: number }> = {
  polaroid: { w: 220, h: 230 },
  sticky: { w: 200, h: 120 },
  article: { w: 260, h: 220 },
  flight: { w: 280, h: 180 },
  hotel: { w: 260, h: 240 },
  note: { w: 210, h: 110 },
};

export function getCardCenter(card: CanvasCard) {
  const dim = cardDimensions[card.type] || { w: 200, h: 150 };
  const w = card.width || dim.w;
  const h = dim.h;
  return {
    x: card.x + w / 2,
    y: card.y + h / 2,
  };
}

export function isCardType(value: string): value is CardType {
  return cardTypeOptions.some((option) => option.value === value);
}

export function buildProcessedCanvasCard({
  item,
  activeDay,
  dayLabels,
  cards,
  now = Date.now,
  random = Math.random,
}: {
  item: InboxItem;
  activeDay: number | null;
  dayLabels: DayLabel[];
  cards: CanvasCard[];
  now?: () => number;
  random?: () => number;
}) {
  const newCardId = `c_spawn_${now()}`;
  const processedItem = { ...item, processed: true, resultingCardId: newCardId };
  const associatedDay = activeDay || 2;
  const dayCfg = dayLabels.find((label) => label.day === associatedDay) || dayLabels[0];
  const scatterX = Math.floor(random() * 80) - 40;
  const scatterY = Math.floor(random() * 80) - 40;
  const targetX = Math.min(Math.max(dayCfg.x + 180 + scatterX, 50), 1000);
  const targetY = Math.min(Math.max(dayCfg.y + scatterY, 50), 800);
  const rotation = random() * 4 - 2;

  let newCard: CanvasCard;

  if (item.type === "flight") {
    newCard = {
      id: newCardId,
      type: "flight",
      x: targetX,
      y: targetY,
      rotation,
      title: "New Flight Ticket",
      subtitle: item.content,
      tag: `Day ${associatedDay} · Flight`,
      tagColor: "slate",
      day: associatedDay,
      details: ["Parsed from flight tracker", "Ready for boarding confirmation"],
      width: 280,
    };
  } else if (item.type === "hotel") {
    newCard = {
      id: newCardId,
      type: "hotel",
      x: targetX,
      y: targetY,
      rotation,
      title: "Hotel Accommodation",
      subtitle: item.content,
      tag: `Day ${associatedDay} · Stay`,
      tagColor: "amber",
      day: associatedDay,
      details: ["Parsed from reservation", "Address details verified"],
      rating: 4.8,
      width: 260,
    };
  } else if (item.id === "i4") {
    newCard = {
      id: newCardId,
      type: "polaroid",
      x: targetX,
      y: targetY,
      rotation,
      title: "Hidden Temples",
      subtitle: "Kurama-dera & Jingo-ji",
      image: "/images/ryokan.jpg",
      tag: "Day 2 · Exploration",
      tagColor: "orange",
      day: 2,
      width: 220,
    };
  } else if (item.id === "i6") {
    newCard = {
      id: newCardId,
      type: "polaroid",
      x: targetX,
      y: targetY,
      rotation,
      title: "Golden Pavilion (Kinkaku-ji)",
      subtitle: "Mom's Match Rec 🍵",
      image: "/images/gion.jpg",
      tag: "Day 2 · Sightseeing",
      tagColor: "orange",
      day: 2,
      width: 220,
    };
  } else if (item.id === "i7") {
    newCard = {
      id: newCardId,
      type: "article",
      x: targetX,
      y: targetY,
      rotation,
      title: "Mizai Restaurant",
      subtitle: "Michelin 3★ Kaiseki near Maruyama Park",
      tag: "Day 4 · Fine Dining",
      tagColor: "rose",
      day: 4,
      details: ["Tasting menu only", "Pre-payment required", "Rated 4.9 on Eater"],
      width: 250,
    };
  } else {
    newCard = {
      id: newCardId,
      type: "sticky",
      x: targetX,
      y: targetY,
      rotation,
      title: item.source || "AI Parsed Clip",
      subtitle: item.content,
      color: item.type === "whatsapp" ? "#fce7f3" : "#d1fae5",
      day: associatedDay,
      width: 200,
    };
  }

  newCard = {
    ...newCard,
    promotedFromInboxId: item.id,
  };

  const siblingCard = cards.find((card) => card.day === associatedDay && card.id !== newCardId);
  const connection = siblingCard
    ? { from: siblingCard.id, to: newCardId, label: "dynamic-link" }
    : undefined;

  return { processedItem, newCard, connection };
}

export function buildManualCanvasCard({
  cardData,
  coords = { x: 450, y: 250 },
  now = Date.now,
  random = Math.random,
}: {
  cardData: Omit<CanvasCard, "id" | "x" | "y" | "rotation">;
  coords?: { x: number; y: number };
  now?: () => number;
  random?: () => number;
}): CanvasCard {
  return {
    id: `c_manual_${now()}`,
    x: coords.x,
    y: coords.y,
    rotation: random() * 4 - 2,
    ...cardData,
  };
}

export function buildCustomDay(days: DayGroup[], dayNum: number, labelText: string) {
  const color = dayColorPresets[dayNum % dayColorPresets.length];
  const newDay = { day: dayNum, label: `Day ${dayNum} — ${labelText}`, color };
  const isRight = days.length % 2 === 1;
  const newX = isRight ? 775 : 38;
  const newY = 46 + Math.floor(days.length / 2) * 260;
  const newLabel = {
    day: dayNum,
    x: newX,
    y: newY,
    color,
    bg: color + "12",
    border: color + "30",
  };

  return { newDay, newLabel };
}
