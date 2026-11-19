import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useCopied } from "./useCopied";

describe("useCopied", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("flashes the copied id and clears it after the display window", () => {
    const { result } = renderHook(() => useCopied());
    expect(result.current[0]).toBe("");
    act(() => result.current[1]("a"));
    expect(result.current[0]).toBe("a");
    act(() => void jest.advanceTimersByTime(1200));
    expect(result.current[0]).toBe("");
  });

  test("a second copy restarts the timer instead of clearing early", () => {
    const { result } = renderHook(() => useCopied());
    act(() => result.current[1]("a"));
    act(() => void jest.advanceTimersByTime(1000));
    act(() => result.current[1]("b"));
    act(() => void jest.advanceTimersByTime(1000));
    expect(result.current[0]).toBe("b");
    act(() => void jest.advanceTimersByTime(200));
    expect(result.current[0]).toBe("");
  });

  test("unmounting cancels the pending timer", () => {
    const { result, unmount } = renderHook(() => useCopied());
    act(() => result.current[1]("a"));
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
