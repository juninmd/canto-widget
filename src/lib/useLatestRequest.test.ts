import { afterEach, beforeEach, expect, jest, test } from "bun:test";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useLatestRequest } from "./useLatestRequest";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("only the most recently bumped id is still latest", () => {
  const { result } = renderHook(() => useLatestRequest());
  const first = result.current.bump();
  const second = result.current.bump();
  expect(result.current.isLatest(first)).toBe(false);
  expect(result.current.isLatest(second)).toBe(true);
});

test("a slow response that resolves after a faster, newer one is dropped", async () => {
  const { result } = renderHook(() => useLatestRequest());
  const applied: string[] = [];

  function load(label: string, delayMs: number) {
    const id = result.current.bump();
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (result.current.isLatest(id)) applied.push(label);
        resolve();
      }, delayMs);
    });
  }

  const pending = Promise.all([load("slow", 200), load("fast", 10)]);
  await act(async () => {
    jest.advanceTimersByTime(200);
  });
  await pending;

  expect(applied).toEqual(["fast"]);
});
