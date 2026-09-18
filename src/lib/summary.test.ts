import { expect, test } from "bun:test";
import type { AgendaItem, Task } from "./api";
import { daySummary } from "./summary";

const t = (title: string, done: boolean, hora: string | null = null): Task => ({ id: title, title, done, day: "2026-09-14", created_at: 1, updated_at: 1, hora });
const meeting: AgendaItem = { id: "r", title: "Daily", start: new Date(2026, 8, 14, 9, 30).toISOString(), end: "", all_day: false, location: "", meet: "", link: "" };

test("separates done, pending and meetings with a count", () => {
  const text = daySummary("2026-09-14", [t("enviar NF", true), t("ligar banco", false, "15:00")], [meeting]);
  expect(text).toContain("Concluído (1)\n- enviar NF");
  expect(text).toContain("Pendente (1)\n- ligar banco (15:00)");
  expect(text).toMatch(/Reuniões \(1\)\n- 09:30 Daily/);
});

test("an empty day says so instead of showing bare headings", () => {
  const text = daySummary("2026-09-14", [], []);
  expect(text).toContain("Nada registrado hoje.");
  expect(text).not.toContain("Pendente");
});

test("a section with no items disappears and the text doesn't end with a blank line", () => {
  const text = daySummary("2026-09-14", [t("a", true)], []);
  expect(text).not.toContain("Reuniões");
  expect(text.endsWith("\n")).toBe(false);
});
