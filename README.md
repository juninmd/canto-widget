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
reminder is already set; add **`!high`** (or `!alta`, `!média`, `!baixa`) for the priority, or click the dot on the row to cycle it. Long titles wrap instead of being cut off. **Day summary** ready to paste (tasks, meetings with total time, PRs/MRs opened, merged and reviewed), a **weekly and monthly report** in markdown, and **pull over pending items** from yesterday.

</td>
</tr>
<tr>
<td>

### 📅 Meeting starting? It tells you.

Join the next meeting with `Ctrl+Alt+M` (`Ctrl+Cmd+M` on macOS). If registration fails, Canto tries
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` on macOS); the tray menu remains available if both are unavailable.

Today's events come from Google Calendar (read-only). One minute before, the widget jumps onto the screen with
**join Meet**, plays a sound and sends a system notification, whichever tab you're on or even if it's hidden.
Each card shows a badge with your answer (accepted, maybe, declined, awaiting). Click the event to see who organized
it, the agenda, every guest with an initials avatar and their answer, and attachments, like Gemini's notes.
The top line tells you the **next free slot** of at least 15 minutes (declined invites and all-day events don't
count), and events that overlap get a **conflict** badge naming the other event.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Notes as cards

Searchable cards with `#tags`, pin to top and one-click tag filter; each card shows the start of the note **rendered** (titles, checklists, code, links), not raw markdown. A **WYSIWYG editor** with a compact
formatting bar (bold, italic, code, heading, lists, checklists you tick right in the text, code blocks with syntax
highlighting, links, images) and markdown shortcuts as you type (`# `, `- `, `[ ] `, ` ``` `); an **MD** toggle
shows the raw markdown, which is still how notes are stored, searched, synced and exported. Links open with
`Ctrl`+click, http(s) only. Paste, drop or attach images (PNG, JPEG, GIF, WebP up to 2 MB), each sealed in its own
encrypted file, shown inside the note and as thumbnails on the card; they stay on this machine, outside `.canto`
backups. Handles thousands of notes: the list is paged and search covers all of them.

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
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Your GitHub at a glance

**Review requested from me**, assigned to me, PRs and issues I opened, with a PR or issue icon and who opened
it. Drafts, PRs **waiting for your review** and PRs **stalled** for a week stand out, and each PR carries a small
**CI badge** (passed, failed, running or no CI) from its head commit's checks. When someone **requests your
review**, an OS notification tells you (on by default, switch it off in Settings). Filter by text, `repo:` or `label:`, PRs only or issues only, sort by update, creation or comments, and
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

🌙 **Do not disturb:** in Settings or the tray, silence meeting alerts, task reminders, status alerts and every
system notification for 30 min, 1 h, 2 h, until tomorrow or until you turn it off. A moon in the top bar shows
when it ends; one click turns it back off. It survives a restart and ends on its own.

⌨️ **Everything by keyboard:** `Alt+1`…`Alt+7` switch tabs, `N` creates, `/` searches, `F11` fullscreen, `Alt+L`
locks and `?` lists the shortcuts. `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS) opens a **command palette** with every
action by name: go to a tab, new task or note, join the next meeting, copy the day's summary, switch skin, lock.

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
<summary>🖥️ More screens: onboarding, global search, command palette, GitLab, subtasks, note editor, security, sync, density and more</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| First-run welcome | Global search (`Ctrl+K`) | Self-hosted GitLab tab | Meeting alert |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Task with subtasks, priority and PR | Note editor | More clipboard types | Security: auto-lock and unlocks |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synced folder | Compact density | Locked vault | Connect GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Task reminder | Change master password | Status API (opt-in tab) | Language: English or Portuguese |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Password changed, one file pending | Day summary |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Weekly report | Agenda: next free time and conflicts |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: free right now | Command palette (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Do not disturb | Image in a note |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI badge on every PR | Review request notifications |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Note images as thumbnails | WYSIWYG note editor |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Note editor: raw markdown (MD) | Note editor on the light skin |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Tasks: priority on the row, long titles wrap | Notes list with rendered markdown |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

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
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` on macOS) shows and hides the widget.
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
| Google | optional, only `calendar.events.readonly`, `directory.readonly` (Workspace colleagues' photos in the guest list) plus profile, OAuth with PKCE and loopback |
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
