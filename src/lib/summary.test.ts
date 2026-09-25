import { expect, test } from "bun:test";
import type { AgendaItem, ForgeItem, GeminiDoc, Task } from "./api";
import { dayStart, daySummary } from "./summary";

const t = (title: string, done: boolean, hora: string | null = null): Task => ({ id: title, title, done, day: "2026-09-14", created_at: 1, updated_at: 1, hora });
const meeting: AgendaItem = { id: "r", title: "Daily", start: new Date(2026, 8, 14, 9, 30).toISOString(), end: "", all_day: false, location: "", meet: "", link: "" };

test("separates done, pending and meetings with a count", () => {
  const text = daySummary("2026-09-14", [t("enviar NF", true), t("ligar banco", false, "15:00")], [meeting]);
  expect(text).toContain("Concluído (1)\n- enviar NF");
  expect(text).toContain("Pendente (1)\n- ligar banco (15:00)");
  expect(text).toMatch(/Reuniões \(1\)\n- 09:30 Daily/);
});

test("a meeting with Gemini notes carries the link in the summary line", () => {
  const doc: GeminiDoc = { meeting: "Daily", start: meeting.start, title: "Notas da Daily", url: "https://docs.google.com/x" };
  const other: GeminiDoc = { meeting: "Outra reunião", start: new Date(2026, 8, 14, 11, 0).toISOString(), title: "Y", url: "https://docs.google.com/y" };
  const text = daySummary("2026-09-14", [], [meeting], [], [doc, other]);
  expect(text).toContain("09:30 Daily — anotações do Gemini: https://docs.google.com/x");
  expect(text).not.toContain("docs.google.com/y");
});

test("PRs and MRs opened today are listed with the forge's own reference", () => {
  const pr = { reference: "octo/canto#7", title: "Cache local", draft: false } as ForgeItem;
  const mr = { reference: "acme/api!12", title: "Rate limit", draft: true } as ForgeItem;
  const text = daySummary("2026-09-14", [], [], [pr, mr]);
  expect(text).toContain("PRs/MRs abertos (2)\n- octo/canto#7 Cache local\n- acme/api!12 Rate limit (rascunho)");
  expect(text).not.toContain("Nada registrado");
});

test("dayStart is local midnight, which is what the forges are asked from", () => {
  expect(new Date(dayStart("2026-09-14")).getHours()).toBe(0);
  expect(new Date(dayStart("2026-09-14")).getDate()).toBe(14);
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
