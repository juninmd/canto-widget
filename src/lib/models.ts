import type { ModelRow } from "./api";
import { LOCALE } from "../i18n";

export type ModelSort = "intelligence" | "price" | "speed" | "context" | "released";

export const SORTS: ModelSort[] = ["intelligence", "price", "speed", "context", "released"];

const NO_SHEET = {
  input_price: null,
  output_price: null,
  ttft: null,
  context: null,
  released: null,
  open_weights: null,
  reasoning: null,
  coding: null,
  math: null,
  inputs: [],
} satisfies Partial<ModelRow>;

/** Fills the sheet with "unknown" for rows that came without it (an older backend), so no field reads `undefined`. */
export function withSheet<T extends Partial<ModelRow>>(row: T): T & typeof NO_SHEET {
  return { ...NO_SHEET, ...row };
}

export type ModelFilter = "open" | "reasoning";

export const FILTERS: ModelFilter[] = ["open", "reasoning"];

/** Cheapest first; everything else biggest or newest first. Models without the measure go last, then by rank. */
export function sortModels(rows: readonly ModelRow[], sort: ModelSort): ModelRow[] {
  const byRank = (a: ModelRow, b: ModelRow) => a.rank - b.rank;
  if (sort === "intelligence") return [...rows].sort(byRank);
  const value = (r: ModelRow): number | null => {
    if (sort === "price") return r.price;
    if (sort === "speed") return r.speed;
    if (sort === "context") return r.context;
    return r.released ? Date.parse(r.released) : null;
  };
  const dir = sort === "price" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    if (va === null || vb === null) return va === vb ? byRank(a, b) : va === null ? 1 : -1;
    return (va - vb) * dir || byRank(a, b);
  });
}

export function filterModels(rows: readonly ModelRow[], on: readonly ModelFilter[]): ModelRow[] {
  return rows.filter((r) => on.every((f) => (f === "open" ? r.open_weights === true : r.reasoning === true)));
}

/** A filter is offered only when the page told us which models qualify; an all-null field would empty the list. */
export function availableFilters(rows: readonly ModelRow[]): ModelFilter[] {
  return FILTERS.filter((f) => rows.some((r) => (f === "open" ? r.open_weights : r.reasoning) === true));
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

export function formatSeconds(s: number): string {
  return s.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 131072 → "131k", 1000000 → "1M", 1048576 → "1M": how the model pages write it. */
export function formatContext(tokens: number): string {
  if (tokens >= 1e6) return `${(tokens / 1e6).toLocaleString(LOCALE, { maximumFractionDigits: tokens % 1e6 < 5e4 ? 0 : 1 })}M`;
  return `${Math.round(tokens / 1e3).toLocaleString(LOCALE)}k`;
}

/** Month and year only: the page's dates are announcement days, not builds. Parsed as local so it never slips a month. */
export function formatReleased(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(LOCALE, { month: "short", year: "numeric" });
}

/** Bar width in percent of the best score shown; never 0 so a low score still reads as a bar. */
export function barWidth(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(2, Math.min(100, (score / max) * 100));
}

/** 1-based place among the models that have the measure, highest first; null when this one doesn't. */
export function placeBy(rows: readonly ModelRow[], id: string, key: "score" | "coding" | "math"): number | null {
  const ranked = rows.filter((r) => r[key] !== null).sort((a, b) => (b[key] as number) - (a[key] as number));
  const i = ranked.findIndex((r) => r.id === id);
  return i < 0 ? null : i + 1;
}

/** The model's page on the leaderboard's site; the id is that site's own slug. */
export const modelUrl = (id: string) => `https://artificialanalysis.ai/models/${encodeURIComponent(id)}`;
