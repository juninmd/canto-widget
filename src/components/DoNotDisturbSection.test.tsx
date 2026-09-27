import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { DndState } from "../lib/api";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let current: DndState = { active: false, untilMs: null };
const listeners: Record<string, (e: { payload: DndState }) => void> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "dnd_set") current = { active: true, untilMs: (args?.untilMs as number | null) ?? null };
    if (cmd === "dnd_clear") current = { active: false, untilMs: null };
    return Promise.resolve(current);
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  listen: (event: string, cb: (e: { payload: DndState }) => void) => {
    listeners[event] = cb;
    return Promise.resolve(() => {});
  },
}));

const { default: DoNotDisturbSection } = await import("./DoNotDisturbSection");
const { default: DndIndicator } = await import("./DndIndicator");

async function settle() {
  for (let i = 0; i < 3; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

beforeEach(() => {
  calls.length = 0;
  current = { active: false, untilMs: null };
});
afterEach(cleanup);

test("a duration sends the end computed in the UI and shows until when it is on", async () => {
  render(<DoNotDisturbSection onError={() => {}} />);
  await settle();
  const before = Date.now();
  fireEvent.click(screen.getByRole("button", { name: "1 h" }));
  await settle();
  const sent = calls.find((c) => c.cmd === "dnd_set")?.args?.untilMs as number;
  expect(sent - before).toBeGreaterThanOrEqual(60 * 60_000);
  expect(sent - before).toBeLessThan(60 * 60_000 + 5_000);
  expect(screen.getByRole("status").textContent).toMatch(/^ativo até \d\d:\d\d$/);
  fireEvent.click(screen.getByRole("button", { name: "desligar" }));
  await settle();
  expect(calls.at(-1)?.cmd).toBe("dnd_clear");
  expect(screen.getByRole("button", { name: "até amanhã" })).toBeTruthy();
});

test("until turned off sends no end", async () => {
  render(<DoNotDisturbSection onError={() => {}} />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "até desligar" }));
  await settle();
  expect(calls.find((c) => c.cmd === "dnd_set")?.args).toEqual({ untilMs: null });
  expect(screen.getByRole("status").textContent).toBe("ativo até desligar");
});

test("a rejected end surfaces the error from Rust", async () => {
  const errors: string[] = [];
  const { api } = await import("../lib/api");
  const original = api.dndSet;
  api.dndSet = () => Promise.reject("horário de fim do não perturbe inválido");
  render(<DoNotDisturbSection onError={(m) => errors.push(m)} />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "30 min" }));
  await settle();
  api.dndSet = original;
  expect(errors).toEqual(["horário de fim do não perturbe inválido"]);
});

test("the top-bar indicator follows Rust, shows the end and turns it off on click", async () => {
  render(<DndIndicator onError={() => {}} />);
  await settle();
  expect(screen.queryByRole("button", { name: "desligar não perturbe" })).toBeNull();
  const end = new Date();
  end.setHours(end.getHours() + 1, 30, 0, 0);
  await act(async () => listeners["canto://dnd"]({ payload: { active: true, untilMs: end.getTime() } }));
  const button = screen.getByRole("button", { name: "desligar não perturbe" });
  expect(button.textContent).toMatch(/^até (\S+ )?\d\d:30$/);
  fireEvent.click(button);
  await settle();
  expect(calls.at(-1)?.cmd).toBe("dnd_clear");
  expect(screen.queryByRole("button", { name: "desligar não perturbe" })).toBeNull();
});

test("the indicator hides by itself when the period ends", async () => {
  current = { active: true, untilMs: Date.now() + 30 };
  render(<DndIndicator onError={() => {}} />);
  await settle();
  expect(screen.getByRole("button", { name: "desligar não perturbe" })).toBeTruthy();
  await act(async () => {
    await new Promise((r) => setTimeout(r, 60));
  });
  expect(screen.queryByRole("button", { name: "desligar não perturbe" })).toBeNull();
});
