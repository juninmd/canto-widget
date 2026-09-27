import type { AgendaItem } from "./api";
import { LOCALE, t } from "../i18n";

/** Past this hour a free slot stops counting; after it, the horizon moves to midnight so the evening still gets an answer. */
export const WORKDAY_END_HOUR = 19;
export const MIN_FREE_MINUTES = 15;

type Span = { id: string; title: string; start: number; end: number };

/** Timed events that actually take my time: all-day blocks and invites I declined don't. */
function busy(items: AgendaItem[]): Span[] {
  return items
    .filter((i) => !i.all_day && i.response !== "declined")
    .map((i) => ({ id: i.id, title: i.title, start: new Date(i.start).getTime(), end: new Date(i.end).getTime() }))
    .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
    .sort((a, b) => a.start - b.start);
}

export function horizon(now: Date): Date {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), WORKDAY_END_HOUR, 0, 0);
  return now < end ? end : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
}

/** `end: null` means nothing else is booked for the day. */
export type FreeSlot = { start: Date; end: Date | null; now: boolean };

/** First gap of at least `minMinutes` between now and the horizon, skipping busy spans (overlapping or back to back). */
export function nextFree(items: AgendaItem[], now: Date, minMinutes = MIN_FREE_MINUTES): FreeSlot | null {
  const limit = horizon(now).getTime();
  const min = minMinutes * 60_000;
  let cursor = now.getTime();
  for (const s of busy(items)) {
    if (s.end <= cursor) continue;
    if (cursor >= limit) return null;
    const gapEnd = Math.min(s.start, limit);
    if (gapEnd - cursor >= min) return { start: new Date(cursor), end: new Date(gapEnd), now: cursor === now.getTime() };
    cursor = Math.max(cursor, s.end);
  }
  if (limit - cursor < min) return null;
  return { start: new Date(cursor), end: null, now: cursor === now.getTime() };
}

const clock = (d: Date) => d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

/** "1 h 30 min", "45 min", "2 h". */
export function duration(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return t("agenda.free.min", { n: m });
  return m ? t("agenda.free.hMin", { h, n: m }) : t("agenda.free.h", { h });
}

export function freeLabel(slot: FreeSlot | null, now: Date): string {
  if (!slot) return t("agenda.free.none", { min: MIN_FREE_MINUTES, end: clock(horizon(now)) });
  if (!slot.end) return slot.now ? t("agenda.free.restOfDay") : t("agenda.free.restFrom", { start: clock(slot.start) });
  if (slot.now) return t("agenda.free.nowUntil", { end: clock(slot.end) });
  const minutes = (slot.end.getTime() - slot.start.getTime()) / 60_000;
  return t("agenda.free.next", { start: clock(slot.start), end: clock(slot.end), duration: duration(minutes) });
}

/** For each event, the titles of the others it overlaps; merely touching at the edges isn't a conflict. */
export function conflicts(items: AgendaItem[]): Map<string, string[]> {
  const spans = busy(items);
  const out = new Map<string, string[]>();
  const add = (id: string, title: string) => out.set(id, [...(out.get(id) ?? []), title]);
  spans.forEach((a, i) => {
    for (const b of spans.slice(i + 1)) {
      if (b.start >= a.end) break;
      add(a.id, b.title);
      add(b.id, a.title);
    }
  });
  return out;
}
