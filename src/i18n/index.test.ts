import { expect, test } from "bun:test";
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
