<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · **Svenska** · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Uppgifter med påminnelser, anteckningar, urklippshistorik, en agenda med mötesvarningar, utskrifter och din GitHub PRs
> i ett litet fönster fäst i hörnet av skärmen.** Dyker upp med `Ctrl+Alt+Space`, gömmer sig när du inte behöver
> det och håller allt krypterat på din maskin, utan konto och ingen server.

## 🌐 Språk

Canto erbjuder **42 gränssnittsspråk**, alla med sin egen README. Välj ditt i **Inställningar → Språk**;
den sökbara väljaren använder modersmålsnamn, och automatiskt läge följer ditt primära systemspråk.
Arabiska, hebreiska och persiska använder text från höger till vänster. Ytterligare språkkataloger laddas vid behov.

De 40 nya gränssnittskatalogerna och 31 nya README-översättningarna är maskinöversättningar och har inte blivit
granskas av infödda talare. Portugisiska och engelska förblir de ursprungliga gränssnittskatalogerna. Bricketiketter och
meddelanderubriker följer det valda språket; vissa integrationsvarningsdetaljer faller tillbaka till engelska,
och backend-fel kvarstår på portugisiska. Syntaxen för uppgiftstiteln behåller de befintliga portugisiska och engelska nyckelorden.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Varför Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Om du lever mellan möten, PRs och små väntande föremål, slutar du med fem appar öppna. Canto lägger in allt
ett ställe.

🔒 **Krypterad som standard.** Argon2id + AES-256-GCM med ett huvudlösenord; nyckeln finns bara i RAM.
Windows Hello valfritt.

🏠 **Din data stannar hos dig.** Noll telemetri, noll server, inget konto krävs. Säkerhetskopiering är en enda krypterad
`.canto` fil.

⏰ **Du kommer inte att missa det.** 1 minut före ett möte och vid påminnelsetid, dyker widgeten upp, spelar ett ljud och
skickar ett meddelande, med **snooze 10 min**.

🪶 **Lätt.** Tauri v2 (Rust + systemets webbvy) istället för Electron: ett 3,5 MB installationsprogram.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Alltid uppdaterad.** Uppdaterar inifrån appen och installerar bara det som är signerat av projektets egen nyckel.

</td>
</tr>
</table>

## 🧰 Funktioner

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Uppgifter som påminner dig

En daglig checklista med tid och återkommande (varje dag, vardagar eller veckovis). Skriv **`Daily at 9:30am`** och
reminder is already set; add **`!high`** (or `!alta`, `!média`, `!baixa`) for the priority, or click the dot on the row to cycle it. Long titles wrap instead of being cut off. **Focus timer** on any task: give it an estimate, press ▶ and a bar pinned under every tab counts the time against it (red once you go over); the time is saved to the vault every minute. **Day summary** ready to paste (tasks, focused time, meetings with total time, PRs/MRs opened, merged, reviewed and closed without merging), a **weekly and monthly report** in markdown, and **pull over pending items** from yesterday. **Quick capture** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` on macOS) jots a task or a note from any app, without opening the widget.

</td>
</tr>
<tr>
<td>

### 📅 Börjar möte? Det säger dig.

Gå med i nästa möte med `Ctrl+Alt+M` (`Ctrl+Cmd+M` på macOS). Om registreringen misslyckas, försöker Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` på macOS); fackmenyn förblir tillgänglig om båda inte är tillgängliga.

Dagens händelser kommer från Google Kalender (skrivskyddad). En minut innan hoppar widgeten upp på skärmen med
**gå med i Meet**, spelar upp ett ljud och skickar ett systemmeddelande, oavsett vilken flik du är på eller även om den är dold.
Varje kort visar ett märke med ditt svar (accepterat, kanske, avslagit, väntar). Klicka på evenemanget för att se vem som organiserade
det, agendan, varje gäst med en initialavatar och deras svar, och bilagor, som Tvillingarnas anteckningar.
Den översta raden talar om för dig **nästa gratis slot** på minst 15 minuter (avvisade inbjudningar och heldagsevenemang gör det inte
räknas), och händelser som överlappar får ett **konflikt**-märke som namnger den andra händelsen. Vyn **Idag** leder med mötet som pågår (tid kvar, gå med-knapp, kollisionsvarning) eller nästa, sedan **dagen på en rad** (möten, uppgifter och ledig tid över hela arbetstiden, med mötestid, ledig tid och konflikter räknade) och en tidslinje där möten, uppgifter med en tid och de fria luckorna är rader för sig själva: vad som redan finns för att få plats, en uppgift som redan finns kvar.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Anteckningar som kort

