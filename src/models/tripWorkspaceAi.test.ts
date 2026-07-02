import { describe, expect, it } from "vitest";
import { canvasCards, connections, createDemoTrip, dayGroups, inboxItems } from "@/data/tripData";
import { dayLabelConfig } from "@/models/trip";
import { applyAiPromptToTripWorkspace } from "@/models/tripWorkspaceAi";
import type { TripWorkspaceState } from "@/models/tripWorkspaceTypes";

const zeroRandom = () => 0.5;
const fixedNow = () => 1_774_200_000_000;

const createBaseWorkspaceState = (overrides: Partial<TripWorkspaceState> = {}): TripWorkspaceState => ({
  activeDay: null,
  days: [],
  dayLabels: [],
  cards: [],
  connections: [],
  items: [],
  selectedCard: null,
  isAiThinking: false,
  showCreateModal: false,
  createModalCoords: null,
  showAddDayModal: false,
  showOverflow: false,
  ...overrides,
});

describe("tripWorkspaceAi", () => {
  it("applies a grounded Day 5 planner reply without hardcoded card mutation", () => {
    const result = applyAiPromptToTripWorkspace({
      ...createBaseWorkspaceState({
        activeDay: null,
        days: dayGroups,
        dayLabels: dayLabelConfig,
        cards: canvasCards,
        connections,
        items: inboxItems,
      }),
      query: "Plan Day 5",
      trip: createDemoTrip(),
      now: fixedNow,
      random: zeroRandom,
    });

    expect(result.activeDay).toBe(5);
    expect(result.days).toEqual(dayGroups);
    expect(result.dayLabels).toEqual(dayLabelConfig);
    expect(result.cards.some((card) => card.id === "c15")).toBe(false);
    expect(result.cards.at(-1)).toMatchObject({
      id: "c_ai_response_1774200000000",
      type: "note",
      title: "AI Planner Reply",
      subtitle: "Day 5 already has Kikunoi Honten.",
      day: 5,
      details: ["Citations: Kikunoi Honten"],
    });
    expect(result.connections).toEqual(connections);
  });
});
