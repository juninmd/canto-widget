<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · **Nederlands** · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Taken met herinneringen, notities, klembordgeschiedenis, een agenda met vergaderingswaarschuwingen, transcripties en uw GitHub PRs
> in een klein venster vastgemaakt aan de hoek van het scherm.** Verschijnt met `Ctrl+Alt+Space`, verbergt wanneer je het niet nodig hebt
> het en houdt alles gecodeerd op uw machine, zonder account en zonder server.

## 🌐 Talen

Canto biedt **42 interfacetalen**, elk met zijn eigen README. Kies de jouwe in **Instellingen → Taal**;
de doorzoekbare kiezer gebruikt namen in de moedertaal, en de automatische modus volgt uw primaire systeemtaal.
Arabisch, Hebreeuws en Perzisch gebruiken tekst van rechts naar links. Extra taalcatalogi worden op aanvraag geladen.

De 40 nieuwe interfacecatalogi en 31 nieuwe README-vertalingen zijn machinevertalingen en dat is niet zo geweest
beoordeeld door moedertaalsprekers. Portugees en Engels blijven de oorspronkelijke interfacecatalogi. Ladelabels en
notificatiekoppen volgen de geselecteerde taal; sommige details van integratiewaarschuwingen vallen terug naar het Engels,
en backend-fouten blijven in het Portugees. De syntaxis van de taaktitel behoudt de bestaande Portugese en Engelse trefwoorden.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Waarom Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Als je tussen vergaderingen, PRs en kleine openstaande items leeft, heb je uiteindelijk vijf apps geopend. Canto stopt het allemaal
één plaats.

🔒 **Standaard gecodeerd.** Argon2id + AES-256-GCM met een hoofdwachtwoord; de sleutel bestaat alleen in RAM.
Windows Hello optioneel.

🏠 **Uw gegevens blijven bij u.** Geen telemetrie, geen server, geen account vereist. Back-up is een enkele gecodeerd
`.canto` bestand.

⏰ **Je zult het niet missen.** 1 minuut vóór een vergadering en ter herinnering verschijnt de widget, speelt een geluid af en
stuurt een melding, met **snooze 10 min**.

🪶 **Light.** Tauri v2 (Rust + de systeemwebview) in plaats van Electron: een installatieprogramma van 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Altijd up-to-date.** Updates vanuit de app en installeert alleen wat is ondertekend door de eigen sleutel van het project.

</td>
</tr>
</table>

## 🧰 Kenmerken

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Taken die u eraan herinneren

Een dagelijkse checklist met tijd en herhaling (elke dag, weekdagen of wekelijks). Typ **`Daily at 9:30am`** en de
herinnering is al ingesteld; voeg **`!high`** (of `!alta`, `!média`, `!baixa`) toe voor de prioriteit, of klik op de stip op de rij om deze te doorlopen. Lange titels worden omhuld in plaats van afgekapt. **Focustimer** voor elke taak: geef er een schatting van, druk op ▶ en een balk onder elk tabblad telt de tijd af (rood zodra je eroverheen gaat); de tijd wordt elke minuut in de kluis opgeslagen. **Dagsamenvatting** klaar om te plakken (taken, gefocuste tijd, vergaderingen met totale tijd, PRs/MRs geopend, samengevoegd, beoordeeld en gesloten zonder samen te voegen), een **wekelijks en maandelijks rapport** in prijsverlaging, en **openstaande items** van gisteren.

</td>
</tr>
<tr>
<td>

### 📅Vergadering begint? Het vertelt je.

