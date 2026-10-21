<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · **Dansk** · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Opgaver med påmindelser, noter, klippebordshistorik, en dagsorden med mødeadvarsler, transskriptioner og din GitHub PRs
> i et lille vindue fastgjort til hjørnet af skærmen.** Dukker op med `Ctrl+Alt+Space`, gemmer sig, når du ikke har brug for
> det og holder alt krypteret på din maskine, uden konto og ingen server.

## 🌐 Sprog

Canto tilbyder **42 grænsefladesprog**, hver med sin egen README. Vælg din i **Indstillinger → Sprog**;
den søgbare vælger bruger modersmålsnavne, og automatisk tilstand følger dit primære systemsprog.
Arabisk, hebraisk og persisk bruger tekst fra højre mod venstre. Yderligere sprogkataloger indlæses efter behov.

De 40 nye grænsefladekataloger og 31 nye README-oversættelser er maskinoversættelser og er ikke blevet
gennemgået af indfødte. Portugisisk og engelsk forbliver de originale grænsefladekataloger. Bakkeetiketter og
meddelelsesoverskrifter følger det valgte sprog; nogle integrationsalarmdetaljer falder tilbage til engelsk,
og backend-fejl forbliver på portugisisk. Syntaks for opgavetitel beholder de eksisterende portugisiske og engelske søgeord.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Hvorfor Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Hvis du bor mellem møder, PRs og små ventende elementer, ender du med fem åbne apps. Canto sætter det hele ind
ét sted.

🔒 **Krypteret som standard.** Argon2id + AES-256-GCM med en hovedadgangskode; nøglen eksisterer kun i RAM.
Windows Hello valgfri.

🏠 **Dine data bliver hos dig.** Nul telemetri, nul server, ingen konto påkrævet. Backup er en enkelt krypteret
`.canto` fil.

⏰ **Du vil ikke gå glip af det.** 1 minut før et møde og på påmindelsestidspunktet dukker widgetten op, afspiller en lyd og
sender en notifikation med **snooze 10 min**.

🪶 **Lys.** Tauri v2 (Rust + systemets webvisning) i stedet for Electron: et 3,5 MB installationsprogram.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Altid opdateret.** Opdaterer inde fra appen og installerer kun det, der er signeret af projektets egen nøgle.

</td>
</tr>
</table>

## 🧰 Funktioner

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Opgaver, der minder dig om

En daglig tjekliste med tid og gentagelse (hver dag, hverdage eller ugentligt). Skriv **`Daily at 9:30am`** og
påmindelsen er allerede indstillet; tilføj **`!high`** (eller `!alta`, `!média`, `!baixa`) som prioritet, eller klik på prikken på rækken for at skifte mellem den. Lange titler ombrydes i stedet for at blive skåret af. **Fokustimer** på enhver opgave: giv den et estimat, tryk på ▶ og en bjælke fastgjort under hver fane tæller tiden imod den (rød, når du går over); tiden gemmes til boksen hvert minut. **Dagsoversigt** klar til at indsætte (opgaver, fokuseret tid, møder med samlet tid, PRs/MRs åbnet, flettet, gennemgået og lukket uden sammenlægning), en **ugentlig og månedlig rapport** i markdown, og **træk over afventende varer** fra i går. **Hurtig optagelse** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` på macOS) skriver en opgave eller en note fra enhver app uden at åbne widgetten.

</td>
</tr>
<tr>
<td>

### 📅 Starter møde? Det fortæller dig.

Deltag i det næste møde med `Ctrl+Alt+M` (`Ctrl+Cmd+M` på macOS). Hvis registreringen mislykkes, prøver Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` på macOS); bakkemenuen forbliver tilgængelig, hvis begge ikke er tilgængelige.

