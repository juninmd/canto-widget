import type { ForgeItem } from "../../lib/api";
import { t } from "../../i18n";

/** A review request older than this is overdue: the Radar paints it red. */
export const SLA_HOURS = 48;
export const SNOOZE_MS = 4 * 3_600_000;
export type SnoozeKind = "h1" | "h4" | "tomorrow" | "week";
const KEY = "canto.reviewSnooze";

export function waitHours(item: ForgeItem, now = new Date()): number {
  const ms = now.getTime() - new Date(item.created_at).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 3_600_000)) : 0;
}

export const overdue = (hours: number) => hours >= SLA_HOURS;

/** Hours below two days, where a day is too coarse to tell a fresh request from an overdue one. */
export function waitLabel(hours: number): string {
  if (hours < 1) return t("forge.item.waitLessThanHour");
  if (hours < SLA_HOURS) return t("forge.item.waitHours", { n: hours });
  return t("forge.item.waitDays", { n: Math.floor(hours / 24) });
}

/** Longest wait first; GitHub returns review requests by last update, which hides the oldest. */
export function oldestFirst(items: ForgeItem[]): ForgeItem[] {
  return [...items].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
}

/** "Tomorrow" is the next 8:00 local time, so a snooze at night does not come back before the workday. */
export function snoozeDelay(kind: SnoozeKind, now = Date.now()): number {
  if (kind === "h1") return 3_600_000;
  if (kind === "week") return 7 * 24 * 3_600_000;
  if (kind === "h4") return SNOOZE_MS;
  const at = new Date(now);
  at.setDate(at.getDate() + 1);
  at.setHours(8, 0, 0, 0);
  return at.getTime() - now;
}

export type Snoozed = Record<string, number>;

/** Expired entries are dropped on read, so the stored map never grows past what is still snoozed. */
export function activeSnoozes(raw: string | null, now = Date.now()): Snoozed {
  try {
    const map: unknown = raw ? JSON.parse(raw) : {};
    if (typeof map !== "object" || map === null || Array.isArray(map)) return {};
    return Object.fromEntries(Object.entries(map).filter(([, until]) => typeof until === "number" && until > now));
  } catch {
    return {};
  }
}

export function loadSnoozes(now = Date.now()): Snoozed {
  try {
    return activeSnoozes(localStorage.getItem(KEY), now);
  } catch {
    return {};
  }
}

/** Merges into what is stored now, not the caller's copy, so a second mounted list cannot drop this one's snoozes. */
export function snoozeUntil(url: string, now = Date.now(), kind: SnoozeKind = "h4"): Snoozed {
  const next = { ...loadSnoozes(now), [url]: now + snoozeDelay(kind, now) };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: the snooze lasts until the tab reloads, which is acceptable */
  }
  return next;
}
