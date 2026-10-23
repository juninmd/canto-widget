import { expect, test } from "bun:test";
import type { ModelRow } from "./api";
import { availableFilters, barWidth, filterModels, formatContext, formatPrice, formatReleased, formatScore, formatSpeed, placeBy, sortModels } from "./models";
import { modelRow } from "./modelsTestRow";

const row = (id: string, rank: number, price: number | null, speed: number | null): ModelRow =>
  modelRow({ id, creator: "Lumen Labs", score: 80 - rank, price, speed, rank });

const rows = [row("c", 3, 0.5, 300), row("a", 1, 10, null), row("b", 2, null, 90), row("d", 4, 0.5, 90)];
const ids = (list: ModelRow[]) => list.map((r) => r.id);

test("intelligence follows the rank", () => {
  expect(ids(sortModels(rows, "intelligence"))).toEqual(["a", "b", "c", "d"]);
});

test("price goes cheapest first, ties by rank and unknown prices last", () => {
  expect(ids(sortModels(rows, "price"))).toEqual(["c", "d", "a", "b"]);
});

test("speed goes fastest first, ties by rank and unknown speeds last", () => {
  expect(ids(sortModels(rows, "speed"))).toEqual(["c", "b", "d", "a"]);
});

test("sorting doesn't change the list it was given", () => {
  sortModels(rows, "price");
  expect(ids(rows)).toEqual(["c", "a", "b", "d"]);
});

test("numbers use the pt-BR format", () => {
  expect(formatScore(73.25)).toBe("73,3");
  expect(formatScore(70)).toBe("70");
  expect(formatPrice(3.4)).toBe("3,40");
  expect(formatSpeed(1234.6)).toBe("1.235");
});

test("the bar is proportional to the best score and never vanishes", () => {
  expect(barWidth(50, 100)).toBe(50);
  expect(barWidth(0, 100)).toBe(2);
  expect(barWidth(10, 0)).toBe(0);
});

test("context goes biggest first and released newest first, unknowns last", () => {
  const list = [
    modelRow({ id: "a", rank: 1, context: 200_000, released: "2025-08-05" }),
    modelRow({ id: "b", rank: 2, context: null, released: "2026-09-30" }),
    modelRow({ id: "c", rank: 3, context: 1_000_000, released: null }),
  ];
  expect(ids(sortModels(list, "context"))).toEqual(["c", "a", "b"]);
  expect(ids(sortModels(list, "released"))).toEqual(["b", "a", "c"]);
});

test("filters keep only models the page marked, and are offered only when some model has the flag", () => {
  const list = [modelRow({ id: "a", open_weights: true, reasoning: false }), modelRow({ id: "b", open_weights: false, reasoning: true }), modelRow({ id: "c" })];
  expect(ids(filterModels(list, ["open"]))).toEqual(["a"]);
  expect(ids(filterModels(list, ["open", "reasoning"]))).toEqual([]);
  expect(availableFilters(list)).toEqual(["open", "reasoning"]);
  expect(availableFilters([modelRow({ id: "x" })])).toEqual([]);
});

test("context and release read like the model pages", () => {
  expect(formatContext(131_072)).toBe("131k");
  expect(formatContext(1_000_000)).toBe("1M");
  expect(formatContext(1_048_576)).toBe("1M");
  expect(formatContext(2_500_000)).toBe("2,5M");
  expect(formatReleased("2025-08-05")).toBe("ago. de 2025");
});

test("place counts only the models that have the index", () => {
  const list = [modelRow({ id: "a", coding: 40 }), modelRow({ id: "b", coding: null }), modelRow({ id: "c", coding: 60 })];
  expect(placeBy(list, "a", "coding")).toBe(2);
  expect(placeBy(list, "b", "coding")).toBe(null);
});
