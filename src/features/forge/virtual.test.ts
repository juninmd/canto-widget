import { expect, test } from "bun:test";
import { offsetsOf, rowAt, scrollToRow, windowRange } from "./virtual";

const offsets = offsetsOf([30, 50, 50, 30, 50]); // 0 30 80 130 160 210

test("offsets are cumulative and the last one is the total height", () => {
  expect(offsets).toEqual([0, 30, 80, 130, 160, 210]);
  expect(offsetsOf([])).toEqual([0]);
});

test("a pixel belongs to the row that covers it, and past the end to the last row", () => {
  expect([0, 29, 30, 79, 80, 209, 500].map((y) => rowAt(offsets, y))).toEqual([0, 0, 1, 1, 2, 4, 4]);
});

test("the window holds the rows in view plus the overscan, clamped to the list", () => {
  expect(windowRange(offsets, 0, 60, 0)).toEqual([0, 2]);
  expect(windowRange(offsets, 85, 40, 1)).toEqual([1, 4]);
  expect(windowRange(offsets, 1000, 100, 2)).toEqual([2, 5]);
  expect(windowRange([0], 0, 100, 3)).toEqual([0, 0]);
});

test("5,000 groups and 5,000 repositories render a few dozen rows, not ten thousand", () => {
  const big = offsetsOf(Array.from({ length: 10_000 }, (_, i) => (i % 2 ? 66 : 30)));
  const [start, end] = windowRange(big, 240_000, 480, 6);
  expect(end - start).toBeLessThan(30);
  expect(big[start]).toBeLessThanOrEqual(240_000);
});

test("scrolling to a row moves only as far as needed", () => {
  expect(scrollToRow(offsets, 1, 0, 200)).toBe(0);
  expect(scrollToRow(offsets, 4, 0, 100)).toBe(110);
  expect(scrollToRow(offsets, 0, 50, 100)).toBe(0);
});
