<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Features](#-features)** · **[Skins](#-six-skins)** · **[Install](#%EF%B8%8F-install)** · **[Security](#-security-at-a-glance)** · **[Documentation](#-documentation)**

<sub>**English** · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Tasks with reminders, notes, clipboard history, an agenda with meeting alerts, transcripts and your GitHub PRs
> in a small window pinned to the corner of the screen.** Pops up with `Ctrl+Alt+Space`, hides when you don't need
> it and keeps everything encrypted on your machine, with no account and no server.

## 🌐 Languages

Canto offers **42 interface languages**, each with its own README. Choose yours in **Settings → Language**;
the searchable picker uses native language names, and automatic mode follows your primary system language.
Arabic, Hebrew and Persian use right-to-left text. Additional language catalogs load on demand.

The 40 new interface catalogs and 31 new README translations are machine translations and have not been
reviewed by native speakers. Portuguese and English remain the original interface catalogs. Tray labels and
notification headings follow the selected language; some integration alert details fall back to English,
as do the errors the backend returns, in any of the 42 languages. Task title syntax keeps the existing Portuguese and English keywords.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

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
reminder is already set; add **`!high`** (or `!alta`, `!média`, `!baixa`) for the priority, or click the dot on the row to cycle it. Long titles wrap instead of being cut off. **Focus timer** on any task: give it an estimate, press ▶ and a bar pinned under every tab counts the time against it (red once you go over); the time is saved to the vault every minute. **Day summary** ready to paste (tasks, focused time, meetings with total time, PRs/MRs opened, merged, reviewed and closed without merging), a **weekly and monthly report** in markdown, and **pull over pending items** from yesterday. **Quick capture** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` on macOS) jots a task or a note from any app, without opening the widget.

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
count), and events that overlap get a **conflict** badge naming the other event. The **Today** view leads with the meeting in progress (time left, join button, clash warning) or the next one, then **the day in one line** (meetings, tasks and free time across the working hours, with meeting time, free time and conflicts counted) and one timeline where meetings, tasks with a time and the free gaps are rows of their own: a gap offers to fit an untimed task, and what is already over folds away.

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

Encrypted history with search and pin; recognizes links, colors and code. Hover an item to **copy it rewritten**:
JSON formatted or compact, text on one line, UPPERCASE or lowercase (the history entry stays as it was). A giant copy (a 100 MB log) doesn't
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
scroll with **show more**. Switch to the **Comments** view to see a **Commenters catalog** grid of everyone who commented on your PRs (avatars, human vs bot badges, comment counts, search, bot filter, progressive pagination) and their comments. Also supports **GitLab.com and self-hosted GitLab**, with a 5-minute cache that
respects the rate limit. Sign in with a read-only personal token or from the browser (device flow).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in the chosen store's currency, what each deal saves, the region picker and the price-alert bell in the header"></td>
<td>

### 🎮 Steam without leaving the widget

Five sub-tabs for Steam: **wishlist deals** (biggest discount first, each with what it saves), the **top sellers**
ranked, **play now** (every game Steam reports for the last two weeks), the **library** (every game you own, most
played first, with the total hours and a search box) and the **catalog**, ordered by rating, by lowest price or by
release date and filterable to **only what is on sale**, paged with **load more** so it reaches the rest of the
store. Every row carries the **capsule art**, the **review score**
with Steam's own wording and how many reviews it counts, the crossed-out price, the price of the storefront you pick
and what the discount saves — and the list adds up the total saving. The **region picker** in the header chooses the
store (Brasil, United States, Euro, United Kingdom): prices, wording and currency follow it, and it starts on the
one your language implies, keeping whatever you pick afterwards. The **bell** turns on price alerts for your
wishlist: a game that got cheaper rings an OS
notification, and nothing rings for a price it already had before you turned them on — a game that becomes **free**
is the biggest drop of all. The public lists only need your
**SteamID64**; an optional **Steam Web API key**, pasteable from the header at any time, adds **play now** and the
**library**. The tab starts off by default, one checkbox away in Settings.

</td>
</tr>
<tr>
<td><img src="docs/prints/app/90-agentes.png" alt="Agents tab: provider logos with an installed count and progress bar, then one card per CLI with the latest version, its age and a summary of what changed"><img src="docs/prints/app/91-agentes-claro.png" alt="Agents tab on the light skin with all six CLIs installed"></td>
<td>

### 🤖 The agent CLIs, installed or not

The coding-agent harnesses in one list: **Claude Code**, **Codex CLI**, **Gemini CLI**, **OpenCode**,
**GitHub Copilot CLI** and **Aider**, each with its **provider logo** and brand color. A header strip shows how many
are installed as a row of logos and a progress bar. Each card says whether the CLI is installed **on this machine** (and where),
shows the **latest GitHub release** with its date and a summary of what changed, and — when the CLI is missing —
brings the **install command ready to copy**. Canto only copies: **nothing is installed or executed** by the
widget. Public data, no account or key, with a 30-minute cache. The tab starts off by default, one checkbox away
in Settings.

</td>
</tr>
<tr>
<td><img src="docs/prints/app/92-clima.png" alt="Weather tab: an animated sky card with 22 °C, the condition drawn as an icon, today's range, the rain warning and tiles for humidity, wind, UV, sunrise, sunset and today's rain chance"><img src="docs/prints/app/93-clima-previsao.png" alt="Weather tab scrolled: the next 24 hours as a smooth curve with icons and rain chance, and seven days with a min-to-max bar each"><img src="docs/prints/app/97-clima-busca.png" alt="Picking a city: results listed while typing, each with its state and country, the first one highlighted"><img src="docs/prints/app/99-clima-cidades.png" alt="Picking a city before typing: popular cities as one-click chips"></td></td>
<td>

### 🌤️ The weather without leaving the widget

**A sky that matches the weather**: the card behind the temperature turns into clear blue, a starry night, rain,
snow, fog or a storm with lightning — falling drops and flakes, drifting clouds, a drawn and animated icon for
each condition (all of it still when your system asks for less motion). Under it: **humidity, wind with its
direction, UV index, sunrise, sunset** and today's rain chance, the **next 24 hours as a smooth curve** and **seven
days** with a min-to-max bar each, so the days compare at a glance; "rain from 13:00" when it is coming.

**Choosing the city takes seconds**: results appear **while you type** (arrows and Enter work), the cities you
picked before and a row of **popular ones are one click away**, and "Londres" still lists England, Argentina and
Mexico with their **state and country**. Canto keeps only the coordinates of the one you chose; "change city"
keeps the current one until you pick another. Open-Meteo, which is open and **keyless** — no account, no address
of yours leaving the machine — and a 30-minute cache. The tab starts off by default, one checkbox away in Settings.

</td>
</tr>
<tr>
<td>

### 📰 An RSS/Atom reader with thumbnails

Paste the feed addresses and read them in one place: **unread count**, newest first, each card with the **source
favicon**, the age, a summary and, when the entry has one, a **thumbnail** — all of it downloaded by Rust and
handed over as `data:` URLs, so the window never talks to a remote origin. Cards open in the browser and can be
marked **read/unread**; a feed that breaks stays visible in red. Keyless, 15-minute cache, the list saved next to
the vault (it is only public addresses). The tab starts off by default.

</td>
<td><img src="docs/prints/app/96-leituras.png" alt="Reads tab: unread count, feed chips with one broken in red, and reading cards with source, age, summary and the open/mark-as-read actions"></td>
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

Also has 🎙️ **Meetings**, a sub-tab of the Agenda next to List and Day: Gemini's notes and transcripts from
the last two weeks, plus `.vtt`, `.srt`, `.txt` and `.md` transcripts from a local folder, cleaned up and searchable.

🤖 **AI models** (on the tab bar by default, **no API key or account**): LLMs ranked by the
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, read from its public leaderboard page,
with a score bar, creator, price per 1M tokens and speed, sortable by intelligence, price or speed. It fetches at
most once every 3 hours, and the opt-in 🔔 notifies you when a
model **enters the top 10** or **climbs within it** (checked every 6 hours while the vault is unlocked), with
"new" and "up" badges for a week.

🌙 **Do not disturb:** in Settings or the tray, silence meeting alerts, task reminders, status alerts and every
system notification for 30 min, 1 h, 2 h, until tomorrow or until you turn it off. A moon in the top bar shows
when it ends; one click turns it back off. It survives a restart and ends on its own.

🔔 **Every alert in one screen:** the bell in the header (count and colour when anything is pending) opens the
alerts over the whole window in any mode: one card per alert with its actions, **dismiss all**, and what was
resolved today under them — with nothing pending, it is how you still reach today's log. From the dock, a click
still opens that single alert on top of the normal window. The pop-up that rings for one alert shows the whole queue
as mini cards, and with more than one waiting its **close** button grows a chevron that closes the whole queue at
once — the same split the snooze button uses. In that pop-up, what the alert says renders **markdown** (a mention or a
service writes markdown), with its links opening in the browser.

⌨️ **Everything by keyboard:** `Alt+1`…`Alt+7` switch tabs, `N` creates, `/` searches, `F11` fullscreen, `Alt+L`
locks and `?` lists the shortcuts. `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS) opens a **command palette** with every
action by name: go to a tab, new task or note, join the next meeting, copy the day's summary, switch skin, lock.

