import { t } from "../i18n";
import type { TaskContext } from "./api";

export const CONTEXT_KINDS = ["app", "wifi"] as const;

/** The pill under a task: where it is waiting for, in the user's words. */
export function contextLabel(c: TaskContext): string {
  return c.kind === "app" ? t("tasks.context.chipApp", { name: c.name }) : t("tasks.context.chipWifi", { name: c.name });
}
