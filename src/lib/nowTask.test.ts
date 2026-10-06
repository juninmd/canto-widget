import { expect, test } from "bun:test";
import { pickNow } from "./nowTask";
import type { Task } from "./api";

const task = (id: string, done = false): Task => ({ id, title: id, done, day: "2026-09-09", created_at: 1, updated_at: 1 });

test("picks the running task over the first open one", () => {
  expect(pickNow([task("a"), task("b")], "b")?.id).toBe("b");
});

test("falls back to the first open task, skipping done ones", () => {
  expect(pickNow([task("a", true), task("b")], null)?.id).toBe("b");
  expect(pickNow([task("a", true), task("b")], "a")?.id).toBe("b");
});

test("returns null when everything is done", () => {
  expect(pickNow([task("a", true)], null)).toBeNull();
});