Sökbara kort med `#tags`, nål upptill och ett-klick-taggfilter; varje kort visar början på noten **återgiven** (titlar, checklistor, kod, länkar), inte råmarkering. En **WYSIWYG-redigerare** med en kompakt
formateringsstapel (fet, kursiv, kod, rubrik, listor, checklistor du markerar direkt i texten, kodblock med syntax
markering, länkar, bilder) och markdown-genvägar medan du skriver (`# `, `- `, `[ ] `, ` ``` `); en **MD**-växling
visar den råa markdown, som fortfarande är hur anteckningar lagras, söks, synkroniseras och exporteras. Länkar öppnas med
`Ctrl`+klick, endast http(s). Klistra in, släpp eller bifoga bilder (PNG, JPEG, GIF, WebP upp till 2 MB), var och en förseglad i sin egen
krypterad fil, visad inuti anteckningen och som miniatyrer på kortet; de stannar på den här maskinen, utanför `.canto`
säkerhetskopior. Hanterar tusentals anteckningar: listan är bläddrad och sökningen täcker alla.

</td>
</tr>
<tr>
<td>

### 📋 Urklipp som aldrig glömmer (eller läcker)

Krypterad historik med sökning och pin; känner igen länkar, färger och kod. Håll muspekaren över ett objekt för att **kopiera det omskrivet**:
JSON-formaterad eller kompakt, text på en rad, VERSALER eller gemener (historikposten förblir som den var). En jättekopia (en 100 MB logg) gör det inte
frys allt: det håller starten och varnar dig. På Windows hoppar den över vad lösenordshanterare markerar som
känslig.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Din GitHub i ett ögonkast

**Recension begärd från mig**, tilldelad till mig, PRs och frågor jag öppnade, med en PR eller ärendeikon och vem som öppnade
det. Utkast, PRs **väntar på din recension** och PRs **stoppad** i en vecka sticker ut, och varje PR har en liten
**CI-märke** (godkänd, misslyckad, igång eller ingen CI) från sina huvudbevakningskontroller. När någon **begär din
recension**, säger ett OS-meddelande till dig (på som standard, stäng av det i Inställningar). Filtrera efter text, `repo:` eller `label:`, PRs endast eller endast problem, sortera efter uppdatering, skapande eller kommentarer, och
scroll with **show more**. Switch to the **Comments** view to see a **Commenters catalog** grid of everyone who commented on your PRs (avatars, human vs bot badges, comment counts, search, bot filter, progressive pagination) and their comments. Also supports **GitLab.com and self-hosted GitLab**, with a 5-minute cache that
respekterar taxegränsen. Logga in med en skrivskyddad personlig token eller från webbläsaren (enhetsflöde).

</td>
</tr>
<tr>
<td>

### ⚙️ Inställningar och automatiska uppdateringar

Byte av huvudlösenord, Windows Hello, `.canto` backup, en synkroniserad mapp med automatisk sammanslagning (Dropbox,
OneDrive, Syncthing...), börja med systemet och avsnittet **Uppdateringar**, med den **installerade versionen** och
den **senast publicerade** sida vid sida och en knapp för att uppdatera och starta om.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Har även 🎙️ **Möten**, en underflik till Agenda bredvid Lista och Dag: Tvillingarnas anteckningar och avskrifter från
de senaste två veckorna, plus `.vtt`, `.srt`, `.txt` och `.md` avskrifter från en lokal mapp, rensade och sökbara.

🤖 **AI-modeller** (på flikfältet som standard, **ingen API-nyckel eller konto**): LLM:er rankade efter
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, läst från dess offentliga leaderboard-sida,
med en poängstapel, skapare, pris per 1M tokens och hastighet, sorterbara efter intelligens, pris eller hastighet. Den hämtar kl
mest en gång var tredje timme, och opt-in 🔔 meddelar dig när en
modell **går in i topp 10** eller **klättrar inom den** (kontrolleras var 6:e timme medan valvet är upplåst), med
"nya" och "upp" märken i en vecka.

🌙 **Stör ej:** i Inställningar eller facket, tysta mötesvarningar, uppgiftspåminnelser, statusvarningar och varje
systemavisering i 30 min, 1 h, 2 h, tills imorgon eller tills du stänger av den. En måne i den översta fältet visar
när det tar slut; ett klick stänger av den igen. Den överlever en omstart och slutar av sig själv.

⌨️ **Allt med tangentbord:** `Alt+1`...`Alt+7` byter flikar, `N` skapar, `/` söker, `F11` helskärm, `Alt+L`
låser och `?` listar genvägarna. `Ctrl+Shift+P` (`Cmd+Shift+P` på macOS) öppnar en **kommandopalett** med varje
action by name: gå till en flik, ny uppgift eller anteckning, gå med i nästa möte, kopiera dagens sammanfattning, byt skal, lås.

## 🎨 Six skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Standard</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

Och **Följ system**, som växlar mellan ljust och mörkt tillsammans med operativsystemet. Alla klarar AA-kontrast.

<details>
<summary>🖥️ Fler skärmar: onboarding, global sökning, kommandopalett, GitLab, deluppgifter, anteckningsredigerare, säkerhet, synkronisering, densitet och mer</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Första gången välkommen | Global sökning (`Ctrl+K`) | Egen värd fliken GitLab | Mötesvarning |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Uppgift med deluppgifter, prioritet och PR | Anteckningsredigerare | Fler typer av urklipp | Säkerhet: automatisk låsning och upplåsning |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synkroniserad mapp | Kompakt densitet | Låst valv | Anslut GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Settings in groups, with search | Search filters the groups | Offline chip in the header | Confirm before clearing the clipboard |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Discard an unsaved note draft |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Lägen: Mini, Dold, Normal, Maximerad | Miniläge: varningar på skärmens kant |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klicka på en varning i dockan | Maximerad: uppgifter och meddelanden, med en dragbar avdelare |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| The bell opens the alerts over the whole window |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: lägesmenyn öppnas i dockningsfönstret |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Flikar som inte passar väntar i en "mer"-meny |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Spel och helskärm: varningar vänta tills du lämnar |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Snooze: 1, 5 eller 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Task reminder | Change master password | Status API (opt-in tab) | Language: English, Portuguese or Spanish |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopiera ett klipp omskrivet | Mötesvarning med prep |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Omdesign: fliken Uppgifter, före och efter |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redesign: varje flik, före (överst) och efter (nederst) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI misslyckades, med de trasiga jobben | Någon nämnde mig | Deras växlar i Inställningar |
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
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| Day summary alert | Day summary setting |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mentions subtab (GitHub and GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Lösenordet ändrat, en fil väntar | Dagssammanfattning |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Veckorapport | Agenda: nästa lediga tid och konflikter |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: gratis just nu | Kommandopalett (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Stör ej | Bild i en anteckning |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI-märke på varje PR | Granskningsförfrågningsmeddelanden |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Notera bilder som miniatyrer | WYSIWYG anteckningsredigerare |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Note editor: rå markdown (MD) | Anteckningsredigerare på det ljusa skinnet |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Uppgifter: prioritet på raden, långa titlar omsluter | Anteckningslista med renderad markdown |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI-modeller rankade av Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| En varningsöverlagring för allt som väntar: avbrott, möten, uppgifter och nya AI-modeller |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Mina slutpunkter: brickor med den senaste latensen | En öppen slutpunkt: latensdiagram, gräns- och varningsinställningar | Lägga till en DNS + certifikatkontroll |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda för vilken dag som helst: föregående och nästa pilar, en datumväljare och en tillbaka-till-idag-knapp |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Uppgifter: den aktuella uppgiften med timer och grupperad lista | GitHub: sammanfattningsremsa ovanför listorna | GitLab: samma remsa, utan CI-brickan |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fokustimer fäst under varje flik | Agenda som dag, uppgifter vid sidan av möten |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dagvy: överlappande händelser delar bredden sida vid sida |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Granska radar: äldsta begäran först, försenad i rött, snooze |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Möten som en underflik till Agenda, bredvid Lista och Dag |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Fliken Aktivitet (av som standard) | Sammanfattning med fokuserad tid och stängd PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Fliken Aktivitet, senaste 7 dagarna | Fliken Aktivitet, avstängd | Aktivitetsfliken på ett brett fönster |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Fliken **Aktivitet** börjar dold (aktivera den under Inställningar → synliga flikar). Den registrerar endast namnet på
fokuserad applikation medan du använder datorn, i en förseglad lokal fil som aldrig når säkerhetskopior eller synkronisering (Wayland
kan inte rapportera det fokuserade fönstret, så det förblir otillgängligt där). Av tills du väljer att delta och den första skärmen säger vad
hålls och det som aldrig finns.

- **Dag**: en munk per kategori med summan inuti, vars förklaring döljer en kategori, förändringen mot dagen
före och vilotiden (inget tangentbord eller mus under 2 minuter). Under det, ett dagligt kodfokusmål med dess streak och
en prick per dag, tre höjdpunkter (längsta sträckan i en app, appväxlar, peak hour), en tidslinje där hela
dag, tomgången sträcker sig och de mest trafikerade apparna delar en tidsaxel med en "nu"-markör och en lista över applikationer
(tryck på en för att ändra dess kategori) eller av uppgifterna som fokustimern körde på.
- **Vecka**: staplade kolumner per dag med medellinjen och en prick under varje dag som uppfyllde målet, en timmes värmekarta
med din topp, och samma listor för hela veckan.
- **Layout och skal**: en kolumn i standardfönstret, två när den är bred (maximerad); varje hud har sin egen
kategorifärger, kontrollerade för kontrast. Menyn bredvid dagen kopierar den som text.

<sub>Alla skärmdumpar använder fiktiva data.</sub>

## ⚖️ Jämfört med vad som finns där ute

Inget av de undersökta verktygen täcker mer än två av dessa fronter samtidigt. Källor och detaljer i
[docs/benchmark.md](docs/benchmark.md).

| | Uppgifter + påminnelse | Anteckningar | Urklipp | Möten | GitHub | Lokal kryptering som standard |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ endast synkronisering |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ valfritt |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ inbyggt · ➖ partiell, via tillägg eller valfritt · — inga · ? opublicerad · n/a lagrar inte användardata</sub>

Vad riktmärket förde hit: **tid rätt i uppgiftens titel** (Todoist/TickTick), **snooza varningen**
(TickTick) och **klippbord som respekterar lösenordshanterare** (CopyQ/Ditto).

## ⬇️ Installera

Ladda ner installationsprogrammet för din plattform från **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| System | Arkiv |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (rekommenderas) eller `.msi` |
| 🍎 macOS | `.dmg` för Apple Silicon eller Intel |
| 🐧 Linux | `.AppImage`, `.deb` eller `.rpm` |

1. Vid första körningen skapar du **huvudlösenordet**. Det finns ingen återställning: förlora lösenordet, förlora data.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` på macOS) visar och döljer widgeten.
3. Klart. När en ny version skickas meddelar Canto dig och **Inställningar → Uppdateringar** uppdateras med ett klick.