Neem deel aan de volgende vergadering met `Ctrl+Alt+M` (`Ctrl+Cmd+M` op macOS). Als de registratie mislukt, probeert Canto het
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` op macOS); het lademenu blijft beschikbaar als beide niet beschikbaar zijn.

De gebeurtenissen van vandaag zijn afkomstig uit Google Agenda (alleen-lezen). Een minuut eerder springt de widget op het scherm met
**word lid van Meet**, speelt een geluid af en verzendt een systeemmelding, op welk tabblad je ook zit of zelfs als het verborgen is.
Op elke kaart staat een badge met uw antwoord (geaccepteerd, misschien geweigerd, in afwachting). Klik op het evenement om te zien wie er heeft georganiseerd
het, de agenda, elke gast met een initialen-avatar en hun antwoord, en bijlagen, zoals de aantekeningen van Gemini.
In de bovenste regel staat het **volgende gratis slot** van minimaal 15 minuten (geweigerde uitnodigingen en evenementen die de hele dag duren niet
tellen), en evenementen die elkaar overlappen, krijgen een **conflict**-badge met de naam van de andere gebeurtenis. De weergave **Vandaag** begint met de vergadering die aan de gang is (resterende tijd, knop Deelnemen, botsingswaarschuwing) of de volgende, en vervolgens **de dag op één regel** (vergaderingen, taken en vrije tijd over de werkuren, waarbij vergadertijd, vrije tijd en conflicten worden meegeteld) en één tijdlijn waar vergaderingen, taken met een tijd en de vrije gaten rijen op zichzelf zijn: een kloof biedt ruimte voor een taak die nog niet is getimed, en wat al voorbij is, vouwt zich weg.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Notities als kaarten

Doorzoekbare kaarten met `#tags`, vastzetten naar boven en tagfilter met één klik; elke kaart toont het begin van de **weergegeven** notitie (titels, checklists, code, links), geen ruwe prijsverlaging. Een **WYSIWYG-editor** met een compact
opmaakbalk (vet, cursief, code, kop, lijsten, checklists die je direct in de tekst aanvinkt, codeblokken met syntaxis
markeren, links, afbeeldingen) en sneltoetsen voor markeringen terwijl u typt (`# `, `- `, `[ ] `, ` ``` `); een **MD**-schakelaar
toont de onbewerkte prijsverlaging, wat nog steeds de manier is waarop notities worden opgeslagen, doorzocht, gesynchroniseerd en geëxporteerd. Links openen met
`Ctrl`+klik, alleen http(s). Afbeeldingen plakken, neerzetten of bijvoegen (PNG, JPEG, GIF, WebP tot 2 MB), elk op zichzelf verzegeld
gecodeerd bestand, weergegeven in de notitie en als miniaturen op de kaart; ze blijven op deze machine, buiten `.canto`
back-ups. Verwerkt duizenden notities: de lijst is gepagineerd en de zoekopdracht omvat ze allemaal.

</td>
</tr>
<tr>
<td>

### 📋 Klembord dat nooit vergeet (of lekt)

Versleutelde geschiedenis met zoeken en pincode; herkent koppelingen, kleuren en code. Beweeg de muis over een item om het te **kopiëren, herschreven**:
JSON opgemaakt of compact, tekst op één regel, HOOFDLETTERS of kleine letters (het geschiedenisitem blijft zoals het was). Een gigantische kopie (een log van 100 MB) doet dat niet
alles bevriezen: het houdt de start vast en waarschuwt u. In Windows slaat het alle wachtwoordmanagers over die dit markeren
gevoelig.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Uw GitHub in één oogopslag

**Review gevraagd aan mij**, toegewezen aan mij, PRs en nummers die ik heb geopend, met een PR of nummerpictogram en wie de problemen heeft geopend
het. Concepten, PRs **wachten op uw beoordeling** en PRs **een week lang vastgelopen** vallen op, en elke PR heeft een kleine
**CI-badge** (geslaagd, mislukt, actief of geen CI) van de controles van de hoofdcommit. Wanneer iemand **uw verzoekt
review**, meldt een OS-melding (standaard ingeschakeld, schakel dit uit in Instellingen). Filter op tekst, `repo:` of `label:`, alleen PRs of alleen problemen, sorteer op update, creatie of commentaar, en
scroll met **toon meer**. Ondersteunt ook **GitLab.com en zelfgehoste GitLab**, met een cache van 5 minuten
respecteert de tarieflimiet. Meld u aan met een alleen-lezen persoonlijk token of vanuit de browser (apparaatstroom).

</td>
</tr>
<tr>
<td>

### ⚙️ Instellingen en automatische updates

Hoofdwachtwoord wijzigen, Windows Hello, `.canto` back-up, een gesynchroniseerde map met automatische samenvoeging (Dropbox,
OneDrive, Syncthing...), begin met het systeem en de sectie **Updates**, met de **geïnstalleerde versie** en
de **laatst gepubliceerde** naast elkaar en een knop om bij te werken en opnieuw te starten.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Heeft ook 🎙️ **Vergaderingen**, een subtabblad van de Agenda naast Lijst en Dag: Gemini's aantekeningen en transcripties van
de afgelopen twee weken, plus `.vtt`, `.srt`, `.txt` en `.md` transcripties uit een lokale map, opgeschoond en doorzoekbaar.

🤖 **AI-modellen** (standaard op de tabbladbalk, **geen API sleutel of account**): LLM's gerangschikt op basis van
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, gelezen vanaf de openbare scorebordpagina,
met een scorebalk, maker, prijs per 1 miljoen tokens en snelheid, sorteerbaar op intelligentie, prijs of snelheid. Het haalt bij
meestal eens per 3 uur, en de opt-in 🔔 geeft u een melding wanneer een
model **komt in de top 10** of **klimt erin** (elke 6 uur gecontroleerd terwijl de kluis ontgrendeld is), met
"nieuwe" en "up" badges voor een week.

🌙 **Niet storen:** in Instellingen of in de lade kunt u vergaderingswaarschuwingen, taakherinneringen, statuswaarschuwingen en elke
systeemmelding gedurende 30 min, 1 uur, 2 uur, tot morgen of totdat u het uitschakelt. Er verschijnt een maan in de bovenste balk
wanneer het eindigt; met één klik wordt het weer uitgeschakeld. Het overleeft een herstart en eindigt vanzelf.

⌨️ **Alles via toetsenbord:** `Alt+1`…`Alt+7` van tabblad wisselen, `N` maakt, `/` zoekopdrachten, `F11` volledig scherm, `Alt+L`
vergrendelt en `?` geeft de snelkoppelingen weer. `Ctrl+Shift+P` (`Cmd+Shift+P` op macOS) opent een **opdrachtenpalet** bij elke
actie op naam: ga naar een tabblad, nieuwe taak of notitie, neem deel aan de volgende vergadering, kopieer het dagoverzicht, wissel van skin, vergrendel.

## 🎨 Vijf skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Standaard</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Licht</b></td>
</tr>
</table>

En **Volg-systeem**, dat samen met het besturingssysteem tussen licht en donker schakelt. Ze passeren allemaal AA-contrast.

<details>
<summary>🖥️ Meer schermen: onboarding, globaal zoeken, opdrachtenpalet, GitLab, subtaken, notitie-editor, beveiliging, synchronisatie, dichtheid en meer</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| Welkom bij de eerste run | Globaal zoeken (`Ctrl+K`) | Zelf-gehost tabblad GitLab | Vergaderingswaarschuwing |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Taak met subtaken, prioriteit en PR | Notitie-editor | Meer soorten klemborden | Beveiliging: automatisch vergrendelen en ontgrendelen |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Gesynchroniseerde map | Compacte dichtheid | Vergrendelde kluis | Verbind GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Modi: Mini, Verborgen, Normaal, Gemaximaliseerd | Minimodus: waarschuwingen aan de schermrand |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klik op een waarschuwing in het dock | Gemaximaliseerd: taken en meldingen, met een versleepbare scheidingslijn |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| Mini: het modusmenu wordt geopend in het dockvenster |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Tabbladen die niet passen, wachten in een "meer"-menu |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Games en volledig scherm: waarschuwingen wachten tot je weggaat |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Snooze: 1, 5 of 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Taakherinnering | Hoofdwachtwoord wijzigen | Status API (tabblad aanmelden) | Taal: Engels of Portugees |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopieer een herschreven clip | Vergaderingswaarschuwing met voorbereiding |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Herontwerp: het tabblad Taken, voor en na |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Herontwerp: elk tabblad, voor (boven) en na (onder) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI mislukt, met de kapotte banen | Iemand heeft mij genoemd | Hun schakelaars in Instellingen |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: CI failed, PR without a review for 24, 48 or 72 hours, and mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Wachtwoord gewijzigd, één bestand in behandeling | Dagoverzicht |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Wekelijks rapport | Agenda: volgende vrije tijd en conflicten |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: nu gratis | Commandopalet (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Niet storen | Afbeelding in een notitie |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI-badge op elke PR | Meldingen van beoordelingsverzoeken |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Noteer afbeeldingen als miniaturen | WYSIWYG-notitie-editor |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Notitie-editor: onbewerkte prijsverlaging (MD) | Notitie-editor op de lichte huid |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Taken: prioriteit op de rij, lange titels wrap | Notitielijst met weergegeven prijsverlaging |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI-modellen gerangschikt volgens de Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Eén waarschuwingsoverlay voor alles wat in behandeling is: storingen, vergaderingen, taken en nieuwe AI-modellen |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Mijn eindpunten: tegels met de nieuwste latentie | Een open eindpunt: latentiegrafiek, limiet- en waarschuwingsinstellingen | Een DNS + certificaatcontrole toevoegen |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda van elke dag: vorige en volgende pijlen, een datumkiezer en een terug-naar-vandaag-knop |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Taken: de huidige taak met timer en gegroepeerde lijst | GitHub: overzichtsstrook boven de lijsten | GitLab: dezelfde strook, zonder de CI-tegel |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Focustimer vastgezet onder elk tabblad | Agenda als dag, taken naast vergaderingen |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dagweergave: overlappende gebeurtenissen delen de breedte naast elkaar |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Bekijk radar: oudste verzoek eerst, te laat in rood, snooze |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Vergaderingen als subtabblad van de Agenda, naast Lijst en Dag |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Tabblad Activiteit (standaard uitgeschakeld) | Samenvatting met gerichte tijd en gesloten PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Tabblad Activiteit, afgelopen 7 dagen | Tabblad Activiteit, uitgeschakeld | Tabblad Activiteit in een breed venster |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Het tabblad **Activiteit** wordt verborgen (schakel het in onder Instellingen → zichtbare tabbladen). Het registreert alleen de naam van de
gerichte toepassing terwijl u de computer gebruikt, in een verzegeld lokaal bestand dat nooit back-ups of synchronisatie bereikt (Wayland
kan het gefocuste venster niet rapporteren, dus het blijft daar niet beschikbaar). Uit totdat u zich aanmeldt en het eerste scherm zegt wat
wordt bewaard en wat nooit wordt bewaard.

- **Dag**: een donut per categorie met het totaal erin, waarvan de legenda een categorie verbergt, de verandering ten opzichte van de dag
voor en de inactieve tijd (geen toetsenbord of muis gedurende 2 minuten). Daaronder een dagelijks codefocusdoel met zijn streak en
één stip per dag, drie highlights (langste traject in één app, app-switches, piekuur), een tijdlijn waar het geheel
Op een dag delen de inactieve delen en de drukste apps één tijdas met een 'nu'-markering en een lijst met applicaties
(tik er één om de categorie te wijzigen) of van de taken waarop de focustimer is uitgevoerd.
- **Week**: gestapelde kolommen per dag met de gemiddelde lijn en een punt onder elke dag die het doel heeft bereikt, een hittekaart van een uur
met je piek, en dezelfde lijsten voor de hele week.
- **Lay-out en skins**: één kolom in het standaardvenster, twee zodra deze breed is (gemaximaliseerd); elke huid heeft zijn eigen
categoriekleuren, gecontroleerd op contrast. Het menu naast de dag kopieert deze als tekst.

<sub>Alle screenshots gebruiken fictieve gegevens.</sub>

## ⚖️Vergeleken met wat er is

Geen van de onderzochte instrumenten bestrijkt meer dan twee van deze fronten tegelijk. Bronnen en details in
[docs/benchmark.md](docs/benchmark.md).

| | Taken + herinnering | Opmerkingen | Klembord | Vergaderingen | GitHub | Standaard lokale codering |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidiaan / Joplin | ➖ | ✅ | — | — | — | ➖ alleen synchroniseren |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Idem | — | — | ✅ | — | — | ➖ optioneel |
| MeetingBar | — | — | — | ✅ | — | n.v.t. |
| Gitificeren | — | — | — | — | ✅ | n.v.t. |

<sub>✅ native · ➖ gedeeltelijk, via extensie of optioneel · — geen · ? niet gepubliceerd · n.v.t. slaat geen gebruikersgegevens op</sub>

Wat de benchmark hier heeft gebracht: **tijd goed in de taaktitel** (Todoist/TickTick), **de waarschuwing snoozen**
(TickTick) en **klembord dat wachtwoordbeheerders respecteert** (CopyQ/Ditto).

## ⬇️ Installeren

Download het installatieprogramma voor uw platform van **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Systeem | Bestand |
|---|---|
| 🪟Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (aanbevolen) of `.msi` |
| 🍎 macOS | `.dmg` voor Apple Silicon of Intel |
| 🐧Linux | `.AppImage`, `.deb` of `.rpm` |

1. Bij de eerste run maakt u het **hoofdwachtwoord** aan. Er is geen herstel: verlies het wachtwoord, verlies de gegevens.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` op macOS) toont en verbergt de widget.
3. Klaar. Wanneer er een nieuwe versie wordt verzonden, waarschuwt Canto u en wordt **Instellingen → Updates** met één klik bijgewerkt.

