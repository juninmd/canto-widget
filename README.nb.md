<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · **Norsk bokmål** · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Oppgaver med påminnelser, notater, utklippstavlehistorikk, en agenda med møtevarsler, transkripsjoner og din GitHub PRs
> i et lite vindu festet til hjørnet av skjermen.** Dukker opp med `Ctrl+Alt+Space`, skjuler seg når du ikke trenger
> den og holder alt kryptert på maskinen din, uten konto og ingen server.

## 🌐 Språk

Canto tilbyr **42 grensesnittspråk**, hver med sin egen README. Velg ditt i **Innstillinger → Språk**;
den søkbare velgeren bruker morsmålsnavn, og automatisk modus følger ditt primære systemspråk.
Arabisk, hebraisk og persisk bruker tekst fra høyre til venstre. Ytterligere språkkataloger lastes inn ved behov.

De 40 nye grensesnittkatalogene og 31 nye README-oversettelsene er maskinoversettelser og har ikke blitt
anmeldt av morsmål. Portugisisk og engelsk forblir de originale grensesnittkatalogene. Skuffetiketter og
varslingsoverskrifter følger det valgte språket; noen integrasjonsvarseldetaljer faller tilbake til engelsk,
og backend-feil forblir på portugisisk. Syntaks for oppgavetittel beholder eksisterende portugisiske og engelske søkeord.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Hvorfor Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Hvis du lever mellom møter, PRs og små ventende gjenstander, ender du opp med fem apper åpne. Canto legger alt inn
ett sted.

🔒 **Kryptert som standard.** Argon2id + AES-256-GCM med et hovedpassord; nøkkelen eksisterer bare i RAM.
Windows Hello valgfritt.

🏠 **Dataene dine forblir hos deg.** Null telemetri, null server, ingen konto nødvendig. Backup er en enkelt kryptert
`.canto` fil.

⏰ **Du vil ikke gå glipp av det.** 1 minutt før et møte og på påminnelsestidspunktet dukker widgeten opp, spiller av en lyd og
sender et varsel, med **slumre 10 min**.

🪶 **Lys.** Tauri v2 (Rust + systemets webvisning) i stedet for Electron: et 3,5 MB installasjonsprogram.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Alltid oppdatert.** Oppdaterer fra appen og installerer kun det som er signert med prosjektets egen nøkkel.

</td>
</tr>
</table>

## 🧰 Funksjoner

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Oppgaver som minner deg på

En daglig sjekkliste med tid og gjentakelse (hver dag, ukedager eller ukentlig). Skriv inn **`Daily at 9:30am`** og
påminnelse er allerede satt; legg til **`!high`** (eller `!alta`, `!média`, `!baixa`) for prioritet, eller klikk på prikken på raden for å bla gjennom den. Lange titler pakkes inn i stedet for å bli kuttet av. **Fokustimer** på enhver oppgave: gi den et estimat, trykk på ▶ og en stolpe festet under hver fane teller tiden mot den (rød når du går over); tiden lagres til hvelvet hvert minutt. **Dagsoppsummering** klar til å lime inn (oppgaver, fokusert tid, møter med total tid, PRs/MRs åpnet, slått sammen, gjennomgått og lukket uten sammenslåing), en **ukentlig og månedlig rapport** i nedtelling, og **trekk over ventende elementer** fra i går. **Rask fangst** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` på macOS) skriver en oppgave eller et notat fra en hvilken som helst app, uten å åpne widgeten.

</td>
</tr>
<tr>
<td>

### 📅 Starter møtet? Det forteller deg.

Bli med på neste møte med `Ctrl+Alt+M` (`Ctrl+Cmd+M` på macOS). Hvis registreringen mislykkes, prøver Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` på macOS); skuffmenyen forblir tilgjengelig hvis begge ikke er tilgjengelige.

