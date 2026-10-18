import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { WeatherPlace, WeatherView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
const saved: WeatherView[] = [];
let results: WeatherPlace[] = [];
let failure = "";

const LONDON: WeatherPlace = { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5, lon: -0.1 };
const CATAMARCA: WeatherPlace = { city: "Londres", admin1: "Catamarca", country: "Argentina", lat: -27.0, lon: -67.0 };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "weather_search") return failure ? Promise.reject(failure) : Promise.resolve(results);
    if (cmd === "weather_set_place") {
      return Promise.resolve({ place: args.place, forecast: null, fetched_at: 1, error: null } as WeatherView);
    }
    return Promise.resolve(null);
  },
}));

const { default: WeatherCity } = await import("./WeatherCity");

async function show() {
  render(<WeatherCity onSaved={(view) => saved.push(view)} />);
}

async function type(value: string) {
  await act(async () => fireEvent.change(screen.getByLabelText("Cidade"), { target: { value } }));
}

async function search() {
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "buscar" })));
}

beforeEach(() => {
  calls.length = 0;
  saved.length = 0;
  results = [];
  failure = "";
});
afterEach(cleanup);

test("the search sends the typed name and nothing else", async () => {
  results = [LONDON];
  await show();
  await type("Londres");
  await search();
  expect(calls[0]).toEqual({ cmd: "weather_search", args: { query: "Londres" } });
});

test("every candidate is offered with its state, so two cities of the same name can be told apart", async () => {
  results = [LONDON, CATAMARCA];
  await show();
  await type("Londres");
  await search();
  expect(screen.getByText("Londres · Inglaterra, Reino Unido")).toBeTruthy();
  expect(screen.getByText("Londres · Catamarca, Argentina")).toBeTruthy();
  expect(calls.some((c) => c.cmd === "weather_set_place")).toBe(false);
});

test("picking a candidate saves its coordinates, not its name", async () => {
  results = [LONDON, CATAMARCA];
  await show();
  await type("Londres");
  await search();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /Reino Unido/ })));
  expect(calls.find((c) => c.cmd === "weather_set_place")?.args).toEqual({ place: LONDON });
  expect(saved).toHaveLength(1);
  expect(saved[0].place).toEqual(LONDON);
});

test("a single match is saved without a second click", async () => {
  results = [{ city: "Franca", admin1: "São Paulo", country: "Brasil", lat: -20.5, lon: -47.4 }];
  await show();
  await type("Franca");
  await search();
  expect(calls.find((c) => c.cmd === "weather_set_place")?.args).toEqual({
    place: { city: "Franca", admin1: "São Paulo", country: "Brasil", lat: -20.5, lon: -47.4 },
  });
});

test("a name with no match says so instead of saving a guess", async () => {
  results = [];
  await show();
  await type("Xyzzy");
  await search();
  expect(screen.getByText("nada encontrado")).toBeTruthy();
  expect(calls.some((c) => c.cmd === "weather_set_place")).toBe(false);
});

test("a failed search is reported and leaves no candidate behind", async () => {
  failure = "sem resposta da Open-Meteo";
  await show();
  await type("Londres");
  await search();
  expect(screen.getByRole("alert").textContent).toBe("sem resposta da Open-Meteo");
  expect(screen.queryByText(/Inglaterra/)).toBeNull();
});

test("a city the API did not give a state for still shows its country", async () => {
  results = [{ city: "Franca", admin1: "", country: "Brasil", lat: -20.5, lon: -47.4 }, LONDON];
  await show();
  await type("Franca");
  await search();
  expect(screen.getByText("Franca · Brasil")).toBeTruthy();
});
