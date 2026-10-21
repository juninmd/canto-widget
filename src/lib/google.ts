import { LOCALE } from "../i18n";

/** What the Google tabs need before they can show anything: a login, a new login with the new scopes, or nothing. */
export function googleGate(error: string): "connect" | "reconnect" | null {
  if (/entre com o google|sign in with google/i.test(error)) return "connect";
  if (/reconecte o google|reconnect google/i.test(error)) return "reconnect";
  return null;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Today shows the time, any other day the short date: how a mail client lists its inbox. */
export function shortWhen(at: Date, now: Date): string {
  if (Number.isNaN(at.getTime())) return "";
  return sameDay(at, now)
    ? at.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })
    : at.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit" });
}

/** Google keeps only the day of a task's due date, as midnight UTC: read it as a plain day. */
export function dueDay(due: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(due);
  if (!match) return "";
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
  });
}

/** A due day before `today` (both `YYYY-MM-DD`) is late. */
export const isLate = (due: string, today: string) => due !== "" && due < today;

export const initials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
