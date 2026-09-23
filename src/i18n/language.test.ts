import { expect, test } from "bun:test";
import { parseChoice, resolveLanguage } from "./language";

test("automatic follows the system: Portuguese for pt-*, English otherwise", () => {
  expect(resolveLanguage("auto", ["pt-BR", "en-US"])).toBe("pt-BR");
  expect(resolveLanguage("auto", ["pt-PT"])).toBe("pt-BR");
  expect(resolveLanguage("auto", ["en-GB"])).toBe("en");
  expect(resolveLanguage("auto", ["de-DE", "pt-BR"])).toBe("en");
  expect(resolveLanguage("auto", [])).toBe("pt-BR");
});

test("an explicit choice wins over the system", () => {
  expect(resolveLanguage("en", ["pt-BR"])).toBe("en");
  expect(resolveLanguage("pt-BR", ["en-US"])).toBe("pt-BR");
});

test("unknown stored values fall back to automatic", () => {
  expect(parseChoice("en")).toBe("en");
  expect(parseChoice("fr")).toBe("auto");
  expect(parseChoice(null)).toBe("auto");
});
