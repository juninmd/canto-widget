import { LOCALE, t } from "../i18n";

/** What each quote is called on screen; brands and tickers stay as they are. */
export function quoteLabel(symbol: string): string {
  if (symbol === "USD/BRL") return t("protos.market.usd");
  if (symbol === "EUR/BRL") return t("protos.market.eur");
  if (symbol === "BTC/USD") return "Bitcoin";
  if (symbol === "IBOV") return "Ibovespa";
  return symbol;
}

/** Currencies keep cents; indexes and bitcoin read better as whole numbers. */
export function formatPrice(symbol: string, price: number): string {
  const digits = symbol.endsWith("/BRL") ? 2 : 0;
  return price.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Signed percentage without the symbol, in the user's locale ("+0,31"); the catalog carries the "%". */
export function signedPercent(value: number): string {
  const abs = Math.abs(value).toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : "+"}${abs}`;
}
