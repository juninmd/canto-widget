import { t, type MessageKey } from "../../i18n";
import type { CronTask } from "./devTypes";

const RANGES: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
const NAMES: Record<string, number>[] = [{}, {}, {}, { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }, { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }];

function field(text: string, i: number): Set<number> | null {
  const [min, max] = RANGES[i];
  const out = new Set<number>();
  const num = (s: string) => (/^\d+$/.test(s) ? Number(s) : NAMES[i][s.toLowerCase()]);
  for (const part of text.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText === undefined ? 1 : Number(stepText);
    const [a, b] = range === "*" ? [min, max] : range.includes("-") ? range.split("-").map(num) : [num(range), stepText === undefined ? num(range) : max];
    if (a === undefined || b === undefined || !Number.isInteger(step) || step < 1) return null;
    for (let n = a; n <= b; n += step) if (n >= min && n <= (i === 4 ? 7 : max)) out.add(i === 4 && n === 7 ? 0 : n);
  }
  return out.size ? out : null;
}

/** The five fields as sets of allowed values, or null when the expression isn't a valid cron one. */
export function parseCron(expr: string): Set<number>[] | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const sets = parts.map(field);
  return sets.every(Boolean) ? (sets as Set<number>[]) : null;
}

/** The next `n` minutes the expression fires at, after `from`; "@reboot" and the like have none. */
export function nextRuns(expr: string, from: Date, n = 3): Date[] {
  const f = parseCron(expr);
  if (!f) return [];
  const d = new Date(from);
  d.setSeconds(0, 0);
  const out: Date[] = [];
  for (let i = 0; i < 60 * 24 * 366 && out.length < n; i++) {
    d.setMinutes(d.getMinutes() + 1);
    // Cron fires on day-of-month OR weekday when both are restricted.
    const dayOk = (expr.split(/\s+/)[2] !== "*" && expr.split(/\s+/)[4] !== "*") ? f[2].has(d.getDate()) || f[4].has(d.getDay()) : f[2].has(d.getDate()) && f[4].has(d.getDay());
    if (f[0].has(d.getMinutes()) && f[1].has(d.getHours()) && f[3].has(d.getMonth() + 1) && dayOk) out.push(new Date(d));
  }
  return out;
}

const MACROS: Record<string, string> = { "@reboot": "reboot", "@daily": "daily", "@midnight": "daily", "@hourly": "hourly", "@weekly": "weekly", "@monthly": "monthly", "@yearly": "yearly", "@annually": "yearly" };

/** The expression in the user's language: "Every 15 minutes, 9h to 18h, Monday to Friday". */
export function describeCron(expr: string): string | null {
  const e = expr.trim();
  if (e in MACROS) return t(`dev.cron.macro.${MACROS[e]}` as MessageKey);
  if (!parseCron(e)) return null;
  const [m, h, d, mo, w] = e.split(/\s+/);
  const parts: string[] = [];
  parts.push(m.startsWith("*/") ? t("dev.cron.everyMin", { n: m.slice(2) }) : m === "*" ? t("dev.cron.eachMin") : t("dev.cron.atMin", { n: m }));
  if (h !== "*") parts.push(/^\d+-\d+$/.test(h) ? t("dev.cron.between", { a: h.split("-")[0], b: h.split("-")[1] }) : h.startsWith("*/") ? t("dev.cron.everyHour", { n: h.slice(2) }) : t("dev.cron.atHour", { n: h }));
  if (d !== "*") parts.push(t("dev.cron.onDay", { n: d }));
  if (mo !== "*") parts.push(t("dev.cron.inMonth", { n: mo }));
  if (w !== "*") parts.push(w === "1-5" ? t("dev.cron.weekdays") : t("dev.cron.onWeekday", { n: w }));
  return parts.join(", ");
}

/** A task's schedule for a list row: its own expression, or the time Windows gave. */
export function nextLabel(task: CronTask, from: Date): string {
  const when = task.expr ? nextRuns(task.expr, from, 1)[0] : task.next ? new Date(task.next) : undefined;
  return when && !Number.isNaN(when.getTime()) ? when.toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
}
