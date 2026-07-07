import { describe, expect, it } from "vitest";
import {
  buildAiPlannerInboxDraftFeedback,
  buildAiCanvasReplyFeedback,
  buildExportFeedback,
  buildOrganizedInboxItemFeedback,
  buildShareFeedback,
} from "./workspaceFeedbackMessages";

describe("workspaceFeedbackMessages", () => {
  it("identifies the resulting Canvas Card when an Inbox Item is organized", () => {
    expect(
      buildOrganizedInboxItemFeedback({
        source: "Reddit r/JapanTravel",
        cardTitle: "Hidden Temples",
        day: 2,
      }),
    ).toEqual({
      tone: "success",
      title: "Placed on canvas",
      message: 'Reddit r/JapanTravel became "Hidden Temples" on Day 2.',
    });
  });

  it("guides the traveler to review an AI Planner draft in the Inbox", () => {
    expect(
      buildAiPlannerInboxDraftFeedback({
        draftLabel: "Gion Sasaki",
      }),
    ).toEqual({
      tone: "success",
      title: "AI draft saved to Inbox",
      message: 'Review "Gion Sasaki" in the Inbox before placing it on the Spatial Canvas.',
    });
  });

  it("guides the traveler to an AI reply Canvas Card on the Spatial Canvas", () => {
    expect(
      buildAiCanvasReplyFeedback({
        cardTitle: "AI Planner Reply",
      }),
    ).toEqual({
      tone: "success",
      title: "AI reply added",
      message: 'Opened "AI Planner Reply" on the Spatial Canvas.',
    });
  });

  it("returns in-app share and export success/failure copy", () => {
    expect(buildShareFeedback("clipboard-copied")).toMatchObject({
      tone: "success",
      title: "Trip link copied",
    });
    expect(buildShareFeedback("copy-failed", "https://example.com/trip")).toMatchObject({
      tone: "error",
      title: "Could not copy link automatically",
      copyUrl: "https://example.com/trip",
    });
    expect(buildExportFeedback("download-started", "demo-kyoto.json")).toMatchObject({
      tone: "success",
      message: "Started download for demo-kyoto.json.",
    });
    expect(buildExportFeedback("download-failed", "demo-kyoto.json")).toMatchObject({
      tone: "error",
      title: "Could not export trip",
    });
  });
});
