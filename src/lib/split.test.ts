import { expect, test } from "bun:test";
import { clampLeft, keyLeft, LEFT_DEFAULT, LEFT_MIN, maxLeft, RIGHT_MIN } from "./split";

test("the list keeps its minimum and leaves the other column its own", () => {
  expect(clampLeft(100, 1280)).toBe(LEFT_MIN);
  expect(clampLeft(5000, 1280)).toBe(1280 - RIGHT_MIN);
  expect(clampLeft(500, 1280)).toBe(500);
});

test("a window too narrow for both minimums still gives the list its minimum", () => {
  expect(maxLeft(500)).toBe(LEFT_MIN);
  expect(clampLeft(450, 500)).toBe(LEFT_MIN);
});

test("garbage restores the default instead of breaking the layout", () => {
  expect(clampLeft(Number.NaN, 1280)).toBe(LEFT_DEFAULT);
});

test("arrows move by 16, Shift by 64, and stay inside the limits", () => {
  expect(keyLeft("ArrowRight", 416, 1280)).toBe(432);
  expect(keyLeft("ArrowLeft", 416, 1280)).toBe(400);
  expect(keyLeft("ArrowRight", 416, 1280, true)).toBe(480);
  expect(keyLeft("ArrowLeft", LEFT_MIN, 1280)).toBe(LEFT_MIN);
  expect(keyLeft("ArrowRight", maxLeft(1280), 1280)).toBe(maxLeft(1280));
});

test("Home, End and Enter jump to the limits and the default; other keys are not ours", () => {
  expect(keyLeft("Home", 500, 1280)).toBe(LEFT_MIN);
  expect(keyLeft("End", 500, 1280)).toBe(maxLeft(1280));
  expect(keyLeft("Enter", 700, 1280)).toBe(LEFT_DEFAULT);
  expect(keyLeft("a", 500, 1280)).toBeNull();
});
