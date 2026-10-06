import { t } from "../i18n";
import { appName, byCategory, secsLabel } from "./activity";
import type { ActivityFocus } from "./api";

/** The day as plain text for a message or a stand-up: total, time per category and the top applications. */
export function activityText(day: string, apps: { app: string; secs: number }[], focus: ActivityFocus[] = []): string {
  const total = apps.reduce((s, a) => s + a.secs, 0);
  const lines = byCategory(apps).map((c) => `- ${t(`activity.cat.${c.category}` as const)}: ${secsLabel(c.secs)}`);
  const top = apps.slice(0, 3).map((a) => `${appName(a.app)} ${secsLabel(a.secs)}`).join(", ");
  const tasks = focus.map((f) => `${f.title ?? t("activity.taskGone")} ${secsLabel(f.secs)}`).join(", ");
  return [
    t("activity.summaryHead", { day, time: secsLabel(total) }),
    ...lines,
    top,
    tasks && t("activity.summaryTasks", { tasks }),
  ].filter(Boolean).join("\n");
}
