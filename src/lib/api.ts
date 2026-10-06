import { invoke } from "@tauri-apps/api/core";
import type { ForgeFilter, ForgeList, ForgeLists, ForgeOpened, ForgeSection, GitlabStatus, VaultPeriod } from "./forgeTypes";
import { t } from "../i18n";

export type * from "./forgeTypes";

// wire keys mirror the synced vault format (frozen across app versions)
/** `dia` of `semanal`: 0 = Sunday ... 6 = Saturday. */
export type Repeat = { tipo: "diaria" } | { tipo: "dias_uteis" } | { tipo: "semanal"; dia: number };

export type Subtask = { id: string; title: string; done: boolean };
/** Unix seconds: the day is cut in the UI, whose timezone is the reliable one. */
export type ActivitySpan = { app: string; start: number; end: number };
export type ActivityAway = { start: number; end: number };
/** Focus-timer time on one task; `title` is null once the task is gone. */
export type ActivityFocus = { task: string; title: string | null; secs: number };
export type ActivitySummary = {
  spans: ActivitySpan[];
  apps: { app: string; secs: number }[];
  total_secs: number;
  /** Stretches with the computer on and no keyboard or mouse input. */
  idle: ActivityAway[];
  idle_secs: number;
  focus: ActivityFocus[];
};
export type ActivityStatus = { supported: boolean; enabled: boolean };

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
  /** Planned effort in minutes. */
  estimate_min?: number | null;
  /** Seconds spent in focus. */
  tracked_secs?: number;
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

/** Pop-ups about the user's own PRs: red CI, and no review for `stalled_hours`. */
export type MyPrAlerts = { ci: boolean; stalled: boolean; stalled_hours: number; mentions: boolean };

export type ClipMode = "json_pretty" | "json_compact" | "one_line" | "upper" | "lower";

export type NotesPage = { total: number; items: Note[] };

export type VaultStatus = { exists: boolean; unlocked: boolean };
/** Do not disturb; `untilMs: null` while active means until turned off. */
export type DndState = { active: boolean; untilMs: number | null };
export type PasswordChanged = { biometricDisabled: boolean; pending: boolean };
export type BiometricStatus = { available: boolean; enabled: boolean; name: string };
export type UnlockEntry = { at: number; method: "password" | "windows_hello" | "touch_id" };
export type WindowConfig = { position: [number, number] | null; size: [number, number] | null; always_on_top: boolean; mini: boolean };

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
  /** Short state for alerts that aren't calendar events: a Status API indicator or a model's rank. */
  tag?: string;
};
/** What was done with an alert: the main action, snoozed, closed or (a service) muted. */
export type AlertOutcome = "done" | "snoozed" | "closed" | "muted";
export type ResolvedAlert = { item: AgendaItem; outcome: AlertOutcome; at: number };
export type Rsvp = "accepted" | "declined" | "tentative" | "needsAction";
export type Guest = { name: string; email: string; response: Rsvp | ""; organizer: boolean; optional: boolean; me: boolean };
export type Attachment = { title: string; url: string; mime: string };
export type GuestPhotos = { photos: Record<string, string>; needs_consent: boolean };
/** Combined CI/pipeline status of a PR/MR's head commit. */
export type ChecksStatus = "success" | "failure" | "running" | "none";
export type PrRef = { repo: string; number: number };
export type PrChecks = PrRef & { status: ChecksStatus };
export type GeminiDoc = { meeting: string; start: string; title: string; url: string };
export type StatusItem = { title: string; link: string; published_at: number };
export type StatusLive = { indicator: "none" | "minor" | "major" | "critical" | "maintenance"; description: string };
export type StatusResult = { id: string; label: string; items: StatusItem[]; error: string | null; live?: StatusLive | null };

