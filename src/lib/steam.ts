/** Steam helpers that don't need the network: the store link, a readable playtime and the money. */
import { LOCALE, type MessageKey } from "../i18n";
import type { SteamRow } from "./api";

/** Where a row opens: the store page of the game. */
export function steamUrl(appid: number): string {
  return `https://store.steampowered.com/app/${Math.trunc(appid)}/`;
}

/** Minutes as Steam reports them, written the short way ("2 h 15 min"); under an hour stays in minutes. */
export function playtime(minutes: number): string {
  const total = Math.max(0, Math.trunc(minutes));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Cents in the region's currency, written the way the chosen language writes money ("R$ 45,00").
 * The code comes from Rust, but it is still checked: `Intl` throws on anything that isn't ISO 4217. */
export function money(cents: number, currency: string): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "USD";
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: code }).format(Math.max(0, Math.trunc(cents)) / 100);
}

/** The storefronts Rust can read, each named the way that store names itself, with its symbol. */
export const REGIONS = [
  { code: "br", label: "Brasil · R$" },
  { code: "us", label: "United States · $" },
  { code: "eu", label: "Euro · €" },
  { code: "gb", label: "United Kingdom · £" },
] as const;

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
