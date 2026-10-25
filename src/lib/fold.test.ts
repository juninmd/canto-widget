import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fold, foldIncludes, foldRanges } from "./fold";

// The same fixtures text_fold.rs runs: a drift between the two folds fails here or there.
const cases = JSON.parse(readFileSync(new URL("./fold_cases.json", import.meta.url), "utf8")) as Array<[string, string]>;

test("shared cases fold exactly like the Rust search", () => {
  expect(cases.length).toBeGreaterThanOrEqual(5);
  for (const [input, want] of cases) expect([input, fold(input)]).toEqual([input, want]);
});

test("a plain query finds accented text and the other way round", () => {
  expect(foldIncludes("Pauta da Reunião", fold("reuniao"))).toBe(true);
  expect(foldIncludes("acao de graças", fold("Ação"))).toBe(true);
  expect(foldIncludes("reunir", fold("reuniao"))).toBe(false);
  expect(foldIncludes("ΟΔΟΣ", fold("οδος"))).toBe(true);
});

test("ranges point into the original text, whole accented letters included", () => {
  const text = "Pauta: Reunião e reuniao";
  expect(foldRanges(text, "reuniao").map(([a, b]) => text.slice(a, b))).toEqual(["Reunião", "reuniao"]);
  const decomposed = "Ação!";
  expect(foldRanges(decomposed, "acao").map(([a, b]) => decomposed.slice(a, b))).toEqual(["Ação"]);
  expect(foldRanges("😀 ação", "acao")).toEqual([[3, 7]]);
  expect(foldRanges("nada", "")).toEqual([]);
});

test("letters outside the shared table are not highlighted for a stripped query", () => {
  expect(foldRanges("Йогурт", "иогурт")).toEqual([]);
  expect(foldRanges("がっこう", "かっこう")).toEqual([]);
});
