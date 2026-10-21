import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";
import type { Agenda } from "../lib/useAgenda";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    return Promise.resolve(cmd === "tasks_for_day" || cmd === "agenda_today" ? [] : null);
  },
}));

const { default: AgendaTab } = await import("./AgendaTab");
const { savePicked } = await import("../lib/agendaPicked");

const at = (h: number, m = 0) => new Date(2026, 8, 30, h, m).toISOString();
const ev = (id: string, h: number, m: number, endH: number, endM: number, extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id, title: id, start: at(h, m), end: at(endH, endM), all_day: false, location: "", meet: "", link: "", ...extra,
});
const agenda = (items: AgendaItem[]): Agenda => ({ items, loading: false, error: "", reload: () => Promise.resolve(), fetchedAt: new Date(2026, 8, 30, 9, 41).getTime() });
const clock = (h: number, m = 0) => () => new Date(2026, 8, 30, h, m);

async function show(items: AgendaItem[], now = clock(10, 20)) {
  render(<AgendaTab agenda={agenda(items)} today="2026-09-30" now={now} onError={() => {}} />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  localStorage.removeItem("canto.agendaView");
});
afterEach(() => {
  cleanup();
  savePicked(null);
});

test("sub-tabs, day navigation, refresh and the menu share one row", async () => {
  await show([ev("Daily", 9, 0, 9, 30)]);
  const row = screen.getByRole("button", { name: "Hoje" }).closest("div[class*='flex-wrap']")!.parentElement ?? document.body;
  for (const name of ["Reuniões", "Dia anterior", "Próximo dia", "atualizar", "ações da agenda"]) {
    expect(row.contains(screen.getByRole("button", { name }))).toBe(true);
  }
  expect(row.contains(screen.getByLabelText("Escolher o dia da agenda"))).toBe(true);
  expect(screen.queryByRole("button", { name: "testar aviso" })).toBeNull();
  expect(screen.queryByText("agenda de hoje · aviso 1 min antes")).toBeNull();
});

test("the meetings view keeps only the sub-tabs on the row", async () => {
  await show([ev("Daily", 9, 0, 9, 30)]);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Reuniões" }));
  });
  expect(screen.queryByRole("button", { name: "Dia anterior" })).toBeNull();
  expect(screen.queryByRole("button", { name: "ações da agenda" })).toBeNull();
});

test("the menu tests the alert and states the reminder lead", async () => {
  await show([ev("Daily", 9, 0, 9, 30)]);
  const more = screen.getByRole("button", { name: "ações da agenda" });
  expect(more.getAttribute("aria-haspopup")).toBe("menu");
  fireEvent.click(more);
  expect(screen.getByText("Aviso 1 min antes")).toBeTruthy();
  expect(screen.getByText("atualizado às 09:41")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("menuitem", { name: "Testar aviso" }));
  });
  expect(calls.some((c) => c.cmd === "alert_open")).toBe(true);
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(more);
});

test("Escape closes the menu and arrows move through its items", async () => {
  await show([ev("Daily", 9, 0, 9, 30)]);
  fireEvent.click(screen.getByRole("button", { name: "ações da agenda" }));
  const item = screen.getByRole("menuitem", { name: "Testar aviso" });
  expect(document.activeElement).toBe(item);
  fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
  expect(document.activeElement).toBe(item);
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
});

test("the meeting in progress has a countdown ring with the minutes left, labelled like the header", async () => {
  await show([ev("Planejamento", 10, 0, 11, 0, { meet: "https://meet.example.com/x", location: "Sala Orion", guests: 6 })]);
  const hero = screen.getByRole("region", { name: "agora" });
  const ring = hero.querySelector('[role="progressbar"]')!;
  expect(ring.getAttribute("aria-label")).toBe("termina em 40 min");
  expect(ring.getAttribute("aria-valuenow")).toBe("33");
  expect(ring.textContent).toBe("40min");
  expect(ring.querySelector("svg circle")).not.toBeNull();
  expect(hero.textContent).toContain("Sala Orion");
  expect(hero.textContent).toContain("6 convidados");
  expect(within(hero).getByRole("button", { name: "entrar no Meet" })).toBeTruthy();
});

test("a next meeting has no ring, and a long one shows hours in it", async () => {
  await show([ev("Mais tarde", 14, 0, 15, 0)]);
  expect(screen.getByRole("region", { name: "próxima" }).querySelector('[role="progressbar"]')).toBeNull();
  cleanup();
  await show([ev("Workshop", 9, 0, 13, 0)], clock(10, 55));
  expect(screen.getByRole("region", { name: "agora" }).querySelector('[role="progressbar"]')!.textContent).toBe("2h05");
});

test("a clash on the meeting in progress stays as a pill in the hero", async () => {
  await show([ev("Planejamento", 10, 0, 11, 0), ev("Café com fornecedor", 10, 30, 10, 45)]);
  const pill = screen.getByRole("region", { name: "agora" }).querySelector('[role="alert"]')!;
  expect(pill.textContent).toContain("conflita com: Café com fornecedor");
  expect(pill.className).toContain("rounded-full");
});

test("the date between the arrows is the picker and keeps the 'hoje' shortcut when away", async () => {
  await show([ev("Daily", 9, 0, 9, 30)]);
  expect(screen.getByText("Hoje", { selector: "[aria-live]" })).toBeTruthy();
  await act(async () => {
    fireEvent.change(screen.getByLabelText("Escolher o dia da agenda"), { target: { value: "2026-10-05" } });
  });
  expect(screen.queryByText("Hoje", { selector: "[aria-live]" })).toBeNull();
  expect(screen.getByRole("button", { name: "hoje" })).toBeTruthy();
});
