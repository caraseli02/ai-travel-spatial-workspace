// @vitest-environment happy-dom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingToast from "@/components/OnboardingToast";
import * as preferences from "@/models/preferences";

describe("OnboardingToast", () => {
  beforeEach(() => {
    vi.spyOn(preferences, "getOnboardingCompleted").mockReturnValue(true);
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shows tips when forceShow is true even if onboarding was completed", async () => {
    render(<OnboardingToast forceShow />);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByLabelText(/close onboarding tips/i)).toBeTruthy();
  });

  it("stays hidden when onboarding was completed and forceShow is false", async () => {
    render(<OnboardingToast />);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.queryByLabelText(/close onboarding tips/i)).toBeNull();
  });
});
