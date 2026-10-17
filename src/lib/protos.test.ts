import { expect, test } from "bun:test";
import { signedPercent, sparkline } from "./protos";

test("a sparkline spreads the points across the width and scales them between the smallest and largest", () => {
  const points = sparkline([1, 2, 3], 20, 10).split(" ");
  expect(points).toEqual(["0.0,10.0", "10.0,5.0", "20.0,0.0"]);
  expect(sparkline([], 20, 10)).toBe("");
  expect(sparkline([7], 20, 10)).toBe("0.0,5.0");
});

test("a flat series is centred instead of glued to the bottom", () => {
  expect(sparkline([4, 4, 4], 20, 10)).toBe("0.0,5.0 10.0,5.0 20.0,5.0");
});

test("the variation is signed and written in the user's locale", () => {
  expect(signedPercent(0.31)).toBe("+0,31");
  expect(signedPercent(-0.44)).toBe("-0,44");
  expect(signedPercent(1.2)).toBe("+1,2");
  expect(signedPercent(0)).toBe("+0,0");
});
