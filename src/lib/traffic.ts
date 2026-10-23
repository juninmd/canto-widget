import type { IncidentKind, TrafficDeparture, TrafficIncident } from "./api";

export const TILE = 256;
export const MIN_ZOOM = 11;
export const MAX_ZOOM = 17;
export const DEFAULT_ZOOM = 14;
export const TRIP_ICONS = ["work", "home", "gym", "heart", "pin"] as const;
export const INCIDENT_KINDS: IncidentKind[] = ["accident", "jam", "works", "closed", "hazard"];

export type Level = "free" | "slow" | "jam" | "stop";

/** Web Mercator in pixels of the whole world at `zoom`, the same math Rust uses to pick the tiles. */
export function project(lat: number, lon: number, zoom: number): [number, number] {
  const n = TILE * 2 ** zoom;
  const r = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
  const x = ((lon + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  return [x, y];
}

/** How bad a trip is against free flow: under 15% extra is fine, 70% or more is standstill. */
export function tripLevel(minutes: number, free: number): Level {
  const r = free > 0 ? minutes / free : 1;
  return r < 1.15 ? "free" : r < 1.4 ? "slow" : r < 1.7 ? "jam" : "stop";
}

/** The gauge's word: the share of speed lost around the starting point. */
export function slowLevel(percent: number): Level {
  return percent < 12 ? "free" : percent < 25 ? "slow" : percent < 40 ? "jam" : "stop";
}

export const LEVEL_COLOR: Record<Level, string> = {
  free: "var(--color-traffic-free)",
  slow: "var(--color-traffic-slow)",
  jam: "var(--color-traffic-jam)",
  stop: "var(--color-traffic-stop)",
};

export const KIND_LEVEL: Record<IncidentKind, Level> = { accident: "stop", closed: "stop", jam: "jam", works: "slow", hazard: "slow" };

/** The fastest departure; on a tie the earliest wins, since leaving sooner is never worse. */
export function bestDeparture(list: TrafficDeparture[]): number {
  let best = -1;
  list.forEach((d, i) => {
    if (best < 0 || d.minutes < list[best].minutes) best = i;
  });
  return best;
}

export function filterIncidents(list: TrafficIncident[], kind: IncidentKind | "all"): TrafficIncident[] {
  return kind === "all" ? list : list.filter((i) => i.kind === kind);
}

/** Readings older than today (local) fall off the line under the gauge. */
export function todayHistory(history: [number, number][], now: number): [number, number][] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return history.filter(([at]) => at >= start.getTime());
}
