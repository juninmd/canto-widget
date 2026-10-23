import { LOCALE } from "../i18n";
import type { DriveFile } from "./api";

export type DriveDay = "today" | "yesterday" | "week" | "older";
const DAYS: DriveDay[] = ["today", "yesterday", "week", "older"];
const DAY_MS = 86_400_000;

const midnight = (at: Date) => new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime();

/** How long ago a change was, in the buckets a file list reads well by. */
export function dayOf(modified: string, now: Date): DriveDay {
  const at = new Date(modified);
  if (Number.isNaN(at.getTime())) return "older";
  const days = Math.round((midnight(now) - midnight(at)) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return days < 7 ? "week" : "older";
}

/** Files in day buckets, newest bucket first, keeping Drive's own order inside each; empty buckets are left out. */
export function groupByDay(files: DriveFile[], now: Date): { day: DriveDay; files: DriveFile[] }[] {
  const groups = new Map<DriveDay, DriveFile[]>();
  for (const file of files) {
    const day = dayOf(file.modified, now);
    groups.set(day, [...(groups.get(day) ?? []), file]);
  }
  return DAYS.filter((d) => groups.has(d)).map((day) => ({ day, files: groups.get(day) ?? [] }));
}

/** "4,2 GB", "15 GB", "820 KB": binary units, at most one decimal from GB up. */
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toLocaleString(LOCALE, { maximumFractionDigits: unit >= 3 ? 1 : 0 })} ${units[unit]}`;
}

/** Share of the quota in use, 0 to 1; 0 when the plan is unlimited. */
export const quotaShare = (used: number, limit: number) => (limit > 0 ? Math.min(1, used / limit) : 0);

/** Blank documents open straight in the browser: Google's own shortcuts, no write scope needed. */
export const NEW_FILE = { doc: "https://docs.new", sheet: "https://sheets.new", slide: "https://slides.new" } as const;