/** `price`: USD per 1M tokens (blended 3:1); `speed`: median output tokens/s; null when not measured. */
export type ModelRow = {
  id: string;
  name: string;
  creator: string;
  score: number;
  price: number | null;
  speed: number | null;
  rank: number;
  badge: "new" | "up" | null;
};
/** `throttled`: a manual refresh inside the 3 h floor, answered from the cache until `next_fetch_at`. */
export type ModelsView = {
  alerts: boolean;
  models: ModelRow[];
  total: number;
  fetched_at: number;
  next_fetch_at: number;
  throttled: boolean;
  error: string | null;
};

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
  taskSetEstimate: (id: string, minutes: number | null) => invoke<void>("task_set_estimate", { id, minutes }),
  taskAddTime: (id: string, secs: number) => invoke<void>("task_add_time", { id, secs }),
  activityStatus: () => invoke<ActivityStatus>("activity_status"),
  activitySetEnabled: (enabled: boolean) => invoke<void>("activity_set_enabled", { enabled }),
  activitySummary: (fromMs: number, toMs: number) => invoke<ActivitySummary>("activity_summary", { fromMs, toMs }),
  activityClear: () => invoke<void>("activity_clear"),
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
  /** Seals a pasted/dropped image (base64, no `data:` prefix) and returns its id for `canto-img:<id>`. */
  noteImageSave: (data: string) => invoke<string>("note_image_save", { data }),
  /** A `data:image/...;base64,` URL; rejects with "imagem indisponível" when missing. */
  noteImageGet: (id: string) => invoke<string>("note_image_get", { id }),
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
  windowMiniSet: (enabled: boolean) => invoke<void>("window_mini_set", { enabled }),
  windowMiniResize: (width: number, height: number) => invoke<void>("window_mini_resize", { width, height }),

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
  /** Copies the item rewritten by `mode` (see `clipTransforms`); the history entry stays as it was. */
  clipCopyAs: (id: string, mode: ClipMode) => invoke<void>("clip_copy_as", { id, mode }),
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
  alertPayload: () => invoke<AgendaItem[]>("alert_payload"),
  /** No outcome means plain "closed"; Rust records it for the notifications column. */
  alertClose: (id: string, outcome?: AlertOutcome) => invoke<void>("alert_close", { id, outcome }),
  alertLog: () => invoke<ResolvedAlert[]>("alert_log"),
  mainShow: () => invoke<void>("main_show"),
  alertSnooze: (id: string, minutes: number) => invoke<void>("alert_snooze", { id, minutes }),
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
  /** Fallback click for a PR the batch left out; shares the batch's cache. */
  githubPrChecks: (repo: string, number: number) => invoke<ChecksStatus>("github_pr_checks", { repo, number }),
  /** CI badges for up to 20 PRs, cached in Rust per head sha; PRs that failed to load are left out. */
  githubPrsChecks: (prs: PrRef[]) => invoke<PrChecks[]>("github_prs_checks", { prs }),
  fullscreenHoldGet: () => invoke<boolean>("fullscreen_hold_get"),
  fullscreenHoldSet: (enabled: boolean) => invoke<boolean>("fullscreen_hold_set", { enabled }),
  reviewAlertsGet: () => invoke<boolean>("review_alerts_get"),
  reviewAlertsSet: (enabled: boolean) => invoke<boolean>("review_alerts_set", { enabled }),
  myPrAlertsGet: () => invoke<MyPrAlerts>("my_pr_alerts_get"),
  myPrAlertsSet: (config: MyPrAlerts) => invoke<MyPrAlerts>("my_pr_alerts_set", { config }),

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
  /** The period report's bounds are local midnights computed here (see AGENTS.md); `toMs` is exclusive. */
  forgesActivityBetween: (fromMs: number, toMs: number) =>
    invoke<ForgeOpened>("forges_activity_between", { fromMs, toMs }),
  reportAgenda: (fromMs: number, toMs: number) => invoke<AgendaItem[]>("report_agenda", { fromMs, toMs }),
  reportVault: (fromDay: string, toDay: string, fromMs: number, toMs: number) =>
    invoke<VaultPeriod>("report_vault", { fromDay, toDay, fromMs, toMs }),
  /** Feeds the taskbar badge: Rust can't compute "today" reliably itself (see AGENTS.md), so the UI pushes it. */
  badgeSetTasks: (count: number) => invoke<void>("badge_set_tasks", { count }),

  /** RSS/Atom incident history from services the team depends on; served from a 5 min cache unless `force`. */
  apiStatus: (force = false) => invoke<StatusResult[]>("api_status", { force }),
  guestPhotos: (emails: string[]) => invoke<GuestPhotos>("guest_photos", { emails }),
  statusAlertsGet: () => invoke<string[]>("status_alerts_get"),
  statusAlertsSet: (ids: string[]) => invoke<string[]>("status_alerts_set", { ids }),

  /** Artificial Analysis ranking; Rust fetches at most once every 3 h, `force` included. */
  modelsGet: (force = false) => invoke<ModelsView>("models_get", { force }),
  modelsAlertsSet: (enabled: boolean) => invoke<boolean>("models_alerts_set", { enabled }),

  dndGet: () => invoke<DndState>("dnd_get"),
  /** `untilMs: null` keeps it on until turned off; the UI computes the end (local timezone). */
  dndSet: (untilMs: number | null) => invoke<DndState>("dnd_set", { untilMs }),
  dndClear: () => invoke<DndState>("dnd_clear"),

  updateCheck: () => invoke<UpdateInfo>("update_check"),
  /** Verifies the signature, installs and restarts the app; only resolves if something fails first. */
  updateInstall: () => invoke<void>("update_install"),
};

export function errText(e: unknown): string {
  return typeof e === "string" ? e : e instanceof Error ? e.message : t("app.unexpectedError");
}
