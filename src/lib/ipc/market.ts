import { invoke } from "@tauri-apps/api/core";

export type MarketGroup = "fx" | "index" | "crypto";
/** One Mercado quote; `points` run through the session up to the live price, `times` in unix seconds. */
export type MarketQuote = {
  symbol: string;
  group: MarketGroup;
  price: number;
  change: number;
  points: number[];
  times: number[];
  currency: string | null;
  prev_close: number | null;
  open: number | null;
  day_low: number | null;
  day_high: number | null;
  year_low: number | null;
  year_high: number | null;
  market_time: number | null;
  /** Today's regular session, unix seconds. */
  session: [number, number] | null;
};
/** The spotlight's longer periods, as Yahoo names them. */
export type MarketRange = "1d" | "5d" | "1mo" | "6mo" | "1y";
export type MarketHistory = { points: number[]; times: number[] };
export type MarketView = {
  quotes: MarketQuote[];
  fetched_at: number;
  /** Set when the reading failed; the last good quotes still come through with it. */
  error: string | null;
};

export const marketApi = {
  /** Mercado: Yahoo Finance quotes; Rust keeps them for 15 min. */
  marketGet: (force = false) => invoke<MarketView>("market_get", { force }),
  /** One asset over a longer period, for the spotlight; also cached for 15 min. */
  marketHistory: (symbol: string, range: MarketRange) => invoke<MarketHistory>("market_history", { symbol, range }),
};
