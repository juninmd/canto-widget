import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../../lib/api";

const calls: { cmd: string; args: Record<string, unknown> }[] = [];
const events: { name: string; payload: unknown }[] = [];
let on: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "weather_alerts_get") return Promise.resolve(on);
    if (cmd === "weather_alerts_set") return Promise.resolve(args.kinds);
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
mock.module("./sound", () => ({ playAlert: () => {} }));

const { default: Alert } = await import("./Alert");

const base = { end: "", all_day: false, location: "", meet: "", link: "", start: new Date().toISOString() };
const storm: AgendaItem = { ...base, id: "weather:storm", title: "Tempestade a caminho", description: "Trovoadas (16:00). Evite sair.", organizer: "16:00", tag: "severe" };
const rain: AgendaItem = { ...base, id: "weather:rain", title: "Leve guarda-chuva", description: "Chuva por volta das 15:00 (70%).", organizer: "70%", tag: "" };

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

test("a weather alert shows its sky, its number under the icon and a clear severity", async () => {
  await show([storm]);
  expect(screen.getByRole("alertdialog").querySelector("[data-weather-fx]") === null).toBe(false);
  expect(screen.getByText("16:00", { selector: "span.font-mono" })).toBeTruthy();
  expect(screen.getByText("grave")).toBeTruthy();
  expect(screen.getByText("Trovoadas (16:00). Evite sair.")).toBeTruthy();
  expect(screen.getByRole("alertdialog").className).toContain("wx-severe");
  expect(screen.getByRole("alertdialog").className).toContain("wx-enter-shake");
});

test("a calm weather alert gets no alarm and says to pay attention", async () => {
  await show([rain]);
  expect(screen.getByText("atenção")).toBeTruthy();
  expect(screen.getByRole("alertdialog").className.includes("wx-severe")).toBe(false);
  expect(screen.getByRole("alertdialog").className).toContain("wx-enter-drop");
});

test("the pending strip counts the severe ones", async () => {
  await show([rain, storm]);
  expect(screen.getByText("1 grave")).toBeTruthy();
});

test("view forecast opens the Clima tab and closes the alert", async () => {
  const gone: string[] = [];
  await show([rain], (id) => gone.push(id));
  await act(async () => {
    fireEvent.click(screen.getByText("ver previsão"));
  });
  expect(events).toEqual([{ name: "canto://open-tab", payload: "weather" }]);
  expect(calls.some((c) => c.cmd === "alert_close" && c.args.outcome === "done")).toBe(true);
  expect(gone).toEqual(["weather:rain"]);
});

test("mute switches off only that kind of weather alert", async () => {
  on = ["rain", "storm"];
  await show([rain]);
  await act(async () => {
    fireEvent.click(screen.getByText("silenciar"));
  });
  expect(calls.find((c) => c.cmd === "weather_alerts_set")?.args).toEqual({ kinds: ["storm"] });
});