Dagens hendelser kommer fra Google Kalender (skrivebeskyttet). Ett minutt før hopper widgeten inn på skjermen med
**bli med i Meet**, spiller av en lyd og sender et systemvarsel, uansett hvilken fane du er på eller til og med om den er skjult.
Hvert kort viser et merke med svaret ditt (godkjent, kanskje, avslått, venter). Klikk på arrangementet for å se hvem som har organisert
det, agendaen, hver gjest med en initialavatar og deres svar, og vedlegg, som Geminis notater.
Den øverste linjen forteller deg **neste gratis spilleautomat** på minst 15 minutter (avslåtte invitasjoner og heldagsarrangementer gjør det ikke
teller), og hendelser som overlapper får et **konflikt**-merke som navngir den andre hendelsen. **I dag**-visningen fører med møtet som pågår (tid igjen, bli med-knapp, kollisjonsadvarsel) eller det neste, deretter **dagen på én linje** (møter, oppgaver og fritid på tvers av arbeidstiden, med møtetid, fritid og konflikter regnet) og én tidslinje der møter, oppgaver med en tid og de ledige hullene er rader for seg selv: det er en oppgave som allerede er oppløst, og en oppgave som allerede finnes.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Notater som kort

Søkbare kort med `#tags`, pin til toppen og ett-klikks tag-filter; hvert kort viser starten på notatet **gjengitt** (titler, sjekklister, kode, lenker), ikke rå nedtelling. En **WYSIWYG-editor** med en kompakt
formateringsstrek (fet, kursiv, kode, overskrift, lister, sjekklister du krysser av rett i teksten, kodeblokker med syntaks
utheving, lenker, bilder) og snarveier mens du skriver (`# `, `- `, `[ ] `, ` ``` `); en **MD** bryter
viser den rå markdown, som fortsatt er hvordan notater lagres, søkes, synkroniseres og eksporteres. Lenker åpnes med
`Ctrl`+klikk, kun http(er). Lim inn, slipp eller legg ved bilder (PNG, JPEG, GIF, WebP opptil 2 MB), hver forseglet i sin egen
kryptert fil, vist inne i notatet og som miniatyrbilder på kortet; de blir på denne maskinen, utenfor `.canto`
sikkerhetskopier. Håndterer tusenvis av notater: listen bladres og søket dekker alle.

</td>
</tr>
<tr>
<td>

### 📋 Utklippstavle som aldri glemmer (eller lekker)

Kryptert historikk med søk og pin; gjenkjenner lenker, farger og kode. Hold markøren over et element for å **kopiere det omskrevet**:
JSON-formatert eller kompakt, tekst på én linje, STORE BOKSTAVER eller små bokstaver (historikkoppføringen forblir som den var). En gigantisk kopi (en 100 MB logg) gjør det ikke
frys alt: det holder starten og advarer deg. På Windows hopper den over det passordbehandlere merker som
sensitive.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Din GitHub på et øyeblikk

**Evaluering forespurt fra meg**, tildelt meg, PRs og problemer jeg åpnet, med et PR eller problemikon og hvem som åpnet
det. Utkast, PRs **venter på vurderingen din** og PRs **stoppet** i en uke skiller seg ut, og hver PR har en liten
**CI-merke** (bestått, mislyktes, løpende eller ingen CI) fra kontrollene til hovedkommisjonen. Når noen ** ber om din
anmeldelse**, forteller en OS-varsling deg (på som standard, slå den av i Innstillinger). Filtrer etter tekst, `repo:` eller `label:`, PRs bare eller kun problemer, sorter etter oppdatering, opprettelse eller kommentarer, og
bla med **vis mer**. Bytt til **Kommentarer**-visningen for å se et **Kommentarkatalog**-rutenett over alle som kommenterte PRs (avatarer, menneskelige vs bot-merker, antall kommentarer, søk, botfilter, progressiv paginering) og deres kommentarer. Støtter også **GitLab.com og selvvertsbasert GitLab**, med en 5-minutters hurtigbuffer som
respekterer takstgrensen. Logg på med et skrivebeskyttet personlig token eller fra nettleseren (enhetsflyt).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam uten å forlate widgeten

Fire underfaner for Steam: **ønskelistetilbud** (største rabatt først, hver med det den sparer), **toppselgerne**
rangert, **spill nå** (hvert spill Steam rapporterer de siste to ukene) og **katalogen sortert etter rangering**, sidesøkt
med **last mer** så den når resten av butikken. Hver rad har **kapselkunst**, **anmeldelsesresultatet**
med Steams egen ordlyd og hvor mange anmeldelser den teller, prisen som er krysset ut, prisen i reais og hva
rabattbesparelser - og listen summerer den totale besparelsen. De offentlige listene trenger bare din **SteamID64**; en valgfri
**Steam Web API nøkkel** legger til de siste spillene med spilletidene deres. Fanen starter som standard, én avmerkingsboks unna
i Innstillinger.

</td>
</tr>
<tr>
<td>

### ⚙️ Innstillinger og automatiske oppdateringer

Endring av hovedpassord, Windows Hello, `.canto` backup, en synkronisert mappe med automatisk sammenslåing (Dropbox,
OneDrive, Syncthing...), start med systemet og delen **Oppdateringer**, med **installert versjon** og
den **sist publiserte** side ved side og en knapp for å oppdatere og starte på nytt.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Har også 🎙️ **Møter**, en underfane til Agendaen ved siden av Liste og Dag: Geminis notater og utskrifter fra
de siste to ukene, pluss `.vtt`, `.srt`, `.txt` og `.md` transkripsjoner fra en lokal mappe, ryddet opp og søkbare.

🤖 **AI-modeller** (på fanelinjen som standard, **ingen API-nøkkel eller konto**): LLM-er rangert etter
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, lest fra den offentlige leaderboard-siden,
med en resultatlinje, skaper, pris per 1M-poletter og hastighet, sorterbar etter intelligens, pris eller hastighet. Den henter kl
mest én gang hver tredje time, og påmeldingen 🔔 varsler deg når en
modellen **kommer inn i topp 10** eller **klatrer innenfor den** (kontrolleres hver 6. time mens hvelvet er ulåst), med
«nye» og «opp»-merker i en uke.

🌙 **Ikke forstyrr:** i innstillingene eller skuffen, slå av møtevarsler, oppgavepåminnelser, statusvarsler og hver
systemvarsling i 30 min, 1 t, 2 t, til i morgen eller til du slår den av. En måne i den øverste linjen viser
når det slutter; ett klikk slår den av igjen. Den overlever en omstart og slutter av seg selv.

🔔 **Hvert varsel på én skjerm:** bjellen i overskriften (tell og farge når noe venter) åpner
varsler over hele vinduet i alle moduser: ett kort per varsel med handlingene, **avvis alle**, og hva som var
løst i dag under dem — uten at noe venter, er det slik du fortsatt når dagens logg. Fra kaien, et klikk
åpner fortsatt det ene varselet på toppen av det vanlige vinduet.

⌨️ **Alt med tastatur:** `Alt+1`...`Alt+7` bytt fane, `N` oppretter, `/` søker, `F11` fullskjerm, `Alt+L`
låser og `?` viser snarveiene. `Ctrl+Shift+P` (`Cmd+Shift+P` på macOS) åpner en **kommandopalett** med hver
handling etter navn: gå til en fane, ny oppgave eller notat, bli med på neste møte, kopier dagens sammendrag, bytt hud, lås.

## 🎨 Seks skinn

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Standard</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

Og **Følg system**, som bytter mellom lys og mørk sammen med OS. Alle passerer AA-kontrast.

<details>
<summary>🖥️ Flere skjermer: onboarding, globalt søk, kommandopalett, GitLab, underoppgaver, notatredigering, sikkerhet, synkronisering, tetthet og mer</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Førstegangs velkommen | Globalt søk (`Ctrl+K`) | Egen vertskap GitLab-fanen | Møtevarsling |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Oppgave med deloppgaver, prioritet og PR | Notat editor | Flere utklippstavletyper | Sikkerhet: automatisk låsing og opplåsing |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synkronisert mappe | Kompakt tetthet | Låst hvelv | Koble til GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Innstillinger i grupper, med søk | Søk filtrerer gruppene | Frakoblet brikke i overskriften | Bekreft før du tømmer utklippstavlen |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Forkast et ulagret notatutkast |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Modi: Mini, Skjult, Normal, Maksimert | Minimodus: varsler på skjermkanten |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klikk på et varsel i dokken | Maksimert: hele vinduet for den åpne fanen |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Klokken åpner varslene over hele vinduet |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: modusmenyen åpnes i dokkingvinduet |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Faner som ikke passer venter i en "mer"-meny |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Spill og fullskjerm: varsler venter til du drar |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Slumre: 1, 5 eller 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Oppgavepåminnelse | Endre hovedpassord | Status API (opt-in-fane) | Språk: engelsk, portugisisk eller spansk |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopier et klipp omskrevet | Møtevarsling med prep |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Redesign: Oppgaver-fanen, før og etter |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redesign: hver fane, før (øverst) og etter (nederst) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI mislyktes, med de ødelagte jobbene | Noen nevnte meg | Deres brytere i Innstillinger |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Nevn varsel med hvem som skrev det |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Nevn varsling med forhåndsvisning av teksten |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Flere varsler om mitt eget arbeid |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Dagsoppsummeringsvarsel | Innstilling for dagsoppsummering |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Omtaler underfane (GitHub og GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Passord endret, én fil venter | Dagsoppsummering |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Ukentlig rapport | Agenda: neste fritid og konflikter |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: gratis akkurat nå | Kommandopalett (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Ikke forstyrr | Bilde i et notat |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI-merke på hver PR | Gjennomgå forespørselsvarsler |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Legg merke til bilder som miniatyrbilder | WYSIWYG notat editor |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Note editor: rå markdown (MD) | Notat editor på den lyse huden |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Oppgaver: prioritet på raden, lange titler brytes | Notatliste med gjengitt markering |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI-modeller rangert etter Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: bestselgerne, nummerert | Steam: de siste fem kampene spilt, med begge spilletid |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalogen etter vurdering, med "last mer" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Ett varseloverlegg for alt som venter: avbrudd, møter, oppgaver og nye AI-modeller |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Mine endepunkter: fliser med siste ventetid | Et åpent endepunkt: latensdiagram, grense- og varslingsinnstillinger | Legger til en DNS + sertifikatsjekk |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda for en hvilken som helst dag: forrige og neste piler, en datovelger og en tilbake-til-i dag-knapp |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Oppgaver: gjeldende oppgave med timer og gruppert liste | GitHub: oppsummeringsstripe over listene | GitLab: samme stripe, uten CI-flisen |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fokustidtaker festet under hver fane | Agenda som dag, oppgaver ved siden av møter |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dagsvisning: overlappende hendelser deler bredden side ved side |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Gjennomgå radar: eldste forespørsel først, forfallen i rødt, slumre |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Møter som en underkategori av Agendaen, ved siden av Liste og Dag |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Aktivitetsfanen (av som standard) | Sammendrag med fokusert tid og lukket PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Aktivitetsfanen, siste 7 dager | Aktivitetsfanen, slått av | Aktivitetsfanen i et stort vindu |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

**Aktivitet**-fanen starter skjult (slå den på under Innstillinger → synlige faner). Den registrerer bare navnet på
fokusert applikasjon mens du bruker datamaskinen, i en forseglet lokal fil som aldri når sikkerhetskopier eller synkronisering (Wayland
kan ikke rapportere det fokuserte vinduet, så det forblir utilgjengelig der). Av til du melder deg på, og den første skjermen sier hva
beholdes og det som aldri er.

- **Dag**: en smultring etter kategori med totalen inni, hvis legende skjuler en kategori, endringen mot dagen
før og inaktiv tid (ingen tastatur eller mus i 2 minutter). Under det, et daglig kodefokus mål med sin rekke og
én prikk per dag, tre høydepunkter (lengste strekning i én app, appbrytere, peak time), en tidslinje der hele
dag, den inaktive strekker seg og de travleste appene deler én tidsakse med en "nå"-markør og en liste over applikasjoner
(trykk på en for å endre kategorien) eller av oppgavene fokustimeren kjørte på.
- **Uke**: stablede kolonner per dag med gjennomsnittslinjen og en prikk under hver dag som nådde målet, et times varmekart
med toppen din, og de samme listene for hele uken.
- **Layout og skinn**: én kolonne i standardvinduet, to når den er bred (maksimert); hver hud har sin egen
kategorifarger, sjekket for kontrast. Menyen ved siden av dagen kopierer den som tekst.

<sub>Alle skjermbilder bruker fiktive data.</sub>

## ⚖️ Sammenlignet med det som finnes der ute

Ingen av verktøyene som undersøkes dekker mer enn to av disse frontene samtidig. Kilder og detaljer i
[docs/benchmark.md](docs/benchmark.md).

| | Oppgaver + påminnelse | Merknader | Utklippstavle | Møter | GitHub | Lokal kryptering som standard |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ kun synkronisering |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ valgfritt |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ innfødt · ➖ delvis, via utvidelse eller valgfri · — ingen · ? upublisert · n/a lagrer ikke brukerdata</sub>

Hva referansen brakte hit: **tid rett i oppgavetittelen** (Todoist/TickTick), **utsett varselet**
(TickTick) og **utklippstavle som respekterer passordbehandlere** (CopyQ/Ditto).

## ⬇️ Installer

Last ned installasjonsprogrammet for plattformen din fra **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| System | Fil |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (anbefalt) eller `.msi` |
| 🍎 macOS | `.dmg` for Apple Silicon eller Intel |
| 🐧 Linux | `.AppImage`, `.deb` eller `.rpm` |

1. Ved første kjøring oppretter du **hovedpassordet**. Det er ingen gjenoppretting: mister passordet, mister dataene.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` på macOS) viser og skjuler widgeten.
3. Ferdig. Når en ny versjon sendes, varsler Canto deg, og **Innstillinger → Oppdateringer** oppdateres med ett klikk.

