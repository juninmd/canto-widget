import { LOCALE } from "../i18n";
import type { ActivityAway, ActivityFocus, ActivitySpan } from "./api";
import { byCategory, categoryOf, hourlyHeat, withoutHidden, type Category } from "./activity";

export type Apps = { app: string; secs: number }[];
export type Day = { day: number; apps: Apps; spans: ActivitySpan[]; idle: ActivityAway[]; idleSecs: number; focus: ActivityFocus[] };

const sumSecs = (apps: Apps) => apps.reduce((s, a) => s + a.secs, 0);

/** The busiest hour of the day (0-23) with its active seconds, or null with no records. */
export function peakHour(spans: ActivitySpan[], dayStartSec: number): { hour: number; secs: number } | null {
  const hours = hourlyHeat(spans, dayStartSec);
  const secs = Math.max(...hours);
  return secs > 0 ? { hour: hours.indexOf(secs), secs } : null;
}

/** Dash length and offset of each slice of a donut with this circumference, a small gap between slices. */
export function donutArcs(cats: { category: Category; secs: number }[], circumference: number, gap = 2.5) {
  const total = cats.reduce((s, c) => s + c.secs, 0);
  let offset = 0;
  return cats.map((c) => {
    const length = (c.secs / total) * circumference;
    const arc = { category: c.category, secs: c.secs, dash: Math.max(0, length - (length > gap * 2 ? gap : 0)), offset };
    offset += length;
    return arc;
  });
}

/** Even hours inside the range: where the time axis puts its labels and grid lines. */
export function axisTicks([from, to]: [number, number]): number[] {
  const out: number[] = [];
  for (let h = Math.ceil(from / 2) * 2; h <= to; h += 2) out.push(h);
  return out;
}

/** Stack order of the week columns: the same category sits at the same height every day, code at the bottom. */
export const STACK_ORDER: Category[] = ["code", "games", "meet", "docs", "chat", "web", "other"];

/** What the week chart draws, oldest day first. The goal looks at code time whatever the filter hides. */
export function weekSeries(days: Day[], hidden: ReadonlySet<Category>, goalSecs: number) {
  return [...days].reverse().map((d) => {
    const bySecs = new Map(byCategory(withoutHidden(d.apps, hidden)).map((c) => [c.category, c.secs]));
    const stack = STACK_ORDER.flatMap((category) => (bySecs.get(category) ? [{ category, secs: bySecs.get(category)! }] : []));
    const code = sumSecs(d.apps.filter((a) => categoryOf(a.app) === "code"));
    return { day: d.day, total: stack.reduce((s, c) => s + c.secs, 0), stack, code, met: goalSecs > 0 && code >= goalSecs };
  });
}

/** "09:30" for a unix second, in the user's locale. */
export const clockOf = (sec: number) => new Date(sec * 1000).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

/** Focus time per task across several days, most first; a task seen with a title keeps it. */
export function mergeFocus(days: Day[]): ActivityFocus[] {
  const byTask = new Map<string, ActivityFocus>();
  for (const f of days.flatMap((d) => d.focus)) {
    const seen = byTask.get(f.task);
    byTask.set(f.task, { task: f.task, title: seen?.title ?? f.title, secs: (seen?.secs ?? 0) + f.secs });
  }
  return [...byTask.values()].sort((a, b) => b.secs - a.secs);
}

/** Apps across several days, most used first. */
export function mergeApps(days: Day[]): Apps {
  const byApp = new Map<string, number>();
  for (const a of days.flatMap((d) => d.apps)) byApp.set(a.app, (byApp.get(a.app) ?? 0) + a.secs);
  return [...byApp].map(([app, secs]) => ({ app, secs })).sort((a, b) => b.secs - a.secs);
}
