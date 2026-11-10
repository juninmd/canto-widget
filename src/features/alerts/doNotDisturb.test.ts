import { expect, test } from "bun:test";
import { dndEndLabel, dndUntil, TOMORROW_HOUR } from "./doNotDisturb";

const now = new Date(2026, 8, 27, 14, 5, 30);

test("timed choices count from now", () => {
  expect(dndUntil("30m", now)).toBe(now.getTime() + 30 * 60_000);
  expect(dndUntil("1h", now)).toBe(now.getTime() + 60 * 60_000);
  expect(dndUntil("2h", now)).toBe(now.getTime() + 120 * 60_000);
});

test("until tomorrow ends at the start of the next local day's work", () => {
  expect(new Date(dndUntil("tomorrow", now)!)).toEqual(new Date(2026, 8, 28, TOMORROW_HOUR, 0, 0, 0));
  const lateNight = new Date(2026, 8, 30, 23, 50);
  expect(new Date(dndUntil("tomorrow", lateNight)!)).toEqual(new Date(2026, 9, 1, TOMORROW_HOUR));
});

test("until turned off has no end", () => {
  expect(dndUntil("off", now)).toBeNull();
});

test("the end reads as a time today and adds the weekday otherwise", () => {
  expect(dndEndLabel(new Date(2026, 8, 27, 16, 30).getTime(), now)).toBe("16:30");
  expect(dndEndLabel(new Date(2026, 8, 28, 8, 0).getTime(), now)).toMatch(/^seg\.? 08:00$/);
});
