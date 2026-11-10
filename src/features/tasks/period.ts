/** Local-calendar bounds for the summary's period; computed here because Rust's timezone isn't reliable. */
export type Period = "day" | "week" | "month";
export const PERIODS: Period[] = ["day", "week", "month"];

/** Days are local `YYYY-MM-DD`, both inclusive; `toMs` is the next local midnight (exclusive). */
export type Bounds = { fromDay: string; toDay: string; fromMs: number; toMs: number };

function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parts(day: string): [number, number, number] {
  const [y, m, d] = day.split("-").map(Number);
  return [y, m - 1, d];
}

/** Week starts on Monday; both week and month end today, since the report looks back, not ahead. */
export function periodBounds(period: Period, today: string): Bounds {
  const [y, m, d] = parts(today);
  const back = period === "week" ? (new Date(y, m, d).getDay() + 6) % 7 : 0;
  const from = period === "month" ? new Date(y, m, 1) : new Date(y, m, d - back);
  return { fromDay: isoDay(from), toDay: today, fromMs: from.getTime(), toMs: new Date(y, m, d + 1).getTime() };
}

/** Every day from `fromDay` to `toDay`, inclusive; built from calendar fields so a DST change can't skip one. */
export function daysBetween(fromDay: string, toDay: string): string[] {
  const [y, m, d] = parts(fromDay);
  const out: string[] = [];
  for (let i = 0; out.length < 62; i++) {
    const day = isoDay(new Date(y, m, d + i));
    if (day > toDay) break;
    out.push(day);
  }
  return out;
}

export function isWorkday(day: string): boolean {
  const [y, m, d] = parts(day);
  const dow = new Date(y, m, d).getDay();
  return dow !== 0 && dow !== 6;
}

/** Local `YYYY-MM-DD` of an agenda start: RFC 3339 instant for timed events, the date itself for all-day ones. */
export function localDayOf(start: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : isoDay(new Date(start));
}
