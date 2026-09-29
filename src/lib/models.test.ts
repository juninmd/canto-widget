import { expect, test } from "bun:test";
import type { ModelRow } from "./api";
import { barWidth, formatPrice, formatScore, formatSpeed, nextSort, sortModels } from "./models";

const row = (id: string, rank: number, price: number | null, speed: number | null): ModelRow => ({
  id,
  name: id,
  creator: "Lumen Labs",
  score: 80 - rank,
  price,
  speed,
  rank,
  badge: null,
});

const rows = [row("c", 3, 0.5, 300), row("a", 1, 10, null), row("b", 2, null, 90), row("d", 4, 0.5, 90)];
const ids = (list: ModelRow[]) => list.map((r) => r.id);

test("the sort cycles intelligence, price, speed and back", () => {
  expect(nextSort("intelligence")).toBe("price");
  expect(nextSort("price")).toBe("speed");
  expect(nextSort("speed")).toBe("intelligence");
});

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
