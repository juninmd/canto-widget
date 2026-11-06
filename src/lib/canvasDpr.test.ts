import { expect, test } from "bun:test";
import { canvasDpr } from "./canvasDpr";

test("keeps a normal display scale", () => {
  expect(canvasDpr(1)).toBe(1);
  expect(canvasDpr(1.5)).toBe(1.5);
  expect(canvasDpr(2)).toBe(2);
});

test("caps retina and 4K scaling at 2x to save backing-store pixels", () => {
  expect(canvasDpr(3)).toBe(2);
  expect(canvasDpr(4)).toBe(2);
});

test("falls back to 1 when the platform reports nothing usable", () => {
  expect(canvasDpr(0)).toBe(1);
  expect(canvasDpr(-2)).toBe(1);
  expect(canvasDpr(Number.NaN)).toBe(1);
  expect(canvasDpr(Number.POSITIVE_INFINITY)).toBe(1);
});
