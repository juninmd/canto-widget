import { invoke } from "@tauri-apps/api/core";

/** `latest` is the newest published version, even when it is not newer than `current`. */
export type UpdateInfo = { current: string; latest: string; available: boolean; notes: string; date: string | null };
export type UpdateProgress = { downloaded: number; total: number | null };
export const UPDATE_PROGRESS_EVENT = "canto://update-progress";

export const updateApi = {
  updateCheck: () => invoke<UpdateInfo>("update_check"),
  /** Verifies the signature, installs and restarts the app; only resolves if something fails first. */
  updateInstall: () => invoke<void>("update_install"),
};
