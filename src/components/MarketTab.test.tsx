import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { MarketQuote, MarketView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: MarketView;
let history: unknown;

const quote = (over: Partial<MarketQuote>): MarketQuote => ({
  symbol: "USD/BRL", group: "fx", price: 1, change: 0, points: [1], times: [1], currency: "BRL",
  prev_close: null, open: null, day_low: null, day_high: null, year_low: null, year_high: null,
  market_time: null, session: null, ...over,
});

const LIVE: MarketView = {
  quotes: [
    quote({ price: 5.4237, change: 0.31, points: [5.41, 5.43, 5.42], times: [1, 2, 3], prev_close: 5.4071, open: 5.401, day_low: 5.38, day_high: 5.44, year_low: 4.9, year_high: 6.1 }),
    quote({ symbol: "EUR/BRL", price: 5.88, change: -0.12, points: [5.89, 5.88], times: [1, 2], prev_close: 5.887 }),
    quote({ symbol: "IBOV", group: "index", price: 132540.4, change: -0.44, points: [133100, 132540], times: [1, 2], prev_close: 133126 }),
    quote({ symbol: "BTC/USD", group: "crypto", price: 118402, change: 1.24, points: [116950, 118402], times: [1, 2], currency: "USD", prev_close: 116950 }),
  ],
  fetched_at: Date.now(),
  error: null,
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "market_history") return history instanceof Error ? Promise.reject(history) : Promise.resolve(history);
    return Promise.resolve(cmd === "market_get" ? view : null);
  },
}));

const { default: MarketTab } = await import("./MarketTab");

beforeEach(() => {
  calls.length = 0;
  view = LIVE;
  history = { points: [5.0, 5.2, 5.4237], times: [1, 2, 3] };
});
afterEach(cleanup);

const hero = () => document.querySelector("[data-market-hero]")?.getAttribute("data-market-hero");
const move = () => document.querySelector("[data-market-move]")?.textContent ?? "";

test("the spotlight shows the price with its unit, the move in value and percent, and the day's numbers", async () => {
  render(<MarketTab />);
  await screen.findByText("Abertura");
  expect(hero()).toBe("USD/BRL");
  expect(move()).toBe("+0,0166 (+0,31%) hoje");
  expect(screen.getByText("R$")).toBeTruthy();
  expect(screen.getByText("Fech. anterior")).toBeTruthy();
  expect(screen.getByText("Faixa do dia")).toBeTruthy();
  expect(screen.getByText("52 semanas")).toBeTruthy();
  expect(screen.getByText("6,10")).toBeTruthy();
  expect(document.querySelectorAll("[data-market-quote]")).toHaveLength(4);
  expect(screen.getByText("▲ 2 em alta")).toBeTruthy();
  expect(screen.getByText("2 em baixa ▼")).toBeTruthy();
  expect(screen.getByText(/dados: Yahoo Finance · atualizado às .* · até 15 min de atraso/)).toBeTruthy();
  expect(calls).toEqual([{ cmd: "market_get", args: { force: false } }]);
});

test("picking a row moves it to the spotlight; an index reads in points and coins never close", async () => {
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: /Ibovespa/ }));
  expect(hero()).toBe("IBOV");
  expect(screen.getByText("pts")).toBeTruthy();
  expect(screen.getByRole("button", { name: /Ibovespa/ }).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: /Bitcoin/ }));
  expect(document.querySelector("[data-market-state]")?.textContent).toBe("24 horas");
});

test("the groups filter the watchlist and the sort cycles through gainers and losers", async () => {
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: "Cripto" }));
  expect(document.querySelectorAll("[data-market-quote]")).toHaveLength(1);
  expect(hero()).toBe("BTC/USD");
  fireEvent.click(screen.getByRole("button", { name: "Tudo" }));
  fireEvent.click(screen.getByRole("button", { name: /ordem: padrão/ }));
  const order = () => [...document.querySelectorAll("[data-market-quote]")].map((el) => el.getAttribute("data-market-quote"));
  expect(order()).toEqual(["BTC/USD", "USD/BRL", "EUR/BRL", "IBOV"]);
  fireEvent.click(screen.getByRole("button", { name: /maiores altas/ }));
  expect(order()[0]).toBe("IBOV");
});

test("a longer period loads that asset's history and measures the move from its start", async () => {
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: "1M" }));
  await waitFor(() => expect(move()).toBe("+0,4237 (+8,47%) em 1 mês"));
  expect(calls.at(-1)).toEqual({ cmd: "market_history", args: { symbol: "USD/BRL", range: "1mo" } });
});

test("a period that fails to load says so and keeps the day's curve", async () => {
  history = new Error("sem resposta do Yahoo Finance");
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: "1A" }));
  expect(await screen.findByText(/não deu para ler esse período/)).toBeTruthy();
  expect(move()).toContain("hoje");
});

test("a period that failed can be retried without leaving it", async () => {
  history = new Error("sem resposta do Yahoo Finance");
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: "1A" }));
  await screen.findByText(/não deu para ler esse período/);
  history = { points: [5.0, 5.2, 5.4237], times: [1, 2, 3] };
  fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  await waitFor(() => expect(screen.queryByText(/não deu para ler esse período/) === null).toBe(true));
  await waitFor(() => expect(move()).toContain("+8,47%"));
  expect(calls.filter((c) => c.cmd === "market_history").length).toBe(2);
});

test("refreshing forces a new reading past the cache", async () => {
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: "atualizar" }));
  expect(calls.at(-1)).toEqual({ cmd: "market_get", args: { force: true } });
});

test("a failed reading with nothing cached says why and offers a retry", async () => {
  view = { quotes: [], fetched_at: 0, error: "sem resposta do Yahoo Finance" };
  render(<MarketTab />);
  expect((await screen.findByRole("alert")).textContent).toContain("sem resposta do Yahoo Finance");
});

test("a failed refresh keeps the last quotes on screen under the error", async () => {
  view = { ...LIVE, error: "sem resposta do Yahoo Finance" };
  render(<MarketTab />);
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(hero()).toBe("USD/BRL");
});

test("an answer with no quotes and no error says so with a retry instead of an endless skeleton", async () => {
  view = { quotes: [], fetched_at: 0, error: null };
  render(<MarketTab />);
  expect(await screen.findByText(/nenhuma cotação chegou agora/)).toBeTruthy();
  expect(screen.queryByText("consultando as cotações")).toBeNull();
  view = LIVE;
  fireEvent.click(screen.getByText("tentar de novo"));
  await screen.findByText("Abertura");
  expect(calls.map((c) => c.args.force)).toEqual([false, true]);
});
