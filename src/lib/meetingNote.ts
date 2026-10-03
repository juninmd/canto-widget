import type { AgendaItem, Note } from "./api";
import { hour } from "./agenda";
import { LOCALE, t } from "../i18n";

/** A note a person would keep for this meeting: when, who, the agenda from the invite and room to write. */
export function meetingNoteDraft(event: AgendaItem): { title: string; body: string; tags: string[] } {
  const day = new Date(event.start).toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit" });
  const names = (event.attendees ?? []).map((g) => g.name || g.email);
  const lines = [`**${t("alert.prep.note.when")}:** ${hour(event)}`];
  if (names.length > 0) lines.push("", `## ${t("alert.prep.note.guests")}`, "", ...names.map((n) => `- ${n}`));
  if (event.description) lines.push("", `## ${t("alert.prep.note.agenda")}`, "", event.description);
  lines.push("", `## ${t("alert.prep.note.notes")}`, "");
  return { title: `${event.title} · ${day}`, body: lines.join("\n"), tags: [t("alert.prep.note.tag")] };
}

/** Earlier notes about the same meeting: a title that contains the event's, newest first as the search returns them. */
export function relatedNotes(notes: Note[], event: AgendaItem, max = 3): Note[] {
  const needle = event.title.trim().toLowerCase();
  if (!needle) return [];
  return notes.filter((n) => n.title.toLowerCase().includes(needle)).slice(0, max);
}
