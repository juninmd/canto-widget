/** Steam helpers that don't need the network: the store link, a readable playtime and the money. */
import { LOCALE, t, type MessageKey } from "../i18n";
import type { SteamRow } from "./api";

/** Where a row opens: the store page of the game. */
export function steamUrl(appid: number): string {
  return `https://store.steampowered.com/app/${Math.trunc(appid)}/`;
}

/** The wide header Steam keeps for every app; deterministic, so no request is needed to find it. */
export function headerArt(appid: number): string {
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${Math.trunc(appid)}/header.jpg`;
}

/** The discount that rings an alert and sets a row on fire. */
export const HOT = 75;

/** Where the header's persona name opens: the profile behind the SteamID64 or a vanity link. */
export function profileUrl(steamid: string): string {
  return `https://steamcommunity.com/profiles/${steamid.replace(/[^\d]/g, "")}/`;
}

/** What a row is called: Steam occasionally omits the title, and the appid still says which game it is. */
export function gameTitle(row: { appid: number; name: string }): string {
  return row.name.trim() || `#${Math.trunc(row.appid)}`;
}

/** Minutes as Steam reports them, written the short way ("2 h 15 min"); under an hour stays in minutes.
 *  The hours carry the language's thousands separator, since a library adds up to four digits. */
export function playtime(minutes: number): string {
  const total = Math.max(0, Math.trunc(minutes));
  if (total < 60) return t("time.min", { n: total });
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const written = new Intl.NumberFormat(LOCALE).format(hours);
  return rest === 0 ? t("agenda.free.h", { h: written }) : t("agenda.free.hMin", { h: written, n: rest });
}

/** Cents in the region's currency, written the way the chosen language writes money ("R$ 45,00").
 * The code comes from Rust, but it is still checked: `Intl` throws on anything that isn't ISO 4217. */
export function money(cents: number, currency: string): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: code }).format(Math.max(0, Math.trunc(cents)) / 100);
}

/** The storefronts Rust can read, with the symbol the picker shows; the names come from `Intl`. */
export const REGIONS = [
  { code: "br", country: "BR", currency: "BRL", symbol: "R$" },
  { code: "us", country: "US", currency: "USD", symbol: "$" },
  { code: "eu", country: "EU", currency: "EUR", symbol: "€" },
  { code: "gb", country: "GB", currency: "GBP", symbol: "£" },
  { code: "jp", country: "JP", currency: "JPY", symbol: "¥" },
  { code: "cn", country: "CN", currency: "CNY", symbol: "¥" },
  { code: "au", country: "AU", currency: "AUD", symbol: "A$" },
  { code: "ca", country: "CA", currency: "CAD", symbol: "C$" },
  { code: "ch", country: "CH", currency: "CHF", symbol: "CHF" },
  { code: "kr", country: "KR", currency: "KRW", symbol: "₩" },
  { code: "in", country: "IN", currency: "INR", symbol: "₹" },
  { code: "mx", country: "MX", currency: "MXN", symbol: "MX$" },
] as const;
export type Region = (typeof REGIONS)[number];

/** The country and the currency in the reader's language ("Japão", "Iene japonês"); the codes when
 *  the engine has no names. */
export function regionNames(region: Region): { country: string; currency: string } {
  try {
    const country = new Intl.DisplayNames([LOCALE], { type: "region" }).of(region.country) ?? region.country;
    const currency = new Intl.DisplayNames([LOCALE], { type: "currency" }).of(region.currency) ?? region.currency;
    return { country, currency };
  } catch {
    return { country: region.country, currency: region.currency };
  }
}

/** How long ago a unix time was, the way the language says it ("ontem", "há 5 dias"). */
export function ago(unixSeconds: number, now = Date.now()): string {
  const days = Math.round((unixSeconds * 1000 - now) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
  if (Math.abs(days) < 1) {
    const hours = Math.round((unixSeconds * 1000 - now) / 3_600_000);
    return rtf.format(hours, "hour");
  }
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

/** Disk size in GB or MB, in the language's digits. */
export function diskSize(bytes: number): string {
  const gb = bytes / 1e9;
  const [value, unit] = gb >= 1 ? [gb, "gigabyte"] : [bytes / 1e6, "megabyte"];
  return new Intl.NumberFormat(LOCALE, { style: "unit", unit, maximumFractionDigits: 1 }).format(value);
}

/** How a score reads at a glance: most reviews positive, mixed, or mostly negative. */
export type ReviewTone = "good" | "mixed" | "bad" | "";

/** Steam's own nine buckets, in the store's spelling. */
export function reviewTone(bucket: string): ReviewTone {
  if (bucket === "mixed") return "mixed";
  if (bucket === "positive" || bucket.endsWith("_positive")) return "good";
  if (bucket === "negative" || bucket.endsWith("_negative")) return "bad";
  return "";
}

const REVIEW_KEYS: Record<string, MessageKey> = {
  overwhelmingly_positive: "steam.review.overwhelmingly_positive",
  very_positive: "steam.review.very_positive",
  positive: "steam.review.positive",
  mostly_positive: "steam.review.mostly_positive",
  mixed: "steam.review.mixed",
  mostly_negative: "steam.review.mostly_negative",
  negative: "steam.review.negative",
  very_negative: "steam.review.very_negative",
  overwhelmingly_negative: "steam.review.overwhelmingly_negative",
};

/** The message that names Steam's bucket, or null when the store gave no bucket. */
export function reviewLabelKey(bucket: string): MessageKey | null {
  return REVIEW_KEYS[bucket] ?? null;
}

/** Appends a page, dropping what the store already listed (a row can repeat between pages). */
export function mergeGames(current: SteamRow[], next: SteamRow[]): SteamRow[] {
  const seen = new Set(current.map((row) => row.appid));
  return [...current, ...next.filter((row) => !seen.has(row.appid))];
}

/** Counts as the reader's language writes them ("12.345"). */
export function count(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(Math.max(0, Math.trunc(value)));
}
