import { describe, expect, it } from "vitest";
import { resolveAiPromptOutcome } from "./resolveAiPromptOutcome";

describe("resolveAiPromptOutcome", () => {
  it("detects a new AI Planner draft Inbox Item", () => {
    expect(
      resolveAiPromptOutcome({
        previousItemIds: new Set(["i1"]),
        previousCardIds: new Set(["c1"]),
        items: [
          {
            id: "i_ai_card_draft_1",
            type: "link",
            source: "AI Planner Draft",
            content: "Draft Canvas Card: Gion Sasaki",
            timestamp: "Just now",
            processed: false,
          },
          {
            id: "i1",
            type: "note",
            source: "Manual",
            content: "Existing item",
            timestamp: "Earlier",
            processed: false,
          },
        ],
        cards: [{ id: "c1", title: "Existing card" }],
      }),
    ).toEqual({
      kind: "inbox-draft",
      draftLabel: "Gion Sasaki",
    });
  });

  it("detects a new AI reply Canvas Card", () => {
    expect(
      resolveAiPromptOutcome({
        previousItemIds: new Set(["i1"]),
        previousCardIds: new Set(["c1"]),
        items: [
          {
            id: "i1",
            type: "note",
            source: "Manual",
            content: "Existing item",
            timestamp: "Earlier",
            processed: false,
          },
        ],
        cards: [
          { id: "c1", title: "Existing card" },
          { id: "c_ai_response_2", title: "AI Planner Reply" },
        ],
      }),
    ).toEqual({
      kind: "canvas-reply",
      cardTitle: "AI Planner Reply",
    });
  });
});
