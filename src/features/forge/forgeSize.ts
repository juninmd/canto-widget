export type PrSize = "PP" | "P" | "M" | "G" | "GG";

/** T-shirt size from changed lines, so a glance tells a nit from a rewrite. */
export function prSize(additions: number, deletions: number): PrSize {
  const n = additions + deletions;
  return n < 30 ? "PP" : n < 100 ? "P" : n < 300 ? "M" : n < 700 ? "G" : "GG";
}
