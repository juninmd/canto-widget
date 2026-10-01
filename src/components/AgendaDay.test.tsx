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
const daily: AgendaItem = { id: "e1", title: "Daily do time", start: at(9), end: at(9, 30), all_day: false, location: "", meet: "", link: "" };
const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, title: id, done: false, day: "2026-09-30", created_at: 1, updated_at: 1, ...extra });
const agenda = (items: AgendaItem[]): Agenda => ({ items, loading: false, error: "", reload: () => Promise.resolve() });
const now = () => new Date(2026, 8, 30, 8, 50);

async function openDay() {
  render(<AgendaTab agenda={agenda([daily])} today="2026-09-30" now={now} onError={() => {}} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Dia" }));
  });
}

beforeEach(() => {
  calls.length = 0;
  localStorage.removeItem("canto.agendaView");
  tasks = [task("Revisar PR", { hora: "09:15", estimate_min: 30 }), task("Escrever changelog", { estimate_min: 30 })];
});
afterEach(cleanup);

test("the list stays the default and never reads tasks", () => {
  render(<AgendaTab agenda={agenda([daily])} today="2026-09-30" now={now} onError={() => {}} />);
  expect(screen.getByRole("button", { name: "Lista" }).getAttribute("aria-pressed")).toBe("true");
  expect(calls.some((c) => c.cmd === "tasks_for_day")).toBe(false);
});

test("the day view shows events and timed tasks, and flags the task that clashes with a meeting", async () => {
  await openDay();
  expect(screen.getByText("Daily do time")).toBeTruthy();
  expect(screen.getByText("Revisar PR")).toBeTruthy();
  expect(screen.getByText(/conflita/)).toBeTruthy();
  expect(localStorage.getItem("canto.agendaView")).toBe("day");
});

test("clicking an open task books it in the first free slot", async () => {
  await openDay();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Escrever changelog/ }));
  });
  // 08:50 rounds to 09:00, but 09:00-09:45 is taken by the daily and the clashing task: first free quarter is 09:45.
  const call = calls.find((c) => c.cmd === "task_set_schedule");
  expect(call?.args).toEqual({ id: "Escrever changelog", time: "09:45", repeat: null });
});

test("Reuniões is a sub-view next to Lista and Dia: it swaps the agenda header for the transcripts and is remembered", async () => {
  render(<AgendaTab agenda={agenda([daily])} today="2026-09-30" now={now} onError={() => {}} />);
  expect(screen.getByText(/agenda de hoje/)).toBeTruthy();

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Reuniões" }));
  });

  expect(screen.getByRole("button", { name: "Reuniões" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.queryByText(/agenda de hoje/)).toBeNull();
  expect(screen.queryByText("Daily do time")).toBeNull();
  expect(screen.getByPlaceholderText(/buscar/i), "the transcripts search is what the sub-view shows").toBeTruthy();
  expect(localStorage.getItem("canto.agendaView")).toBe("meetings");
});

test("a saved Reuniões choice reopens on it, and an unknown saved value falls back to the list", () => {
  localStorage.setItem("canto.agendaView", "meetings");
  render(<AgendaTab agenda={agenda([daily])} today="2026-09-30" now={now} onError={() => {}} />);
  expect(screen.getByRole("button", { name: "Reuniões" }).getAttribute("aria-pressed")).toBe("true");
  cleanup();

  localStorage.setItem("canto.agendaView", "weekly");
  render(<AgendaTab agenda={agenda([daily])} today="2026-09-30" now={now} onError={() => {}} />);
  expect(screen.getByRole("button", { name: "Lista" }).getAttribute("aria-pressed")).toBe("true");
});
