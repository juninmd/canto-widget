import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];
const emitted: { event: string; payload?: unknown }[] = [];
let payload: unknown[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    return Promise.resolve(cmd === "alert_payload" ? payload : null);
  },
}));
const listeners: Record<string, () => void> = {};
mock.module("@tauri-apps/api/event", () => ({
  listen: (event: string, cb: () => void) => {
    listeners[event] = cb;
    return Promise.resolve(() => {});
  },
  emit: (event: string, p?: unknown) => {
    emitted.push({ event, payload: p });
    return Promise.resolve();
  },
}));

const { default: AlertWindow } = await import("./AlertWindow");

const alert = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: "pagar boleto",
  start: "2026-09-09T09:00:00-03:00",
  end: "",
  all_day: false,
  location: "",
  meet: "",
  link: "",
  ...extra,
});

const settle = () => act(async () => void (await Promise.resolve()));

beforeEach(() => {
  calls.length = 0;
  emitted.length = 0;
  payload = [];
});
afterEach(cleanup);

test("reads the pending alerts without needing an unlocked vault", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(calls).toEqual(expect.arrayContaining(["alert_payload"]));
  expect(calls.some((c) => c.startsWith("vault_"))).toBe(false);
});

test("rings again when Rust announces another alert", async () => {
  render(<AlertWindow />);
  await settle();
  expect(screen.queryByRole("alertdialog")).toBeNull();
  payload = [alert("task:t1")];
  await act(async () => listeners["canto://alert"]());
  await settle();
  expect(screen.getByRole("alertdialog")).toBeTruthy();
});

test("completing a task tells the widget window to reread its list", async () => {
  payload = [alert("task:t1")];
  render(<AlertWindow />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "concluir tarefa" }));
  await settle();
  expect(emitted.map((e) => e.event)).toContain("canto://tasks-changed");
});

test("opening the models tab shows the widget and asks it to switch", async () => {
  payload = [alert("model:aurora", { tag: "#3" })];
  render(<AlertWindow />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "abrir aba Modelos" }));
  await settle();
  expect(emitted).toContainEqual({ event: "canto://open-tab", payload: "models" });
  expect(calls).toContain("main_show");
});
