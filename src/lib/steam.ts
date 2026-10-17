/** Steam helpers that don't need the network: the store link, a readable playtime and the money. */
import { LOCALE, type MessageKey } from "../i18n";

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

/** Cents as reais, in the chosen language ("R$ 45,00"); the store is always read in BRL. */
export function brl(cents: number): string {
  return new Intl.NumberFormat(LOCALE, { style: "currency", currency: "BRL" }).format(Math.max(0, Math.trunc(cents)) / 100);
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

/** Counts as the reader's language writes them ("12.345"). */
export function count(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(Math.max(0, Math.trunc(value)));
}
