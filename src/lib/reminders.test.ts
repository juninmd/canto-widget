import { expect, test } from "bun:test";
import type { Task } from "./api";
import { toEvent, dayOfWeek, TASK_PREFIX } from "./reminders";

const t = (extra: Partial<Task>): Task => ({ id: "t1", title: "remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30", ...extra });

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