Dagens begivenheder kommer fra Google Kalender (skrivebeskyttet). Et minut før hopper widgetten ind på skærmen med
**tilmeld dig Meet**, afspiller en lyd og sender en systemmeddelelse, uanset hvilken fane du er på, eller selvom den er skjult.
Hvert kort viser en badge med dit svar (accepteret, måske, afvist, afventer). Klik på begivenheden for at se, hvem der arrangerede
det, dagsordenen, hver gæst med en initialavatar og deres svar, og vedhæftede filer, som Geminis noter.
Den øverste linje fortæller dig det **næste gratis slot** på mindst 15 minutter (afviste invitationer og heldagsbegivenheder gør det ikke
tæller), og begivenheder, der overlapper, får et **konflikt**-badge, der navngiver den anden begivenhed. **I dag**-visningen fører med det igangværende møde (tid tilbage, deltagelsesknap, sammenstødsadvarsel) eller det næste, derefter **dagen på én linje** (møder, opgaver og fritid på tværs af arbejdstiden, med mødetid, fritid og konflikter optællet) og én tidslinje, hvor møder, opgaver med en tid og de frie huller er rækker af deres egne: en tid, der allerede byder op over, og en tid, der allerede byder op over, og som er ledige.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Noter som kort

Søgbare kort med `#tags`, pin til top og et-klik-tag-filter; hvert kort viser starten på noten **gengivet** (titler, tjeklister, kode, links), ikke rå markdown. En **WYSIWYG-editor** med en kompakt
formateringslinje (fed, kursiv, kode, overskrift, lister, tjeklister du krydser af lige i teksten, kodeblokke med syntaks
fremhævelse, links, billeder) og markdown-genveje, mens du skriver (`# `, `- `, `[ ] `, ` ``` `); en **MD**-knap
viser den rå markdown, som stadig er, hvordan noter gemmes, søges, synkroniseres og eksporteres. Links åbnes med
`Ctrl`+klik, kun http(er). Indsæt, slip eller vedhæft billeder (PNG, JPEG, GIF, WebP op til 2 MB), hver forseglet i sin egen
krypteret fil, vist inde i noten og som thumbnails på kortet; de bliver på denne maskine udenfor `.canto`
sikkerhedskopier. Håndterer tusindvis af noter: Listen bladres, og søgningen dækker dem alle.

</td>
</tr>
<tr>
<td>

### 📋 Udklipsholder, der aldrig glemmer (eller lækker)

Krypteret historie med søgning og pin; genkender links, farver og kode. Hold markøren over et element for at **kopiere det omskrevet**:
JSON-formateret eller kompakt, tekst på én linje, STORE BOGSTAVER eller små bogstaver (historikindtastningen forbliver, som den var). En kæmpe kopi (en 100 MB log) gør det ikke
frys alt: det holder starten og advarer dig. På Windows springer den over, hvad adgangskodeadministratorer markerer som
følsomme.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Din GitHub på et øjeblik

**Anmodning om gennemgang fra mig**, tildelt til mig, PRs og problemer, jeg har åbnet, med et PR eller problemikon og hvem der åbnede
det. Udkast, PRs **venter på din anmeldelse** og PRs **stoppet** i en uge skiller sig ud, og hver PR bærer en lille
**CI-emblem** (bestået, mislykket, kørende eller ingen CI) fra dets head commits kontroller. Når nogen **anmoder om din
anmeldelse**, fortæller en OS-notifikation dig (til som standard, sluk det i Indstillinger). Filtrer efter tekst, `repo:` eller `label:`, PRs kun eller kun problemer, sorter efter opdatering, oprettelse eller kommentarer, og
rul med **vis mere**. Skift til visningen **Kommentarer** for at se et **Kommentarkatalog**-gitter med alle, der kommenterede dine PRs (avatarer, menneskelige vs bot-badges, antal kommentarer, søgning, botfilter, progressiv sideopdeling) og deres kommentarer. Understøtter også **GitLab.com og selv-hostet GitLab**, med en 5-minutters cache, der
respekterer takstgrænsen. Log ind med et skrivebeskyttet personligt token eller fra browseren (enhedsflow).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam uden at forlade widgetten

Fire underfaner til Steam: **ønskelistetilbud** (største rabat først, hver med hvad den sparer), **topsælgere**
rangeret, **spil nu** (hvert spil Steam rapporterer i de sidste to uger) og **kataloget sorteret efter vurdering**, sidet
med **indlæs mere**, så den når resten af butikken. Hver række bærer **kapselkunsten**, **anmeldelsesresultatet**
med Steams egen formulering og hvor mange anmeldelser det tæller, den overstregede pris, prisen i reais og hvad
rabatbesparelser - og listen summerer den samlede besparelse. De offentlige lister behøver kun din **SteamID64**; en valgfri
**Steam Web API nøgle** tilføjer de seneste spil med deres spilletider. Fanen starter som standard, et afkrydsningsfelt væk
i Indstillinger.

</td>
</tr>
<tr>
<td>

### ⚙️ Indstillinger og automatiske opdateringer

Ændring af hovedadgangskode, Windows Hello, `.canto` backup, en synkroniseret mappe med automatisk fletning (Dropbox,
OneDrive, Syncthing...), start med systemet og sektionen **Opdateringer**, med den **installerede version** og
den **senest offentliggjorte** side om side og en knap til at opdatere og genstarte.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Har også 🎙️ **Møder**, en underfane til dagsordenen ved siden af Liste og Dag: Geminis notater og udskrifter fra
de sidste to uger, plus `.vtt`, `.srt`, `.txt` og `.md` transskriptioner fra en lokal mappe, ryddet op og søgbart.

🤖 **AI-modeller** (på fanelinjen som standard, **ingen API nøgle eller konto**): LLM'er rangeret efter
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, læst fra dens offentlige ranglisteside,
med en scorebar, skaber, pris pr. 1M tokens og hastighed, sorterbar efter intelligens, pris eller hastighed. Den henter kl
mest én gang hver 3. time, og tilmeldingen 🔔 giver dig besked, når en
model **kommer ind i top 10** eller **klatrer inden for den** (kontrolleres hver 6. time, mens hvælvingen er ulåst), med
"nye" og "op" badges i en uge.

🌙 **Forstyr ikke:** i Indstillinger eller bakken, dæmp mødeadvarsler, opgavepåmindelser, statusadvarsler og hver
systembesked i 30 min, 1 t, 2 t, indtil i morgen, eller indtil du slukker det. En måne i den øverste bjælke viser
når det slutter; et klik slår den fra igen. Den overlever en genstart og ender af sig selv.

🔔 **Hver advarsel på én skærm:** klokken i overskriften (tæller og farve, når noget afventer) åbner
advarsler over hele vinduet i enhver tilstand: et kort pr. advarsel med dets handlinger, **afvis alle**, og hvad der var
løst i dag under dem - uden noget afventende, det er sådan, du stadig når dagens log. Fra kajen, et klik
åbner stadig den enkelte advarsel oven på det normale vindue.

⌨️ **Alt med tastatur:** `Alt+1`...`Alt+7` skifter fane, `N` opretter, `/` søger, `F11` fuldskærm, `Alt+L`
låser og `?` viser genvejene. `Ctrl+Shift+P` (`Cmd+Shift+P` på macOS) åbner en **kommandopalet** med hver
handling efter navn: gå til en fane, ny opgave eller note, deltag i næste møde, kopier dagens opsummering, skift skin, lås.

## 🎨 Seks skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Standard</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glas</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Lys</b></td>
</tr>
</table>

Og **Følg system**, som skifter mellem lys og mørk sammen med OS. Alle passerer AA-kontrast.

<details>
<summary>🖥️ Flere skærme: onboarding, global søgning, kommandopalet, GitLab, underopgaver, noteeditor, sikkerhed, synkronisering, tæthed og mere</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Førstegangs velkomst | Global søgning (`Ctrl+K`) | Selvvært fanen GitLab | Mødevarsling |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Opgave med delopgaver, prioritet og PR | Note editor | Flere udklipsholdertyper | Sikkerhed: automatisk låsning og oplåsning |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synkroniseret mappe | Kompakt densitet | Låst hvælving | Tilslut GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Indstillinger i grupper, med søgning | Søgning filtrerer grupperne | Offline chip i overskriften | Bekræft før du rydder udklipsholderen |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Kassér en ikke-gemt notekladde |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Tilstande: Mini, Skjult, Normal, Maksimeret | Minitilstand: advarsler på skærmens kant |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klik på en advarsel i docken | Maksimeret: hele vinduet for den åbne fane |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Klokken åbner alarmerne over hele vinduet |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: tilstandsmenuen åbnes inde i dockvinduet |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Faner, der ikke passer, venter i en "mere"-menu |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Vertical tabs: every tab in reach, in groups | Settings > Appearance: pick the tab layout |
|---|---|
| ![The vertical tab bar opened over the window: My day, Code and Explore groups, Settings at the bottom](docs/prints/app/102-abas-verticais.png) | ![Tab layout in Settings: two previews, Horizontal and Vertical, and a checkbox to keep the side bar open](docs/prints/app/103-abas-layout-ajustes.png) |

| Tasks: progress ring, priority chips, a menu for the rest | Notes: tag chips with counts, list or grid |
|---|---|
| ![Tasks with a progress ring, Todas/Alta/Média/Baixa chips, a more-actions menu and priority pills](docs/prints/app/104-tarefas-refresh.png) | ![Notes with a tag chip row, Pinned and Recent sections and a list/grid toggle](docs/prints/app/105-notas-tags.png) |

| Clipboard: type chips and cards by kind | Agenda: one control row and a countdown ring |
|---|---|
| ![Clipboard with a lock badge, chips by type with counts and cards with a colored type tile](docs/prints/app/113-clipboard-chips.png) | ![Agenda with a single control row and a countdown ring on the meeting in progress](docs/prints/app/114-agenda-anel.png) |

| GitHub: the numbers are filters | Status API: services by severity |
|---|---|
| ![GitHub with four toggle tiles, a compact sort button and CI and waiting-time pills](docs/prints/app/110-github-tiles.png) | ![Status API services sorted by severity, with a summary bar, filter chips and a state pill](docs/prints/app/111-status-servicos.png) |

| Status API: my endpoints | AI models: sort chips | Activity: the focus goal |
|---|---|---|
| ![My endpoints worst first, with state pills, a plus-address button and the add form](docs/prints/app/112-status-endpoints.png) | ![AI models with Intelligence, Price and Speed chips and a rank block](docs/prints/app/106-modelos-chips.png) | ![Activity with the focus goal card and a pill with the minutes left](docs/prints/app/107-atividade-meta.png) |

| Spil og fuld skærm: advarsler venter, indtil du forlader |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Snooze: 1, 5 eller 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Opgavepåmindelse | Skift hovedadgangskode | Status API (opt-in fane) | Sprog: engelsk, portugisisk eller spansk |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopier et klip omskrevet | Mødevarsling med forberedelse |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Redesign: fanen Opgaver, før og efter |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redesign: hver fane, før (øverst) og efter (nederst) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI mislykkedes, med de ødelagte job | Nogen nævnte mig | Deres kontakter i Indstillinger |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Omtale alarm med hvem der skrev det |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Omtale advarsel med en forhåndsvisning af teksten |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Flere advarsler om mit eget arbejde |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Dagsoversigt advarsel | Indstilling af dagsoversigt |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Underfanen Omtaler (GitHub og GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Adgangskode ændret, én fil afventer | Dagsoversigt |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Ugerapport | Dagsorden: næste fritid og konflikter |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Dagsorden: gratis lige nu | Kommandopalet (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Forstyr ikke | Billede i en note |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI-badge på hver PR | Gennemgå anmodningsmeddelelser |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Bemærk billeder som thumbnails | WYSIWYG note editor |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Note editor: rå markdown (MD) | Note editor på den lyse hud |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Opgaver: prioritet på rækken, lange titler ombrydes | Noteliste med gengivet markdown |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI-modeller rangeret efter Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: topsælgere, nummereret | Steam: de seneste fem spil spillet, med begge spilletider |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: kataloget efter vurdering, med "indlæs mere" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Én advarselsoverlejring for alt afventende: udfald, møder, opgaver og nye AI-modeller |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Mine slutpunkter: fliser med den seneste latency | Et åbent slutpunkt: latensdiagram, grænse- og advarselsindstillinger | Tilføjelse af en DNS + certifikatkontrol |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Dagsorden for enhver dag: forrige og næste pile, en datovælger og en tilbage-til-i dag-knap |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Opgaver: den aktuelle opgave med timer og grupperet liste | GitHub: oversigtsstrimmel over listerne | GitLab: samme strimmel uden CI-flisen |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fokustimer fastgjort under hver fane | Dagsorden som dag, opgaver ved siden af ​​møder |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dagsvisning: overlappende begivenheder deler bredden side om side |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Gennemgå radar: ældste anmodning først, forfalden i rødt, snooze |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Møder som en underfane til dagsordenen ved siden af ​​Liste og Dag |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Aktivitetsfanen (deaktiveret som standard) | Resumé med fokuseret tid og lukket PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Fanen Aktivitet, sidste 7 dage | Fanen Aktivitet, slået fra | Aktivitetsfane i et bredt vindue |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Fanen **Aktivitet** starter skjult (slå den til under Indstillinger → synlige faner). Den registrerer kun navnet på
fokuseret program, mens du bruger computeren, i en forseglet lokal fil, der aldrig når sikkerhedskopier eller synkronisering (Wayland
kan ikke rapportere det fokuserede vindue, så det forbliver utilgængeligt der). Slukket, indtil du tilmelder dig, og den første skærm siger hvad
holdes og hvad der aldrig er.

- **Dag**: en doughnut efter kategori med totalen indeni, hvis forklaring skjuler en kategori, ændringen i forhold til dagen
før og inaktiv tid (ingen tastatur eller mus i 2 minutter). Under det, et dagligt kodefokus mål med sin streak og
en prik om dagen, tre højdepunkter (længste strækning i én app, app-omskiftere, peak time), en tidslinje, hvor hele
dag, den ledige strækker sig, og de travleste apps deler en tidsakse med en "nu"-markør og en liste over applikationer
(tryk på en for at ændre dens kategori) eller af de opgaver, som fokustimeren kørte på.
- **Uge**: stablede kolonner pr. dag med den gennemsnitlige linje og en prik under hver dag, der opfyldte målet, et times varmekort
med dit højdepunkt, og de samme lister for hele ugen.
- **Layout og skins**: en kolonne i standardvinduet, to når den er bred (maksimeret); hver hud har sin egen
kategorifarver, kontrolleret for kontrast. Menuen ved siden af ​​dagen kopierer den som tekst.

<sub>Alle skærmbilleder bruger fiktive data.</sub>

## ⚖️ Sammenlignet med hvad der er derude

Ingen af de undersøgte værktøjer dækker mere end to af disse fronter på én gang. Kilder og detaljer i
[docs/benchmark.md](docs/benchmark.md).

| | Opgaver + påmindelse | Noter | Udklipsholder | Møder | GitHub | Lokal kryptering som standard |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ kun synkronisering |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ valgfrit |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ indfødt · ➖ delvis, via udvidelse eller valgfri · — ingen · ? upubliceret · n/a gemmer ikke brugerdata</sub>

Hvad benchmark bragte her: **tid lige i opgavetitlen** (Todoist/TickTick), **udsæt advarslen**
(TickTick) og **udklipsholder, der respekterer adgangskodeadministratorer** (CopyQ/Ditto).

## ⬇️ Installer

Download installationsprogrammet til din platform fra **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| System | Fil |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (anbefales) eller `.msi` |
| 🍎 macOS | `.dmg` til Apple Silicon eller Intel |
| 🐧 Linux | `.AppImage`, `.deb` eller `.rpm` |

1. Ved første kørsel opretter du **hovedadgangskoden**. Der er ingen genoprettelse: mister adgangskoden, mister dataene.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` på macOS) viser og skjuler widgetten.
3. Færdig. Når en ny version sendes, giver Canto dig besked, og **Indstillinger → Opdateringer** opdaterer med et enkelt klik.

