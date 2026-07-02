import { describe, expect, it } from "vitest";
import { canvasCards, inboxItems } from "@/data/tripData";
import { dayLabelConfig } from "@/models/trip";
import {
  buildProcessedCanvasCard,
  getCardCenter,
} from "@/models/tripWorkspaceCanvas";

const zeroRandom = () => 0.5;
const fixedNow = () => 1_774_200_000_000;

describe("tripWorkspaceCanvas", () => {
  it("places a processed Inbox Item onto the Spatial Canvas near its day label", () => {
    const result = buildProcessedCanvasCard({
      item: inboxItems.find((item) => item.id === "i7")!,
      activeDay: null,
      dayLabels: dayLabelConfig,
      cards: canvasCards,
      now: fixedNow,
      random: zeroRandom,
    });

    expect(result.processedItem.processed).toBe(true);
    expect(result.processedItem.resultingCardId).toBe("c_spawn_1774200000000");
    expect(result.newCard).toMatchObject({
      id: "c_spawn_1774200000000",
      type: "article",
      promotedFromInboxId: "i7",
      x: 218,
      y: 285,
      rotation: 0,
      title: "Mizai Restaurant",
      subtitle: "Michelin 3★ Kaiseki near Maruyama Park",
      tag: "Day 4 · Fine Dining",
      tagColor: "rose",
      day: 4,
      width: 250,
    });
    expect(result.connection).toEqual({
      from: "c4",
      to: "c_spawn_1774200000000",
      label: "dynamic-link",
    });
  });

  it("computes connection endpoints from Canvas Card dimensions", () => {
    expect(getCardCenter({ ...canvasCards[0], width: 300 })).toEqual({ x: 180, y: 162 });
    expect(getCardCenter(canvasCards[4])).toEqual({ x: 372.5, y: 350 });
  });
});
