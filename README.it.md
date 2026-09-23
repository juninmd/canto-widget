<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: tutta la tua giornata nell'angolo dello schermo. Attività, GitHub e avvisi di riunione in finestre widget." width="100%">

<br><br>

[![Scarica](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Scarica-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![Licenza MIT](https://img.shields.io/badge/licenza-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-nucleo%20cifrato-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Funzionalità](#-funzionalità)** · **[Skin](#-cinque-skin)** · **[Installazione](#%EF%B8%8F-installazione)** · **[Sicurezza](#-sicurezza-in-breve)** · **[Documentazione](#-documentazione)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · **Italiano** · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **Attività con promemoria, note, cronologia degli appunti, un'agenda con avvisi di riunione, trascrizioni e le tue
> PR di GitHub in una piccola finestra ancorata all'angolo dello schermo.** Compare con `Ctrl+Alt+Space`, si nasconde
> quando non serve e mantiene tutto cifrato sul tuo computer, senza account e senza server.

## ✨ Perché Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour tra le schede Attività, Note, Appunti, Agenda e GitHub, l'avviso di riunione e le skin" width="300"></td>
<td>

Se vivi tra riunioni, PR e piccole cose in sospeso, finisci per avere cinque app aperte. Canto mette tutto in un
unico posto.

🔒 **Cifrato per impostazione predefinita.** Argon2id + AES-256-GCM con una password principale; la chiave esiste
solo in RAM. Windows Hello opzionale.

🏠 **I tuoi dati restano con te.** Zero telemetria, zero server, nessun account richiesto. Il backup è un singolo
file `.canto` cifrato.

⏰ **Non te lo perderai.** 1 minuto prima di una riunione e all'orario del promemoria, il widget appare, riproduce
un suono e invia una notifica, con **snooze di 10 minuti**.

🪶 **Leggero.** Tauri v2 (Rust + la webview di sistema) invece di Electron: un installer da 3,5 MB.
[Numeri misurati](docs/benchmark.md#footprint-medido).

🔄 **Sempre aggiornato.** Si aggiorna dall'interno dell'app e installa solo ciò che è firmato dalla chiave stessa
del progetto.

</td>
</tr>
</table>

## 🧰 Funzionalità

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Le attività di oggi con orario e ricorrenza"></td>
<td>

### ✅ Attività che ti ricordano

Una checklist giornaliera con orario e ricorrenza (ogni giorno, giorni feriali o settimanale). Scrivi
**`Daily alle 9:30`** e il promemoria è già impostato. **Riepilogo del giorno** pronto da incollare e
**riporta gli elementi in sospeso** di ieri.

</td>
</tr>
<tr>
<td>

### 📅 La riunione sta per iniziare? Te lo dice.

Gli eventi di oggi arrivano da Google Calendar (sola lettura). Un minuto prima, il widget salta sullo schermo con
**partecipa su Meet**, riproduce un suono e invia una notifica di sistema, qualunque scheda tu stia usando o anche
se è nascosto. Clicca sull'evento per vedere chi lo ha organizzato, l'agenda, gli invitati e gli allegati, come le
note di Gemini.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Dettagli dell'evento con organizzatore, invitati e note di Gemini"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note in formato scheda con tag e una nota fissata"></td>
<td>

### 🗒️ Note come schede

Schede ricercabili con `#tag`, fissabili in alto e filtro tag con un click. Gestisce migliaia di note: l'elenco è
paginato e la ricerca le copre tutte.

</td>
</tr>
<tr>
<td>

### 📋 Appunti che non dimenticano mai (né perdono dati)

Cronologia cifrata con ricerca e fissaggio; riconosce link, colori e codice. Una copia enorme (un log da 100 MB)
non blocca nulla: mantiene l'inizio e ti avvisa. Su Windows, salta tutto ciò che i gestori di password segnano
come sensibile.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Cronologia degli appunti con un link, un log grande e del codice"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="Scheda GitHub con revisione richiesta, assegnate e PR aperte"></td>
<td>

### 🐙 Il tuo GitHub a colpo d'occhio

**Revisione richiesta a me**, assegnate a me, PR e issue che ho aperto, con un'icona PR o issue e chi le ha aperte.
Filtra per testo, `repo:` o `label:`, solo PR o solo issue, ordina per aggiornamento, creazione o commenti e
scorri con **mostra altri**. Supporta anche **GitLab.com e GitLab self-hosted**, con una cache di 5 minuti che
rispetta il rate limit. Accedi con un token personale in sola lettura o dal browser (device flow).

</td>
</tr>
<tr>
<td>

### ⚙️ Impostazioni e aggiornamenti automatici

Cambio della password principale, Windows Hello, backup `.canto`, una cartella sincronizzata con merge automatico
(Dropbox, OneDrive, Syncthing...), avvio con il sistema e la sezione **Aggiornamenti**, con la **versione
installata** e l'**ultima pubblicata** affiancate e un pulsante per aggiornare e riavviare.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Impostazioni con versione installata, ultima versione pubblicata e pulsante di aggiornamento"></td>
</tr>
</table>

Include anche 🎙️ **Riunioni**: note di Gemini e trascrizioni delle ultime due settimane, più trascrizioni `.vtt`,
`.srt`, `.txt` e `.md` da una cartella locale, ripulite e ricercabili.

⌨️ **Tutto da tastiera:** `Alt+1`…`Alt+7` cambiano scheda, `N` crea, `/` cerca, `F11` schermo intero, `Alt+L`
blocca e `?` elenca le scorciatoie.

## 🎨 Cinque skin

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Skin predefinita" width="200"><br><b>Predefinita</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Skin Hueco Mundo" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Skin Dracula" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Skin chiara" width="200"><br><b>Chiara</b></td>
</tr>
</table>

E **Segui sistema**, che passa tra chiaro e scuro insieme al sistema operativo. Tutte superano il contrasto AA.

<details>
<summary>🖥️ Altre schermate: onboarding, ricerca globale, GitLab, sottoattività, markdown, sicurezza, sincronizzazione, densità e altro</summary>

<br>

![Scheda GitHub a schermo intero](docs/prints/app/12-tela-cheia.png)

| Benvenuto al primo avvio | Ricerca globale (`Ctrl+K`) | Scheda GitLab self-hosted | Avviso di riunione |
|---|---|---|---|
| ![Onboarding con le scorciatoie essenziali](docs/prints/app/19-onboarding.png) | ![Ricerca in attività, note e appunti insieme](docs/prints/app/20-busca-global.png) | ![Revisione richiesta, assegnate e issue su GitLab self-hosted](docs/prints/app/21-gitlab.png) | ![Avviso di riunione con partecipa su Meet e snooze](docs/prints/app/07-aviso-reuniao.png) |

| Attività con sottoattività, priorità e PR | Nota in markdown | Altri tipi di appunti | Sicurezza: blocco automatico e sblocchi |
|---|---|---|---|
| ![Checklist, priorità e link a PR su un'attività](docs/prints/app/23-tarefas-detalhes.png) | ![Nota renderizzata in markdown collegata a un'attività](docs/prints/app/24-notas-markdown.png) | ![Appunti che riconoscono link, colore, json, e-mail e telefono](docs/prints/app/25-clipboard-tipos.png) | ![Blocco automatico configurabile e un registro degli ultimi sblocchi](docs/prints/app/26-ajustes-seguranca.png) |

| Cartella sincronizzata | Densità compatta | Cofre bloccato | Connetti GitHub |
|---|---|---|---|
| ![Impostazioni con una cartella Dropbox](docs/prints/app/27-ajustes-sync.png) | ![Interfaccia compatta nella scheda Attività](docs/prints/app/28-densidade-compacta.png) | ![Schermata della password con Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connetti con un token o dal browser](docs/prints/app/10-github-conectar.png) |

| Promemoria attività | Cambia password principale |
|---|---|
| ![Promemoria con completa e snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Modulo di cambio password](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>Tutte le schermate usano dati fittizi.</sub>

## ⚖️ Confronto con quello che c'è in giro

Nessuno degli strumenti analizzati copre più di due di questi fronti contemporaneamente. Fonti e dettagli in
[docs/benchmark.md](docs/benchmark.md).

| | Attività + promemoria | Note | Appunti | Riunioni | GitHub | Cifratura locale predefinita |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ solo sync |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ opzionale |
| MeetingBar | — | — | — | ✅ | — | n/d |
| Gitify | — | — | — | — | ✅ | n/d |

<sub>✅ nativo · ➖ parziale, tramite estensione o opzionale · — nessuno · ? non pubblicato · n/d non memorizza dati utente</sub>

Cosa ha portato qui il benchmark: **orario direttamente nel titolo dell'attività** (Todoist/TickTick), **snooze
dell'avviso** (TickTick) e **appunti che rispettano i gestori di password** (CopyQ/Ditto).

## ⬇️ Installazione

Scarica l'installer per la tua piattaforma da **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistema | File |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (consigliato) o `.msi` |
| 🍎 macOS | `.dmg` per Apple Silicon o Intel |
| 🐧 Linux | `.AppImage`, `.deb` o `.rpm` |

1. Al primo avvio crei la **password principale**. Non c'è recupero: se perdi la password, perdi i dati.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` su macOS) mostra e nasconde il widget.
3. Fatto. Quando esce una nuova versione, Canto ti avvisa e **Impostazioni → Aggiornamenti** aggiorna con un click.

> [!NOTE]
> Gli installer non sono ancora firmati con certificato: SmartScreen (Windows) e Gatekeeper (macOS) avvisano al
> primo avvio. Gli aggiornamenti automatici vengono verificati rispetto alla firma del progetto prima di essere
> eseguiti.

Manifest pronti per winget e Homebrew (più uno scheletro per Flatpak, al momento bloccato) si trovano in
[`packaging/`](packaging/README.md) — preparati e verificati in locale, ma non ancora pubblicati in quei
repository: la pubblicazione è una decisione e un'azione manuale del maintainer.

## 🔒 Sicurezza in breve

| Livello | Protezione |
|---|---|
| Cofre | Argon2id (19 MiB, t=2) → AES-256-GCM, un nonce nuovo a ogni scrittura, scrittura atomica con `fsync` |
| Chiave | Solo in RAM, azzerata al blocco; blocco automatico configurabile (da 5 a 60 min di inattività, 15 min di default) |
| Rete | solo il processo Rust comunica in rete; la webview non ha origine remota (CSP) e non vede mai i token |
| Google | opzionale, solo `calendar.events.readonly` più profilo, OAuth con PKCE e loopback |
| GitHub | opzionale, token cifrato; gli elementi si aprono solo se il link è `https://github.com/` |
| GitLab | opzionale, indirizzo e token cifrati; solo `https://`, nessun redirect, link solo dall'istanza configurata |
| Aggiornamenti | installa solo un pacchetto firmato dalla chiave del progetto; un download manomesso viene scartato prima dell'esecuzione |

Modello completo, backup, merge tra macchine e dove si trova ogni file: [docs/seguranca.md](docs/seguranca.md).
Hai trovato una falla? [SECURITY.md](SECURITY.md).

## 📚 Documentazione

| Documento | Cosa contiene |
|---|---|
| 📖 [Guida utente](docs/uso.md) | schede, attività ricorrenti, scorciatoie, skin, accessibilità, finestra, aggiornamenti e avvio con il sistema |
| 🔌 [Integrazioni](docs/integracoes.md) | agenda Google e GitHub (token personale o device flow) |
| 🛡️ [Sicurezza e dati](docs/seguranca.md) | modello di minaccia, backup `.canto`, merge, cambio password, file su disco |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify e test di volume |
| 📝 [CHANGELOG](CHANGELOG.md) | cosa è cambiato in ogni versione |
| 🤝 [Come contribuire](CONTRIBUTING.md) | ambiente, test, PR e come pubblicare una release |
| 🤖 [Guida per agenti](AGENTS.md) | contratti e trappole per chi modifica il codice con l'IA |

## 🛠️ Sviluppo

Prerequisiti: [Bun](https://bun.sh) ≥ 1.2, Rust stabile ≥ 1.85 e le
[dipendenze di Tauri v2](https://v2.tauri.app/start/prerequisites/) per il tuo sistema.

```bash
bun install
bun run tauri dev                                        # app con hot reload
bun run lint && bun test                                 # tipi e test UI
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer per la piattaforma corrente
```

Ogni PR esegue la CI su Windows, macOS e Linux. Un tag `v*` compila gli installer firmati per gli aggiornamenti
in una release in bozza (passo passo in [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licenza

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Fatto con 🦀 Rust, ⚛️ React e ☕ per chi vive tra riunioni.</sub></div>
