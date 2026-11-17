import { invoke } from "@tauri-apps/api/core";
import type { SystemSnapshot } from "../../features/system/systemTypes";


export const systemApi = {
  /** Sistema: a fresh reading of CPU, GPU, memory, disks, network, battery and the heaviest apps, with the last minute. */
  systemGet: () => invoke<SystemSnapshot>("system_get"),
  /** The system alert kinds switched on (`SYSTEM_ALERT_KINDS`); Rust checks them once a minute. */
  systemAlertsGet: () => invoke<string[]>("system_alerts_get"),
  systemAlertsSet: (kinds: string[]) => invoke<string[]>("system_alerts_set", { kinds }),
};
