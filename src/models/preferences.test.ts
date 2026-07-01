import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOnboardingCompleted,
  setOnboardingCompleted,
} from "@/models/preferences";

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
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("preferences accessors", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("reads onboarding completion from storage and defaults to false", () => {
    expect(getOnboardingCompleted()).toBe(false);

    store.wayfarer_onboarding_completed = "true";

    expect(getOnboardingCompleted()).toBe(true);
  });

  it("writes onboarding completion to storage", () => {
    setOnboardingCompleted(true);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "wayfarer_onboarding_completed",
      "true",
    );
    expect(getOnboardingCompleted()).toBe(true);
  });

  it("falls back safely when storage reads fail", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error("storage unavailable");
    });

    expect(getOnboardingCompleted()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to get item "wayfarer_onboarding_completed" from localStorage:',
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });

  it("does not throw when storage writes fail", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("storage unavailable");
    });

    expect(() => setOnboardingCompleted(false)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to set item "wayfarer_onboarding_completed" in localStorage:',
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });
});
