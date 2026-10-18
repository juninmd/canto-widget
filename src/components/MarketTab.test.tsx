import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { MarketView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: MarketView;
let failure = "";

const QUOTES: MarketView = {
  quotes: [
    { symbol: "USD/BRL", label: "Dólar", value: 5.0826, change: 0.6038, decimals: 4 },
    { symbol: "BTC/BRL", label: "Bitcoin", value: 411553, change: -0.51, decimals: 0 },
    { symbol: "IBOV", label: "Ibovespa", value: 205430.33, change: 0.54, decimals: 2 },
  ],
  fetched_at: Date.now(),
  error: null,
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "market_get") return failure ? Promise.reject(failure) : Promise.resolve(view);
    return Promise.resolve(null);
  },
}));

const { default: MarketTab } = await import("./MarketTab");

async function show() {
  render(<MarketTab />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  view = QUOTES;
  failure = "";
});
afterEach(cleanup);

test("each quote is a row: its label, the number and the day's variation", async () => {
  await show();
  expect(screen.getByText("cotações")).toBeTruthy();
  const dollar = document.querySelector("[data-market-quote='USD/BRL']")!;
  expect(dollar.textContent).toContain("Dólar");
  expect(dollar.textContent).toContain("5,0826");
  expect(dollar.textContent).toContain("+0,60% no dia");
  const bitcoin = document.querySelector("[data-market-quote='BTC/BRL']")!;
  expect(bitcoin.textContent).toContain("411.553");
  expect(bitcoin.textContent).toContain("-0,51% no dia");
  expect(document.querySelectorAll("[data-market-quote]")).toHaveLength(3);
});

test("atualizar goes back to the sources", async () => {
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "atualizar" })));
  expect(calls.filter((c) => c.cmd === "market_get").map((c) => c.args)).toEqual([
    { force: false },
    { force: true },
  ]);
});

test("a reading that failed keeps the last list on the card and says when it was read", async () => {
  view = { ...QUOTES, error: "sem resposta da fonte" };
  await show();
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível atualizar");
  expect(document.querySelectorAll("[data-market-quote]")).toHaveLength(3);
});

test("a reading that failed with nothing cached says so instead of showing an empty card", async () => {
  view = { quotes: [], fetched_at: 0, error: "sem resposta da fonte" };
  await show();
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar");
  expect(document.querySelectorAll("[data-market-quote]")).toHaveLength(0);
});

test("a command that rejects shows the error and offers the retry", async () => {
  failure = "sem resposta da fonte";
  await show();
  expect(screen.getByRole("alert").textContent).toContain("sem resposta da fonte");
  expect(screen.getByRole("button", { name: "tentar de novo" })).toBeTruthy();
});

test("the sources are named in the footnote", async () => {
  await show();
  expect(screen.getByText("BCB · CoinGecko · CNBC")).toBeTruthy();
});
