import { expect, test } from "bun:test";
import { nextFocus } from "./stripKeys";

test("arrows walk the details and wrap at both ends", () => {
  expect(nextFocus("ArrowDown", -1, 5)).toBe(0);
  expect(nextFocus("ArrowDown", 4, 5)).toBe(0);
  expect(nextFocus("ArrowUp", 0, 5)).toBe(4);
  expect(nextFocus("ArrowUp", -1, 5)).toBe(4);
  expect(nextFocus("Home", 3, 5)).toBe(0);
  expect(nextFocus("End", 1, 5)).toBe(4);
});

test("other keys, and an empty list, are left alone", () => {
  expect(nextFocus("a", 0, 5)).toBeNull();
  expect(nextFocus("ArrowDown", 0, 0)).toBeNull();
});
