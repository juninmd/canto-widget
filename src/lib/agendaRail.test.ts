import { expect, test } from "bun:test";
import type { AgendaItem, Task } from "./api";
import { dayStats, fitInGap, freeGaps, heroOf, railEntries, ribbon } from "./agendaRail";
import { dayBlocks } from "./dayPlan";

const at = (h: number, m = 0) => new Date(2026, 8, 30, h, m).toISOString();
const ev = (id: string, s: [number, number], e: [number, number], extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id, title: id, start: at(...s), end: at(...e), all_day: false, location: "", meet: "", link: "", ...extra,
});
const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, title: id, done: false, day: "2026-09-30", created_at: 1, updated_at: 1, ...extra });
const now = (h: number, m = 0) => new Date(2026, 8, 30, h, m);

test("gaps run around events and timed tasks, skipping the ones shorter than 15 minutes", () => {
  const blocks = dayBlocks([ev("a", [9, 0], [10, 0]), ev("b", [10, 10], [11, 0])], [task("t", { hora: "12:00", estimate_min: 60 })]);
  expect(freeGaps(blocks, 9 * 60, 14 * 60)).toEqual([
    { start: 11 * 60, end: 12 * 60 },
    { start: 13 * 60, end: 14 * 60 },
  ]);
});

test("the rail folds what is over and puts the free gaps among what is left", () => {
  const { past, upcoming } = railEntries([ev("a", [9, 0], [9, 30]), ev("b", [11, 0], [12, 0])], [], now(10, 0));
  expect(past.map((e) => e.id)).toEqual(["a"]);
  expect(upcoming.map((e) => `${e.kind}:${e.start}`)).toEqual(["gap:600", "event:660", "gap:720"]);
});

test("declined events show on the rail but take no time", () => {
  const items = [ev("a", [9, 0], [10, 0], { response: "declined" })];
  expect(railEntries(items, [], now(8, 0)).upcoming.map((e) => e.kind)).toEqual(["gap", "event"]);
  expect(dayStats(items, [], now(8, 0)).meetings).toBe(0);
});

test("the hero is the meeting in progress, else the next, else the day's summary", () => {
  const items = [ev("a", [9, 0], [10, 0]), ev("b", [11, 0], [11, 30])];
  expect(heroOf(items, now(9, 15))).toMatchObject({ kind: "now", left: 45, pct: 0.25 });
  expect(heroOf(items, now(10, 15))).toMatchObject({ kind: "next", minutes: 45 });
  expect(heroOf(items, now(12, 0))).toEqual({ kind: "done", count: 2, minutes: 90 });
  expect(heroOf([], now(9))).toBeNull();
});

test("meetings count once where they overlap, and each overlap is one conflict", () => {
  const s = dayStats([ev("a", [9, 0], [10, 0]), ev("b", [9, 30], [10, 30])], [], now(8, 0));
  expect(s).toMatchObject({ meetings: 90, events: 2, clashes: 1 });
  expect(s.free).toBe(19 * 60 - 8 * 60 - 90);
  expect(s.nextFree).toBe(8 * 60);
});

test("the ribbon covers the working hours and marks tentative and unanswered invites", () => {
  const r = ribbon([ev("a", [9, 0], [10, 0], { response: "tentative" }), ev("b", [11, 0], [12, 0], { response: "needsAction" })], [], now(8, 0));
  expect([r.from, r.to]).toEqual([8 * 60, 18 * 60]);
  expect(r.segments.filter((s) => s.kind === "event").map((s) => s.tone)).toEqual(["tentative", "pending"]);
  expect(r.segments.some((s) => s.kind === "gap")).toBe(true);
});

test("a task fits a gap only when its estimate does", () => {
  const blocks = dayBlocks([ev("a", [9, 0], [9, 40])], []);
  expect(fitInGap(blocks, task("t", { estimate_min: 30 }), { start: 9 * 60 + 40, end: 10 * 60 + 15 })).toBe(9 * 60 + 45);
  expect(fitInGap(blocks, task("t", { estimate_min: 30 }), { start: 9 * 60 + 40, end: 10 * 60 })).toBeNull();
});
