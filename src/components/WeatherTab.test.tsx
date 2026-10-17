import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { WeatherView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: WeatherView;

const EMPTY: WeatherView = { place: null, forecast: null, fetched_at: 0, error: null };
const SAVED: WeatherView = {
  place: { city: "São Paulo", country: "Brasil", lat: -23.5, lon: -46.6 },
  forecast: {
    now: { temp: 22.4, feels: 24.1, condition: "cloudy" },
    hours: [
      { at: "2026-10-17T10:00", temp: 22.4, rain: 10, condition: "cloudy" },
      { at: "2026-10-17T11:00", temp: 25.2, rain: 70, condition: "rain" },
    ],
    days: [
      { date: "2026-10-18", min: 16.4, max: 27, rain: 80, condition: "rain" },
      { date: "2026-10-19", min: 15, max: 25, rain: 60, condition: "clear" },
    ],
    rain_from: "2026-10-17T11:00",
  },
  fetched_at: Date.now(),
  error: null,
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "weather_get") return Promise.resolve(view);
    if (cmd === "weather_set_city") {
      return Promise.reject("configuração: cidade não encontrada: Xyz");
    }
    if (cmd === "weather_clear") return Promise.resolve(EMPTY);
    return Promise.resolve(null);
  },
}));

const { default: WeatherTab } = await import("./WeatherTab");

async function show() {
  render(<WeatherTab />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  view = EMPTY;
});
afterEach(cleanup);

test("without a city the tab asks for one and reports a name it cannot resolve", async () => {
  await show();
  expect(screen.getByText("Escolher a cidade")).toBeTruthy();
  expect(screen.getByText(/Open-Meteo, que é aberta/)).toBeTruthy();
  await act(async () => fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Xyz" } }));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "buscar" })));
  expect(calls.find((c) => c.cmd === "weather_set_city")?.args).toEqual({ city: "Xyz" });
  expect(screen.getByRole("alert").textContent).toContain("cidade não encontrada");
});

test("with a city the card shows now, the hours, the days and the rain window", async () => {
  view = SAVED;
  await show();
  expect(screen.getByText("São Paulo · Brasil")).toBeTruthy();
  expect(document.querySelector("[data-weather-now]")?.textContent).toContain("22°C");
  expect(document.querySelector("[data-weather-now]")?.textContent).toContain("parcialmente nublado");
  expect(screen.getByText("sensação de 24 °C")).toBeTruthy();
  expect(screen.getByText("chuva a partir das 11:00")).toBeTruthy();
  expect(screen.getByText("10:00 22°")).toBeTruthy();
  const day = document.querySelector("[data-weather-day]")!;
  expect(day.textContent).toContain("27° / 16°");
  expect(day.textContent).toContain("chuva");
  expect(day.textContent).not.toContain("80% de chuva");
  expect(document.querySelectorAll("[data-weather-day]")[1].textContent).toContain("céu limpo · 60% de chuva");
  expect(document.querySelector("polyline")?.getAttribute("points")).toBeTruthy();
});

test("atualizar bypasses the cache and trocar de cidade forgets the saved one", async () => {
  view = SAVED;
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "atualizar" })));
  expect(calls.filter((c) => c.cmd === "weather_get").map((c) => c.args)).toEqual([{ force: false }, { force: true }]);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "esquecer a cidade" })));
  expect(calls.some((c) => c.cmd === "weather_clear")).toBe(true);
  expect(screen.getByText("Escolher a cidade")).toBeTruthy();
});

test("a failed reading is shown above the card that is still there", async () => {
  view = { ...SAVED, forecast: null, error: "sem resposta da Open-Meteo" };
  await show();
  expect(screen.getByRole("alert").textContent).toBe("sem resposta da Open-Meteo");
  expect(screen.getByText("São Paulo · Brasil")).toBeTruthy();
});
