import { expect, test } from "bun:test";
import { en } from "./en";
import { es } from "./es";
import { ptBR } from "./pt-BR";

test("every message is a non-empty string", () => {
  for (const [key, value] of Object.entries(ptBR)) {
    expect(typeof value, key).toBe("string");
    expect((value as string).trim().length, key).toBeGreaterThan(0);
  }
});

test("t fills placeholders and leaves unknown ones visible", async () => {
  const { t } = await import("./index");
  expect(t("status.updatedAgo", { ago: "agora" })).toBe("atualizado agora");
  expect(t("status.updatedAgo")).toBe("atualizado {ago}");
  expect(t("status.updatedAgo", { other: 1 })).toBe("atualizado {ago}");
});

for (const [name, catalog] of [["English", en], ["Spanish", es]] as const) {
  test(`the ${name} catalog has exactly the same keys and placeholders as pt-BR`, () => {
    const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    expect(Object.keys(catalog).sort()).toEqual(Object.keys(ptBR).sort());
    for (const [key, text] of Object.entries(ptBR)) {
      const translated = (catalog as Record<string, string>)[key];
      expect(translated.trim().length, key).toBeGreaterThan(0);
      expect(placeholders(translated), key).toEqual(placeholders(text as string));
    }
  });
}
