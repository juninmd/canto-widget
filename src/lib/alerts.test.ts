import { expect, test } from "bun:test";
import type { AgendaItem } from "./api";
import { outcomeLabel, resolvedToday } from "./alerts";

const item = (id: string): AgendaItem => ({ id, title: id, start: "", end: "", all_day: false, location: "", meet: "", link: "" });

test("the outcome is named after what the alert was about", () => {
  const meeting = { ...item("e1"), meet: "https://meet.example.com/a" };
  expect(outcomeLabel(meeting, "done")).toBe("entrou no Meet");
  expect(outcomeLabel(item("task:t1"), "done")).toBe("tarefa concluída");
  expect(outcomeLabel(item("pr:acme/atlas#4"), "done")).toBe("PR aberto");
  expect(outcomeLabel(meeting, "snoozed")).toBe("adiado");
  expect(outcomeLabel(meeting, "closed")).toBe("fechado");
  expect(outcomeLabel(item("status:github"), "muted")).toBe("silenciado");
});

test("only what happened since local midnight counts as resolved today", () => {
  const now = new Date(2026, 8, 30, 15, 0, 0);
  const at = (d: Date) => ({ item: item("e1"), outcome: "closed" as const, at: d.getTime() });
  const list = [at(new Date(2026, 8, 30, 0, 0, 1)), at(new Date(2026, 8, 29, 23, 59, 59)), at(new Date(2026, 8, 30, 14, 0, 0))];
  expect(resolvedToday(list, now)).toHaveLength(2);
});
