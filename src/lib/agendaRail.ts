import type { AgendaItem, Task } from "./api";
import { conflicts, horizon, MIN_FREE_MINUTES } from "./agendaFree";
import { DEFAULT_TASK_MIN, dayBlocks, firstFreeSlot, hourRange, taskStart, type PlanBlock } from "./dayPlan";

export const minuteOf = (d: Date) => d.getHours() * 60 + d.getMinutes();

type Span = { start: number; end: number };

export type RailEntry =
  | ({ kind: "event"; id: string; item: AgendaItem } & Span)
  | ({ kind: "task"; id: string; task: Task } & Span)
  | ({ kind: "gap"; id: string } & Span);

/** Timed events as minutes of the day; declined ones stay (the card says so) but take no time. */
function eventEntries(items: AgendaItem[]): RailEntry[] {
  return items.flatMap((item) => {
    if (item.all_day) return [];
    const [s, f] = [new Date(item.start), new Date(item.end)];
    if (Number.isNaN(s.getTime()) || Number.isNaN(f.getTime()) || f <= s) return [];
    const end = f.getDate() === s.getDate() ? minuteOf(f) : 24 * 60;
    return [{ kind: "event" as const, id: item.id, item, start: minuteOf(s), end }];
  });
}

function taskEntries(tasks: Task[]): RailEntry[] {
  return tasks.flatMap((task) => {
    const start = task.done || !task.hora ? null : taskStart(task.hora);
    if (start === null) return [];
    return [{ kind: "task" as const, id: task.id, task, start, end: Math.min(24 * 60, start + (task.estimate_min ?? DEFAULT_TASK_MIN)) }];
  });
}

export const horizonMin = (now: Date) => {
  const h = horizon(now);
  return h.getDate() === now.getDate() ? h.getHours() * 60 : 24 * 60;
};

/** Gaps of at least `min` minutes between `from` and `to`, around everything that takes time. */
export function freeGaps(blocks: PlanBlock[], from: number, to: number, min = MIN_FREE_MINUTES): Span[] {
  const out: Span[] = [];
  let cursor = from;
  for (const b of [...blocks].sort((x, y) => x.start - y.start)) {
    if (b.end <= cursor) continue;
    if (b.start >= to) break;
    if (b.start - cursor >= min) out.push({ start: cursor, end: b.start });
    cursor = Math.max(cursor, b.end);
  }
  if (to - cursor >= min) out.push({ start: cursor, end: to });
  return out;
}

/** What is over, and what is left of the day with its free gaps as entries of their own. */
export function railEntries(items: AgendaItem[], tasks: Task[], now: Date): { past: RailEntry[]; upcoming: RailEntry[] } {
  const at = minuteOf(now);
  const all = [...eventEntries(items), ...taskEntries(tasks)];
  const gaps: RailEntry[] = freeGaps(dayBlocks(items, tasks), at, horizonMin(now)).map((g) => ({ kind: "gap", id: `gap-${g.start}`, ...g }));
  const order = (a: RailEntry, b: RailEntry) => a.start - b.start || a.end - b.end;
  return {
    past: all.filter((e) => e.end <= at).sort(order),
    upcoming: [...all.filter((e) => e.end > at), ...gaps].sort(order),
  };
}

export type Hero =
  | { kind: "now"; item: AgendaItem; left: number; pct: number }
  | { kind: "next"; item: AgendaItem; minutes: number }
  | { kind: "done"; count: number; minutes: number };

/** The meeting in progress, else the next one; once the day is over, a summary. Null when nothing takes time. */
export function heroOf(items: AgendaItem[], now: Date): Hero | null {
  const at = minuteOf(now);
  const events = eventEntries(items.filter((i) => i.response !== "declined")).filter((e) => e.kind === "event");
  if (events.length === 0) return null;
  const sorted = events.sort((a, b) => a.start - b.start);
  const cur = sorted.find((e) => e.start <= at && at < e.end);
  if (cur && cur.kind === "event") return { kind: "now", item: cur.item, left: cur.end - at, pct: (at - cur.start) / (cur.end - cur.start) };
  const nxt = sorted.find((e) => e.start > at);
  if (nxt && nxt.kind === "event") return { kind: "next", item: nxt.item, minutes: nxt.start - at };
  return { kind: "done", count: sorted.length, minutes: meetingMinutes(sorted) };
}

/** Time in meetings, overlapping ones counted once. */
function meetingMinutes(spans: Span[]): number {
  let total = 0;
  let end = -1;
  for (const s of [...spans].sort((a, b) => a.start - b.start)) {
    total += Math.max(0, s.end - Math.max(s.start, end));
    end = Math.max(end, s.end);
  }
  return total;
}

export type DayStats = { meetings: number; events: number; free: number; nextFree: number | null; clashes: number };

export function dayStats(items: AgendaItem[], tasks: Task[], now: Date): DayStats {
  const blocks = dayBlocks(items, tasks);
  const events = blocks.filter((b) => b.kind === "event");
  const gaps = freeGaps(blocks, minuteOf(now), horizonMin(now));
  const pairs = [...conflicts(items).values()].reduce((n, titles) => n + titles.length, 0) / 2;
  return {
    meetings: meetingMinutes(events),
    events: events.length,
    free: gaps.reduce((n, g) => n + (g.end - g.start), 0),
    nextFree: gaps[0]?.start ?? null,
    clashes: pairs,
  };
}

export type RibbonSegment = { id: string; kind: "event" | "task" | "gap"; tone: "solid" | "tentative" | "pending"; start: number; end: number };

/** The day on one line: hours covered, what fills them and the gaps still ahead. */
export function ribbon(items: AgendaItem[], tasks: Task[], now: Date) {
  const blocks = dayBlocks(items, tasks);
  const [first, last] = hourRange(blocks);
  const byId = new Map(items.map((i) => [i.id, i]));
  const gaps = freeGaps(blocks, Math.max(minuteOf(now), first * 60), Math.min(horizonMin(now), last * 60), 30);
  const segments: RibbonSegment[] = [
    ...gaps.map((g) => ({ id: `gap-${g.start}`, kind: "gap" as const, tone: "solid" as const, ...g })),
    ...blocks.map((b) => {
      const response = b.kind === "event" ? byId.get(b.id)?.response : undefined;
      const tone = response === "tentative" ? "tentative" : response === "needsAction" ? "pending" : "solid";
      return { id: `${b.kind}-${b.id}`, kind: b.kind, tone, start: b.start, end: b.end } as RibbonSegment;
    }),
  ];
  const ticks = Array.from({ length: Math.floor((last - first) / 2) + 1 }, (_, i) => first + i * 2).filter((h) => h <= last);
  return { from: first * 60, to: last * 60, segments, ticks, now: minuteOf(now) };
}

/** Where `task` fits inside `gap`, as minutes of the day; null when it doesn't. */
export function fitInGap(blocks: PlanBlock[], task: Task, gap: Span): number | null {
  const need = task.estimate_min ?? DEFAULT_TASK_MIN;
  const slot = firstFreeSlot(blocks, need, gap.start);
  return slot !== null && slot + need <= gap.end ? slot : null;
}
