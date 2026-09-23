# AGENTS.md

Guide for coding agents working on **Canto**, a Tauri v2 desktop widget (Windows, macOS, Linux) that keeps tasks,
notes, clipboard history, meeting transcripts, the Google Calendar agenda and GitHub issues/PRs in an encrypted
local vault. Public repository: treat everything you write, commit or screenshot as public.

## Stack and commands

| Layer | Tech |
|---|---|
| Shell | Tauri 2.11, Rust 2021 (MSRV 1.85), `src-tauri/` |
| UI | React 19 + TypeScript 7 + Vite 8 + Tailwind v4, `src/` |
| Package manager | **bun** (`bun.lock`); never npm/yarn/pnpm |
| UI tests | `bun test` (happy-dom, preload `src/test-setup.ts`) |

```bash
bun install --frozen-lockfile
bun run lint                     # tsc --noEmit
bun test                         # UI tests
bun run e2e                      # Playwright smoke tests (e2e/*.e2e.ts): real UI in Chromium, Tauri IPC mocked
bun run build                    # tsc + vite build -> dist/ (needed before cargo: generate_context! embeds it)
cd src-tauri && cargo fmt --check                         # rustfmt.toml: max_width 120
cd src-tauri && cargo clippy --all-targets --locked -- -D warnings
cd src-tauri && cargo test --locked
cd src-tauri && cargo test --release --test scale -- --ignored --nocapture   # load harness, on demand
bun run tauri dev                # app with hot reload
bun run tauri build              # installer for the current OS
```

CI (`.github/workflows/ci.yml`) runs exactly these gates on every PR: lint, UI tests, build and `bun audit` on
Ubuntu; e2e smoke tests, `cargo fmt --check` and `cargo audit` on Ubuntu; clippy and `cargo test` on Ubuntu,
Windows and macOS. Every new first-parent commit on `main` runs `release.yml`, which builds signed installers
and publishes a release after the checks pass.

## Layout

```text
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
```

## Conventions

- **Code in English** (identifiers, files, comments, test names). **User-facing text in pt-BR** (UI, errors
  returned to the UI, notifications). Tests assert on the pt-BR text the user sees.
- **UI text lives in the catalog**, never inline: `t("area.key", { param })` from `src/i18n`, with the pt-BR text
  in `src/i18n/pt-BR/<area>.ts` (app, tasks, content, integrations). Dates and numbers use `LOCALE`, not a literal
  `"pt-BR"`. Symbols, key names and brand names stay inline. Errors from Rust are still pt-BR strings in Rust.
- Comments only for *why*, one line. No narrating comments, no section banners.
- Files stay under ~200 lines; split by responsibility (see `*_tests.rs` siblings via `#[path]`).
- One feature per module; commands are thin, logic is a pure function with a unit test.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`); body explains why.
- Every behavior change ships with a test that fails before and passes after, plus a `CHANGELOG.md` entry under
  **Não publicado** (and README when user-visible).
- **Any new or changed UI adds or updates a screenshot in `docs/prints/` and the README** (features table, tour,
  or the "mais telas" section) in the same PR — fictitious data only, per Security rules. A tab hidden by
  default (`DEFAULT_HIDDEN` in `src/lib/tabs.ts`) still needs one; skipping this is a scope gap, not optional.
- **`README.md` (English) is canonical.** `README.pt-BR.md` plus the other `README.<lang>.md` translations
  (es, fr, it, ja, zh, de, ru, tr, hi) don't need to change in the same PR — they drift and get refreshed
  separately. Never edit only a translation and leave `README.md` behind.

## Contracts you must not break

- **IPC**: Rust command name == `invoke` name; args are camelCase on the TS side. Change both sides together.
- **Synced vault keys are frozen.** `Task.hora`, `repetir`, `serie`, `Repeat.tipo` (`diaria`/`dias_uteis`/`semanal`,
  `dia`) and `Note.fixada` travel between machines via backup/merge; Rust fields use English names with
  `#[serde(rename = "...")]`. Renaming the wire key silently drops data on older installs.
- **Local files** (`janela.json`, `biometria.json`, `drive.json`, `autostart.json`) read legacy keys through
  `#[serde(alias = "...")]`, each with a legacy-JSON test. Keep the alias when renaming.
- Commands that read or write the vault are `#[tauri::command(async)]`: a sync command runs on the main thread and
  each persist re-seals the whole vault (~120 ms at 22 MB), freezing the window. Lists sent to the webview are paged
  or bounded (`notes_search` takes `limit` and returns `{total, items}`).
- **Updater signing**: `plugins.updater.pubkey` in `tauri.conf.json` must match the private key in the
  `TAURI_SIGNING_PRIVATE_KEY` secret. Changing the pubkey without shipping it first under the old key leaves every
  installed app unable to update. Signed bundles only come from `--config src-tauri/tauri.updater.conf.json`
  (release workflow), so local `tauri build` does not need the key. Never commit a private key.
- File names on disk, AAD strings (`canto.vault.v1`, ...), the `.canto` extension and the Windows Hello credential
  name `com.junin.canto.cofre` never change.
- **Releases are automated.** `release.yml` assigns one `v0.3.N` tag to each first-parent commit on `main`
  after `v0.3.0`, including `docs:` and `chore:` commits. It resumes drafts, builds signed installers with
  the tag version, verifies `latest.json`, and publishes with notes generated from the commit. A six-hour
  schedule retries failed or missed runs. Never hand-push a `v0.3.N` tag or edit release versions manually.

## Security rules

- The vault key lives only in RAM (`Zeroizing`); tokens never reach the webview. All network calls go through
  Rust; the CSP allows no remote origin.
- Validate every value coming from the webview at the command boundary (paths, URLs, times, sizes).
- Links opened from the UI must be `http(s)://`; GitHub items only keep `https://github.com/` URLs.
- Never commit `src-tauri/google-oauth.json`, `client_secret_*.json`, `.env`, tokens or vault files.
- Screenshots in `docs/prints/` use fictitious data only: no real names, e-mails, hosts, IPs, paths with a user
  name, or real clipboard content.

## Traps

- **Windows Hello is shared with the installed app.** `hello::delete()` / `hello::create()` touch
  the real TPM credential regardless of the app identifier. No test may reach them; tests use
  `biometric::disable(dir)` (file only). Deletion lives in the command layer (`cmd_biometric::delete_credential`).
- **Never touch `%APPDATA%\com.junin.canto`** (the real vault). For manual runs use a separate identifier:
  `bun run tauri dev --config '{"identifier":"com.junin.canto.homolog"}'` and delete only that folder afterwards.
- A release build of the real identifier registers autostart on first run; don't launch it for measurements.
- `cargo test` needs `dist/` to exist (`bun run build` first).
- The Rust process timezone is unreliable on multithreaded Linux: "today" is computed in the UI (`todayLocal`)
  and passed to commands.
- GitHub device-flow refresh tokens are single-use: renewals are serialized by a mutex.

## Definition of done

`bun run lint`, `bun test`, `bun run build`, `cargo fmt --check`, `cargo clippy ... -D warnings` and
`cargo test --locked` are green;
changed behavior has a test; docs and CHANGELOG updated; UI changes have a README screenshot; no debug output,
commented-out code or TODO without an issue.