> [!BEMÆRK]
> Installationsprogrammerne er ikke kodesigneret endnu: SmartScreen (Windows) og Gatekeeper (macOS) advarer ved første lancering.
> Automatiske opdateringer verificeres mod projektets egen signatur, før de køres.

Færdiglavede manifester til winget og Homebrew (plus et skelet til Flatpak, i øjeblikket blokeret) bor i
[`packaging/`](packaging/README.md) — forberedt og verificeret lokalt, men endnu ikke offentliggjort til disse
repositories: publicering er en manuel beslutning og handling fra vedligeholderen.

## 🔒 Sikkerhed på et øjeblik

| Lag | Beskyttelse |
|---|---|
| Hvælving | Argon2id (19 MiB, t=2) → AES-256-GCM, en frisk nonce på hver skrivning, atomisk skrivning med `fsync` |
| Nøgle | Kun RAM, nulstillet ved lås; konfigurerbar autolås (5 til 60 min i tomgang, 15 min som standard) |
| Netværk | kun Rust processen taler til netværket; webvisningen har ingen ekstern oprindelse (CSP) og ser aldrig tokens |
| Google | valgfrit, kun `calendar.events.readonly`, `directory.readonly` (Workspace-kollegers billeder på gæstelisten) plus profil, OAuth med PKCE og loopback |
| GitHub | valgfri, krypteret token; elementer åbnes kun, hvis linket er `https://github.com/` |
| GitLab | valgfri, krypteret adresse og token; Kun `https://`, ingen omdirigeringer, kun links fra den konfigurerede instans |
| Opdateringer | installerer kun en pakke signeret af projektets nøgle; en manipuleret download kasseres før kørsel |

