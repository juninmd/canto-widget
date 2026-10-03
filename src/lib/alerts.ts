import type { AgendaItem } from "./api";
import { minutesUntil } from "./agenda";
import { TASK_PREFIX } from "./reminders";
import { t } from "../i18n";

/** Same prefixes as `STATUS_PREFIX` and `MODEL_PREFIX` in `notification.rs`. */
export const STATUS_PREFIX = "status:";
export const MODEL_PREFIX = "model:";
/** Same prefix as `PR_PREFIX` in `notification.rs`: one of the user's own PRs has red CI or waits for a review. */
export const PR_PREFIX = "pr:";

export type AlertKind = "status" | "model" | "pr" | "task" | "meeting";
export type Tone = "danger" | "warn" | "accent" | "muted";

export function kindOf(e: AgendaItem): AlertKind {
  if (e.id.startsWith(STATUS_PREFIX)) return "status";
  if (e.id.startsWith(MODEL_PREFIX)) return "model";
  if (e.id.startsWith(PR_PREFIX)) return "pr";
  return e.id.startsWith(TASK_PREFIX) ? "task" : "meeting";
}

/** Statuspage's indicator decides how loud a service alert is; everything else keeps one tone per kind. */
export function toneOf(e: AgendaItem): Tone {
  switch (kindOf(e)) {
    case "status":
      if (e.tag === "major" || e.tag === "critical") return "danger";
      return e.tag === "maintenance" ? "muted" : "warn";
    case "model":
      return "muted";
    case "pr":
      return e.tag === "ci" ? "danger" : "warn";
    default:
      return "accent";
  }
}

const ORDER: Record<Tone, number> = { danger: 0, warn: 1, accent: 2, muted: 3 };

/** Worst first; ties keep arrival order, except meetings, which go by start time. */
export function sortAlerts(list: AgendaItem[]): AgendaItem[] {
  return list
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      const byTone = ORDER[toneOf(a.e)] - ORDER[toneOf(b.e)];
      if (byTone !== 0) return byTone;
      if (kindOf(a.e) === "meeting" && kindOf(b.e) === "meeting") {
        const byStart = minutesUntil(a.e) - minutesUntil(b.e);
        if (Number.isFinite(byStart) && byStart !== 0) return byStart;
      }
      return a.i - b.i;
    })
    .map(({ e }) => e);
}

/** Statuspage's indicator in words; an unknown one reads as degraded, the least alarming true statement. */
export function levelLabel(tag: string | undefined): string {
  switch (tag) {
    case "critical":
      return t("alert.level.critical");
    case "major":
      return t("alert.level.major");
    case "maintenance":
      return t("alert.level.maintenance");
    default:
      return t("alert.level.minor");
  }
}
