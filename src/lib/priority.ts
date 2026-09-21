import type { Priority } from "./api";

export const PRIORITY_LABEL: Record<Priority, string> = { high: "alta", medium: "média", low: "baixa" };
export const PRIORITY_DOT: Record<Priority, string> = { high: "bg-danger", medium: "bg-accent", low: "bg-faint" };
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
