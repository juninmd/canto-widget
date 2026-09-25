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

/** Time actually spent in timed meetings: overlapping ones count once, all-day ones not at all. */
export function meetingMinutes(agenda: AgendaItem[]): number {
  const spans = agenda
    .filter((e) => !e.all_day)
    .map((e) => [Date.parse(e.start), Date.parse(e.end)])
    .filter(([s, e]) => Number.isFinite(s) && Number.isFinite(e) && e > s)
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [from, to] = [0, 0];
  for (const [s, e] of spans) {
    if (s > to) {
      total += to - from;
      [from, to] = [s, e];
    } else to = Math.max(to, e);
  }
  return Math.round((total + to - from) / 60000);
}

function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m} min` : `${h}h${m ? String(m).padStart(2, "0") : ""}`;
}

export type DayForges = { opened?: ForgeItem[]; merged?: ForgeItem[]; reviewed?: ForgeItem[] };

const forgeLine = (i: ForgeItem) => `${i.reference} ${i.title}${i.draft ? ` (${t("summary.draft")})` : ""}`;

/** Plain text, ready to paste into chat or email: no markdown that could break at the destination. */
export function daySummary(
  day: string,
  tasks: Task[],
  agenda: AgendaItem[],
  forges: DayForges = {},
  geminiDocs: GeminiDoc[] = [],
): string {
  const done = tasks.filter((t) => t.done);
  const open = tasks.filter((t) => !t.done);
  const lines = [t("summary.title", { date: longDate(day) }), ""];
  const section = (title: string, items: string[], extra = "") => {
    if (items.length === 0) return;
    lines.push(`${title} (${items.length}${extra})`, ...items.map((i) => `- ${i}`), "");
  };
  section(t("summary.done"), done.map((task) => task.title));
  section(t("summary.pending"), open.map((task) => (task.hora ? `${task.title} (${task.hora})` : task.title)));
  const minutes = meetingMinutes(agenda);
  const total = minutes > 0 ? ` · ${t("summary.meetingsTotal", { time: duration(minutes) })}` : "";
  section(t("summary.meetings"), agenda.map((e) => `${hour(e)} ${e.title}${geminiLink(e, geminiDocs)}`), total);
  section(t("summary.openedPrs"), (forges.opened ?? []).map(forgeLine));
  section(t("summary.mergedPrs"), (forges.merged ?? []).map(forgeLine));
  section(t("summary.reviewedPrs"), (forges.reviewed ?? []).map(forgeLine));
  if (lines.length === 2) lines.push(t("summary.empty"));
  return lines.join("\n").trimEnd();
}
