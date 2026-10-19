import { expect, test } from "bun:test";
import { smoothCurve, sparkline } from "./sparkline";

test("a sparkline spreads the points across the width and scales them between the smallest and largest", () => {
  const points = sparkline([1, 2, 3], 20, 10).split(" ");
  expect(points).toEqual(["0.0,10.0", "10.0,5.0", "20.0,0.0"]);
  expect(sparkline([], 20, 10)).toBe("");
  expect(sparkline([7], 20, 10)).toBe("0.0,5.0");
});

test("a flat series is centred instead of glued to the bottom", () => {
  expect(sparkline([4, 4, 4], 20, 10)).toBe("0.0,5.0 10.0,5.0 20.0,5.0");
});

test("the smooth curve passes through every point and its area closes along the bottom", () => {
  const { line, area } = smoothCurve([10, 20, 15], [10, 30, 50], 40, 5);
  expect(line.startsWith("M10.0,35.0")).toBe(true);
  expect(line.endsWith("50.0,20.0")).toBe(true);
  expect(line.match(/C/g)).toHaveLength(2);
  expect(area).toBe(`${line} L50.0,40 L10.0,40 Z`);
  expect(smoothCurve([], [], 40)).toEqual({ line: "", area: "" });
  expect(smoothCurve([1, 2], [0], 40)).toEqual({ line: "", area: "" });
});

test("a flat series is drawn through the middle", () => {
  expect(smoothCurve([4, 4], [0, 10], 40).line).toStartWith("M0.0,20.0");
});
