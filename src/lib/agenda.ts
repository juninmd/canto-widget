import type { AgendaItem } from "./api";
import { LOCALE, t } from "../i18n";

/** Day window in RFC3339, from midnight to the end of the day. */
export function dayWindow(now = new Date()): { timeMin: string; timeMax: string } {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

export function hour(item: AgendaItem): string {
  if (item.all_day) return t("agenda.allDay");
  const d = new Date(item.start);
  return Number.isNaN(d.getTime())
    ? item.start
    : d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}

/** Minutes until the event starts (negative if it has already started). */
export function minutesUntil(item: AgendaItem, now = new Date()): number {
  if (item.all_day) return Number.POSITIVE_INFINITY;
  const start = new Date(item.start).getTime();
  if (Number.isNaN(start)) return Number.POSITIVE_INFINITY;
  return (start - now.getTime()) / 60000;
}

/**
 * Events that deserve the pop-up now: start within `leadTime` minutes,
 * haven't started more than 2 min ago, and were never alerted this session.
 */
export function shouldAlert(
  items: AgendaItem[],
  alreadyAlerted: Set<string>,
  now = new Date(),
  leadTime = 1,
): AgendaItem[] {
  return items.filter((i) => {
    if (alreadyAlerted.has(i.id)) return false;
    const m = minutesUntil(i, now);
    return m <= leadTime && m > -2;
  });
}

/** Quick-read label: color alone can't be the only signal for "now" (WCAG 1.4.1). */
export function status(item: AgendaItem, now = new Date()): { label: string; now: boolean } {
  const remaining = minutesUntil(item, now);
  if (!Number.isFinite(remaining)) return { label: "", now: false };
  const end = new Date(item.end).getTime();
  const ended = Number.isNaN(end) ? remaining <= -60 : end <= now.getTime();
  if (ended) return { label: t("agenda.ended"), now: false };
  if (remaining <= 0) return { label: t("agenda.now"), now: true };
  const min = Math.ceil(remaining);
  const h = Math.floor(min / 60);
  return { label: h ? t("agenda.inHours", { h, mm: String(min % 60).padStart(2, "0") }) : t("agenda.inMinutes", { n: min }), now: false };
}

/** "organizado por Ana · criado por Bruno · 5 convidados"; the creator only shows when it isn't the organizer. */
export function people(item: AgendaItem): string {
  const parts: string[] = [];
  if (item.organizer) parts.push(t("agenda.organizedBy", { name: item.organizer }));
  if (item.creator && item.creator !== item.organizer) parts.push(t("agenda.createdBy", { name: item.creator }));
  const guests = item.guests ?? 0;
  if (guests > 0) parts.push(guests === 1 ? t("agenda.guests.one") : t("agenda.guests.other", { n: guests }));
  return parts.join(" · ");
}
