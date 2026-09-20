import { expect, test } from "bun:test";
import type { Task } from "./api";
import { reminderKey, toEvent, dayOfWeek, dueReminders, TASK_PREFIX } from "./reminders";

const t = (extra: Partial<Task>): Task => ({ id: "t1", title: "remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30", ...extra });
const as = (h: number, m: number, s = 0) => new Date(2026, 8, 14, h, m, s);

test("fires at the set minute and up to 2 min after, never before", () => {
  expect(dueReminders([t({})], new Set(), as(8, 29, 59))).toHaveLength(0);
  expect(dueReminders([t({})], new Set(), as(8, 30))).toHaveLength(1);
  expect(dueReminders([t({})], new Set(), as(8, 31, 30))).toHaveLength(1);
  expect(dueReminders([t({})], new Set(), as(8, 32))).toHaveLength(0);
});

test("done, without a time, or already notified does not fire again", () => {
  const notified = new Set([reminderKey(t({ id: "x" }))]);
  const list = [t({ done: true }), t({ id: "sem", hora: null }), t({ id: "x" })];
  expect(dueReminders(list, notified, as(8, 30))).toHaveLength(0);
});

test("leadMinutes fires the reminder that many minutes earlier", () => {
  expect(dueReminders([t({})], new Set(), as(8, 19, 59), 10)).toHaveLength(0);
  expect(dueReminders([t({})], new Set(), as(8, 20), 10)).toHaveLength(1);
  expect(dueReminders([t({})], new Set(), as(8, 22), 10)).toHaveLength(0);
});

test("rescheduling the time produces a new reminder", () => {
  const notified = new Set([reminderKey(t({}))]);
  expect(dueReminders([t({ hora: "09:00" })], notified, as(9, 0))).toHaveLength(1);
});

test("becomes an overlay event tagged as a task, at the local time", () => {
  const e = toEvent(t({}));
  expect(e.id).toBe(TASK_PREFIX + "t1");
  expect(new Date(e.start).getHours()).toBe(8);
  expect(e.meet).toBe("");
});

test("day of week matches Rust's (0 = Sunday)", () => {
  expect(dayOfWeek("2026-09-13")).toBe(0);
  expect(dayOfWeek("2026-09-14")).toBe(1);
});