> [!NOTE]
> De installatieprogramma's zijn nog niet met code ondertekend: SmartScreen (Windows) en Gatekeeper (macOS) waarschuwen bij de eerste keer opstarten.
> Automatische updates worden vóór uitvoering geverifieerd aan de hand van de eigen handtekening van het project.

Kant-en-klare manifesten voor winget en Homebrew (plus een skelet voor Flatpak, momenteel geblokkeerd) leven erin
[`packaging/`](packaging/README.md) — lokaal opgesteld en geverifieerd, maar nog niet voor hen gepubliceerd
repositories: publiceren is een handmatige beslissing en actie van de beheerder.

## 🔒 Beveiliging in één oogopslag

| Laag | Bescherming |
|---|---|
| Kluis | Argon2id (19 MiB, t=2) → AES-256-GCM, een nieuwe nonce bij elke schrijfbeurt, atomaire schrijfactie met `fsync` |
| Sleutel | Alleen RAM, op ​​nul gezet bij vergrendeling; configureerbare automatische vergrendeling (5 tot 60 minuten inactief, standaard 15 minuten) |
| Netwerk | alleen het Rust-proces praat met het netwerk; de webview heeft geen externe oorsprong (CSP) en ziet nooit tokens |
| Google | optioneel, alleen `calendar.events.readonly`, `directory.readonly` (foto's van Workspace-collega's in de gastenlijst) plus profiel, OAuth met PKCE en loopback |
| GitHub | optioneel, gecodeerd token; items zijn alleen geopend als de link `https://github.com/` | is
| GitLab | optioneel, gecodeerd adres en token; Alleen `https://`, geen omleidingen, alleen links vanaf de geconfigureerde instantie |
| Updates | installeert alleen een pakket dat is ondertekend door de sleutel van het project; een gemanipuleerde download wordt verwijderd voordat |

