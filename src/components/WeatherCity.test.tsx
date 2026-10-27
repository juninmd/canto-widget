import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { WeatherPlace, WeatherView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
const saved: WeatherView[] = [];
let results: WeatherPlace[] = [];
let failure = "";
let clearFailure = "";
let saveGate: (() => void) | null = null;

const LONDON: WeatherPlace = { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5, lon: -0.1 };
const CATAMARCA: WeatherPlace = { city: "Londres", admin1: "Catamarca", country: "Argentina", lat: -27.0, lon: -67.0 };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "weather_search") return failure ? Promise.reject(failure) : Promise.resolve(results);
    if (cmd === "weather_set_place") {
      const view = { place: args.place, forecast: null, fetched_at: 1, error: null } as WeatherView;
      if (saveGate === null) return Promise.resolve(view);
      return new Promise((r) => (saveGate = () => r(view)));
    }
    if (cmd === "weather_clear") return clearFailure ? Promise.reject(clearFailure) : Promise.resolve({ place: null } as unknown as WeatherView);
    return Promise.resolve(null);
  },
}));

const { default: WeatherCity } = await import("./WeatherCity");

async function show(props: { onBack?: () => void } = {}) {
  render(<WeatherCity onSaved={(view) => saved.push(view)} {...props} />);
}

const field = () => screen.getByRole("combobox", { name: "Cidade" });
const wait = (ms: number) => act(async () => void (await new Promise((r) => setTimeout(r, ms))));

async function type(value: string) {
  await act(async () => fireEvent.change(field(), { target: { value } }));
}

async function search() {
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "buscar" })));
}

beforeEach(() => {
  calls.length = 0;
  saved.length = 0;
  results = [];
  failure = "";
  clearFailure = "";
  saveGate = null;
});
afterEach(() => {
  cleanup();
  localStorage.removeItem("canto.weather.recent");
});

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
  const options = screen.getAllByRole("option");
  expect(options.map((o) => o.textContent)).toEqual(["LondresInglaterra, Reino Unido›", "LondresCatamarca, Argentina›"]);
  expect(calls.some((c) => c.cmd === "weather_set_place")).toBe(false);
});

test("picking a candidate saves its coordinates, not its name, and remembers the pick", async () => {
  results = [LONDON, CATAMARCA];
  await show();
  await type("Londres");
  await search();
  await act(async () => fireEvent.click(screen.getByRole("option", { name: /Reino Unido/ })));
  expect(calls.find((c) => c.cmd === "weather_set_place")?.args).toEqual({ place: LONDON });
  expect(saved).toHaveLength(1);
  expect(saved[0].place).toEqual(LONDON);
  expect(JSON.parse(localStorage.getItem("canto.weather.recent")!)).toEqual([LONDON]);
});

test("the results appear while typing, after a pause, and a single match is not saved on its own", async () => {
  results = [{ city: "Franca", admin1: "São Paulo", country: "Brasil", lat: -20.5, lon: -47.4 }];
  await show();
  await type("Fr");
  expect(calls).toHaveLength(0);
  await wait(450);
  expect(calls.map((c) => c.cmd)).toEqual(["weather_search"]);
  expect(screen.getByRole("option", { name: /Franca/ })).toBeTruthy();
  expect(calls.some((c) => c.cmd === "weather_set_place")).toBe(false);
});

test("one letter is not searched and clearing the field drops the list", async () => {
  results = [LONDON];
  await show();
  await type("L");
  await wait(450);
  expect(calls).toHaveLength(0);
  await type("Lo");
  await wait(450);
  expect(screen.getAllByRole("option")).toHaveLength(1);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "limpar a busca" })));
  expect(screen.queryByRole("option")).toBeNull();
  expect((field() as HTMLInputElement).value).toBe("");
});

test("arrow keys move through the list and Enter picks the highlighted city", async () => {
  results = [LONDON, CATAMARCA];
  await show();
  await type("Londres");
  await search();
  expect(field().getAttribute("aria-activedescendant")).toBe("wx-opt-0");
  await act(async () => fireEvent.keyDown(field(), { key: "ArrowDown" }));
  expect(screen.getByRole("option", { name: /Argentina/ }).getAttribute("aria-selected")).toBe("true");
  await act(async () => fireEvent.keyDown(field(), { key: "ArrowDown" }));
  expect(screen.getByRole("option", { name: /Reino Unido/ }).getAttribute("aria-selected")).toBe("true");
  await act(async () => fireEvent.keyDown(field(), { key: "ArrowUp" }));
  await act(async () => fireEvent.keyDown(field(), { key: "Enter" }));
  expect(calls.find((c) => c.cmd === "weather_set_place")?.args).toEqual({ place: CATAMARCA });
});

test("a single match of an explicit search is saved without a second click", async () => {
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
  expect(screen.queryByRole("option")).toBeNull();
});

test("a city the API did not give a state for still shows its country", async () => {
  results = [{ city: "Franca", admin1: "", country: "Brasil", lat: -20.5, lon: -47.4 }, LONDON];
  await show();
  await type("Franca");
  await search();
  expect(screen.getAllByRole("option")[0].textContent).toContain("Brasil");
});

test("before typing, a popular city is one click away and saves its fixed coordinates", async () => {
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Recife" })));
  expect(calls).toHaveLength(1);
  expect(calls[0]).toEqual({
    cmd: "weather_set_place",
    args: { place: { city: "Recife", admin1: "PE", country: "Brasil", lat: -8.0476, lon: -34.877 } },
  });
});

test("the cities picked before come first and the popular row hides while typing", async () => {
  localStorage.setItem("canto.weather.recent", JSON.stringify([LONDON]));
  await show();
  expect(screen.getByText("recentes")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Londres" })).toBeTruthy();
  expect(screen.getByText("cidades populares")).toBeTruthy();
  await type("Lo");
  expect(screen.queryByText("cidades populares")).toBeNull();
  expect(screen.queryByText("recentes")).toBeNull();
});

test("voltar only exists when there is a saved city to go back to", async () => {
  let back = 0;
  await show({ onBack: () => back++ });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: /voltar/ })));
  expect(back).toBe(1);
  cleanup();
  await show();
  expect(screen.queryByRole("button", { name: /voltar/ })).toBeNull();
});

test("Enter twice while the city is saving saves it once", async () => {
  results = [LONDON, CATAMARCA];
  saveGate = () => {};
  await show();
  await type("Londres");
  await wait(400);
  await act(async () => {
    fireEvent.keyDown(field(), { key: "Enter" });
    fireEvent.keyDown(field(), { key: "Enter" });
  });
  expect(calls.filter((c) => c.cmd === "weather_set_place").length).toBe(1);
  await act(async () => saveGate!());
  expect(saved.length).toBe(1);
});

test("a failed forget explains why and keeps the picker open", async () => {
  clearFailure = "disco cheio";
  const forgotten: WeatherView[] = [];
  render(<WeatherCity onSaved={() => {}} onBack={() => {}} onForgotten={(v) => forgotten.push(v)} />);
  await act(async () => {
    fireEvent.click(screen.getByText("esquecer a cidade"));
  });
  expect(screen.getByRole("alert").textContent).toContain("disco cheio");
  expect(forgotten.length).toBe(0);
  clearFailure = "";
  await act(async () => {
    fireEvent.click(screen.getByText("esquecer a cidade"));
  });
  expect(forgotten.length).toBe(1);
  expect(screen.queryByRole("alert") === null).toBe(true);
});
