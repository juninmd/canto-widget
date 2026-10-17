/** Agent harnesses: what the card shows of the release notes, the date and the installed count. */
import { LOCALE } from "../i18n";
import type { HarnessView } from "./api";
import { plainNotes } from "./releaseNotes";

/** The card shows the first lines; the whole changelog stays one click away, on GitHub. */
export const SUMMARY_LINES = 5;

export function releaseSummary(notes: string, lines = SUMMARY_LINES): string {
  return plainNotes(notes).split("\n").slice(0, lines).join("\n");
}

/** A local date; an empty or broken `published_at` gives "" so the row simply omits it. */
export function releaseDate(iso: string): string {
  const at = new Date(iso);
  if (iso.trim() === "" || Number.isNaN(at.getTime())) return "";
  return at.toLocaleDateString(LOCALE, { day: "2-digit", month: "short", year: "numeric" });
}

export function installedCount(views: readonly Pick<HarnessView, "installed">[]): number {
  return views.filter((v) => v.installed).length;
}
