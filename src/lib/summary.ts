import type { AgendaItem, ForgeItem, GeminiDoc, Task } from "./api";
import { hour } from "./agenda";
import { LOCALE, t } from "../i18n";

/** Local midnight of a `YYYY-MM-DD` day, in ms. */
export function dayStart(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function longDate(day: string): string {
  return new Date(dayStart(day)).toLocaleDateString(LOCALE, { weekday: "long", day: "2-digit", month: "2-digit" });
}

/** Same event the Calendar attachment came from: title and start match exactly. */
function geminiLink(e: AgendaItem, docs: GeminiDoc[]): string {
  const doc = docs.find((d) => d.meeting === e.title && d.start === e.start);
  return doc ? ` — ${t("summary.geminiNotes", { url: doc.url })}` : "";
}

/** Plain text, ready to paste into chat or email: no markdown that could break at the destination. */
export function daySummary(
  day: string,
  tasks: Task[],
  agenda: AgendaItem[],
  opened: ForgeItem[] = [],
  geminiDocs: GeminiDoc[] = [],
): string {
  const done = tasks.filter((t) => t.done);
  const open = tasks.filter((t) => !t.done);
  const lines = [t("summary.title", { date: longDate(day) }), ""];
  const section = (title: string, items: string[]) => {
    if (items.length === 0) return;
    lines.push(`${title} (${items.length})`, ...items.map((i) => `- ${i}`), "");
  };
  section(t("summary.done"), done.map((task) => task.title));
  section(t("summary.pending"), open.map((task) => (task.hora ? `${task.title} (${task.hora})` : task.title)));
  section(t("summary.meetings"), agenda.map((e) => `${hour(e)} ${e.title}${geminiLink(e, geminiDocs)}`));
  section(t("summary.openedPrs"), opened.map((i) => `${i.reference} ${i.title}${i.draft ? ` (${t("summary.draft")})` : ""}`));
  if (lines.length === 2) lines.push(t("summary.empty"));
  return lines.join("\n").trimEnd();
}
