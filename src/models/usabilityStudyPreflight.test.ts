import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDemoTrip } from "@/data/tripData";
import { localTripRepository } from "@/models/tripRepository";
import { buildInboxItem } from "@/models/tripWorkspaceInbox";

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach((key) => delete store[key]);
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((_index: number) => null),
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

/** Stimuli from docs/product/trip-material-capture-return-usability-study.md */
const STUDY_STIMULI = [
  {
    id: "P1",
    content: "https://www.hiiragiya.co.jp/en/ — checking ryokan availability for Dec 14",
    expectSourceUrl: "https://www.hiiragiya.co.jp/en/",
  },
  {
    id: "P2",
    content:
      "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTEyLTE0agcIARIDS0lYcgcIARIDU0ZPGAI",
    expectSourceUrl:
      "https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI1LTEyLTE0agcIARIDS0lYcgcIARIDU0ZPGAI",
  },
  {
    id: "P3",
    content: "https://example.com/opaque-path-xyz123",
    expectSourceUrl: "https://example.com/opaque-path-xyz123",
  },
  {
    id: "P4",
    content: "Mom says: buy matcha kit-kats at Nishiki Market before Dec 20",
    expectSourceUrl: undefined,
  },
  {
    id: "P5",
    content: "ANA JL69 SFO→KIX Dec 14 11:20am — confirmation AB12CD",
    expectSourceUrl: undefined,
  },
] as const;

function clearStore() {
  Object.keys(store).forEach((key) => delete store[key]);
}

describe("usability study preflight (#139)", () => {
  beforeEach(() => {
    clearStore();
    vi.clearAllMocks();
  });

  it.each(STUDY_STIMULI)(
    "stimulus $id survives Trip Repository save/load unchanged",
    ({ content, expectSourceUrl }) => {
      const trip = createDemoTrip();
      trip.inboxItems = [buildInboxItem(content, () => 1_700_000_000_000)];

      localTripRepository.save(trip);
      const loaded = localTripRepository.load(trip.id);
      const loadedItem = loaded?.inboxItems[0];

      expect(loadedItem?.rawContent).toBe(content);
      expect(loadedItem?.content).toBe(content);
      expect(loadedItem?.sourceUrl).toBe(expectSourceUrl);
    },
  );
});
