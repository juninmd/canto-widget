<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Features](#-features)** · **[Skins](#-five-skins)** · **[Install](#%EF%B8%8F-install)** · **[Security](#-security-at-a-glance)** · **[Documentation](#-documentation)**

<sub>**English** · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **Tasks with reminders, notes, clipboard history, an agenda with meeting alerts, transcripts and your GitHub PRs
> in a small window pinned to the corner of the screen.** Pops up with `Ctrl+Alt+Space`, hides when you don't need
> it and keeps everything encrypted on your machine, with no account and no server.

## ✨ Why Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

If you live between meetings, PRs and small pending items, you end up with five apps open. Canto puts it all in
one place.

🔒 **Encrypted by default.** Argon2id + AES-256-GCM with a master password; the key only ever exists in RAM.
Windows Hello optional.

🏠 **Your data stays with you.** Zero telemetry, zero server, no account required. Backup is a single encrypted
`.canto` file.

⏰ **You won't miss it.** 1 minute before a meeting and at reminder time, the widget pops up, plays a sound and
sends a notification, with **snooze 10 min**.

🪶 **Light.** Tauri v2 (Rust + the system webview) instead of Electron: a 3.5 MB installer.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Always up to date.** Updates from within the app and only installs what's signed by the project's own key.

</td>
</tr>
</table>

## 🧰 Features

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Tasks that remind you

A daily checklist with time and recurrence (every day, weekdays or weekly). Type **`Daily at 9:30am`** and the
reminder is already set. **Day summary** ready to paste and **pull over pending items** from yesterday.

</td>
</tr>
<tr>
<td>

### 📅 Meeting starting? It tells you.

Today's events come from Google Calendar (read-only). One minute before, the widget jumps onto the screen with
**join Meet**, plays a sound and sends a system notification, whichever tab you're on or even if it's hidden.
Click the event to see who organized it, the agenda, the guests and attachments, like Gemini's notes.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with organizer, guests and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Notes as cards

Searchable cards with `#tags`, pin to top and one-click tag filter. Handles thousands of notes: the list is
paged and search covers all of them.

</td>
</tr>
<tr>
<td>

### 📋 Clipboard that never forgets (or leaks)

Encrypted history with search and pin; recognizes links, colors and code. A giant copy (a 100 MB log) doesn't
freeze anything: it keeps the start and warns you. On Windows, it skips whatever password managers mark as
sensitive.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and open PRs"></td>
<td>

### 🐙 Your GitHub at a glance

**Review requested from me**, assigned to me, PRs and issues I opened, with a PR or issue icon and who opened
it. Filter by text, `repo:` or `label:`, PRs only or issues only, sort by update, creation or comments, and
scroll with **show more**. Also supports **GitLab.com and self-hosted GitLab**, with a 5-minute cache that
respects the rate limit. Sign in with a read-only personal token or from the browser (device flow).

</td>
</tr>
<tr>
<td>

### ⚙️ Settings and automatic updates

Master password change, Windows Hello, `.canto` backup, a synced folder with automatic merge (Dropbox,
OneDrive, Syncthing...), start with the system and the **Updates** section, with the **installed version** and
the **latest published** one side by side and a button to update and restart.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Also has 🎙️ **Meetings**: Gemini's notes and transcripts from the last two weeks, plus `.vtt`, `.srt`, `.txt`
and `.md` transcripts from a local folder, cleaned up and searchable.

⌨️ **Everything by keyboard:** `Alt+1`…`Alt+7` switch tabs, `N` creates, `/` searches, `F11` fullscreen, `Alt+L`
locks and `?` lists the shortcuts.

## 🎨 Five skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Default</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

And **Follow system**, which switches between light and dark along with the OS. All pass AA contrast.

<details>
<summary>🖥️ More screens: onboarding, global search, GitLab, subtasks, markdown, security, sync, density and more</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| First-run welcome | Global search (`Ctrl+K`) | Self-hosted GitLab tab | Meeting alert |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Task with subtasks, priority and PR | Note in markdown | More clipboard types | Security: auto-lock and unlocks |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note rendered in markdown linked to a task](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synced folder | Compact density | Locked vault | Connect GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Task reminder | Change master password |
|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>All screenshots use fictitious data.</sub>

## ⚖️ Compared to what's out there

None of the tools researched cover more than two of these fronts at once. Sources and details in
[docs/benchmark.md](docs/benchmark.md).

| | Tasks + reminder | Notes | Clipboard | Meetings | GitHub | Local encryption by default |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ sync only |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ optional |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ native · ➖ partial, via extension or optional · — none · ? unpublished · n/a doesn't store user data</sub>

What the benchmark brought here: **time right in the task title** (Todoist/TickTick), **snooze the alert**
(TickTick) and **clipboard that respects password managers** (CopyQ/Ditto).

## ⬇️ Install

Download the installer for your platform from **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| System | File |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recommended) or `.msi` |
| 🍎 macOS | `.dmg` for Apple Silicon or Intel |
| 🐧 Linux | `.AppImage`, `.deb` or `.rpm` |

