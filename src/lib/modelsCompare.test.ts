import { beforeEach, expect, test } from "bun:test";
import { METRICS, bestValue, loadPicked, preset, radius, savePicked, togglePick, verdicts } from "./modelsCompare";
import { modelRow } from "./modelsTestRow";

const a = modelRow({ id: "a", name: "Aurora", rank: 1, score: 60, price: 10, speed: 50, open_weights: false });
const b = modelRow({ id: "b", name: "Brisa", rank: 2, score: 55, price: 1, speed: 200, open_weights: true });
const c = modelRow({ id: "c", name: "Cirro", rank: 3, score: 55, price: null, speed: null, open_weights: true });
const metric = (key: string) => METRICS.find((m) => m.key === key)!;

beforeEach(() => localStorage.clear());

test("the best value is the highest or the lowest, and needs two models with the measure", () => {
  expect(bestValue([a, b, c], metric("score"))).toBe(60);
  expect(bestValue([a, b, c], metric("price"))).toBe(1);
  expect(bestValue([a, c], metric("price"))).toBe(null);
  const newer = modelRow({ id: "n", released: "2026-09-30" });
  expect(bestValue([newer, modelRow({ id: "o", released: "2025-01-01" })], metric("released"))).toBe(Date.parse("2026-09-30"));
});

test("verdicts name the leader, the cheapest and fastest by how many times, and who wasn't measured", () => {
  expect(verdicts([a, b, c])).toEqual([
    { kind: "smartest", id: "a", other: "Brisa", gap: 5 },
    { kind: "cheapest", id: "b", other: "Aurora", times: 10 },
    { kind: "fastest", id: "b", other: "Aurora", times: 4 },
    { kind: "unmeasured", id: "c", names: "Cirro" },
  ]);
  expect(verdicts([b, c])[0]).toEqual({ kind: "tie", id: "b", other: "Cirro", score: 55 });
  expect(verdicts([a])).toEqual([]);
});

test("the radar scales against the whole pool, inverts price on a log scale and puts missing at the center", () => {
  const pool = [a, b, c];
  expect(radius(pool, "score", 60)).toBe(1);
  expect(radius(pool, "score", 55)).toBeCloseTo(0.1);
  expect(radius(pool, "price", 1)).toBe(1);
  expect(radius(pool, "price", 10)).toBeCloseTo(0.1);
  expect(radius(pool, "speed", null)).toBe(0);
});

test("presets pick three by rank, price, speed or open weights", () => {
  const pool = [a, b, c, modelRow({ id: "d", rank: 4, price: 5, speed: 100, open_weights: true })];
  expect(preset(pool, "top")).toEqual(["a", "b", "c"]);
  expect(preset(pool, "cheap")).toEqual(["b", "d", "a"]);
  expect(preset(pool, "fast")).toEqual(["b", "d", "a"]);
  expect(preset(pool, "open")).toEqual(["b", "c", "d"]);
});

test("picking toggles and stops at four", () => {
  expect(togglePick(["a"], "a")).toEqual([]);
  expect(togglePick(["a", "b", "c", "d"], "e")).toEqual(["a", "b", "c", "d"]);
});

test("the pick survives a restart and bad storage reads as empty", () => {
  savePicked(["a", "b"]);
  expect(loadPicked()).toEqual(["a", "b"]);
  localStorage.setItem("canto.models.compare", "{oops");
  expect(loadPicked()).toEqual([]);
  localStorage.setItem("canto.models.compare", JSON.stringify(["a", 3, "b", "c", "d", "e"]));
  expect(loadPicked()).toEqual(["a", "b", "c", "d"]);
});
