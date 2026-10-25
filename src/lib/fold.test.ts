import { expect, test } from "bun:test";
import { fold, foldIncludes, foldRanges } from "./fold";

test("accents and case fold to the plain letter, like the Rust search", () => {
  expect(fold("Ação")).toBe("acao");
  expect(fold("REUNIÃO às 10h")).toBe("reuniao as 10h");
  expect(fold("Ação")).toBe("acao");
});

test("a plain query finds accented text and the other way round", () => {
  expect(foldIncludes("Pauta da Reunião", fold("reuniao"))).toBe(true);
  expect(foldIncludes("acao de graças", fold("Ação"))).toBe(true);
  expect(foldIncludes("reunir", fold("reuniao"))).toBe(false);
});

test("ranges point into the original text, whole accented letters included", () => {
  const text = "Pauta: Reunião e reuniao";
  expect(foldRanges(text, "reuniao").map(([a, b]) => text.slice(a, b))).toEqual(["Reunião", "reuniao"]);
  const decomposed = "Ação!";
  expect(foldRanges(decomposed, "acao").map(([a, b]) => decomposed.slice(a, b))).toEqual(["Ação"]);
  expect(foldRanges("😀 ação", "acao")).toEqual([[3, 7]]);
  expect(foldRanges("nada", "")).toEqual([]);
});
