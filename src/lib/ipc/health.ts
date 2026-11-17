import { invoke } from "@tauri-apps/api/core";
import type { HealthEndpoint, HealthView } from "../../features/health/healthTypes";


export const healthApi = {
  healthList: () => invoke<HealthView[]>("health_list"),
  /** Empty `id` adds; a known one updates. Returns the whole list. */
  healthSave: (endpoint: HealthEndpoint) => invoke<HealthView[]>("health_save", { endpoint }),
  healthRemove: (id: string) => invoke<HealthView[]>("health_remove", { id }),
  healthCheckNow: (id: string) => invoke<HealthView[]>("health_check_now", { id }),
};
