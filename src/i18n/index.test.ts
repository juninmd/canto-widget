import { expect, test } from "bun:test";
import { en } from "./en";
import { ptBR } from "./pt-BR";
import { CATALOGS } from "./catalogs";
import { languageNames, localeFor } from "./languages";

test("every message is a non-empty string", () => {
  for (const [key, value] of Object.entries(ptBR)) {
    expect(typeof value, key).toBe("string");
    expect((value as string).trim().length, key).toBeGreaterThan(0);
  }
});

test("every selectable language has a full catalog, valid locale and intact placeholders", () => {
  const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  const keys = Object.keys(ptBR).sort();
  for (const [language] of languageNames) {
    const messages = CATALOGS[language];
    expect(Object.keys(messages).sort(), language).toEqual(keys);
    expect(() => new Intl.DateTimeFormat(localeFor(language)).format(new Date())).not.toThrow();
    for (const key of keys) {
      const translated = messages[key as keyof typeof ptBR];
      expect(translated.trim().length, `${language}:${key}`).toBeGreaterThan(0);
      expect(translated, `${language}:${key}`).not.toContain("__CANTO_");
      expect(placeholders(translated), `${language}:${key}`).toEqual(placeholders(ptBR[key as keyof typeof ptBR]));
    }
    expect(messages["app.name"], language).toBe(en["app.name"]);
    expect(messages["tasks.addPlaceholder"], language).toContain(language === "pt-BR" ? "Daily às 9h30 !alta" : "Daily at 9:30 !high");
  }
});

test("t fills placeholders and leaves unknown ones visible", async () => {
  const { t } = await import("./index");
  expect(t("status.updatedAgo", { ago: "agora" })).toBe("atualizado agora");
  expect(t("status.updatedAgo")).toBe("atualizado {ago}");
  expect(t("status.updatedAgo", { other: 1 })).toBe("atualizado {ago}");
});

test("the English catalog has exactly the same keys and placeholders as pt-BR", () => {
  const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  expect(Object.keys(en).sort()).toEqual(Object.keys(ptBR).sort());
  for (const [key, text] of Object.entries(ptBR)) {
    const translated = (en as Record<string, string>)[key];
    expect(translated.trim().length, key).toBeGreaterThan(0);
    expect(placeholders(translated), key).toEqual(placeholders(text as string));
  }
});