> [!OBS]
> Installationsprogrammen är inte kodsignerade än: SmartScreen (Windows) och Gatekeeper (macOS) varnar vid första lanseringen.
> Automatiska uppdateringar verifieras mot projektets egen signatur innan de körs.

Färdiga manifest för winget och Homebrew (plus ett skelett för Flatpak, för närvarande blockerad) bor i
[`packaging/`](packaging/README.md) — förberedd och verifierad lokalt, men ännu inte publicerad för dessa
arkiv: publicering är ett manuellt beslut och åtgärd av underhållaren.

## 🔒 Säkerhet i korthet

| Lager | Skydd |
|---|---|
| Valv | Argon2id (19 MiB, t=2) → AES-256-GCM, en ny nonce på varje skriv, atomär skrivning med `fsync` |
| Nyckel | Endast RAM, nollställt vid lås; konfigurerbart autolås (5 till 60 min tomgång, 15 min som standard) |
| Nätverk | endast Rust-processen pratar med nätverket; webbvyn har inget fjärrursprung (CSP) och ser aldrig tokens |
| Google | valfritt, endast `calendar.events.readonly`, `directory.readonly` (Arbetsplatskollegornas foton i gästlistan) plus profil, OAuth med PKCE och loopback |
| GitHub | valfri, krypterad token; objekt öppnas endast om länken är `https://github.com/` |
| GitLab | valfri, krypterad adress och token; Endast `https://`, inga omdirigeringar, länkar endast från den konfigurerade instansen |
| Uppdateringar | installerar endast ett paket signerat av projektets nyckel; en manipulerad nedladdning kasseras innan den körs |

