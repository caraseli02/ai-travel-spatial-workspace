import { describe, expect, it } from "vitest";
import { tripWorkspaceReducer, type TripWorkspaceState } from "@/models/tripWorkspaceReducer";

const createInitialState = (): TripWorkspaceState => ({
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
});

describe("tripWorkspaceReducer", () => {
  it("adds parsed Trip Material to the Inbox via ADD_INBOX_ITEM", () => {
    const state = createInitialState();
    const nextState = tripWorkspaceReducer(state, {
      type: "ADD_INBOX_ITEM",
      content: "ANA flight SFO-KIX",
    });

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]).toMatchObject({
      type: "note",
      content: "ANA flight SFO-KIX",
      rawContent: "ANA flight SFO-KIX",
      processed: false,
    });
  });
});
