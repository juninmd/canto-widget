import { expect, test } from "bun:test";
import { localOffsetMin, minutesToTime, summaryText, timeToMinutes } from "./focusMode";

test("the offset is minutes east of UTC", () => {
  const d = { getTimezoneOffset: () => 180 } as Date; // UTC-3
  expect(localOffsetMin(d)).toBe(-180);
});

test("times round-trip and bad input is refused", () => {
  expect(minutesToTime(9 * 60 + 5)).toBe("09:05");
  expect(timeToMinutes("22:30")).toBe(22 * 60 + 30);
  expect(timeToMinutes("")).toBeNull();
  expect(timeToMinutes("24:00")).toBeNull();
  expect(timeToMinutes("9:00")).toBeNull();
});

test("the summary names the count and the first titles", () => {
  const held = ["a", "b", "c", "d", "e"].map((title, at) => ({ title, at }));
  const text = summaryText(held);
  expect(text).toContain("5");
  expect(text).toContain("a, b, c +2");
});
