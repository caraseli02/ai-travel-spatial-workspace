// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useIsMobile } from "@/hooks/useIsMobile";

function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
}

describe("useIsMobile", () => {
  afterEach(() => {
    setInnerWidth(1024);
  });

  it("reports mobile when the viewport starts under the breakpoint", () => {
    setInnerWidth(390);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("reports desktop when the viewport starts at or above the breakpoint", () => {
    setInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("updates when the window is resized across the breakpoint", () => {
    setInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      setInnerWidth(500);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);
  });

  it("respects a custom breakpoint", () => {
    setInnerWidth(800);
    const { result } = renderHook(() => useIsMobile(900));
    expect(result.current).toBe(true);
  });
});