Fullständig modell, säkerhetskopiering, sammanfogning mellan maskiner och var varje fil finns: [docs/seguranca.md](docs/seguranca.md).
Hittade ett fel? [SECURITY.md](SECURITY.md).

## 📚 Dokumentation

| Dokument | Vad finns i den |
|---|---|
| 📖 [User guide](docs/uso.md) | flikar, återkommande uppgifter, genvägar, skal, tillgänglighet, fönster, uppdateringar och börja med systemet |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda och GitHub (personlig token eller enhetsflöde) |
| 🛡️ [Security and data](docs/seguranca.md) | hotmodell, `.canto` säkerhetskopiering, sammanfogning, lösenordsändring, filer på disk |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify och volymtester |
| 📝 [CHANGELOG](CHANGELOG.md) | vad ändrades i varje version |
| 🤝 [How to contribute](CONTRIBUTING.md) | miljö, tester, PRs och hur man publicerar en utgåva |
| 🤖 [Agent guide](AGENTS.md) | kontrakt och fällor för alla som redigerar koden med AI |

## 🛠️ Utveckling

Förkunskaper: [Bun](https://bun.sh) ≥ 1,2, stabil Rust ≥ 1,85 och
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) för ditt system.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Varje PR kör CI på Windows, macOS och Linux. Konventionella `fix`, `feat` och breaking commits sammanslagna till `main`
få en SemVer-tagg, genererade release notes och signerade installationsprogram byggda parallellt; releasen publiceras efter verifiering (detaljer i
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licens

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Gjord med 🦀 Rust, ⚛️ React och ☕ för dig som bor mellan mötena.</sub></div>
