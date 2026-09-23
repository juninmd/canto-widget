import type { StatusResult } from "./api";

/** Feeds only carry history, not live state: an incident this recent is treated as still ongoing. */
export const RECENT_MS = 24 * 60 * 60 * 1000;

export const lastIncident = (r: StatusResult) => r.items.reduce((max, i) => Math.max(max, i.published_at), 0);

export const hasRecentIncident = (r: StatusResult, now: number) => {
  const last = lastIncident(r);
  return last > 0 && now - last < RECENT_MS;
};

/** Most recent incident first; services with none (or whose feed failed) keep their original order at the end. */
export function sortByLastIncident(results: StatusResult[]): StatusResult[] {
  return results
    .map((r, i) => ({ r, i, last: lastIncident(r) }))
    .sort((a, b) => b.last - a.last || a.i - b.i)
    .map((x) => x.r);
}

/**
 * Statuspage's live indicator wins when there is one (a resolved incident an hour ago is not trouble);
 * other providers only have history, so a recent incident stands in for "still happening".
 */
export function isTroubled(r: StatusResult, now: number): boolean {
  if (r.live) return ["minor", "major", "critical"].includes(r.live.indicator);
  return !r.error && hasRecentIncident(r, now);
}
