import { t } from "../i18n";
import { activityApi } from "./ipc/activity";
import { agendaApi } from "./ipc/agenda";
import { agentsApi } from "./ipc/agents";
import { alertsApi } from "./ipc/alerts";
import { clipboardApi } from "./ipc/clipboard";
import { devApi } from "./ipc/dev";
import { githubApi } from "./ipc/github";
import { googleApi } from "./ipc/google";
import { healthApi } from "./ipc/health";
import { marketApi } from "./ipc/market";
import { mcpApi } from "./ipc/mcp";
import { modelsApi } from "./ipc/models";
import { notesApi } from "./ipc/notes";
import { readsApi } from "./ipc/reads";
import { statusApi } from "./ipc/status";
import { steamApi } from "./ipc/steam";
import { systemApi } from "./ipc/system";
import { tasksApi } from "./ipc/tasks";
import { trafficApi } from "./ipc/traffic";
import { updateApi } from "./ipc/update";
import { vaultApi } from "./ipc/vault";
import { weatherApi } from "./ipc/weather";
import { windowApi } from "./ipc/window";

// IPC surface, split by domain in ./ipc/<domain>.ts; every consumer still imports from here.
export * from "./ipc/activity";
export * from "./ipc/agenda";
export * from "./ipc/agents";
export * from "./ipc/alerts";
export * from "./ipc/clipboard";
export * from "./ipc/dev";
export * from "./ipc/github";
export * from "./ipc/google";
export * from "./ipc/health";
export * from "./ipc/market";
export * from "./ipc/mcp";
export * from "./ipc/models";
export * from "./ipc/notes";
export * from "./ipc/reads";
export * from "./ipc/status";
export * from "./ipc/steam";
export * from "./ipc/system";
export * from "./ipc/tasks";
export * from "./ipc/time";
export * from "./ipc/traffic";
export * from "./ipc/update";
export * from "./ipc/vault";
export * from "./ipc/weather";
export * from "./ipc/window";
export type * from "../features/forge/forgeTypes";
export type * from "../features/health/healthTypes";
export type * from "../features/system/systemTypes";
export type * from "../features/dev/devTypes";
export { SYSTEM_ALERT_KINDS } from "../features/system/systemTypes";

export const api = {
  ...activityApi,
  ...agendaApi,
  ...agentsApi,
  ...alertsApi,
  ...clipboardApi,
  ...devApi,
  ...githubApi,
  ...googleApi,
  ...healthApi,
  ...marketApi,
  ...mcpApi,
  ...modelsApi,
  ...notesApi,
  ...readsApi,
  ...statusApi,
  ...steamApi,
  ...systemApi,
  ...tasksApi,
  ...trafficApi,
  ...updateApi,
  ...vaultApi,
  ...weatherApi,
  ...windowApi,
};

export function errText(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : t("app.unexpectedError");
}
