import { describe, expect, it } from "vitest";
import {
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

  it("returns in-app share and export success/failure copy", () => {
    expect(buildShareFeedback("clipboard-copied")).toMatchObject({
      tone: "success",
      title: "Trip link copied",
    });
    expect(buildShareFeedback("copy-failed")).toMatchObject({
      tone: "error",
      title: "Could not copy link",
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
