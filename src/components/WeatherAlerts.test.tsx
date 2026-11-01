import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let saved: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "weather_alerts_get") return Promise.resolve(saved);
    if (cmd === "weather_alerts_set") return Promise.resolve(args.kinds);
    return Promise.resolve(null);
  },
}));

const { default: WeatherAlerts } = await import("./WeatherAlerts");

async function show() {
  render(<WeatherAlerts index={0} />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  saved = [];
});
afterEach(cleanup);

test("folded, the card says how many alerts are on", async () => {
  saved = ["rain", "heat"];
  await show();
  expect(screen.getByText("Avisos do clima")).toBeTruthy();
  expect(screen.getByText("2 de 11 ligados")).toBeTruthy();
  expect(screen.queryByText("chuva: guarda-chuva") === null).toBe(true);
});

test("each kind switches on and off on its own, in the catalogue's order", async () => {
  saved = ["heat"];
  await show();
  fireEvent.click(screen.getByText("Avisos do clima"));
  await act(async () => {
    fireEvent.click(screen.getByText("chuva: guarda-chuva"));
  });
  expect(calls.at(-1)).toEqual({ cmd: "weather_alerts_set", args: { kinds: ["rain", "heat"] } });
  await act(async () => {
    fireEvent.click(screen.getByText("calor: beber água"));
  });
  expect(calls.at(-1)?.args).toEqual({ kinds: ["rain"] });
  await act(async () => {
    fireEvent.click(screen.getByText("ligar todos"));
  });
  expect((calls.at(-1)?.args.kinds as string[]).length).toBe(11);
  expect(screen.getByText("desligar todos")).toBeTruthy();
});
