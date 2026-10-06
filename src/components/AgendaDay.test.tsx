import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem, Task } from "../lib/api";
import type { Agenda } from "../lib/useAgenda";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let tasks: Task[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    return Promise.resolve(cmd === "tasks_for_day" ? tasks : null);
  },
}));

const { default: AgendaTab } = await import("./AgendaTab");

const at = (h: number, m = 0) => new Date(2026, 8, 30, h, m).toISOString();
const ev = (id: string, h: number, m: number, endH: number, endM: number, extra: Partial<AgendaItem> = {}): AgendaItem => ({
  id, title: id, start: at(h, m), end: at(endH, endM), all_day: false, location: "", meet: "", link: "", ...extra,
});
const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, title: id, done: false, day: "2026-09-30", created_at: 1, updated_at: 1, ...extra });
const agenda = (items: AgendaItem[]): Agenda => ({ items, loading: false, error: "", reload: () => Promise.resolve() });
const clock = (h: number, m = 0) => () => new Date(2026, 8, 30, h, m);

async function show(items: AgendaItem[], now = clock(8, 50)) {
  render(<AgendaTab agenda={agenda(items)} today="2026-09-30" now={now} onError={() => {}} />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  localStorage.removeItem("canto.agendaView");
  tasks = [task("Revisar PR", { hora: "09:15", estimate_min: 30 }), task("Escrever changelog", { estimate_min: 30 })];
});
afterEach(cleanup);

test("today is the default view and reads the day's tasks", async () => {
  await show([ev("Daily do time", 9, 0, 9, 30)]);
  expect(screen.getByRole("button", { name: "Hoje" }).getAttribute("aria-pressed")).toBe("true");
  expect(calls.some((c) => c.cmd === "tasks_for_day")).toBe(true);
});

test("the old list and day choices land on today", async () => {
  localStorage.setItem("canto.agendaView", "day");
  await show([ev("Daily do time", 9, 0, 9, 30)]);
  expect(screen.getByRole("button", { name: "Hoje" }).getAttribute("aria-pressed")).toBe("true");
});

test("the line shows events and timed tasks, flagging the task that clashes with a meeting", async () => {
  await show([ev("Daily do time", 9, 0, 9, 30)]);
  const line = screen.getByRole("list", { name: "linha do dia" });
  expect(line.textContent).toContain("Daily do time");
  expect(line.textContent).toContain("Revisar PR");
  expect(line.textContent).toContain("09:15–09:45");
});

test("the meeting in progress leads, with the time left and the join button", async () => {
  await show([ev("Planejamento", 10, 0, 11, 0, { meet: "https://meet.example.com/x" })], clock(10, 20));
  const hero = screen.getByRole("region", { name: "agora" });
  expect(hero.textContent).toContain("termina em 40 min");
  expect(hero.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("33");
  expect(hero.textContent).toContain("entrar no Meet");
});

test("free gaps are rows of the line, and past meetings fold away", async () => {
  tasks = [];
  await show([ev("Daily", 9, 0, 9, 30), ev("Revisão", 11, 0, 12, 0)], clock(10, 0));
  const line = screen.getByRole("list", { name: "linha do dia" });
  expect(line.textContent).toContain("livre · 1 h (10:00–11:00)");
  expect(line.textContent).not.toContain("Daily");
  fireEvent.click(screen.getByRole("button", { name: /1 já passaram/ }));
  expect(screen.getByRole("list", { name: "linha do dia" }).textContent).toContain("Daily");
});

test("the day in one line counts meetings, free time and conflicts", async () => {
  tasks = [];
  await show([ev("A", 9, 0, 10, 0), ev("B", 9, 30, 10, 30)], clock(8, 0));
  const strip = screen.getByRole("region", { name: "dia em uma linha" });
  expect(strip.textContent).toContain("1 h 30 min");
  expect(strip.textContent).toContain("conflitos1");
  expect(strip.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe("linha do dia, das 8h às 18h");
});

test("an open task can be fitted into a free gap from the line", async () => {
  await show([ev("Daily do time", 9, 0, 9, 30), ev("Revisão", 11, 0, 12, 0)], clock(8, 50));
  await act(async () => {
    fireEvent.click(screen.getByTitle("encaixar Escrever changelog às 09:45"));
  });
  const call = calls.find((c) => c.cmd === "task_set_schedule");
  expect(call?.args).toEqual({ id: "Escrever changelog", time: "09:45", repeat: null });
});

test("an open task in the tray books itself into the first free slot", async () => {
  await show([ev("Daily do time", 9, 0, 9, 30)]);
  await act(async () => {
    fireEvent.click(screen.getByTitle("agendar Escrever changelog às 09:45"));
  });
  expect(calls.find((c) => c.cmd === "task_set_schedule")?.args).toEqual({ id: "Escrever changelog", time: "09:45", repeat: null });
});
