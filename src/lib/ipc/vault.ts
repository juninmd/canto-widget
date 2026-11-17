import { invoke } from "@tauri-apps/api/core";

export type VaultStatus = { exists: boolean; unlocked: boolean };
export type PasswordChanged = { biometricDisabled: boolean; pending: boolean };
export type BiometricStatus = { available: boolean; enabled: boolean; name: string };
export type UnlockEntry = { at: number; method: "password" | "windows_hello" | "touch_id" };
export type SyncStatus = {
  lastExportOkAt: number | null;
  lastExportError: string | null;
  lastMergeOkAt: number | null;
  lastMergeError: string | null;
  consecutiveFailures: number;
};
export type DriveStatus = {
  configured: boolean;
  embedded?: boolean;
  connected: boolean;
  email: string;
  name?: string;
  /** Account photo as a `data:` URL, or empty. */
  avatar?: string;
};
export type ImportSummary = { tasks: number; notes: number };

export const vaultApi = {
  status: () => invoke<VaultStatus>("vault_status"),
  create: (password: string) => invoke<void>("vault_create", { password }),
  unlock: (password: string) => invoke<void>("vault_unlock", { password }),
  lock: () => invoke<void>("vault_lock"),
  touch: () => invoke<void>("vault_touch"),
  /** `pending`: a re-sealed file waits for the next unlock; the new password is already in effect. */
  changePassword: (currentPassword: string, newPassword: string) =>
    invoke<PasswordChanged>("vault_change_password", { currentPassword, newPassword }),
  biometricStatus: () => invoke<BiometricStatus>("biometric_status"),
  biometricEnable: () => invoke<void>("biometric_enable"),
  biometricUnlock: () => invoke<void>("biometric_unlock"),
  biometricDisable: () => invoke<void>("biometric_disable"),
  autostartStatus: () => invoke<boolean>("autostart_status"),
  autostartSet: (enabled: boolean) => invoke<void>("autostart_set", { enabled }),
  autolockGet: () => invoke<number>("autolock_get"),
  autolockSet: (minutes: number) => invoke<void>("autolock_set", { minutes }),
  unlockHistory: () => invoke<UnlockEntry[]>("unlock_history"),
  /** `null` when the user cancels the dialog. */
  backupExport: () => invoke<string | null>("backup_export"),
  backupImport: () => invoke<ImportSummary | null>("backup_import"),
  syncGet: () => invoke<string | null>("sync_get"),
  /** `null` when the user cancels the folder dialog. */
  syncSetFolder: () => invoke<string | null>("sync_set_folder"),
  syncClear: () => invoke<void>("sync_clear"),
  /** `null` when there was nothing new to merge. */
  syncStatus: () => invoke<SyncStatus>("sync_status"),
  syncNow: () => invoke<ImportSummary | null>("sync_now"),
  driveStatus: () => invoke<DriveStatus>("drive_status"),
  driveConfigure: (clientId: string, clientSecret: string) =>
    invoke<void>("drive_configure", { clientId, clientSecret }),
  driveConnect: () => invoke<string>("drive_connect"),
  driveDisconnect: () => invoke<void>("drive_disconnect"),
  /** Tab choices kept in a file as well: the webview's storage can come back empty after an update. */
  prefsGet: () => invoke<Record<string, string>>("prefs_get"),
  prefsSet: (key: string, value: string) => invoke<void>("prefs_set", { key, value }),
};
