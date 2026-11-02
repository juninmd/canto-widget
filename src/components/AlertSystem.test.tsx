import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const calls: { cmd: string; args: Record<string, unknown> }[] = [];
const events: { name: string; payload: unknown }[] = [];
let on: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "system_alerts_get") return Promise.resolve(on);
    if (cmd === "system_alerts_set") return Promise.resolve(args.kinds);
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  emit: (name: string, payload: unknown) => {
    events.push({ name, payload });
    return Promise.resolve();
  },
  listen: () => Promise.resolve(() => {}),
}));
mock.module("../lib/sound", () => ({ playAlert: () => {} }));

const { default: Alert } = await import("./Alert");

const base = { end: "", all_day: false, location: "", meet: "", link: "", start: new Date().toISOString() };
const disk: AgendaItem = { ...base, id: "system:disk", title: "Disco quase cheio", description: "Restam 18,4 GB livres em C:.", organizer: "96%", tag: "severe" };
const memory: AgendaItem = { ...base, id: "system:memory", title: "Memória quase cheia", description: "28,9 GB de 32,0 GB em uso.", organizer: "90%", tag: "" };

async function show(list: AgendaItem[], onDismiss = (_id: string) => {}) {
  render(<Alert events={list} onDismiss={onDismiss} />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  events.length = 0;
  on = [];
});
afterEach(cleanup);

test("a system alert says what is wrong, how bad, and shakes when severe", async () => {
  await show([disk]);
  expect(screen.getByText("sistema")).toBeTruthy();
  expect(screen.getByText("grave")).toBeTruthy();
  expect(screen.getByText("Restam 18,4 GB livres em C:.")).toBeTruthy();
  expect(screen.getByRole("alertdialog").className).toContain("wx-enter-shake");
});

test("a calm one asks for attention and rises", async () => {
  await show([memory]);
  expect(screen.getByText("atenção")).toBeTruthy();
  expect(screen.getByRole("alertdialog").className).toContain("wx-enter-rise");
});

test("open System goes to the Sistema tab and closes the alert", async () => {
  const gone: string[] = [];
  await show([memory], (id) => gone.push(id));
  await act(async () => {
    fireEvent.click(screen.getByText("abrir Sistema"));
  });
  expect(events).toEqual([{ name: "canto://open-tab", payload: "system" }]);
  expect(gone).toEqual(["system:memory"]);
});

test("mute switches off only that kind of system alert", async () => {
  on = ["memory", "disk"];
  await show([memory]);
  await act(async () => {
    fireEvent.click(screen.getByText("silenciar"));
  });
  expect(calls.find((c) => c.cmd === "system_alerts_set")?.args).toEqual({ kinds: ["disk"] });
});
