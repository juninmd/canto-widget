import type { ModelRow } from "./api";
import { LOCALE } from "../i18n";

export type ModelSort = "intelligence" | "price" | "speed";

export const SORTS: ModelSort[] = ["intelligence", "price", "speed"];

export function nextSort(current: ModelSort): ModelSort {
  return SORTS[(SORTS.indexOf(current) + 1) % SORTS.length];
}

/** Price ascending and speed descending; models without the measure go last, then by rank. */
export function sortModels(rows: readonly ModelRow[], sort: ModelSort): ModelRow[] {
  const byRank = (a: ModelRow, b: ModelRow) => a.rank - b.rank;
  if (sort === "intelligence") return [...rows].sort(byRank);
  const value = (r: ModelRow) => (sort === "price" ? r.price : r.speed);
  const dir = sort === "price" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va === null || vb === null) return va === vb ? byRank(a, b) : va === null ? 1 : -1;
    return (va - vb) * dir || byRank(a, b);
  });
}

export function formatScore(score: number): string {
  return score.toLocaleString(LOCALE, { maximumFractionDigits: 1 });
}

export function formatPrice(price: number): string {
  return price.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatSpeed(speed: number): string {
  return Math.round(speed).toLocaleString(LOCALE);
}

/** Bar width in percent of the best score shown; never 0 so a low score still reads as a bar. */
export function barWidth(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(2, Math.min(100, (score / max) * 100));
}
