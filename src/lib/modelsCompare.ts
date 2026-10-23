import type { ModelRow } from "./api";

export const MAX_PICK = 4;
const KEY = "canto.models.compare";

export type MetricKey = "score" | "coding" | "math" | "input_price" | "output_price" | "price" | "speed" | "ttft" | "context" | "released";
export type Metric = { key: MetricKey; group: "quality" | "price" | "speed" | "sheet"; better: "max" | "min" };

export const METRICS: Metric[] = [
  { key: "score", group: "quality", better: "max" },
  { key: "coding", group: "quality", better: "max" },
  { key: "math", group: "quality", better: "max" },
  { key: "input_price", group: "price", better: "min" },
  { key: "output_price", group: "price", better: "min" },
  { key: "price", group: "price", better: "min" },
  { key: "speed", group: "speed", better: "max" },
  { key: "ttft", group: "speed", better: "min" },
  { key: "context", group: "sheet", better: "max" },
  { key: "released", group: "sheet", better: "max" },
];

/** The metrics drawn as bars: one per question people ask when choosing (how smart, how much, how fast, how much text). */
export const BAR_METRICS: MetricKey[] = ["score", "price", "speed", "ttft", "context"];

export function value(row: ModelRow, key: MetricKey): number | null {
  if (key === "released") return row.released ? Date.parse(row.released) : null;
  return row[key];
}

/** The winning value, or null when fewer than two models have the measure (nothing to win against). */
export function bestValue(rows: readonly ModelRow[], m: Metric): number | null {
  const vals = rows.map((r) => value(r, m.key)).filter((v): v is number => v !== null);
  if (vals.length < 2) return null;
  return m.better === "max" ? Math.max(...vals) : Math.min(...vals);
}

export type Verdict =
  | { kind: "smartest"; id: string; other: string; gap: number }
  | { kind: "tie"; id: string; other: string; score: number }
  | { kind: "cheapest"; id: string; other: string; times: number }
  | { kind: "fastest"; id: string; other: string; times: number }
  | { kind: "unmeasured"; id: string; names: string };

/** The few sentences that answer "which one?" before the charts: leader, cheapest, fastest, and what's missing. */
export function verdicts(rows: readonly ModelRow[]): Verdict[] {
  if (rows.length < 2) return [];
  const out: Verdict[] = [];
  const [first, second] = [...rows].sort((a, b) => b.score - a.score);
  out.push(
    first.score > second.score
      ? { kind: "smartest", id: first.id, other: second.name, gap: first.score - second.score }
      : { kind: "tie", id: first.id, other: second.name, score: first.score },
  );
  const priced = rows.filter((r) => r.price !== null).sort((a, b) => a.price! - b.price!);
  if (priced.length >= 2 && priced[0].price! < priced.at(-1)!.price!) {
    out.push({ kind: "cheapest", id: priced[0].id, other: priced.at(-1)!.name, times: priced.at(-1)!.price! / priced[0].price! });
  }
  const fast = rows.filter((r) => r.speed !== null).sort((a, b) => b.speed! - a.speed!);
  if (fast.length >= 2 && fast[0].speed! > fast.at(-1)!.speed!) {
    out.push({ kind: "fastest", id: fast[0].id, other: fast.at(-1)!.name, times: fast[0].speed! / fast.at(-1)!.speed! });
  }
  const missing = rows.filter((r) => r.price === null && r.speed === null);
  if (missing.length) out.push({ kind: "unmeasured", id: missing[0].id, names: missing.map((r) => r.name).join(", ") });
  return out;
}

export type Axis = "score" | "coding" | "math" | "price" | "speed";
export const AXES: Axis[] = ["score", "coding", "math", "price", "speed"];

/**
 * 0.1–1 against every ranked model, not just the picked ones, so a shape doesn't change when a rival is removed.
 * Price is inverted (cheaper reaches further) and on a log scale, since prices span three orders of magnitude.
 */
export function radius(pool: readonly ModelRow[], axis: Axis, v: number | null): number {
  if (v === null) return 0;
  const f = axis === "price" ? (x: number) => -Math.log(x) : (x: number) => x;
  const vals = pool.map((r) => r[axis]).filter((x): x is number => x !== null && (axis !== "price" || x > 0)).map(f);
  if (vals.length === 0) return 0;
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  if (hi === lo) return 1;
  return 0.1 + (0.9 * (f(v) - lo)) / (hi - lo);
}

export type Preset = "top" | "cheap" | "fast" | "open";
export const PRESETS: Preset[] = ["top", "cheap", "fast", "open"];

export function preset(rows: readonly ModelRow[], p: Preset): string[] {
  const take = (list: ModelRow[]) => list.slice(0, 3).map((r) => r.id);
  if (p === "top") return take([...rows].sort((a, b) => a.rank - b.rank));
  if (p === "cheap") return take(rows.filter((r) => r.price !== null).sort((a, b) => a.price! - b.price! || a.rank - b.rank));
  if (p === "fast") return take(rows.filter((r) => r.speed !== null).sort((a, b) => b.speed! - a.speed! || a.rank - b.rank));
  return take(rows.filter((r) => r.open_weights === true).sort((a, b) => a.rank - b.rank));
}

export function togglePick(picked: readonly string[], id: string): string[] {
  if (picked.includes(id)) return picked.filter((x) => x !== id);
  return picked.length >= MAX_PICK ? [...picked] : [...picked, id];
}

export function loadPicked(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, MAX_PICK) : [];
  } catch {
    return [];
  }
}

export function savePicked(ids: readonly string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode or full storage: the pick just doesn't survive a restart */
  }
}

/** Series colors, one per picked slot; the category tokens already read well on every skin. */
export const SERIES = ["var(--color-cat-meet)", "var(--color-cat-games)", "var(--color-cat-docs)", "var(--color-cat-chat)"];
