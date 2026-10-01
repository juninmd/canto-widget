import { expect, test } from "bun:test";
import type { AgendaItem, Task } from "./api";
import { dayBlocks, firstFreeSlot, hhmm, hourRange, taskStart, unscheduled } from "./dayPlan";

const at = (h: number, m = 0) => new Date(2026, 8, 30, h, m).toISOString();
const event = (id: string, s: string, e: string, extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id, title: id, start: s, end: e, all_day: false, location: "", meet: "", link: "", ...extra,
});
const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, title: id, done: false, day: "2026-09-30", created_at: 1, updated_at: 1, ...extra });

test("events and timed tasks become blocks in minutes, and a task takes its estimate or 30 minutes", () => {
  const blocks = dayBlocks([event("daily", at(9), at(9, 30))], [task("a", { hora: "10:00", estimate_min: 45 }), task("b", { hora: "14:00" })]);
  expect(blocks.map((b) => [b.id, b.kind, b.start, b.end])).toEqual([
    ["daily", "event", 540, 570],
    ["a", "task", 600, 645],
    ["b", "task", 840, 870],
  ]);
});

test("declined, all-day and finished items take no slot", () => {
  const blocks = dayBlocks(
    [event("no", at(9), at(10), { response: "declined" }), event("dia", at(0), at(23), { all_day: true })],
    [task("feita", { hora: "11:00", done: true }), task("semhora")],
  );
  expect(blocks).toEqual([]);
});

test("a task overlapping an event or another task is marked, back-to-back is not", () => {
  const blocks = dayBlocks(
    [event("reuniao", at(10), at(11))],
    [task("choca", { hora: "10:30", estimate_min: 30 }), task("depois", { hora: "11:00", estimate_min: 30 }), task("colado", { hora: "11:30", estimate_min: 15 })],
  );
  const clash = Object.fromEntries(blocks.map((b) => [b.id, b.clash]));
  expect(clash).toEqual({ reuniao: false, choca: true, depois: false, colado: false });
});

test("the grid covers the workday and widens for early or late blocks", () => {
  expect(hourRange([])).toEqual([8, 18]);
  const blocks = dayBlocks([event("cedo", at(6, 30), at(7)), event("tarde", at(19), at(21, 15))], []);
  expect(hourRange(blocks)).toEqual([6, 22]);
});

test("the first free slot skips blocks and rounds up to a quarter hour", () => {
  const blocks = dayBlocks([event("a", at(9), at(10)), event("b", at(10, 15), at(11))], []);
  expect(firstFreeSlot(blocks, 15, 9 * 60 + 5)).toBe(10 * 60);
  expect(firstFreeSlot(blocks, 30, 9 * 60)).toBe(11 * 60);
  expect(firstFreeSlot([], 60, 8 * 60 + 1)).toBe(8 * 60 + 15);
  expect(firstFreeSlot([], 60, 23 * 60 + 30)).toBeNull();
});

test("unscheduled tasks are the open ones without a time", () => {
  expect(unscheduled([task("a"), task("b", { hora: "09:00" }), task("c", { done: true })]).map((x) => x.id)).toEqual(["a"]);
});

test("time helpers round-trip", () => {
  expect(taskStart("09:05")).toBe(545);
  expect(taskStart("9:05")).toBeNull();
  expect(hhmm(545)).toBe("09:05");
});

test("overlapping blocks take side-by-side lanes; a block alone keeps the full width", () => {
  const blocks = dayBlocks(
    [event("a", at(9), at(10)), event("b", at(9, 30), at(10, 30)), event("sozinha", at(12), at(13))],
    [task("t", { hora: "09:45", estimate_min: 15 })],
  );
  const by = Object.fromEntries(blocks.map((b) => [b.id, [b.lane, b.lanes]]));
  expect(by.a).toEqual([0, 3]);
  expect(by.b).toEqual([1, 3]);
  expect(by.t).toEqual([2, 3]);
  expect(by.sozinha).toEqual([0, 1]);
});

test("a freed lane is reused, and a chain of overlaps shares one cluster", () => {
  const blocks = dayBlocks([event("a", at(9), at(10)), event("b", at(9, 30), at(11)), event("c", at(10), at(10, 30))], []);
  const by = Object.fromEntries(blocks.map((b) => [b.id, [b.lane, b.lanes]]));
  // c starts when a ends, so it takes a's lane instead of opening a third one.
  expect(by).toEqual({ a: [0, 2], b: [1, 2], c: [0, 2] });
});

test("back-to-back blocks do not share a lane cluster", () => {
  const blocks = dayBlocks([event("a", at(9), at(10)), event("b", at(10), at(11))], []);
  expect(blocks.map((b) => [b.lane, b.lanes])).toEqual([[0, 1], [0, 1]]);
});