Volledig model, back-up, samenvoeging tussen machines en waar elk bestand zich bevindt: [docs/seguranca.md](docs/seguranca.md).
Een fout gevonden? [SECURITY.md](SECURITY.md).

## 📚 Documentatie

| Document | Wat zit erin |
|---|---|
| 📖 [User guide](docs/uso.md) | tabbladen, terugkerende taken, snelkoppelingen, skins, toegankelijkheid, venster, updates en begin met het systeem |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda en GitHub (persoonlijke token- of apparaatstroom) |
| 🛡️ [Security and data](docs/seguranca.md) | bedreigingsmodel, `.canto` back-up, samenvoegen, wachtwoord wijzigen, bestanden op schijf |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify en volumetests |
| 📝 [CHANGELOG](CHANGELOG.md) | wat is er in elke versie veranderd |
| 🤝 [How to contribute](CONTRIBUTING.md) | omgeving, tests, PRs en hoe u een release publiceert |
| 🤖 [Agent guide](AGENTS.md) | contracten en vallen voor iedereen die de code bewerkt met AI |

## 🛠️ Ontwikkeling

Vereisten: [Bun](https://bun.sh) ≥ 1,2, stabiel Rust ≥ 1,85 en de
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) voor uw systeem.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Elke PR draait CI op Windows, macOS en Linux. Conventionele `fix`, `feat` en brekende commits samengevoegd in `main`
ontvang een SemVer-tag, gegenereerde release-opmerkingen en ondertekende installatieprogramma's die parallel zijn gebouwd; de release wordt na verificatie gepubliceerd (details in
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licentie

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Gemaakt met 🦀 Rust, ⚛️ React en ☕ voor degenen die tussen vergaderingen leven.</sub></div>