> [!MERK]
> Installasjonsprogrammene er ikke kodesignert ennå: SmartScreen (Windows) og Gatekeeper (macOS) advarer ved første oppstart.
> Automatiske oppdateringer verifiseres mot prosjektets egen signatur før de kjøres.

Ferdige manifester for winget og Homebrew (pluss et skjelett for Flatpak, for øyeblikket blokkert) bor i
[`packaging/`](packaging/README.md) — utarbeidet og verifisert lokalt, men ennå ikke publisert til disse
repositories: publisering er en manuell beslutning og handling av vedlikeholderen.

## 🔒 Sikkerhet på et øyeblikk

| Lag | Beskyttelse |
|---|---|
| Hvelv | Argon2id (19 MiB, t=2) → AES-256-GCM, en ny nonce på hver skriving, atomskriving med `fsync` |
| Nøkkel | Kun RAM, nullstilt på lås; konfigurerbar autolås (5 til 60 min inaktiv, 15 min som standard) |
| Nettverk | bare Rust-prosessen snakker med nettverket; webvisningen har ingen ekstern opprinnelse (CSP) og ser aldri tokens |
| Google | valgfritt, kun `calendar.events.readonly`, `directory.readonly` (Arbeidsområde-kollegers bilder i gjestelisten) pluss profil, OAuth med PKCE og loopback |
| GitHub | valgfritt, kryptert token; elementer åpnes bare hvis lenken er `https://github.com/` |
| GitLab | valgfri, kryptert adresse og token; Bare `https://`, ingen omdirigeringer, kun lenker fra den konfigurerte forekomsten |
| Oppdateringer | installerer kun en pakke signert med prosjektets nøkkel; en tuklet nedlasting forkastes før den kjøres |

