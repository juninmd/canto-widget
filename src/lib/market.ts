/** Mercado helpers: the two numbers of a quote, printed in the user's locale. */
import { LOCALE } from "../i18n";

/** As many decimals as the source reports: a rate carries four ("5,0826"), an index two ("205.430,33"). */
export function price(value: number, decimals: number): string {
  return value.toLocaleString(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Signed percentage without the symbol, in the user's locale ("+0,54"); the catalog carries the "%". */
export function signedPercent(value: number): string {
  const abs = Math.abs(value).toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : "+"}${abs}`;
}
