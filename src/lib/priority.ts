import type { Priority } from "./api";
import { t } from "../i18n";

export const PRIORITY_LABEL: Record<Priority, string> = { high: t("priority.high"), medium: t("priority.medium"), low: t("priority.low") };
export const PRIORITY_DOT: Record<Priority, string> = { high: "bg-danger", medium: "bg-accent", low: "bg-faint" };
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