Full modell, sikkerhetskopiering, slå sammen på tvers av maskiner og hvor hver fil bor: [docs/seguranca.md](docs/seguranca.md).
Har du funnet en feil? [SECURITY.md](SECURITY.md).

## 📚 Dokumentasjon

| Dokument | Hva er i den |
|---|---|
| 📖 [User guide](docs/uso.md) | faner, tilbakevendende oppgaver, snarveier, skinn, tilgjengelighet, vindu, oppdateringer og start med systemet |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda og GitHub (personlig token eller enhetsflyt) |
| 🛡️ [Security and data](docs/seguranca.md) | trusselmodell, `.canto` sikkerhetskopiering, sammenslåing, endring av passord, filer på disk |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify og volumtester |
| 📝 [CHANGELOG](CHANGELOG.md) | hva endret seg i hver versjon |
| 🤝 [How to contribute](CONTRIBUTING.md) | miljø, tester, PRs og hvordan publisere en utgivelse |
| 🤖 [Agent guide](AGENTS.md) | kontrakter og feller for alle som redigerer koden med AI |

## 🛠️ Utvikling

Forutsetninger: [Bun](https://bun.sh) ≥ 1.2, stabil Rust ≥ 1.85 og
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) for systemet ditt.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Webvisninger opprettes etter tilstanden Rust og skuffen er initialisert, så oppstarts-IPC-anrop kan ikke settes opp.

Hver PR kjører CI på Windows, macOS og Linux. Konvensjonelle `fix`, `feat` og brytende forpliktelser slått sammen til `main`
få en SemVer-tag, genererte utgivelsesnotater og signerte installatører bygget parallelt; utgivelsen publiseres etter bekreftelse (detaljer i
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Lisens

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Laget med 🦀 Rust, ⚛️ React og ☕ for de som bor mellom møtene.</sub></div>
