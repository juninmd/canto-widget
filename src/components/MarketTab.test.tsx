import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { MarketView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: MarketView;

const LIVE: MarketView = {
  quotes: [
    { symbol: "USD/BRL", price: 5.4237, change: 0.31, points: [5.4, 5.41, 5.43, 5.42] },
    { symbol: "EUR/BRL", price: 5.88, change: -0.12, points: [5.9, 5.89, 5.88] },
    { symbol: "IBOV", price: 132540.4, change: -0.44, points: [133100, 132800, 132540] },
  ],
  fetched_at: Date.now(),
  error: null,
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    return Promise.resolve(cmd === "market_get" ? view : null);
  },
}));

const { default: MarketTab } = await import("./MarketTab");

beforeEach(() => {
  calls.length = 0;
  view = LIVE;
});
afterEach(cleanup);

test("the live quotes show with the day's variation and no prototype badge", async () => {
  render(<MarketTab />);
  expect(await screen.findByText("+0,31% no dia")).toBeTruthy();
  expect(screen.getAllByText("Dólar")).toHaveLength(2);
  expect(screen.getAllByText("5,42")).toHaveLength(2);
  expect(screen.getByText("132.540")).toBeTruthy();
  expect(screen.getByText("-0,44%")).toBeTruthy();
  expect(document.querySelectorAll("[data-market-quote]")).toHaveLength(3);
  expect(document.querySelectorAll("[data-market-delta=down]")).toHaveLength(2);
  expect(screen.queryByText(/protótipo/i)).toBeNull();
  expect(screen.getByText(/dados: Yahoo Finance · atualizado às/)).toBeTruthy();
  expect(calls).toEqual([{ cmd: "market_get", args: { force: false } }]);
});

test("picking a card moves its curve to the spotlight", async () => {
  render(<MarketTab />);
  fireEvent.click(await screen.findByRole("button", { name: /Ibovespa/ }));
  expect(document.querySelector("[data-market-hero]")?.getAttribute("data-market-hero")).toBe("IBOV");
  expect(screen.getByRole("button", { name: /Ibovespa/ }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("-0,44% no dia")).toBeTruthy();
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
  expect(screen.getByText("+0,31% no dia")).toBeTruthy();
});
