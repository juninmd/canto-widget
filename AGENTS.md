src/                      React UI (one component per file, tests next to it)
  lib/api.ts              the only place that calls invoke(); IPC types live here
  lib/                    pure logic (agenda, reminders, shortcuts, summary, theme, motion) + hooks
  components/             tabs (TasksTab, NotesTab, ClipboardTab, TranscriptsTab, AgendaTab, GithubTab, SettingsTab) and sections
src-tauri/src/
  lib.rs                  plugin setup, tray, background watchers, invoke_handler list
  vault.rs, store.rs, crypto.rs   AppState/session, sealed envelopes, Argon2id + AES-256-GCM
  model.rs                synced vault model (Task, Note, merge / tombstones)
  commands.rs, cmd_*.rs   Tauri commands, grouped by feature
  password.rs             master password change (re-seals every sealed file)
  github.rs, github_auth.rs       GitHub search API and PAT / device-flow auth
  biometric.rs, hello.rs  Windows Hello unlock
  routine.rs, snooze.rs, notification.rs   reminders, recurring tasks, snoozing, OS notifications
  clipboard.rs, clip_os.rs        clipboard history (size caps, previews), OS change counter and secret skip list
  window.rs, window_state.rs      corner anchoring, saved position, fullscreen
src-tauri/tests/          integration tests (backup, envelope, merge, routine, trash)