import { invoke } from "@tauri-apps/api/core";

export type StatusItem = { title: string; link: string; published_at: number };
export type StatusLive = { indicator: "none" | "minor" | "major" | "critical" | "maintenance"; description: string };
export type StatusResult = { id: string; label: string; items: StatusItem[]; error: string | null; live?: StatusLive | null };

export const statusApi = {
  /** RSS/Atom incident history from services the team depends on; served from a 5 min cache unless `force`. */
  apiStatus: (force = false) => invoke<StatusResult[]>("api_status", { force }),
  statusAlertsGet: () => invoke<string[]>("status_alerts_get"),
  statusAlertsSet: (ids: string[]) => invoke<string[]>("status_alerts_set", { ids }),
};
