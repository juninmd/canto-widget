import { afterEach, expect, test } from "bun:test";
import { loadSnooze, saveSnooze } from "./snooze";

afterEach(() => localStorage.clear());

test("starts at 10 minutes and remembers the last choice", () => {
  expect(loadSnooze()).toBe(10);
  saveSnooze(5);
  expect(loadSnooze()).toBe(5);
});

test("a stored value that is not on offer falls back to 10", () => {
  localStorage.setItem("canto.snoozeMinutes", "7");
  expect(loadSnooze()).toBe(10);
  localStorage.setItem("canto.snoozeMinutes", "abc");
  expect(loadSnooze()).toBe(10);
});
