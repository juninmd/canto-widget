import { invoke } from "@tauri-apps/api/core";
import type { ForgeFilter, ForgeList, ForgeLists, ForgeOpened, ForgeSection, GitlabStatus } from "./forgeTypes";
import { t } from "../i18n";

export type * from "./forgeTypes";

// wire keys mirror the synced vault format (frozen across app versions)
/** `dia` of `semanal`: 0 = Sunday ... 6 = Saturday. */
export type Repeat = { tipo: "diaria" } | { tipo: "dias_uteis" } | { tipo: "semanal"; dia: number };

export type Subtask = { id: string; title: string; done: boolean };
export type Priority = "low" | "medium" | "high";
/** `day`: 1-31, matched exactly. `days`: 0 = Sunday ... 6 = Saturday, same as `Repeat`'s `dia`. */
export type ExtendedRepeat = { tipo: "monthly"; day: number } | { tipo: "specific_days"; days: number[] };

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
  pr_url?: string | null;
  subtasks?: Subtask[];
  priority?: Priority | null;
  /** Mutually exclusive with `repetir`: monthly or specific-weekdays recurrence. */
  extended_repeat?: ExtendedRepeat | null;
};

export type NoteLink = { kind: "task"; id: string; label: string } | { kind: "event"; id: string; label: string };

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_at: number;
  updated_at: number;
  fixada?: boolean;
  link?: NoteLink | null;
};

export type NotesPage = { total: number; items: Note[] };

export type VaultStatus = { exists: boolean; unlocked: boolean };
export type PasswordChanged = { biometricDisabled: boolean; pending: boolean };
export type BiometricStatus = { available: boolean; enabled: boolean; name: string };
export type UnlockEntry = { at: number; method: "password" | "windows_hello" | "touch_id" };
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

export type GithubStatus = { connected: boolean; login: string; source: string; device_flow: boolean };
export type DeviceCode = { user_code: string; url: string; expires_in_s: number };
/** `latest` is the newest published version, even when it is not newer than `current`. */
export type UpdateInfo = { current: string; latest: string; available: boolean; notes: string; date: string | null };
export type UpdateProgress = { downloaded: number; total: number | null };
export const UPDATE_PROGRESS_EVENT = "canto://update-progress";

// `preview` is the first 500 characters; copying fetches the stored text in Rust.
export type ClipItem = { id: string; preview: string; chars: number; kept: number; truncated: boolean; copied_at: number; pinned: boolean };
export type ClipList = { items: ClipItem[]; max_pinned: number };
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
  // Only Google Calendar events carry these; task reminders leave them out.
  organizer?: string;
  creator?: string;
  description?: string;
  guests?: number;
  attachments?: Attachment[];
  response?: Rsvp | "";
  attendees?: Guest[];
};
export type Rsvp = "accepted" | "declined" | "tentative" | "needsAction";
export type Guest = { name: string; email: string; response: Rsvp | ""; organizer: boolean; optional: boolean; me: boolean };
export type Attachment = { title: string; url: string; mime: string };
export type GuestPhotos = { photos: Record<string, string>; needs_consent: boolean };
/** Combined CI/pipeline status of a PR/MR's head commit. */
export type ChecksStatus = "success" | "failure" | "running" | "none";
export type GeminiDoc = { meeting: string; start: string; title: string; url: string };
export type StatusItem = { title: string; link: string; published_at: number };
export type StatusLive = { indicator: "none" | "minor" | "major" | "critical" | "maintenance"; description: string };
export type StatusResult = { id: string; label: string; items: StatusItem[]; error: string | null; live?: StatusLive | null };

