// @vitest-environment happy-dom
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  clearAiPromptPending,
  consumeAbandonedAiPrompt,
  markAiPromptPending,
} from "@/models/aiPromptPending";

describe("aiPromptPending", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("marks and clears a pending AI prompt for a trip", () => {
    markAiPromptPending("trip-1", "Plan day 3");
    expect(sessionStorage.getItem("wayfarer_ai_pending_trip-1")).toContain("Plan day 3");

    clearAiPromptPending("trip-1");
    expect(sessionStorage.getItem("wayfarer_ai_pending_trip-1")).toBeNull();
  });

  it("consumes an abandoned prompt after reload", () => {
    markAiPromptPending("trip-2", "Find ramen");

    expect(consumeAbandonedAiPrompt("trip-2")).toBe(true);
    expect(consumeAbandonedAiPrompt("trip-2")).toBe(false);
  });
});
