import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];
let failStatus = false;
const day = new Date(2026, 8, 30).getTime() / 1000;
const summary = {
  spans: [{ app: "Code", start: day + 9 * 3600, end: day + 11 * 3600 }],
  apps: [{ app: "Code", secs: 7200 }],
  total_secs: 7200,
  idle: [],
  idle_secs: 0,
  focus: [],
};
const empty = { spans: [], apps: [], total_secs: 0, idle: [], idle_secs: 0, focus: [] };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push(cmd);
    if (cmd === "activity_status") return failStatus ? Promise.reject("cofre ocupado") : Promise.resolve({ supported: true, enabled: true });
    if (cmd === "activity_summary") return Promise.resolve((args?.fromMs as number) === day * 1000 ? summary : empty);
    return Promise.resolve(null);
  },
}));

const { default: ActivityTab } = await import("./ActivityTab");
const { ToastProvider } = await import("../lib/toast");

const settle = async () => {
  for (let i = 0; i < 4; i++) await act(async () => {});
};
const mount = async () => {
  render(
    <ToastProvider>
      <ActivityTab today="2026-09-30" onError={() => {}} />
    </ToastProvider>,
  );
  await settle();
};
const setHidden = (hidden: boolean) => Object.defineProperty(document, "hidden", { value: hidden, configurable: true });

beforeEach(() => {
  localStorage.clear();
  calls.length = 0;
  failStatus = false;
  setHidden(false);
});
afterEach(() => {
  cleanup();
  setHidden(false);
});

test("a failed first load shows an alert with a retry instead of an endless skeleton", async () => {
  failStatus = true;
  await mount();
  expect(screen.queryByRole("status", { name: "carregando atividade" })).toBeNull();
  expect(screen.getByText("Não foi possível carregar. cofre ocupado").closest("[role=alert]")).toBeTruthy();
  failStatus = false;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  await settle();
  expect(screen.queryByText(/Não foi possível carregar/)).toBeNull();
  expect(screen.getByRole("button", { name: "Mais ações" })).toBeTruthy();
});

test("the footer says when the data was fetched and a visible icon button refreshes it", async () => {
  const real = Date.now;
  Date.now = () => new Date(2026, 8, 30, 10, 32).getTime();
  try {
    await mount();
  } finally {
    Date.now = real;
  }
  expect(screen.getByText(/atualizado às 10:32/)).toBeTruthy();
  const before = calls.filter((c) => c === "activity_summary").length;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "atualizar" }));
  });
  expect(calls.filter((c) => c === "activity_summary").length).toBe(before + 7);
});

test("nothing is polled while the window is hidden, and it catches up when it comes back", async () => {
  setHidden(true);
  await mount();
  expect(calls).toEqual([]);
  setHidden(false);
  await act(async () => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await settle();
  expect(calls).toContain("activity_status");
});

test("the actions menu opens on its first item, moves with the arrows and gives focus back on Escape", async () => {
  await mount();
  const trigger = screen.getByRole("button", { name: "Mais ações" });
  await act(async () => {
    fireEvent.click(trigger);
  });
  const items = screen.getAllByRole("menuitem");
  expect(document.activeElement).toBe(items[0]);
  fireEvent.keyDown(items[0], { key: "ArrowDown" });
  expect(document.activeElement).toBe(items[1]);
  fireEvent.keyDown(items[1], { key: "ArrowUp" });
  fireEvent.keyDown(items[0], { key: "ArrowUp" });
  expect(document.activeElement).toBe(items[items.length - 1]);
  fireEvent.keyDown(items[0], { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test("the week's heat map is also a table a screen reader can walk, and the grid is hidden from it", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Semana" }));
  });
  const table = screen.getByRole("table", { name: "Quando você rende mais" });
  expect(table.querySelectorAll("tbody tr").length).toBe(7);
  expect(table.textContent).toContain("2h");
  expect(table.querySelector("thead th")?.textContent).toMatch(/^\d+h$/);
});

test("a visible goal chip names the goal and opens the editor", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "meta 4h" }));
  });
  expect(screen.getByRole("group", { name: "Meta diária" })).toBeTruthy();
});
