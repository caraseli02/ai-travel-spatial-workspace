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

    expect(result.nextState.activeDay).toBe(5);
    expect(result.nextState.days).toEqual(dayGroups);
    expect(result.nextState.dayLabels).toEqual(dayLabelConfig);
    expect(result.nextState.cards.some((card) => card.id === "c15")).toBe(false);
    expect(result.nextState.cards.at(-1)).toMatchObject({
      id: "c_ai_response_1774200000000",
      type: "note",
      title: "AI Planner Reply",
      subtitle: "Day 5 already has Kikunoi Honten.",
      day: 5,
      details: ["Citations: Kikunoi Honten"],
    });
    expect(result.nextState.connections).toEqual(connections);
    expect(result.effects).toEqual([
      {
        kind: "canvas-reply",
        cardId: "c_ai_response_1774200000000",
        cardTitle: "AI Planner Reply",
      },
    ]);
  });

  it("returns an Inbox draft effect separately from the next workspace state", () => {
    const result = applyAiPromptToTripWorkspace({
      ...createBaseWorkspaceState({
        days: dayGroups,
        dayLabels: dayLabelConfig,
        cards: canvasCards,
        connections,
        items: inboxItems,
      }),
      query: "Find a restaurant near Gion",
      trip: createDemoTrip(),
      now: fixedNow,
      random: zeroRandom,
    });

    expect(result.nextState.items[0]).toMatchObject({
      id: "i_ai_card_draft_1774200000000",
      source: "AI Planner Draft",
      content: expect.stringContaining("Draft Canvas Card: Gion Sasaki"),
    });
    expect(result.effects).toEqual([
      {
        kind: "inbox-draft",
        itemId: "i_ai_card_draft_1774200000000",
        draftLabel: "Gion Sasaki",
      },
    ]);
  });
});