## 🎨 Six skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Default</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

And **Follow system**, which switches between light and dark along with the OS. All pass AA contrast.

<details>
<summary>🖥️ More screens: onboarding, global search, command palette, GitLab, subtasks, note editor, security, sync, density and more</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| First-run welcome | Global search (`Ctrl+K`) | Self-hosted GitLab tab | Meeting alert |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Task with subtasks, priority and PR | Note editor | More clipboard types | Security: auto-lock and unlocks |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synced folder | Compact density | Locked vault | Connect GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Settings in groups, with search | Search filters the groups | Offline chip in the header | Confirm before clearing the clipboard |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Discard an unsaved note draft |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Modes: Mini, Hidden, Normal, Maximized | Mini mode: alerts on the screen edge |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Click an alert in the dock | Maximized: the whole window for the open tab |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| The bell opens the alerts over the whole window |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: the mode menu opens inside the dock window |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Tabs that don't fit wait in a "more" menu |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Games and full screen: alerts wait until you leave |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Snooze: 1, 5 or 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Task reminder | Change master password | Status API (opt-in tab) | Language: English, Portuguese or Spanish |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Copy a clip rewritten | Meeting alert with prep |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Redesign: the Tasks tab, before and after |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redesign: every tab, before (top) and after (bottom) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI failed, with the broken jobs | Someone mentioned me | Their switches in Settings |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Mention alert with who wrote it |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Mention alert with a preview of the text |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| More alerts about my own work |
|---|
| ![Pop-up for an approved pull request: kind, repository and number in one line, the reviewer's name and what they wrote, and an "aprovado" pill; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![Pop-up for a PR assigned to me: kind, repository, number and "há 3 min" in one line, who opened it with initials, an "atribuído a você" pill and no empty details box](docs/prints/app/95-aviso-pr-atribuido.png) |

| Day summary alert | Day summary setting |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mentions subtab (GitHub and GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

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

| AI models ranked by the Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: the top sellers, numbered | Steam: the last five games played, with both playtimes |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: the catalog by rating, with "load more" | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| One alert overlay for everything pending: outages, meetings, tasks and new AI models |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting and a task reminder; the outage is detailed with its state, since when and the status page button, and the close button carries a chevron that closes the whole queue](docs/prints/app/51-avisos-pendentes.png) |

</details>

| My endpoints: tiles with the latest latency | An open endpoint: latency chart, limit and alert settings | Adding a DNS + certificate check |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda of any day: previous and next arrows, a date picker and a back-to-today button |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Tasks: the current task with timer and grouped list | GitHub: summary strip above the lists | GitLab: same strip, without the CI tile |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Focus timer pinned under every tab | Agenda as a day, tasks beside meetings |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Day view: overlapping events share the width side by side |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Review radar: oldest request first, overdue in red, snooze |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Meetings as a sub-tab of the Agenda, next to List and Day |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Activity tab (off by default) | Summary with focused time and closed PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Activity tab, last 7 days | Activity tab, turned off | Activity tab on a wide window |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

The **Activity** tab starts hidden (turn it on under Settings → visible tabs). It records only the name of the
focused application while you use the computer, in a sealed local file that never reaches backups or sync (Wayland
can't report the focused window, so it stays unavailable there). Off until you opt in, and the first screen says what
is kept and what never is.

- **Day**: a donut by category with the total inside, whose legend hides a category, the change against the day
  before and the idle time (no keyboard or mouse for 2 minutes). Below it, a daily code-focus goal with its streak and
  one dot per day, three highlights (longest stretch in one app, app switches, peak hour), a timeline where the whole
  day, the idle stretches and the busiest apps share one time axis with a "now" marker, and a list of applications
  (tap one to change its category) or of the tasks the focus timer ran on.
- **Week**: stacked columns per day with the average line and a dot under each day that met the goal, an hour heat map
  with your peak, and the same lists for the whole week.
- **Layout and skins**: one column in the default window, two once it is wide (maximized); every skin has its own
  category colors, checked for contrast. The menu next to the day copies it as text.

<sub>All screenshots use fictitious data.</sub>

## 🧪 Prototypes: one suggested tab

**Clima** and **Leituras** started here, were picked and are now real features (up the page); **Hábitos** and
**Snippets** were dropped. **Mercado** is still a **prototype**: it starts hidden (one checkbox away in Settings)
and is a **mockup with fictitious data** — no backend, nothing stored, nothing fetched. The screen says what it
would still need, so the idea can be judged before it becomes real.

| Market |
|---|
| <img src="docs/prints/app/94-prototipo-mercado.png" alt="Market prototype: dollar, euro, bitcoin and Ibovespa with the day's variation and a small curve"> |

- **Market** — dollar (PTAX), euro, bitcoin, Ibovespa and the world's main indexes with the day's variation. Would
  need the Central Bank, CoinGecko and CNBC, all keyless, with a 15 min cache per quote.

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

Webviews are created after Rust state and the tray are initialized, so startup IPC calls cannot race setup.

Every PR runs CI on Windows, macOS and Linux. Conventional `fix`, `feat` and breaking commits merged into `main`
get a SemVer tag, generated release notes and signed installers built in parallel; the release is published after verification (details in
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 License

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Made with 🦀 Rust, ⚛️ React and ☕ for those who live between meetings.</sub></div>
