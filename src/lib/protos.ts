/**
 * Prototype fixtures for the suggested tabs that are still mockups: invented data only, so the shape of each
 * idea can be judged before any backend exists. Nothing here talks to the network or to the vault.
 */
import { LOCALE } from "../i18n";

export type ProtoQuote = { symbol: string; label: string; value: string; change: number; points: number[] };

export const MARKET: ProtoQuote[] = [
  { symbol: "USD/BRL", label: "Dólar (PTAX)", value: "5,42", change: 0.31, points: [5.39, 5.41, 5.4, 5.43, 5.42, 5.44, 5.42] },
  { symbol: "EUR/BRL", label: "Euro", value: "5,88", change: -0.12, points: [5.9, 5.91, 5.89, 5.9, 5.88, 5.87, 5.88] },
  { symbol: "BTC/USD", label: "Bitcoin", value: "118.402", change: 1.24, points: [116.1, 117.4, 117.0, 118.2, 117.9, 118.6, 118.4] },
  { symbol: "IBOV", label: "Ibovespa", value: "132.540", change: -0.44, points: [133.2, 133.0, 132.8, 133.1, 132.7, 132.6, 132.5] },
];

/** Signed percentage without the symbol, in the user's locale ("+0,31"); the catalog carries the "%". */
export function signedPercent(value: number): string {
  const abs = Math.abs(value).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : "+"}${abs}`;
}
