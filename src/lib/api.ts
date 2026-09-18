import { invoke } from "@tauri-apps/api/core";

// wire keys mirror the synced vault format (frozen across app versions)
/** `dia` of `semanal`: 0 = Sunday ... 6 = Saturday. */
export type Repeat = { tipo: "diaria" } | { tipo: "dias_uteis" } | { tipo: "semanal"; dia: number };

export type Task = {
  id: string;
  title: string;
  done: boolean;
  day: string;
  created_at: number;
  updated_at: number;
  /** Local "HH:MM" reminder time. */
  hora?: string | null;
  repetir?: Repeat | null;
  serie?: string | null;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  fixada?: boolean;
};

export type NotesPage = { total: number; items: Note[] };

export type VaultStatus = { exists: boolean; unlocked: boolean };
export type BiometricStatus = { available: boolean; enabled: boolean; name: string };
export type WindowConfig = { position: [number, number] | null; size: [number, number] | null; always_on_top: boolean };

/// User's local day as YYYY-MM-DD. Lives in the frontend because the Rust
/// process's timezone isn't reliable on multithreaded Linux.
export function todayLocal(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
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

export type GithubItem = {
  repo: string;
  number: number;
  title: string;
  url: string;
  updated_at: string;
  is_pr: boolean;
  draft: boolean;
  author: string;
};
/** `total` is GitHub's count; `items` only carries the first page (up to 30). */
export type GithubList = { total: number; items: GithubItem[] };
export type GithubLists = { assigned: GithubList; my_prs: GithubList; review_requested: GithubList; my_issues: GithubList };
export type GithubStatus = { connected: boolean; login: string; source: string; device_flow: boolean };
export type DeviceCode = { user_code: string; url: string; expires_in_s: number };

// `preview` is the first 500 characters; copying fetches the stored text in Rust.
export type ClipItem = { id: string; preview: string; chars: number; kept: number; truncated: boolean; copied_at: number; pinned: boolean };
export type TranscriptMeta = { name: string; modified_at: number; size: number; preview: string };
export type AgendaItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  all_day: boolean;
  location: string;
  meet: string;
  link: string;
};

export const api = {
  status: () => invoke<VaultStatus>("vault_status"),
  create: (password: string) => invoke<void>("vault_create", { password }),
  unlock: (password: string) => invoke<void>("vault_unlock", { password }),
  lock: () => invoke<void>("vault_lock"),
  touch: () => invoke<void>("vault_touch"),
  /** Returns `true` when biometrics was disabled because it stored the old password. */
  changePassword: (currentPassword: string, newPassword: string) =>
    invoke<boolean>("vault_change_password", { currentPassword, newPassword }),

  tasksForDay: (day: string) => invoke<Task[]>("tasks_for_day", { day }),
  taskAdd: (title: string, day: string) => invoke<Task>("task_add", { title, day }),
  taskToggle: (id: string) => invoke<void>("task_toggle", { id }),
  /** Marks as done without toggling: a repeating task doesn't reopen. */
  taskComplete: (id: string) => invoke<void>("task_complete", { id }),
  taskRename: (id: string, title: string) => invoke<void>("task_rename", { id, title }),
  carryOver: (day: string) => invoke<number>("tasks_carry_over", { day }),
  taskSetSchedule: (id: string, time: string | null, repeat: Repeat | null) =>
    invoke<void>("task_set_schedule", { id, time, repeat }),
  /** Background watcher: doesn't postpone auto-lock; locked returns an empty list. */
  tasksReminders: (day: string) => invoke<Task[]>("tasks_reminders", { day }),

  notesSearch: (query: string, limit: number) => invoke<NotesPage>("notes_search", { query, limit }),
  noteSave: (note: { id?: string; title: string; body: string; tags: string[] }) =>
    invoke<Note>("note_save", { id: note.id ?? null, ...note }),
  /** Returns whether the note ended up pinned. */
  notePin: (id: string) => invoke<boolean>("note_pin", { id }),
  /** Returns the key for `trashUndo`, or `null` if nothing was removed. */
  itemDelete: (id: string) => invoke<string | null>("item_delete", { id }),
  trashUndo: (key: string) => invoke<boolean>("trash_undo", { key }),

  biometricStatus: () => invoke<BiometricStatus>("biometric_status"),
  biometricEnable: () => invoke<void>("biometric_enable"),
  biometricUnlock: () => invoke<void>("biometric_unlock"),
  biometricDisable: () => invoke<void>("biometric_disable"),

  windowConfig: () => invoke<WindowConfig>("window_config"),
  windowSetAlwaysOnTop: (enabled: boolean) => invoke<void>("window_set_always_on_top", { enabled }),
  windowReset: () => invoke<void>("window_reset"),

  autostartStatus: () => invoke<boolean>("autostart_status"),
  autostartSet: (enabled: boolean) => invoke<void>("autostart_set", { enabled }),

  /** `null` when the user cancels the dialog. */
  backupExport: () => invoke<string | null>("backup_export"),
  backupImport: () => invoke<ImportSummary | null>("backup_import"),

  driveStatus: () => invoke<DriveStatus>("drive_status"),
  driveConfigure: (clientId: string, clientSecret: string) =>
    invoke<void>("drive_configure", { clientId, clientSecret }),
  driveConnect: () => invoke<string>("drive_connect"),
  driveDisconnect: () => invoke<void>("drive_disconnect"),

  clipList: (query: string) => invoke<ClipItem[]>("clip_list", { query }),
  clipCopy: (id: string) => invoke<void>("clip_copy", { id }),
  clipPin: (id: string) => invoke<void>("clip_pin", { id }),
  clipDelete: (id: string) => invoke<string | null>("clip_delete", { id }),
  clipClear: () => invoke<string | null>("clip_clear"),

  transcriptsDir: () => invoke<string>("transcripts_dir"),
  transcriptsSetDir: (dir: string) => invoke<void>("transcripts_set_dir", { dir }),
  transcriptsList: (query: string) => invoke<TranscriptMeta[]>("transcripts_list", { query }),
  transcriptRead: (name: string) => invoke<string>("transcript_read", { name }),

  agendaToday: (timeMin: string, timeMax: string) =>
    invoke<AgendaItem[]>("agenda_today", { timeMin, timeMax }),
  alertOpen: (event: AgendaItem) => invoke<void>("alert_open", { event }),
  alertPayload: () => invoke<AgendaItem | null>("alert_payload"),
  alertClose: () => invoke<void>("alert_close"),
  alertSnooze: (minutes: number) => invoke<void>("alert_snooze", { minutes }),
  openLink: (url: string) => invoke<void>("open_link", { url }),

  githubStatus: () => invoke<GithubStatus>("github_status"),
  /** Returns the login of the token's owner account. */
  githubSaveToken: (token: string) => invoke<string>("github_save_token", { token }),
  githubDeviceStart: () => invoke<DeviceCode>("github_device_start"),
  /** Resolves when the user authorizes in the browser; rejects on expiry or cancel. */
  githubDeviceFinish: () => invoke<string>("github_device_finish"),
  githubDeviceCancel: () => invoke<void>("github_device_cancel"),
  githubDisconnect: () => invoke<void>("github_disconnect"),
  githubLists: () => invoke<GithubLists>("github_lists"),
};

export function errText(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : "erro inesperado";
}