1. On first run you create the **master password**. There's no recovery: lose the password, lose the data.
2. `Ctrl+Alt+Space` (`Cmd+Alt+Space` on macOS) shows and hides the widget.
3. Done. When a new version ships, Canto notifies you, and **Settings → Updates** updates with one click.

> [!NOTE]
> The installers aren't code-signed yet: SmartScreen (Windows) and Gatekeeper (macOS) warn on first launch.
> Automatic updates are verified against the project's own signature before running.

Ready-made manifests for winget and Homebrew (plus a skeleton for Flatpak, currently blocked) live in
[`packaging/`](packaging/README.md) — prepared and verified locally, but not yet published to those
repositories: publishing is a manual decision and action by the maintainer.

## 🔒 Security at a glance

| Layer | Protection |
|---|---|
| Vault | Argon2id (19 MiB, t=2) → AES-256-GCM, a fresh nonce on every write, atomic write with `fsync` |
| Key | RAM only, zeroed on lock; configurable auto-lock (5 to 60 min idle, 15 min by default) |
| Network | only the Rust process talks to the network; the webview has no remote origin (CSP) and never sees tokens |
| Google | optional, only `calendar.events.readonly` plus profile, OAuth with PKCE and loopback |
| GitHub | optional, encrypted token; items only open if the link is `https://github.com/` |
| GitLab | optional, encrypted address and token; `https://` only, no redirects, links only from the configured instance |
| Updates | only installs a package signed by the project's key; a tampered download is discarded before running |

Full model, backup, merge across machines and where each file lives: [docs/seguranca.md](docs/seguranca.md).
Found a flaw? [SECURITY.md](SECURITY.md).

## 📚 Documentation

| Document | What's in it |
|---|---|
| 📖 [User guide](docs/uso.md) | tabs, recurring tasks, shortcuts, skins, accessibility, window, updates and start with the system |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda and GitHub (personal token or device flow) |
| 🛡️ [Security and data](docs/seguranca.md) | threat model, `.canto` backup, merge, password change, files on disk |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify and volume tests |
| 📝 [CHANGELOG](CHANGELOG.md) | what changed in each version |
| 🤝 [How to contribute](CONTRIBUTING.md) | environment, tests, PRs and how to publish a release |
| 🤖 [Agent guide](AGENTS.md) | contracts and traps for anyone editing the code with AI |

## 🛠️ Development

Prerequisites: [Bun](https://bun.sh) ≥ 1.2, stable Rust ≥ 1.85 and the
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) for your system.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Every PR runs CI on Windows, macOS and Linux. Conventional `fix`, `feat` and breaking commits merged into `main`
get a SemVer tag, generated release notes and signed installers built in parallel; the release is published after verification (details in
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 License

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Made with 🦀 Rust, ⚛️ React and ☕ for those who live between meetings.</sub></div>
