import { expect, test } from "bun:test";
import type { ForgeItem } from "./api";
import { activeSnoozes, oldestFirst, overdue, SLA_HOURS, snoozeUntil, waitHours, waitLabel } from "./reviewRadar";

const NOW = new Date("2026-09-18T12:00:00Z");
const at = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3_600_000).toISOString();
const item = (hoursAgo: number): ForgeItem => ({ created_at: at(hoursAgo), url: `u${hoursAgo}` }) as ForgeItem;

test("a request becomes overdue exactly at the 48 h SLA", () => {
  expect(overdue(waitHours(item(SLA_HOURS - 1), NOW))).toBe(false);
  expect(overdue(waitHours(item(SLA_HOURS), NOW))).toBe(true);
});

test("labels show hours under two days and whole days after", () => {
  expect(waitLabel(0)).toBe("menos de 1 h");
  expect(waitLabel(20)).toBe("20 h");
  expect(waitLabel(52)).toBe("2 d");
});

test("the oldest request comes first, without mutating the input", () => {
  const list = [item(3), item(52), item(20)];
  expect(oldestFirst(list).map((i) => i.url)).toEqual(["u52", "u20", "u3"]);
  expect(list[0].url).toBe("u3");
});

test("a bad or future created_at never yields NaN or negative hours", () => {
  expect(waitHours({ created_at: "nope" } as ForgeItem, NOW)).toBe(0);
  expect(waitHours(item(-5), NOW)).toBe(0);
});

test("expired snoozes are dropped and corrupt storage is ignored", () => {
  const raw = JSON.stringify({ a: NOW.getTime() + 1000, b: NOW.getTime() - 1, c: "x" });
  expect(activeSnoozes(raw, NOW.getTime())).toEqual({ a: NOW.getTime() + 1000 });
  expect(activeSnoozes("{oops", 0)).toEqual({});
  expect(activeSnoozes("[1]", 0)).toEqual({});
  expect(activeSnoozes(null, 0)).toEqual({});
});

test("snoozing merges into stored snoozes instead of overwriting them", () => {
  localStorage.clear();
  snoozeUntil("a", NOW.getTime());
  snoozeUntil("b", NOW.getTime());
  expect(Object.keys(activeSnoozes(localStorage.getItem("canto.reviewSnooze"), NOW.getTime())).sort()).toEqual(["a", "b"]);
});
