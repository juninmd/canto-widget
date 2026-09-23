<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: dein ganzer Tag in der Bildschirmecke. Aufgaben, GitHub- und Besprechungsbenachrichtigungen in Widget-Fenstern." width="100%">

<br><br>

[![Herunterladen](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Herunterladen-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT-Lizenz](https://img.shields.io/badge/lizenz-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-verschl%C3%BCsselter%20Kern-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Funktionen](#-funktionen)** · **[Skins](#-fünf-skins)** · **[Installation](#%EF%B8%8F-installation)** · **[Sicherheit](#-sicherheit-auf-einen-blick)** · **[Dokumentation](#-dokumentation)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · **Deutsch** · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **Aufgaben mit Erinnerungen, Notizen, Zwischenablage-Verlauf, eine Agenda mit Besprechungsbenachrichtigungen,
> Transkripte und deine GitHub-PRs in einem kleinen Fenster, das an der Bildschirmecke angepinnt ist.** Öffnet sich
> mit `Ctrl+Alt+Space`, verschwindet, wenn du es nicht brauchst, und hält alles verschlüsselt auf deinem Rechner,
> ohne Konto und ohne Server.

## ✨ Warum Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Rundgang durch die Tabs Aufgaben, Notizen, Zwischenablage, Agenda und GitHub, die Besprechungsbenachrichtigung und die Skins" width="300"></td>
<td>

Wenn du zwischen Meetings, PRs und kleinen offenen Punkten lebst, landest du am Ende mit fünf offenen Apps. Canto
bringt alles an einen Ort.

🔒 **Standardmäßig verschlüsselt.** Argon2id + AES-256-GCM mit einem Master-Passwort; der Schlüssel existiert nur
im RAM. Windows Hello optional.

🏠 **Deine Daten bleiben bei dir.** Null Telemetrie, kein Server, kein Konto nötig. Das Backup ist eine einzige
verschlüsselte `.canto`-Datei.

⏰ **Du wirst es nicht verpassen.** 1 Minute vor einer Besprechung und zum Erinnerungszeitpunkt taucht das Widget
auf, spielt einen Ton ab und sendet eine Benachrichtigung, mit **10 Minuten Schlummern**.

🪶 **Leichtgewichtig.** Tauri v2 (Rust + die System-Webview) statt Electron: ein 3,5-MB-Installer.
[Gemessene Werte](docs/benchmark.md#footprint-medido).

🔄 **Immer aktuell.** Updates direkt aus der App heraus, und es wird nur installiert, was mit dem eigenen Schlüssel
des Projekts signiert ist.

</td>
</tr>
</table>

## 🧰 Funktionen

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Heutige Aufgaben mit Uhrzeit und Wiederholung"></td>
<td>

### ✅ Aufgaben, die dich erinnern

Eine tägliche Checkliste mit Uhrzeit und Wiederholung (täglich, werktags oder wöchentlich). Tippe **`Täglich um
9:30`** und die Erinnerung ist bereits gesetzt. **Tageszusammenfassung** zum Einfügen bereit und **offene Punkte**
von gestern übernehmen.

</td>
</tr>
<tr>
<td>

### 📅 Besprechung startet? Canto sagt es dir.

Die heutigen Termine kommen aus dem Google Kalender (nur lesend). Eine Minute vorher springt das Widget auf den
Bildschirm mit **Meet beitreten**, spielt einen Ton ab und sendet eine Systembenachrichtigung, egal auf welchem
Tab du bist oder ob es ausgeblendet ist. Klick auf den Termin zeigt Organisator, Agenda, Gäste und Anhänge, wie
Geminis Notizen.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Termindetails mit Organisator, Gästen und Gemini-Notizen"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Notizkarten mit Tags und einer angepinnten Notiz"></td>
<td>

### 🗒️ Notizen als Karten

Durchsuchbare Karten mit `#tags`, oben anpinnen und Tag-Filter per Klick. Bewältigt Tausende von Notizen: die
Liste ist paginiert und die Suche deckt alle ab.

</td>
</tr>
<tr>
<td>

### 📋 Zwischenablage, die nichts vergisst (und nichts leakt)

Verschlüsselter Verlauf mit Suche und Anpinnen; erkennt Links, Farben und Code. Ein riesiger Copy-Vorgang (ein
100-MB-Log) friert nichts ein: er behält den Anfang und warnt dich. Unter Windows überspringt er alles, was
Passwort-Manager als sensibel markieren.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Zwischenablage-Verlauf mit einem Link, einem großen Log und Code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub-Tab mit angeforderten Reviews, zugewiesenen und offenen PRs"></td>
<td>

### 🐙 Dein GitHub auf einen Blick

**Bei mir angeforderte Reviews**, mir zugewiesen, von mir eröffnete PRs und Issues, mit PR- oder Issue-Symbol und
wer es eröffnet hat. Filter nach Text, `repo:` oder `label:`, nur PRs oder nur Issues, sortiert nach Aktualisierung,
Erstellung oder Kommentaren, und Scrollen mit **mehr anzeigen**. Unterstützt außerdem **GitLab.com und selbst
gehostetes GitLab**, mit 5-Minuten-Cache, der das Rate-Limit respektiert. Anmeldung mit einem schreibgeschützten
persönlichen Token oder über den Browser (Device Flow).

</td>
</tr>
<tr>
<td>

### ⚙️ Einstellungen und automatische Updates

Master-Passwort ändern, Windows Hello, `.canto`-Backup, ein synchronisierter Ordner mit automatischem Merge
(Dropbox, OneDrive, Syncthing …), Start mit dem System und der Bereich **Updates**, mit **installierter Version**
und **zuletzt veröffentlichter Version** nebeneinander sowie einem Button zum Aktualisieren und Neustarten.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Einstellungen mit installierter Version, zuletzt veröffentlichter Version und dem Update-Button"></td>
</tr>
</table>

Außerdem gibt es 🎙️ **Besprechungen**: Geminis Notizen und Transkripte der letzten zwei Wochen sowie `.vtt`,
`.srt`, `.txt` und `.md`-Transkripte aus einem lokalen Ordner, bereinigt und durchsuchbar.

⌨️ **Alles per Tastatur:** `Alt+1`…`Alt+7` wechseln die Tabs, `N` erstellt, `/` sucht, `F11` Vollbild, `Alt+L`
sperrt und `?` listet die Tastenkürzel auf.

## 🎨 Fünf Skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Standard-Skin" width="200"><br><b>Standard</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco-Mundo-Skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula-Skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Heller Skin" width="200"><br><b>Hell</b></td>
</tr>
</table>

Und **Systemabhängig**, das zusammen mit dem OS zwischen hell und dunkel wechselt. Alle erfüllen den
AA-Kontrast.

<details>
<summary>🖥️ Weitere Ansichten: Onboarding, globale Suche, GitLab, Unteraufgaben, Markdown, Sicherheit, Synchronisierung, Dichte und mehr</summary>

<br>

![GitHub-Tab im Vollbild](docs/prints/app/12-tela-cheia.png)

| Willkommen beim ersten Start | Globale Suche (`Ctrl+K`) | Selbst gehosteter GitLab-Tab | Besprechungsbenachrichtigung |
|---|---|---|---|
| ![Onboarding mit den wichtigsten Tastenkürzeln](docs/prints/app/19-onboarding.png) | ![Suche über Aufgaben, Notizen und Zwischenablage gleichzeitig](docs/prints/app/20-busca-global.png) | ![Angeforderte Reviews, zugewiesen und Issues auf selbst gehostetem GitLab](docs/prints/app/21-gitlab.png) | ![Besprechungsbenachrichtigung mit Meet beitreten und Schlummern](docs/prints/app/07-aviso-reuniao.png) |

| Aufgabe mit Unteraufgaben, Priorität und PR | Notiz in Markdown | Weitere Zwischenablage-Typen | Sicherheit: Auto-Sperre und Entsperrungen |
|---|---|---|---|
| ![Checkliste, Priorität und PR-Link bei einer Aufgabe](docs/prints/app/23-tarefas-detalhes.png) | ![In Markdown gerenderte, mit einer Aufgabe verknüpfte Notiz](docs/prints/app/24-notas-markdown.png) | ![Zwischenablage erkennt Link, Farbe, JSON, E-Mail und Telefonnummer](docs/prints/app/25-clipboard-tipos.png) | ![Konfigurierbare Auto-Sperre und ein Protokoll der letzten Entsperrungen](docs/prints/app/26-ajustes-seguranca.png) |

| Synchronisierter Ordner | Kompakte Dichte | Gesperrter Tresor | GitHub verbinden |
|---|---|---|---|
| ![Einstellungen mit Verweis auf einen Dropbox-Ordner](docs/prints/app/27-ajustes-sync.png) | ![Kompakte Oberfläche im Aufgaben-Tab](docs/prints/app/28-densidade-compacta.png) | ![Passwortbildschirm mit Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Verbinden mit einem Token oder über den Browser](docs/prints/app/10-github-conectar.png) |

| Aufgabenerinnerung | Master-Passwort ändern |
|---|---|
| ![Erinnerung mit Erledigt und Schlummern](docs/prints/app/08-lembrete-tarefa.png) | ![Formular zum Ändern des Passworts](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>Alle Screenshots verwenden fiktive Daten.</sub>

## ⚖️ Im Vergleich zum Angebot da draußen

Keines der untersuchten Tools deckt mehr als zwei dieser Bereiche gleichzeitig ab. Quellen und Details in
[docs/benchmark.md](docs/benchmark.md).

| | Aufgaben + Erinnerung | Notizen | Zwischenablage | Besprechungen | GitHub | Lokale Verschlüsselung standardmäßig |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ nur Sync |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ optional |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ nativ · ➖ teilweise, über Erweiterung oder optional · — keine · ? unveröffentlicht · n/a speichert keine Nutzerdaten</sub>

Was der Benchmark hierher gebracht hat: **die Uhrzeit direkt im Aufgabentitel** (Todoist/TickTick), **die
Benachrichtigung schlummern** (TickTick) und **eine Zwischenablage, die Passwort-Manager respektiert**
(CopyQ/Ditto).

## ⬇️ Installation

Lade den Installer für deine Plattform von **[Releases](https://github.com/juninmd/canto-widget/releases)**
herunter:

| System | Datei |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (empfohlen) oder `.msi` |
| 🍎 macOS | `.dmg` für Apple Silicon oder Intel |
| 🐧 Linux | `.AppImage`, `.deb` oder `.rpm` |

1. Beim ersten Start legst du das **Master-Passwort** fest. Es gibt keine Wiederherstellung: Passwort verloren,
   Daten verloren.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` unter macOS) zeigt und versteckt das Widget.
3. Fertig. Wenn eine neue Version erscheint, benachrichtigt Canto dich, und **Einstellungen → Updates**
   aktualisiert mit einem Klick.

> [!NOTE]
> Die Installer sind noch nicht code-signiert: SmartScreen (Windows) und Gatekeeper (macOS) warnen beim ersten
> Start. Automatische Updates werden vor der Ausführung gegen die eigene Signatur des Projekts geprüft.

Fertige Manifeste für winget und Homebrew (plus ein Grundgerüst für Flatpak, derzeit blockiert) liegen in
[`packaging/`](packaging/README.md) — lokal vorbereitet und geprüft, aber noch nicht in diesen Repositories
veröffentlicht: die Veröffentlichung ist eine manuelle Entscheidung und Aktion des Maintainers.

## 🔒 Sicherheit auf einen Blick

| Ebene | Schutz |
|---|---|
| Tresor | Argon2id (19 MiB, t=2) → AES-256-GCM, bei jedem Schreibvorgang ein neuer Nonce, atomares Schreiben mit `fsync` |
| Schlüssel | nur im RAM, wird beim Sperren genullt; konfigurierbare Auto-Sperre (5 bis 60 Minuten Inaktivität, standardmäßig 15 Minuten) |
| Netzwerk | nur der Rust-Prozess spricht mit dem Netzwerk; die Webview hat keinen Remote-Origin (CSP) und sieht nie Tokens |
| Google | optional, nur `calendar.events.readonly` plus Profil, OAuth mit PKCE und Loopback |
| GitHub | optional, verschlüsseltes Token; Einträge öffnen nur, wenn der Link `https://github.com/` ist |
| GitLab | optional, verschlüsselte Adresse und Token; nur `https://`, keine Weiterleitungen, Links nur von der konfigurierten Instanz |
| Updates | installiert nur ein mit dem Schlüssel des Projekts signiertes Paket; ein manipulierter Download wird vor der Ausführung verworfen |

Vollständiges Modell, Backup, Merge über mehrere Rechner hinweg und wo jede Datei liegt:
[docs/seguranca.md](docs/seguranca.md).
Eine Schwachstelle gefunden? [SECURITY.md](SECURITY.md).

## 📚 Dokumentation

| Dokument | Inhalt |
|---|---|
| 📖 [Benutzerhandbuch](docs/uso.md) | Tabs, wiederkehrende Aufgaben, Tastenkürzel, Skins, Barrierefreiheit, Fenster, Updates und Start mit dem System |
| 🔌 [Integrationen](docs/integracoes.md) | Google Kalender und GitHub (persönliches Token oder Device Flow) |
| 🛡️ [Sicherheit und Daten](docs/seguranca.md) | Bedrohungsmodell, `.canto`-Backup, Merge, Passwortwechsel, Dateien auf der Festplatte |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify und Volumentests |
| 📝 [CHANGELOG](CHANGELOG.md) | was sich in jeder Version geändert hat |
| 🤝 [Wie man beiträgt](CONTRIBUTING.md) | Umgebung, Tests, PRs und wie man ein Release veröffentlicht |
| 🤖 [Agent-Leitfaden](AGENTS.md) | Verträge und Fallstricke für alle, die den Code mit KI bearbeiten |

## 🛠️ Entwicklung

Voraussetzungen: [Bun](https://bun.sh) ≥ 1.2, stabiles Rust ≥ 1.85 und die
[Tauri-v2-Abhängigkeiten](https://v2.tauri.app/start/prerequisites/) für dein System.

```bash
bun install
bun run tauri dev                                        # App mit Hot Reload
bun run lint && bun test                                 # Typen und UI-Tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # Installer für die aktuelle Plattform
```

Jeder PR läuft in CI unter Windows, macOS und Linux. Ein `v*`-Tag baut die signierten Installer für Updates in
einem Draft-Release (Schritt für Schritt in [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Lizenz

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Erstellt mit 🦀 Rust, ⚛️ React und ☕ für alle, die zwischen Meetings leben.</sub></div>