export const api = {
  status: () => invoke<VaultStatus>("vault_status"),
  create: (password: string) => invoke<void>("vault_create", { password }),
  unlock: (password: string) => invoke<void>("vault_unlock", { password }),
  lock: () => invoke<void>("vault_lock"),
  touch: () => invoke<void>("vault_touch"),
  /** `pending`: a re-sealed file waits for the next unlock; the new password is already in effect. */
  changePassword: (currentPassword: string, newPassword: string) =>
    invoke<PasswordChanged>("vault_change_password", { currentPassword, newPassword }),

  tasksForDay: (day: string) => invoke<Task[]>("tasks_for_day", { day }),
  taskAdd: (title: string, day: string) => invoke<Task>("task_add", { title, day }),
  taskToggle: (id: string) => invoke<void>("task_toggle", { id }),
  /** Marks as done without toggling: a repeating task doesn't reopen. */
  taskComplete: (id: string) => invoke<void>("task_complete", { id }),
  taskRename: (id: string, title: string) => invoke<void>("task_rename", { id, title }),
  carryOver: (day: string) => invoke<number>("tasks_carry_over", { day }),
  taskSetSchedule: (id: string, time: string | null, repeat: Repeat | null) =>
    invoke<void>("task_set_schedule", { id, time, repeat }),
  /** `url: null` clears the link. */
  taskLinkPr: (id: string, url: string | null) => invoke<void>("task_link_pr", { id, url }),
  subtaskAdd: (id: string, title: string) => invoke<Subtask>("subtask_add", { id, title }),
  subtaskToggle: (id: string, subtaskId: string) => invoke<void>("subtask_toggle", { id, subtaskId }),
  subtaskRemove: (id: string, subtaskId: string) => invoke<void>("subtask_remove", { id, subtaskId }),
  taskSetPriority: (id: string, priority: Priority | null) => invoke<void>("task_set_priority", { id, priority }),
  tasksReorder: (day: string, ids: string[]) => invoke<void>("tasks_reorder", { day, ids }),
  taskSetExtendedRepeat: (id: string, repeat: ExtendedRepeat | null) =>
    invoke<void>("task_set_extended_repeat", { id, repeat }),
  /** Background watcher: doesn't postpone auto-lock; locked returns an empty list. */
  reminderLeadSet: (minutes: number) => invoke<void>("reminder_lead_set", { minutes }),
  languageSet: (lang: string) => invoke<void>("language_set", { lang }),

  notesSearch: (query: string, limit: number) => invoke<NotesPage>("notes_search", { query, limit }),
  noteSave: (note: { id?: string; title: string; body: string; tags: string[]; link?: NoteLink | null }) =>
    invoke<Note>("note_save", { id: note.id ?? null, link: note.link ?? null, ...note }),
  /** Returns whether the note ended up pinned. */
  notePin: (id: string) => invoke<boolean>("note_pin", { id }),
  /** Opens a native save dialog; `null` when the user cancels. */
  noteExportMd: (id: string) => invoke<string | null>("note_export_md", { id }),
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
  syncNow: () => invoke<ImportSummary | null>("sync_now"),

  driveStatus: () => invoke<DriveStatus>("drive_status"),
  driveConfigure: (clientId: string, clientSecret: string) =>
    invoke<void>("drive_configure", { clientId, clientSecret }),
  driveConnect: () => invoke<string>("drive_connect"),
  driveDisconnect: () => invoke<void>("drive_disconnect"),

  clipList: (query: string) => invoke<ClipList>("clip_list", { query }),
  clipCopy: (id: string) => invoke<void>("clip_copy", { id }),
  clipPin: (id: string) => invoke<void>("clip_pin", { id }),
  clipDelete: (id: string) => invoke<string | null>("clip_delete", { id }),
  clipClear: () => invoke<string | null>("clip_clear"),
  clipSetMaxPinned: (max: number) => invoke<void>("clip_set_max_pinned", { max }),

  transcriptsDir: () => invoke<string>("transcripts_dir"),
  transcriptsSetDir: (dir: string) => invoke<void>("transcripts_set_dir", { dir }),
  transcriptsList: (query: string) => invoke<TranscriptMeta[]>("transcripts_list", { query }),
  transcriptRead: (name: string) => invoke<string>("transcript_read", { name }),

  agendaToday: (timeMin: string, timeMax: string) =>
    invoke<AgendaItem[]>("agenda_today", { timeMin, timeMax }),
  geminiDocs: (timeMin: string, timeMax: string) => invoke<GeminiDoc[]>("gemini_docs", { timeMin, timeMax }),
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
  /** Served from Rust's cache for 5 min unless `force`; the rate-limit guard applies either way. */
  githubLists: (filter: ForgeFilter, force = false) => invoke<ForgeLists>("github_lists", { filter, force }),
  githubSection: (section: ForgeSection, page: number, filter: ForgeFilter) =>
    invoke<ForgeList>("github_section", { section, page, filter }),
  /** One call per click, not per list row: never fetched for a whole page at once. */
  githubPrChecks: (repo: string, number: number) => invoke<ChecksStatus>("github_pr_checks", { repo, number }),

  gitlabStatus: () => invoke<GitlabStatus>("gitlab_status"),
  /** Validates address and token against the instance; returns the username. */
  gitlabConnect: (baseUrl: string, token: string) => invoke<string>("gitlab_connect", { baseUrl, token }),
  gitlabDisconnect: () => invoke<void>("gitlab_disconnect"),
  gitlabLists: (filter: ForgeFilter, force = false) => invoke<ForgeLists>("gitlab_lists", { filter, force }),
  gitlabSection: (section: ForgeSection, page: number, filter: ForgeFilter) =>
    invoke<ForgeList>("gitlab_section", { section, page, filter }),
  /** One call per click, not per list row: never fetched for a whole page at once. */
  gitlabMrChecks: (project: string, iid: number) => invoke<ChecksStatus>("gitlab_mr_checks", { project, iid }),
  /** PRs/MRs opened since local midnight on every connected forge; one failing forge only adds to `errors`. */
  forgesOpenedSince: (sinceMs: number) => invoke<ForgeOpened>("forges_opened_since", { sinceMs }),
  /** Feeds the taskbar badge: Rust can't compute "today" reliably itself (see AGENTS.md), so the UI pushes it. */
  badgeSetTasks: (count: number) => invoke<void>("badge_set_tasks", { count }),

  /** RSS/Atom incident history from services the team depends on; served from a 5 min cache unless `force`. */
  apiStatus: (force = false) => invoke<StatusResult[]>("api_status", { force }),
  guestPhotos: (emails: string[]) => invoke<GuestPhotos>("guest_photos", { emails }),
  statusAlertsGet: () => invoke<string[]>("status_alerts_get"),
  statusAlertsSet: (ids: string[]) => invoke<string[]>("status_alerts_set", { ids }),

  updateCheck: () => invoke<UpdateInfo>("update_check"),
  /** Verifies the signature, installs and restarts the app; only resolves if something fails first. */
  updateInstall: () => invoke<void>("update_install"),
};

export function errText(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : t("app.unexpectedError");
}
