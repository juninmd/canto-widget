import type { AgendaItem, Guest } from "./api";
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

/** Two letters for the avatar: first and last word, or the start of an e-mail. */
export function initials(name: string): string {
  const words = name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return "?";
  const pick = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2);
  return pick.toUpperCase();
}

const TONES = [
  "bg-sky-500/30",
  "bg-violet-500/30",
  "bg-amber-500/30",
  "bg-rose-500/30",
  "bg-emerald-500/30",
  "bg-cyan-500/30",
  "bg-fuchsia-500/30",
  "bg-orange-500/30",
];

/** Same person, same color, on every event: a hash of the e-mail (or name) picks the tone. */
export function avatarTone(key: string): string {
  let h = 0;
  for (const c of key.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** Answer counts for the guest list header. */
export function tally(guests: Guest[]): { yes: number; no: number; maybe: number; pending: number } {
  const count = (r: string) => guests.filter((g) => g.response === r).length;
  const yes = count("accepted");
  const no = count("declined");
  const maybe = count("tentative");
  return { yes, no, maybe, pending: guests.length - yes - no - maybe };
}
