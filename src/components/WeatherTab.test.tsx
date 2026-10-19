import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { WeatherView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: WeatherView;

const EMPTY: WeatherView = { place: null, forecast: null, fetched_at: 0, error: null };
const SAVED: WeatherView = {
  place: { city: "São Paulo", admin1: "São Paulo", country: "Brasil", lat: -23.5, lon: -46.6 },
  forecast: {
    now: { temp: 22.4, feels: 24.1, condition: "cloudy", humidity: 71, wind: 12.6, wind_dir: 90, is_day: true },
    hours: [
      { at: "2026-10-17T10:00", temp: 22.4, rain: 10, condition: "cloudy" },
      { at: "2026-10-17T11:00", temp: 25.2, rain: 70, condition: "rain" },
    ],
    days: [
      { date: "2026-10-17", min: 17, max: 27, rain: 80, condition: "rain", sunrise: "2026-10-17T05:40", sunset: "2026-10-17T18:12", uv: 8.4 },
      { date: "2026-10-18", min: 16.4, max: 27, rain: 80, condition: "rain", sunrise: "", sunset: "", uv: 0 },
      { date: "2026-10-19", min: 15, max: 25, rain: 60, condition: "clear", sunrise: "", sunset: "", uv: 0 },
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

test("without a city the tab hands the screen over to the search", async () => {
  await show();
  expect(screen.getByText("Escolher a cidade")).toBeTruthy();
  expect(screen.getByText(/Open-Meteo, que é aberta/)).toBeTruthy();
  expect(screen.getByLabelText("Cidade")).toBeTruthy();
});

test("with a city the card shows the sky, the details, the hours and the days", async () => {
  view = SAVED;
  await show();
  expect(screen.getByText("São Paulo · Brasil")).toBeTruthy();
  const now = document.querySelector("[data-weather-now]")!.textContent!;
  expect(now).toContain("22°C");
  expect(now).toContain("parcialmente nublado");
  expect(now).toContain("máx. 27° · mín. 17°");
  expect(screen.getByText("sensação de 24 °C")).toBeTruthy();
  expect(screen.getByText("chuva a partir das 11:00")).toBeTruthy();
  expect(document.querySelector("section[data-sky]")?.getAttribute("data-sky")).toBe("cloudy");

  const details = document.querySelector("[data-weather-details]")!.textContent!;
  expect(details).toContain("71%");
  expect(details).toContain("13km/h");
  expect(details).toContain("8muito alto");
  expect(details).toContain("05:40");
  expect(details).toContain("18:12");

  const hours = document.querySelectorAll("[data-weather-hour]");
  expect(hours).toHaveLength(2);
  expect(hours[0].textContent).toContain("agora");
  expect(hours[0].textContent).toContain("22°");
  expect(hours[1].textContent).toContain("11:00");
  expect(hours[1].textContent).toContain("70%");
  expect(document.querySelector("[data-weather-hours] path.wx-draw")?.getAttribute("d")).toContain("C");

  const days = document.querySelectorAll("[data-weather-day]");
  expect(days).toHaveLength(3);
  expect(days[0].textContent).toContain("hoje");
  expect(days[0].textContent).toContain("17°");
  expect(days[0].textContent).toContain("27°");
  expect(days[2].textContent).toContain("céu limpo");
  expect(days[2].textContent).toContain("60%");
  expect(screen.getByText(/dados: Open-Meteo/).textContent).toContain("atualizado às");
});

test("an hour after the sunset is drawn as night", async () => {
  view = {
    ...SAVED,
    forecast: { ...SAVED.forecast!, now: { ...SAVED.forecast!.now, is_day: false, condition: "clear" } },
  };
  await show();
  expect(document.querySelector("section[data-sky]")?.getAttribute("data-night")).toBe("true");
});

test("atualizar bypasses the cache", async () => {
  view = SAVED;
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "atualizar" })));
  expect(calls.filter((c) => c.cmd === "weather_get").map((c) => c.args)).toEqual([{ force: false }, { force: true }]);
});

test("trocar de cidade opens the picker without forgetting the saved one, and voltar returns to the card", async () => {
  view = SAVED;
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "trocar de cidade" })));
  expect(screen.getByText("Escolher a cidade")).toBeTruthy();
  expect(calls.some((c) => c.cmd === "weather_clear")).toBe(false);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /voltar/ })));
  expect(screen.getByText("São Paulo · Brasil")).toBeTruthy();
});

test("esquecer a cidade clears the saved city and leaves the picker without a way back", async () => {
  view = SAVED;
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "trocar de cidade" })));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "esquecer a cidade" })));
  expect(calls.some((c) => c.cmd === "weather_clear")).toBe(true);
  expect(screen.getByText("Escolher a cidade")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /voltar/ })).toBeNull();
});

test("a failed reading is shown above the card that is still there", async () => {
  view = { ...SAVED, forecast: null, error: "sem resposta da Open-Meteo" };
  await show();
  expect(screen.getByRole("alert").textContent).toBe("sem resposta da Open-Meteo");
  expect(screen.getByText("São Paulo · Brasil")).toBeTruthy();
  expect(screen.getByRole("button", { name: "trocar de cidade" })).toBeTruthy();
});
