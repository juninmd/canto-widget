import { t } from "../i18n";

// Only the order of magnitude matters in a list, so minutes, hours and days are enough.
export function timeAgo(at: string | number, now = new Date()): string {
  const min = Math.floor((now.getTime() - new Date(at).getTime()) / 60_000);
  if (!Number.isFinite(min) || min < 1) return t("time.now");
  if (min < 60) return t("time.minutesAgo", { n: min });
  if (min < 24 * 60) return t("time.hoursAgo", { n: Math.floor(min / 60) });
  return t("time.daysAgo", { n: Math.floor(min / (24 * 60)) });
}

export function daysSince(at: string, now = new Date()): number {
  return Math.floor((now.getTime() - new Date(at).getTime()) / 86_400_000);
}
