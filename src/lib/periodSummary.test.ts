import { expect, test } from "bun:test";
import type { AgendaItem, ForgeOpened, VaultPeriod } from "./api";
import { periodBounds } from "./period";
import { meetingGroups, periodSummary, workdayTotals } from "./periodSummary";

const week = periodBounds("week", "2026-09-24");
const none: VaultPeriod = { done: [], done_total: 0, notes: [], notes_total: 0 };

function meeting(title: string, day: number, h: number, minutes: number, extra: Partial<AgendaItem> = {}): AgendaItem {
  const start = new Date(2026, 8, day, h, 0);
  const end = new Date(start.getTime() + minutes * 60000);
  const base = { id: `${title}${day}${h}`, title, start: start.toISOString(), end: end.toISOString() };
  return { ...base, all_day: false, location: "", meet: "", link: "", ...extra };
}

const pr = (n: number) => ({
  repo: "acme/atlas",
  number: n,
  reference: `acme/atlas#${n}`,
  title: `Mudança ${n}`,
  url: `https://github.com/acme/atlas/pull/${n}`,
  created_at: "",
  updated_at: "",
  comments: 0,
  is_pr: true,
  draft: false,
  author: "ana",
});

test("workday totals count done tasks and meeting time per day, overlaps once, declined and all-day never", () => {
  const vault: VaultPeriod = { ...none, done: [{ title: "a", day: "2026-09-21" }, { title: "b", day: "2026-09-21" }], done_total: 2 };
  const agenda = [
    meeting("Daily", 21, 9, 30),
    meeting("Sync", 21, 9, 60),
    meeting("Recusada", 22, 10, 60, { response: "declined" }),
    { ...meeting("Folga", 23, 0, 0), all_day: true, start: "2026-09-23", end: "2026-09-24" },
  ];
  expect(workdayTotals(week, { vault, agenda, forges: null })).toEqual([
    { day: "2026-09-21", tasks: 2, minutes: 60 },
    { day: "2026-09-22", tasks: 0, minutes: 0 },
    { day: "2026-09-23", tasks: 0, minutes: 0 },
    { day: "2026-09-24", tasks: 0, minutes: 0 },
  ]);
});

test("repeated meetings are grouped by title, biggest time sink first", () => {
  const agenda = [meeting("Daily", 21, 9, 15), meeting("Daily", 22, 9, 15), meeting("Planejamento", 23, 14, 60)];
  expect(meetingGroups(agenda)).toEqual([
    { title: "Planejamento", count: 1, minutes: 60 },
    { title: "Daily", count: 2, minutes: 30 },
  ]);
});

test("the week's markdown has the overview, the workdays, the lists and PR links", () => {
  const vault: VaultPeriod = {
    done: [{ title: "Revisar contrato", day: "2026-09-22" }],
    done_total: 1,
    notes: [{ title: "Ideias", created: true, at: 1 }],
    notes_total: 1,
  };
  const forges: ForgeOpened = { items: [], merged: [pr(7)], reviewed: [], errors: [] };
  const text = periodSummary("week", week, { vault, agenda: [meeting("Daily", 21, 9, 90)], forges });
  expect(text.startsWith("## Relatório da semana: 21/09 a 24/09")).toBe(true);
  expect(text).toContain("**Tarefas concluídas:** 1 · **Notas criadas ou editadas:** 1 · **Reuniões:** 1 (1h30)");
  expect(text).toContain("### Por dia útil (4)\n- seg., 21/09 — tarefas: 0 · reuniões: 1h30");
  expect(text).toContain("### Tarefas concluídas (1)\n- Revisar contrato (22/09)");
  expect(text).toContain("- Ideias (nova)");
  expect(text).toContain("### Reuniões (1 · 1h30 no total)\n- Daily (1×, 1h30)");
  expect(text).toContain("- [acme/atlas#7](https://github.com/acme/atlas/pull/7) Mudança 7");
});

test("a month shows no per-day block, and a list past its bound shows the real total and what's left out", () => {
  const month = periodBounds("month", "2026-09-24");
  const forges: ForgeOpened = { items: [], merged: [pr(1), pr(2)], errors: [], totals: { opened: 0, merged: 45, reviewed: 0 } };
  const vault: VaultPeriod = { ...none, done: [{ title: "x", day: "2026-09-02" }], done_total: 301 };
  const text = periodSummary("month", month, { vault, agenda: [], forges });
  expect(text).toContain("Relatório de setembro de 2026 (até 24/09)");
  expect(text).not.toContain("Por dia útil");
  expect(text).toContain("### PRs/MRs mergeados (45)");
  expect(text).toContain("- … e mais 43");
  expect(text).toContain("### Tarefas concluídas (301)\n- x (02/09)\n- … e mais 300");
});

test("focused time shows in the overview of a period", () => {
  const vault: VaultPeriod = { ...none, focused_secs: 130 * 60 };
  const text = periodSummary("month", periodBounds("month", "2026-09-24"), { vault, agenda: [], forges: null });
  expect(text).toContain("**Tempo focado:** 2h10");
});

test("closed PRs/MRs appear in the overview and as their own list", () => {
  const forges: ForgeOpened = { items: [], closed: [pr(3)], errors: [], totals: { opened: 0, merged: 0, reviewed: 0, closed: 4 } };
  const text = periodSummary("month", periodBounds("month", "2026-09-24"), { vault: none, agenda: [], forges });
  expect(text).toContain("**PRs/MRs encerrados sem merge:** 4");
  expect(text).toContain("### PRs/MRs encerrados sem merge (4)\n- [acme/atlas#3](https://github.com/acme/atlas/pull/3) Mudança 3\n- … e mais 3");
});

test("an empty period says so instead of an empty report", () => {
  expect(periodSummary("month", periodBounds("month", "2026-09-24"), { vault: none, agenda: [], forges: null })).toContain(
    "Nada registrado no período.",
  );
});
