import type { AgendaItem, ForgeItem, ForgeOpened, VaultPeriod } from "./api";
import { LOCALE, t } from "../i18n";
import { daysBetween, isWorkday, localDayOf, type Bounds } from "./period";
import { minutesOf } from "./focus";
import { dayStart, duration, meetingMinutes } from "./summary";

export type PeriodData = { vault: VaultPeriod; agenda: AgendaItem[]; forges: ForgeOpened | null };
export type WorkdayTotal = { day: string; tasks: number; minutes: number };
export type MeetingGroup = { title: string; count: number; minutes: number };

/** Time in meetings means timed meetings the user didn't decline; all-day entries are usually OOO or holidays. */
export function attended(agenda: AgendaItem[]): AgendaItem[] {
  return agenda.filter((e) => !e.all_day && e.response !== "declined");
}

/** Monday to today (never past Friday): what the user did each workday of the week. */
export function workdayTotals(bounds: Bounds, data: PeriodData): WorkdayTotal[] {
  const meetings = attended(data.agenda);
  return daysBetween(bounds.fromDay, bounds.toDay)
    .filter(isWorkday)
    .map((day) => ({
      day,
      tasks: data.vault.done.filter((task) => task.day === day).length,
      minutes: meetingMinutes(meetings.filter((e) => localDayOf(e.start) === day)),
    }));
}

/** A month of dailies reads better as "Daily (20×)" than as twenty lines; biggest time sink first. */
export function meetingGroups(agenda: AgendaItem[]): MeetingGroup[] {
  const byTitle = new Map<string, AgendaItem[]>();
  for (const e of attended(agenda)) byTitle.set(e.title, [...(byTitle.get(e.title) ?? []), e]);
  return [...byTitle.entries()]
    .map(([title, list]) => ({ title, count: list.length, minutes: meetingMinutes(list) }))
    .sort((a, b) => b.minutes - a.minutes || b.count - a.count || a.title.localeCompare(b.title));
}

function shortDay(day: string, weekday = false): string {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", ...(weekday && { weekday: "short" }) };
  return new Date(dayStart(day)).toLocaleDateString(LOCALE, opts);
}

function title(period: "week" | "month", b: Bounds): string {
  if (period === "week") return t("report.weekTitle", { from: shortDay(b.fromDay), to: shortDay(b.toDay) });
  const month = new Date(dayStart(b.fromDay)).toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
  return t("report.monthTitle", { month, to: shortDay(b.toDay) });
}

/** `[ref title](url)`: pasted into a PR, an issue or a wiki the reference stays a link. */
const forgeLine = (i: ForgeItem) =>
  `[${i.reference}](${i.url}) ${i.title}${i.draft ? ` (${t("summary.draft")})` : ""}`;

/** Markdown for a week or a month: overview, workdays (week only), then each list with its real total. */
export function periodSummary(period: "week" | "month", bounds: Bounds, data: PeriodData): string {
  const { vault, agenda, forges } = data;
  const lines = [`## ${title(period, bounds)}`, ""];
  /** `total` is the real count; a list bounded by the vault or the forge says how many it left out. */
  const section = (heading: string, items: string[], total = items.length, extra = "", bounded = true) => {
    if (total === 0) return;
    lines.push(`### ${heading} (${total}${extra})`, ...items.map((i) => `- ${i}`));
    if (bounded && total > items.length) lines.push(`- ${t("report.more", { count: total - items.length })}`);
    lines.push("");
  };
  const minutes = meetingMinutes(attended(agenda));
  const meetingsCount = attended(agenda).length;
  const forgeTotal = (k: "opened" | "merged" | "reviewed" | "closed", list?: ForgeItem[]) =>
    Math.max(forges?.totals?.[k] ?? 0, list?.length ?? 0);
  const overview = [
    [t("report.done"), vault.done_total],
    [t("report.notes"), vault.notes_total],
    [t("summary.meetings"), meetingsCount, minutes > 0 ? ` (${duration(minutes)})` : ""],
    [t("summary.mergedPrs"), forgeTotal("merged", forges?.merged)],
    [t("summary.reviewedPrs"), forgeTotal("reviewed", forges?.reviewed)],
    [t("summary.closedPrs"), forgeTotal("closed", forges?.closed)],
  ].filter(([, n]) => Number(n) > 0);
  const focusMin = minutesOf(vault.focused_secs ?? 0);
  if (overview.length === 0 && focusMin === 0 && forgeTotal("opened", forges?.items) === 0) {
    lines.push(t("report.empty"));
    return lines.join("\n");
  }
  const parts = overview.map(([l, n, x = ""]) => `**${l}:** ${n}${x}`);
  if (focusMin > 0) parts.push(`**${t("focus.reportLine")}:** ${duration(focusMin)}`);
  if (parts.length > 0) lines.push(parts.join(" · "), "");
  if (period === "week") {
    const rows = workdayTotals(bounds, data).map((w) =>
      t("report.workdayLine", { day: shortDay(w.day, true), tasks: w.tasks, time: duration(w.minutes) }),
    );
    section(t("report.byWorkday"), rows);
  }
  section(t("report.done"), vault.done.map((task) => `${task.title} (${shortDay(task.day)})`), vault.done_total);
  section(
    t("report.notes"),
    vault.notes.map((n) => `${n.title || "—"} (${t(n.created ? "report.noteCreated" : "report.noteEdited")})`),
    vault.notes_total,
  );
  const total = minutes > 0 ? ` · ${t("summary.meetingsTotal", { time: duration(minutes) })}` : "";
  const groups = meetingGroups(agenda).map((g) =>
    t("report.meetingGroup", { title: g.title, count: g.count, time: duration(g.minutes) }),
  );
  section(t("summary.meetings"), groups, meetingsCount, total, false);
  section(t("summary.openedPrs"), (forges?.items ?? []).map(forgeLine), forgeTotal("opened", forges?.items));
  section(t("summary.mergedPrs"), (forges?.merged ?? []).map(forgeLine), forgeTotal("merged", forges?.merged));
  section(t("summary.reviewedPrs"), (forges?.reviewed ?? []).map(forgeLine), forgeTotal("reviewed", forges?.reviewed));
  section(t("summary.closedPrs"), (forges?.closed ?? []).map(forgeLine), forgeTotal("closed", forges?.closed));
  return lines.join("\n").trimEnd();
}
