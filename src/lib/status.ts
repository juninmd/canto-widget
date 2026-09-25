import type { StatusItem, StatusResult } from "./api";

/** Feeds only carry history, not live state: an incident this recent is treated as still ongoing. */
export const RECENT_MS = 24 * 60 * 60 * 1000;

export const lastIncident = (r: StatusResult) => r.items.reduce((max, i) => Math.max(max, i.published_at), 0);

/** A state update saying things are fine again (Site24x7 feeds post "Block Storage - Operational"). */
const RECOVERED = /\b(operational|resolved|completed|recovered|operacional|resolvid[oa]|normalizad[oa]|conclu[ií]d[oa])\b/i;

/** "Component - State" titles share a component; the component itself may contain " - " ("Magalu Cloud - API"). */
const subject = (title: string) => {
  const cut = title.lastIndexOf(" - ");
  return (cut < 0 ? title : title.slice(0, cut)).trim().toLowerCase();
};

/**
 * True when some component's latest update in the last 24 h is not a recovery. Feeds that post every state
 * change (Magalu Cloud) would otherwise look broken all day right after an "Operational" update.
 */
export function hasRecentIncident(r: StatusResult, now: number): boolean {
  const latest = new Map<string, StatusItem>();
  for (const item of r.items) {
    const key = subject(item.title);
    const seen = latest.get(key);
    if (!seen || item.published_at > seen.published_at) latest.set(key, item);
  }
  return [...latest.values()].some(
    (i) => i.published_at > 0 && now - i.published_at < RECENT_MS && !RECOVERED.test(i.title),
  );
}

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

export type Level = "down" | "degraded" | "recent" | "maintenance" | "ok" | "unknown";

/** One word per card: the live indicator when there is one, otherwise the history rule. */
export function level(r: StatusResult, now: number): Level {
  if (r.live) {
    const byIndicator: Record<string, Level> = { critical: "down", major: "down", minor: "degraded", maintenance: "maintenance" };
    return byIndicator[r.live.indicator] ?? "ok";
  }
  if (r.error) return "unknown";
  return hasRecentIncident(r, now) ? "recent" : "ok";
}

/** Only a live Statuspage indicator can say "it just broke"; the Rust watcher polls exactly these. */
export const canAlert = (r: StatusResult) => r.live != null;
