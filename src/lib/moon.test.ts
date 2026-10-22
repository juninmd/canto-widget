import { expect, test } from "bun:test";
import { moon, moonPath } from "./moon";

test("a known full moon and a known new moon read as such", () => {
  // 2024-01-25 17:54 UTC was a full moon; 2024-02-09 22:59 UTC a new one.
  const full = moon(Date.UTC(2024, 0, 25, 18));
  expect(full.phase).toBe("full");
  expect(full.lit).toBeGreaterThan(0.99);
  const dark = moon(Date.UTC(2024, 1, 9, 23));
  expect(dark.phase).toBe("new");
  expect(dark.lit).toBeLessThan(0.01);
});

test("a few days after the new moon it is a waxing crescent with the full moon ahead", () => {
  const m = moon(Date.UTC(2024, 1, 13, 12));
  expect(m.phase).toBe("waxingCrescent");
  expect(m.waxing).toBe(true);
  expect(m.toFull).toBe(11);
});

test("the waxing crescent is lit on the left from the south and on the right from the north", () => {
  const crescent = { phase: "waxingCrescent" as const, lit: 0.25, waxing: true, toFull: 10 };
  // The outer arc runs through the left side (sweep 0) from the south and through the right side (sweep 1) from the north.
  expect(moonPath(crescent, true, 22, 18)).toStartWith("M22 4 A18 18 0 0 0 22 40");
  expect(moonPath(crescent, false, 22, 18)).toStartWith("M22 4 A18 18 0 0 1 22 40");
  expect(moonPath(crescent, true, 22, 18)).toContain("A9.00 18 0 0 1 22 4Z");
});
