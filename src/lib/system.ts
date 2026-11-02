import type { SystemApp, SystemDisk } from "./systemTypes";
import { LOCALE } from "../i18n";

const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** Binary units: three significant digits ("555 KB", "3,22 MB", "57,6 GB"), like a task manager. */
export function bytes(n: number): string {
  let value = Math.max(0, n);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${UNITS[unit]}`;
}

export const rate = (bps: number) => `${bytes(bps)}/s`;

export const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

export type Level = "ok" | "warn" | "danger";

/** The same marks the alerts use: 90% memory, 90% disk, 85 °C. */
export function level(value: number, warn: number, danger: number): Level {
  return value >= danger ? "danger" : value >= warn ? "warn" : "ok";
}

export const LEVEL_TEXT: Record<Level, string> = { ok: "text-ok", warn: "text-warn", danger: "text-danger" };
export const LEVEL_BG: Record<Level, string> = { ok: "bg-accent", warn: "bg-warn", danger: "bg-danger" };

/** Memory pressure in words: under 75% is fine, elevated up to the alert's severe mark (95%), high from there. */
export function pressure(usedPercent: number): "normal" | "elevated" | "high" {
  return usedPercent >= 95 ? "high" : usedPercent >= 75 ? "elevated" : "normal";
}

export function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

export function peak(values: number[]): number {
  return values.length === 0 ? 0 : Math.max(...values);
}

/** The volume the system runs from, else the largest one. */
export function systemDisk(disks: SystemDisk[]): SystemDisk | null {
  return disks.find((d) => d.system) ?? disks[0] ?? null;
}

export type AppSort = "cpu" | "memory";

export function sortApps(apps: SystemApp[], by: AppSort, limit = 8): SystemApp[] {
  const key = (a: SystemApp) => (by === "cpu" ? a.cpu : a.memory);
  return [...apps].sort((a, b) => key(b) - key(a) || a.name.localeCompare(b.name)).slice(0, limit);
}

/** "1 h 05 min", "42 min". */
export function minutesLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}

/** "3 d 4 h", "5 h 12 min". */
export function uptimeLabel(secs: number): string {
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  if (days > 0) return `${days} d ${hours} h`;
  return minutesLabel(Math.floor(secs / 60));
}

export function fixed(value: number, digits = 0): string {
  return value.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
