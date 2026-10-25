import { LOCALE, t } from "../i18n";
import type { MarketGroup, MarketQuote, MarketRange } from "./api";

type Named = Pick<MarketQuote, "symbol" | "group">;

const CURRENCIES: Record<string, Parameters<typeof t>[0]> = {
  "USD/BRL": "protos.market.usd",
  "EUR/BRL": "protos.market.eur",
  "GBP/BRL": "protos.market.gbp",
  "JPY/BRL": "protos.market.jpy",
  "CHF/BRL": "protos.market.chf",
  "CAD/BRL": "protos.market.cad",
  "AUD/BRL": "protos.market.aud",
  "CNY/BRL": "protos.market.cny",
  "ARS/BRL": "protos.market.ars",
  "EUR/USD": "protos.market.eurusd",
};
const BRANDS: Record<string, string> = {
  IBOV: "Ibovespa",
  NASDAQ: "Nasdaq",
  "DOW JONES": "Dow Jones",
  "NIKKEI 225": "Nikkei 225",
  "BTC/USD": "Bitcoin",
  "ETH/USD": "Ethereum",
  "SOL/USD": "Solana",
  "XRP/USD": "XRP",
  "BNB/USD": "BNB",
  "DOGE/USD": "Dogecoin",
  "ADA/USD": "Cardano",
};
/** A short mark for the row's badge: the currency sign, the index's country, the coin's symbol. */
const GLYPHS: Record<string, string> = {
  "USD/BRL": "US$", "EUR/BRL": "€", "GBP/BRL": "£", "JPY/BRL": "¥", "CHF/BRL": "CHF", "CAD/BRL": "C$", "AUD/BRL": "A$", "CNY/BRL": "元", "ARS/BRL": "AR$", "EUR/USD": "€/$",
  IBOV: "BR", "S&P 500": "US", NASDAQ: "US", "DOW JONES": "US", DAX: "DE", "FTSE 100": "UK", "NIKKEI 225": "JP",
  "BTC/USD": "₿", "ETH/USD": "Ξ", "SOL/USD": "SOL", "XRP/USD": "XRP", "BNB/USD": "BNB", "DOGE/USD": "Ð", "ADA/USD": "ADA",
};

/** What each quote is called on screen; brands and tickers stay as they are. */
export function quoteLabel(symbol: string): string {
  const key = CURRENCIES[symbol];
  return key ? t(key) : (BRANDS[symbol] ?? symbol);
}

export function quoteGlyph(symbol: string): string {
  return GLYPHS[symbol] ?? symbol.slice(0, 3);
}

/** Reais keep cents, cheap currencies and coins get four digits, indexes and big coins read as whole numbers. */
export function priceDigits({ symbol, group }: Named, price: number): number {
  if (group === "index") return 0;
  if (group === "crypto") return price >= 1000 ? 0 : price >= 1 ? 2 : 4;
  return price < 1 || !symbol.endsWith("/BRL") ? 4 : 2;
}

export function formatPrice(quote: Named, price: number, digits = priceDigits(quote, price)): string {
  return price.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** The sign the reader's language uses for a currency ("US$" in pt-BR, "$" in en); the code itself when unknown. */
export function currencySign(code: string): string {
  try {
    const parts = new Intl.NumberFormat(LOCALE, { style: "currency", currency: code }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

/** The currency sign before the price, or "pts" after an index. */
export function priceUnit(quote: Pick<MarketQuote, "group" | "currency">): { before: string; after: string } {
  if (quote.group === "index") return { before: "", after: "pts" };
  return { before: currencySign(quote.currency ?? ""), after: "" };
}

/** Signed percentage without the symbol, in the user's locale ("+0,31"); the catalog carries the "%". */
export function signedPercent(value: number): string {
  const abs = Math.abs(value).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : "+"}${abs}`;
}

/** The move in price units, signed, with one more digit than the price for currencies ("+0,0167"). */
export function signedMove(quote: Named, delta: number, price: number): string {
  const base = priceDigits(quote, price);
  const digits = quote.group === "fx" ? Math.max(base, 4) : base;
  return `${delta < 0 ? "-" : "+"}${formatPrice(quote, Math.abs(delta), digits)}`;
}

export const RANGES: MarketRange[] = ["1d", "5d", "1mo", "6mo", "1y"];

/** When a point on the curve was, at the grain the period calls for. */
export function pointTime(range: MarketRange, seconds: number): string {
  const date = new Date(seconds * 1000);
  const options: Intl.DateTimeFormatOptions =
    range === "1d"
      ? { hour: "2-digit", minute: "2-digit" }
      : range === "5d"
        ? { weekday: "short", hour: "2-digit", minute: "2-digit" }
        : range === "1y"
          ? { month: "short", year: "2-digit" }
          : { day: "2-digit", month: "2-digit" };
  return new Intl.DateTimeFormat(LOCALE, options).format(date);
}

export type MarketState = { kind: "open" | "closed"; at: string } | { kind: "always" } | null;

/** Whether the asset trades right now and when that changes; coins never close, a missing session says nothing. */
export function marketState(quote: Pick<MarketQuote, "group" | "session">, nowSeconds: number): MarketState {
  if (quote.group === "crypto") return { kind: "always" };
  if (!quote.session) return null;
  const [start, end] = quote.session;
  const clock = (s: number) => new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(new Date(s * 1000));
  return nowSeconds >= start && nowSeconds < end ? { kind: "open", at: clock(end) } : { kind: "closed", at: clock(start) };
}

export type MarketSort = "default" | "gainers" | "losers";

export function visibleQuotes(quotes: MarketQuote[], group: MarketGroup | "all", sort: MarketSort): MarketQuote[] {
  const shown = quotes.filter((quote) => group === "all" || quote.group === group);
  if (sort === "gainers") return [...shown].sort((a, b) => b.change - a.change);
  if (sort === "losers") return [...shown].sort((a, b) => a.change - b.change);
  return shown;
}

/** Where `value` sits between `low` and `high`, as a percentage clamped to the bar. */
export function rangePosition(value: number, low: number, high: number): number {
  if (high <= low) return 50;
  return Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
}
