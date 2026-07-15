import { describe, expect, it } from "vitest";
import {
  buildInboxItem,
  extractSourceDomain,
  formatInboxCaptureTime,
  formatInboxItemCaptureTime,
  isTripMaterialCaptureInput,
  resolveInboxItemLabel,
  shouldCaptureViaPromptBar,
} from "@/models/tripWorkspaceInbox";

const fixedNow = () => 1_774_200_000_000;
const fixedIso = new Date(fixedNow()).toISOString();

describe("tripWorkspaceInbox", () => {
  it("captures URL Trip Material with preserved sourceUrl and domain fallback label", () => {
    const url = "https://example.com/opaque-path-xyz123";
    expect(buildInboxItem(url, fixedNow)).toMatchObject({
      id: "i_spawn_1774200000000",
      type: "link",
      source: "example.com",
      content: url,
      rawContent: url,
      sourceUrl: url,
      capturedAt: fixedIso,
      processed: false,
    });
  });

  it("uses traveler text as the label when provided with a URL", () => {
    const content = "https://example.com/ryokan Hidden ryokan near Gion";
    expect(buildInboxItem(content, fixedNow)).toMatchObject({
      type: "link",
      source: "Hidden ryokan near Gion",
      rawContent: content,
      sourceUrl: "https://example.com/ryokan",
    });
  });

  it("captures text-only Trip Material without a sourceUrl", () => {
    expect(buildInboxItem("Try Junsei near Nanzenji! — Yuki", fixedNow)).toMatchObject({
      type: "note",
      source: "Try Junsei near Nanzenji! — Yuki",
      rawContent: "Try Junsei near Nanzenji! — Yuki",
      sourceUrl: undefined,
      capturedAt: fixedIso,
    });
  });

  it("formats capture time for display after reload", () => {
    const item = buildInboxItem("https://example.com/guide", fixedNow);
    expect(formatInboxItemCaptureTime(item, fixedNow())).toBe("Just now");
    expect(formatInboxCaptureTime(fixedIso, fixedNow() + 5 * 60_000)).toBe("5 min ago");
    expect(formatInboxCaptureTime(fixedIso, fixedNow() + 2 * 3_600_000)).toMatch(/^Today at /);
    expect(formatInboxCaptureTime("2026-01-01T12:00:00.000Z", fixedNow())).toMatch(/Jan/);
    expect(formatInboxItemCaptureTime({ ...item, capturedAt: undefined })).toBe(item.timestamp);
  });

  it("truncates long traveler labels and handles invalid domains", () => {
    const longNote = `${"A".repeat(80)} near Gion`;
    expect(resolveInboxItemLabel(longNote).endsWith("...")).toBe(true);
    expect(extractSourceDomain("not-a-valid-url")).toBe("not-a-valid-url");
  });

  describe("isTripMaterialCaptureInput", () => {
    it("treats URLs and plain notes as capture input", () => {
      expect(isTripMaterialCaptureInput("https://example.com/opaque-path")).toBe(true);
      expect(isTripMaterialCaptureInput("Try Junsei near Nanzenji! — Yuki")).toBe(true);
      expect(isTripMaterialCaptureInput("Book a tea ceremony in Gion")).toBe(true);
    });

    it("treats questions and AI planning prompts as non-capture input", () => {
      expect(isTripMaterialCaptureInput("Find a restaurant near Gion")).toBe(false);
      expect(isTripMaterialCaptureInput("Plan Day 8")).toBe(false);
      expect(isTripMaterialCaptureInput("Hiiragiya Ryokan availability?")).toBe(false);
    });
  });

  describe("shouldCaptureViaPromptBar", () => {
    it("captures on desktop only when input looks like Trip Material", () => {
      expect(shouldCaptureViaPromptBar("https://example.com/guide", false)).toBe(true);
      expect(shouldCaptureViaPromptBar("Find a restaurant near Gion", false)).toBe(false);
      expect(shouldCaptureViaPromptBar("https://example.com/guide", true)).toBe(false);
    });
  });
});
