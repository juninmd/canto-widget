import type { StatusResult } from "./api";
import { level, type Level } from "./status";

export type StatusFilter = "all" | "problems" | "ok" | "maintenance";

/** Worst first; "recent" shares the degraded rung because both mean "something is off right now". */
const RANK: Record<Level, number> = { down: 0, degraded: 1, recent: 1, maintenance: 2, ok: 3, unknown: 4 };

/** Stable: services keep their incoming order (latest incident first) inside a rung. */
export function bySeverity(results: StatusResult[], now: number): StatusResult[] {
  return results
    .map((r, i) => ({ r, i, rank: RANK[level(r, now)] }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((x) => x.r);
}

const MATCH: Record<StatusFilter, (l: Level) => boolean> = {
  all: () => true,
  problems: (l) => l === "down" || l === "degraded" || l === "recent",
  ok: (l) => l === "ok",
  maintenance: (l) => l === "maintenance",
};

export const matchesFilter = (filter: StatusFilter, l: Level) => MATCH[filter](l);

export type StatusCounts = Record<StatusFilter, number> & { down: number; warn: number; unknown: number };

export function countLevels(results: StatusResult[], now: number): StatusCounts {
  const levels = results.map((r) => level(r, now));
  const n = (f: (l: Level) => boolean) => levels.filter(f).length;
  return {
    all: levels.length,
    problems: n(MATCH.problems),
    ok: n(MATCH.ok),
    maintenance: n(MATCH.maintenance),
    down: n((l) => l === "down"),
    warn: n((l) => l === "degraded" || l === "recent"),
    unknown: n((l) => l === "unknown"),
  };
}