Fuld model, backup, flet på tværs af maskiner og hvor hver fil bor: [docs/seguranca.md](docs/seguranca.md).
Har du fundet en fejl? [SECURITY.md](SECURITY.md).

## 📚 Dokumentation

| Dokument | Hvad er der i det |
|---|---|
| 📖 [User guide](docs/uso.md) | faner, tilbagevendende opgaver, genveje, skins, tilgængelighed, vindue, opdateringer og start med systemet |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google dagsorden og GitHub (personligt token eller enhedsflow) |
| 🛡️ [Security and data](docs/seguranca.md) | trusselmodel, `.canto` backup, fletning, ændring af adgangskode, filer på disk |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify og volumentest |
| 📝 [CHANGELOG](CHANGELOG.md) | hvad ændrede sig i hver version |
| 🤝 [How to contribute](CONTRIBUTING.md) | miljø, test, PRs og hvordan man udgiver en udgivelse |
| 🤖 [Agent guide](AGENTS.md) | kontrakter og fælder for alle, der redigerer koden med AI |

## 🛠️ Udvikling

Forudsætninger: [Bun](https://bun.sh) ≥ 1,2, stabil Rust ≥ 1,85 og
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) til dit system.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Webvisninger oprettes efter tilstanden Rust, og bakken initialiseres, så opstarts-IPC-kald kan ikke opsætte race.

Hver PR kører CI på Windows, macOS og Linux. Konventionelle `fix`, `feat` og breaking commits slået sammen til `main`
få et SemVer tag, genererede release notes og signerede installatører bygget parallelt; udgivelsen offentliggøres efter verifikation (detaljer i
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licens

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Lavet med 🦀 Rust, ⚛️ React og ☕ for dem, der bor mellem møderne.</sub></div>
