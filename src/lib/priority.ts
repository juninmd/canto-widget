import type { Priority } from "./api";
import { t } from "../i18n";

export const PRIORITY_LABEL: Record<Priority, string> = { high: t("priority.high"), medium: t("priority.medium"), low: t("priority.low") };
export const PRIORITY_DOT: Record<Priority, string> = { high: "bg-danger", medium: "bg-warn", low: "bg-faint" };
/** The pill on a row: danger / warn / muted, so the level reads without the 2 px bar. */
export const PRIORITY_PILL: Record<Priority, string> = { high: "bg-danger/15 text-danger", medium: "bg-warn/15 text-warn", low: "bg-edge/70 text-muted" };
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Row button order: none → high → medium → low → none, so one click reaches the most used level. */
export function nextPriority(current: Priority | null | undefined): Priority | null {
  if (!current) return "high";
  return current === "high" ? "medium" : current === "medium" ? "low" : null;
}
