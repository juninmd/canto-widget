import { expect, test } from "bun:test";
import { parseChoice, resolveLanguage } from "./language";

test("automatic matches supported regional locales and keeps the primary language preference", () => {
  expect(resolveLanguage("auto", ["pt-BR", "en-US"])).toBe("pt-BR");
  expect(resolveLanguage("auto", ["pt-PT"])).toBe("pt-BR");
  expect(resolveLanguage("auto", ["en-GB"])).toBe("en");
  expect(resolveLanguage("auto", ["es-MX", "en-US"])).toBe("es");
  expect(resolveLanguage("auto", ["de-DE", "pt-BR"])).toBe("de");
  expect(resolveLanguage("auto", ["fr-CA"])).toBe("fr");
  expect(resolveLanguage("auto", ["zh-CN"])).toBe("zh");
  expect(resolveLanguage("auto", ["ar-EG"])).toBe("ar");
  expect(resolveLanguage("auto", ["iw-IL"])).toBe("he");
  expect(resolveLanguage("auto", ["no-NO"])).toBe("nb");
  expect(resolveLanguage("auto", ["xx-XX", "es"])).toBe("en");
  expect(resolveLanguage("auto", [])).toBe("pt-BR");
});

test("an explicit choice wins over the system", () => {
  expect(resolveLanguage("en", ["pt-BR"])).toBe("en");
  expect(resolveLanguage("pt-BR", ["en-US"])).toBe("pt-BR");
  expect(resolveLanguage("ja", ["en-US"])).toBe("ja");
});

test("unknown stored values fall back to automatic", () => {
  expect(parseChoice("en")).toBe("en");
  expect(parseChoice("es")).toBe("es");
  expect(parseChoice("fr")).toBe("fr");
  expect(parseChoice("xx")).toBe("auto");
  expect(parseChoice(null)).toBe("auto");
});
