import { describe, expect, it } from "vitest";
import { buildInboxItem } from "@/models/tripWorkspaceInbox";

const fixedNow = () => 1_774_200_000_000;

describe("tripWorkspaceInbox", () => {
  it("classifies pasted Trip Material into typed Inbox Items", () => {
    expect(buildInboxItem("ANA flight SFO-KIX JL69", fixedNow)).toMatchObject({
      id: "i_spawn_1774200000000",
      type: "flight",
      source: "Flight Parser",
      content: "ANA flight SFO-KIX JL69",
      timestamp: "Just now",
      processed: false,
    });

    expect(buildInboxItem("Mom says: buy matcha kit-kats", fixedNow)).toMatchObject({
      type: "whatsapp",
      source: "WhatsApp Sync",
      avatar: "💬",
    });
  });
});
