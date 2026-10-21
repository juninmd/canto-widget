<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · **Latviešu** · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Uzdevumi ar atgādinājumiem, piezīmēm, starpliktuves vēsturi, darba kārtību ar sapulces brīdinājumiem, stenogrammām un jūsu GitHub PRs
> mazā logā, kas piesprausts ekrāna stūrī.** Tiek parādīts ar `Ctrl+Alt+Space`, tiek paslēpts, kad tas nav nepieciešams
> tas un viss tiek šifrēts jūsu datorā bez konta un servera.

## 🌐 Valodas

Canto piedāvā **42 saskarnes valodas**, katrai no tām ir savs README. Izvēlieties savu sadaļā **Iestatījumi → Valoda**;
meklēšanas atlasītājs izmanto dzimto valodu nosaukumus, un automātiskais režīms seko jūsu primārajai sistēmas valodai.
Arābu, ebreju un persiešu valodā tiek izmantots teksts no labās puses uz kreiso. Papildu valodu katalogi tiek ielādēti pēc pieprasījuma.

40 jaunie saskarnes katalogi un 31 jaunais README tulkojums ir mašīntulkojumi, un tādi nav bijuši
pārskatījuši dzimtā valoda. Portugāļu un angļu valodas joprojām ir sākotnējie interfeisa katalogi. Paplātes etiķetes un
paziņojumu virsraksti seko atlasītajai valodai; dažas integrācijas brīdinājuma detaļas ir angļu valodā,
un aizmugursistēmas kļūdas paliek portugāļu valodā. Uzdevuma nosaukuma sintakse saglabā esošos portugāļu un angļu valodas atslēgvārdus.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Kāpēc Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ja dzīvojat starp sapulcēm, PRs un maziem neapstiprinātiem vienumiem, tiks atvērtas piecas lietotnes. Canto ievieto visu
viena vieta.

🔒 **Pēc noklusējuma šifrēts.** Argon2id + AES-256-GCM ar galveno paroli; atslēga vienmēr pastāv tikai RAM.
Windows Hello nav obligāta.

🏠 **Jūsu dati paliek pie jums.** Nulle telemetrijas, nulles servera, nav nepieciešams konts. Dublējums ir viens šifrēts
`.canto` failu.

⏰ **Jūs to nepalaidīsit garām.** 1 minūti pirms sapulces un atgādinājuma laikā logrīks tiek parādīts, atskaņo skaņu un
nosūta paziņojumu ar **atlikt 10 min**.

🪶 **Light.** Tauri v2 (Rust + sistēmas tīmekļa skats) Electron vietā: 3,5 MB instalēšanas programma.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Vienmēr atjaunināts.** Atjaunina no lietotnes un instalē tikai to, kas ir parakstīts ar paša projekta atslēgu.

</td>
</tr>
</table>

## 🧰 Funkcijas

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Uzdevumi, kas atgādina

Ikdienas kontrolsaraksts ar laiku un atkārtošanos (katru dienu, darba dienas vai nedēļu). Ierakstiet **`Daily at 9:30am`** un
atgādinājums jau ir iestatīts; pievienojiet **`!high`** (vai `!alta`, `!média`, `!baixa`) kā prioritāti vai noklikšķiniet uz punkta uz rindas, lai to pārvietotu. Garie nosaukumi iesaiņo, nevis tiek nogriezti. **Fokusējiet taimeri** uz jebkuru uzdevumu: sniedziet to aptuvenu, nospiediet ▶, un zem katras cilnes piespraustā josla uzskaita laiku (sarkans, kad esat pārvarējis); laiks tiek saglabāts glabātavā katru minūti. **Dienas kopsavilkums** gatavs ielīmēšanai (uzdevumi, koncentrētais laiks, sapulces ar kopējo laiku, PRs/MRs atvērts, sapludināts, pārskatīts un aizvērts bez sapludināšanas), **nedēļas un mēneša pārskats** ar atlaidi un **neapstiprinātus vienumus** no vakardienas. **Ātrā tveršana** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` operētājsistēmā macOS) ieraksta uzdevumu vai piezīmi no jebkuras lietotnes, neatverot logrīku.

</td>
</tr>
<tr>
<td>

### 📅 Tikšanās sākas? Tas jums saka.

Pievienojieties nākamajai sapulcei, izmantojot `Ctrl+Alt+M` (`Ctrl+Cmd+M` operētājsistēmā macOS). Ja reģistrācija neizdodas, Canto mēģina
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` operētājsistēmā macOS); teknes izvēlne paliek pieejama, ja abi nav pieejami.

Šodienas notikumi nāk no Google Kalendāra (tikai lasāms). Pirms minūtes logrīks tiek parādīts ekrānā ar
**pievienojieties Meet**, atskaņo skaņu un nosūta sistēmas paziņojumu neatkarīgi no jūsu atvērtās cilnes vai pat tad, ja tā ir paslēpta.
Katrā kartītē ir redzama emblēma ar jūsu atbildi (pieņemta, varbūt, noraidīta, gaida). Noklikšķiniet uz pasākuma, lai redzētu, kas to organizēja
tā, darba kārtība, katrs viesis ar iniciāļu iemiesojumu un atbildi, kā arī pielikumi, piemēram, Dvīņu piezīmes.
Augšējā rindiņā ir norādīts **nākamais bezmaksas laiks** vismaz 15 minūšu garumā (noraidīti ielūgumi un visas dienas pasākumi netiek rādīti
skaits), un notikumi, kas pārklājas, saņem emblēmu **konflikts**, nosaucot otru notikumu. Skats **Šodien** tiek atvērts ar notiekošo sapulci (atlicis laiks, pievienošanās poga, brīdinājums par sadursmi) vai nākamo, pēc tam — diena vienā rindā** (sapulces, uzdevumi un brīvais laiks darba laikā, skaitot sapulces laiku, brīvo laiku un konfliktus) un vienu laika skalu, kurā sapulces, uzdevumi ar laiku un brīvās nepilnības jau piedāvā rindas, lai pielāgotos uzdevumam.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Piezīmes kā kartītes

Meklējamas kartītes ar `#tags`, piespraudiet augšpusē un ar viena klikšķa tagu filtru; katrā kartītē tiek rādīts piezīmes sākums **renderēts** (nosaukumi, kontrolsaraksti, kods, saites), nevis neapstrādāta atzīme. **WYSIWYG redaktors** ar kompaktu
formatēšanas josla (treknraksts, slīpraksts, kods, virsraksts, saraksti, kontrolsaraksti, kurus atzīmējat tieši tekstā, kodu bloki ar sintaksi
izcelšana, saites, attēli) un atzīmes saīsnes, rakstot (`# `, `- `, `[ ] `, ` ``` `); **MD** pārslēgs
parāda neapstrādāto cenu samazinājumu, kas joprojām ir veids, kā piezīmes tiek saglabātas, meklētas, sinhronizētas un eksportētas. Saites atveras ar
`Ctrl`+klikšķis, tikai http(s). Ielīmējiet, nometiet vai pievienojiet attēlus (PNG, JPEG, GIF, WebP līdz 2 MB), katrs aizzīmogots atsevišķi
šifrēts fails, kas parādīts piezīmē un kā sīktēli kartē; viņi paliek šajā iekārtā ārpus `.canto`
dublējumkopijas. Apstrādā tūkstošiem piezīmju: saraksts ir lappuses, un meklēšana aptver tās visas.

</td>
</tr>
<tr>
<td>

### 📋 Starpliktuve, kas nekad neaizmirst (vai nenoplūst)

Šifrēta vēsture ar meklēšanu un pin; atpazīst saites, krāsas un kodu. Virziet kursoru uz vienuma, lai **kopētu to pārrakstītu**:
JSON formatēts vai kompakts, teksts vienā rindā, LIELIE vai mazie burti (vēstures ieraksts paliek tāds, kāds tas bija). Milzu kopija (100 MB žurnāls) nav
iesaldēt jebko: tas saglabā startu un brīdina. Operētājsistēmā Windows tas izlaiž visus paroļu pārvaldniekus, ko atzīmē kā
jūtīgs.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Jūsu GitHub īsumā

**No manis pieprasīta pārskatīšana**, piešķirta man, PRs un manis atvērtie jautājumi, ar PR vai problēmas ikonu un kas atvēra
to. Melnraksti, PRs **gaida jūsu atsauksmi** un PRs **apstājās** nedēļu, un katrs PR nes nelielu
**CI emblēma** (nokārtota, neizdevusies, darbojas vai nav CI) no tās galvenās veiktās pārbaudes. Kad kāds **pieprasa jūsu
pārskatīt**, OS paziņojums informē (ieslēgts pēc noklusējuma, izslēdziet to sadaļā Iestatījumi). Filtrējiet pēc teksta, tikai `repo:` vai `label:`, PRs vai tikai problēmām, kārtojiet pēc atjauninājuma, izveides vai komentāriem un
ritiniet ar **rādīt vairāk**. Pārslēdzieties uz skatu **Komentāri**, lai skatītu **Komentētāju kataloga** režģi ar visiem, kas komentēja jūsu PRs (iemiesojumi, cilvēka un robota emblēmas, komentāru skaits, meklēšana, robotu filtrs, progresīvā lappušu šķirošana) un viņu komentārus. Atbalsta arī **GitLab.com un pašmitināto GitLab** ar 5 minūšu kešatmiņu, kas
ievēro likmes ierobežojumu. Pierakstieties, izmantojot tikai lasāmu personīgo pilnvaru vai pārlūkprogrammu (ierīces plūsma).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam, neizejot no logrīka

Četras Steam apakšcilnes: **vēlmju saraksta piedāvājumi** (vispirms lielākā atlaide, katra ar ietaupījumu), **pārdevēji**
ranžēts, **spēlē tagad** (katras spēles Steam ziņo par pēdējām divām nedēļām) un **katalogs sakārtots pēc vērtējuma**, lappuse
ar **ielādēt vairāk**, lai tas sasniegtu pārējo veikalu. Katrā rindā ir **kapsulas noformējums**, **pārskata rezultāts**
ar paša Steam formulējumu un to atsauksmju skaitu, izsvītroto cenu, cenu reālos un
atlaides ietaupījumi — un saraksts saskaita kopējo ietaupījumu. Publiskajiem sarakstiem nepieciešama tikai jūsu **SteamID64**; neobligāts
**Steam Web API taustiņš** pievieno jaunākās spēles ar to atskaņošanas laiku. Cilne sākas pēc noklusējuma, vienas izvēles rūtiņas attālumā
sadaļā Iestatījumi.

</td>
</tr>
<tr>
<td>

### ⚙️ Iestatījumi un automātiskie atjauninājumi

Galvenā paroles maiņa, Windows Hello, `.canto` dublējums, sinhronizēta mape ar automātisku sapludināšanu (Dropbox,
OneDrive, sinhronizēšana...), sāciet ar sistēmu un sadaļu **Atjauninājumi**, ar **instalēto versiju** un
**jaunākais publicētais** viens pie otra un poga atjaunināšanai un restartēšanai.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Ir arī 🎙️ **Sapulces**, darba kārtības apakšcilne blakus sarakstam un dienai: Dvīņu piezīmes un atšifrējumi no plkst.
pēdējās divas nedēļas, kā arī `.vtt`, `.srt`, `.txt` un `.md` atšifrējumi no vietējās mapes, iztīrīti un meklējami.

🤖 **AI modeļi** (pēc noklusējuma ciļņu joslā, **nav atslēgas API vai konta**): LLM sarindoti pēc
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, lasiet no tā publiskā līderu saraksta lapas,
ar rezultātu joslu, veidotāju, cenu par 1 miljonu marķieru un ātrumu, ko var kārtot pēc informācijas, cenas vai ātruma. Tas ienes plkst
visbiežāk reizi 3 stundās, un pieteikšanās 🔔 informē jūs, kad a
modelis **iekļūst top 10** vai **uzkāpj tajā** (pārbauda ik pēc 6 stundām, kamēr glabātuve ir atbloķēta), ar
nozīmītes "jaunas" un "uz augšu" uz nedēļu.

🌙 **Netraucēt:** sadaļā Iestatījumi vai paplātē apklusiniet sapulces brīdinājumus, uzdevumu atgādinājumus, statusa brīdinājumus un citus
sistēmas paziņojums 30 min, 1 h, 2 h, līdz rītdienai vai līdz brīdim, kad to izslēgsiet. Parādās mēness augšējā joslā
kad tas beidzas; viens klikšķis to atkal izslēdz. Tas pārdzīvo restartēšanu un beidzas pats no sevis.

🔔 **Katrs brīdinājums vienā ekrānā:** zvans galvenē (skaitiet un krāsojiet, ja kaut kas gaida), atver
brīdinājumi visā logā jebkurā režīmā: viena kartīte katram brīdinājumam ar tā darbībām, **noraidīt visu** un to, kas bija
šodien tika atrisināts saskaņā ar tiem — nekas nav gaidīts, tādējādi jūs joprojām sasniedzat šodienas žurnālu. No doka — klikšķis
joprojām atver šo vienu brīdinājumu parastā loga augšpusē.

⌨️ **Viss, izmantojot tastatūru:** `Alt+1`…`Alt+7` pārslēgt cilnes, `N` veido, `/` meklē, `F11` pilnekrāna režīmu, `Alt+L`
bloķē un `?` uzskaita īsceļus. `Ctrl+Shift+P` (`Cmd+Shift+P` operētājsistēmā macOS) atver **komandu paleti** ar katru
darbība pēc nosaukuma: dodieties uz cilni, jaunu uzdevumu vai piezīmi, pievienojieties nākamajai sapulcei, kopējiet dienas kopsavilkumu, mainiet apvalku, bloķējiet.

## 🎨 Sešas ādas

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Noklusējums</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Drakula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Stikls</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Gaišs</b></td>
</tr>
</table>

Un **Sekojiet sistēmai**, kas kopā ar operētājsistēmu pārslēdzas starp gaišo un tumšo. Visi iztur AA kontrastu.

<details>
<summary>🖥️ Vairāk ekrānu: iekļaušana, globālā meklēšana, komandu palete, GitLab, apakšuzdevumi, piezīmju redaktors, drošība, sinhronizācija, blīvums un daudz kas cits</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Pirmo reizi laipni lūdzam | Globālā meklēšana (`Ctrl+K`) | Pašmitināta cilne GitLab | Brīdinājums par sapulci |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Uzdevums ar apakšuzdevumiem, prioritāti un PR | Piezīmju redaktors | Vairāk starpliktuves veidu | Drošība: automātiska bloķēšana un atbloķēšana |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Sinhronizētā mape | Kompakts blīvums | Slēgta velve | Pievienojiet GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Iestatījumi grupās, ar meklēšanu | Meklēšana filtrē grupas | Bezsaistes mikroshēma galvenē | Apstipriniet pirms starpliktuves notīrīšanas |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Atmest nesaglabātu piezīmes melnrakstu |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Režīmi: Mini, Slēpts, Normāls, Maksimizēts | Mini režīms: brīdinājumi uz ekrāna malas |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Noklikšķiniet uz brīdinājuma dokā | Maksimizēts: viss atvērtās cilnes logs |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Zvans atver brīdinājumus visā logā |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: režīma izvēlne tiek atvērta dokstacijas logā |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Cilnes, kas nav piemērotas, gaida izvēlnē "vairāk" |
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

| Spēles un pilnekrāna režīms: brīdinājumi pagaidiet, līdz iziesiet |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Atlikt: 1, 5 vai 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Uzdevuma atgādinājums | Mainīt galveno paroli | Statuss API (izvēles cilne) | Valoda: angļu, portugāļu vai spāņu |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopēt pārrakstītu klipu | Brīdinājums par sapulci ar sagatavošanos |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Pārveidošana: cilne Uzdevumi, pirms un pēc |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Pārveidošana: katra cilne, pirms (augšā) un pēc (apakšā) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI neizdevās, ar izjauktiem darbiem | Kāds mani pieminēja | Viņu slēdži sadaļā Iestatījumi |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Minēt brīdinājumu ar to, kas to uzrakstījis |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Pieminēšanas brīdinājums ar teksta priekšskatījumu |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Vairāk brīdinājumu par manu darbu |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Dienas kopsavilkuma brīdinājums | Dienas kopsavilkuma iestatījums |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Piemin apakšcilni (GitHub un GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Parole mainīta, viens fails gaida | Dienas kopsavilkums |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Iknedēļas pārskats | Dienas kārtība: nākamais brīvais laiks un konflikti |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Darba kārtība: šobrīd bez maksas | Komandu palete (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Netraucēt | Attēls piezīmē |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI emblēma katrā PR | Pārskatīt pieprasījumu paziņojumus |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Piezīme attēlus kā sīktēlus | WYSIWYG piezīmju redaktors |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Piezīmju redaktors: neapstrādāta atzīme (MD) | Piezīmju redaktors uz gaišas ādas |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Uzdevumi: prioritāte uz rindu, garie virsraksti wrap | Piezīmju saraksts ar atveidotu samazinājumu |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI modeļi, kas sarindoti pēc izlūkošanas indeksa |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: visvairāk pārdotie, numurēti | Steam: pēdējās piecas aizvadītās spēles ar abiem spēles laikiem |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalogs pēc vērtējuma ar "ielādēt vairāk" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Viens brīdinājuma pārklājums visam gaidāmajam: pārtraukumiem, sanāksmēm, uzdevumiem un jauniem AI modeļiem |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Mani galapunkti: flīzes ar jaunāko latentumu | Atvērts galapunkts: latentuma diagramma, ierobežojums un brīdinājumu iestatījumi | DNS + sertifikāta pārbaudes pievienošana |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Jebkuras dienas darba kārtība: iepriekšējās un nākamās bultiņas, datuma atlasītājs un poga Atgriezties uz šodienu |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Uzdevumi: pašreizējais uzdevums ar taimeri un grupētu sarakstu | GitHub: kopsavilkuma josla virs sarakstiem | GitLab: tā pati josla, bez CI elementa |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fokusa taimeris ir piesprausts zem katras cilnes | Darba kārtība kā diena, uzdevumi blakus sanāksmēm |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dienas skats: notikumi, kas pārklājas, koplieto platumu blakus |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Pārskatīt radaru: vispirms vecākais pieprasījums, nokavēts sarkanā krāsā, atlikt |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Sanāksmes kā darba kārtības apakšcilne blakus sarakstam un dienai |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Cilne Darbība (pēc noklusējuma izslēgta) | Kopsavilkums ar fokusētu laiku un slēgtu PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Cilne Darbība, pēdējās 7 dienas | Darbības cilne, izslēgta | Darbības cilne plašā logā |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Cilne **Aktivitāte** tiek paslēpta (ieslēdziet to sadaļā Iestatījumi → redzamās cilnes). Tas ieraksta tikai nosaukumu
fokusēta lietojumprogramma, kamēr izmantojat datoru, slēgtā lokālā failā, kas nekad nesasniedz dublējumu vai sinhronizāciju (Wayland
nevar ziņot par fokusēto logu, tāpēc tas tur nav pieejams). Izslēgts, līdz izvēlaties, un pirmajā ekrānā tiek parādīts, kas
tiek paturēts un kas nekad netiek.

- **Diena**: virtulis pēc kategorijas ar kopējo iekšpusi, kura leģenda slēpj kategoriju, izmaiņas dienā
pirms un dīkstāves laiks (2 minūtes bez tastatūras vai peles). Zem tā ikdienas koda fokusa mērķis ar tā sēriju un
viens punkts dienā, trīs svarīgākie momenti (garākais posms vienā lietotnē, lietotņu slēdži, maksimālā stunda), laika skala, kurā viss
dienā, dīkstāve ilgst, un noslogotākajām lietotnēm ir viena laika ass ar marķieri "tagad" un lietojumprogrammu sarakstu
(pieskarieties vienam, lai mainītu tā kategoriju) vai uzdevumiem, kurus darbojās fokusa taimeris.
- **Nedēļa**: sakrautas kolonnas dienā ar vidējo līniju un punktu zem katras dienas, kas sasniedza mērķi, stundu siltuma karte
ar savu maksimumu, un tie paši saraksti visai nedēļai.
- **Izkārtojums un apvalki**: viena kolonna noklusējuma logā, divas, ja tas ir plats (maksimizēts); katrai ādai ir savs
kategorijas krāsas, pārbaudīts kontrasts. Izvēlne blakus dienai to kopē kā tekstu.

<sub>Visos ekrānuzņēmumos tiek izmantoti fiktīvi dati.</sub>

## ⚖️ Salīdzinot ar to, kas tur ir

Neviens no izpētītajiem rīkiem neaptver vairāk kā divas no šīm frontēm vienlaikus. Avoti un informācija sadaļā
[docs/benchmark.md](docs/benchmark.md).

| | Uzdevumi + atgādinājums | Piezīmes | Starpliktuve | Sanāksmes | GitHub | Lokālā šifrēšana pēc noklusējuma |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidiāns / Džoplina | ➖ | ✅ | — | — | — | ➖ tikai sinhronizācija |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Tāpat | — | — | ✅ | — | — | ➖ pēc izvēles |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ vietējā · ➖ daļēja, ar paplašinājumu vai izvēles · — nav · ? nav publicēts · n/a neuzglabā lietotāja datus</sub>

Ko šeit sniedz etalons: **laiks tieši uzdevuma nosaukumā** (Todoist/TickTick), **atlikt brīdinājumu**
(TickTick) un **starpliktuve, kas respektē paroļu pārvaldniekus** (CopyQ/Ditto).

## ⬇️ Instalējiet

Lejupielādējiet savas platformas instalēšanas programmu no **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistēma | Fails |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (ieteicams) vai `.msi` |
| 🍎 macOS | `.dmg` Apple Silicon vai Intel |
| 🐧 Linux | `.AppImage`, `.deb` vai `.rpm` |

1. Pirmajā palaišanas reizē jūs izveidojat **galveno paroli**. Nav atkopšanas: pazaudējiet paroli, pazaudējiet datus.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` operētājsistēmā macOS) parāda un paslēpj logrīku.
3. Gatavs. Kad tiek piegādāta jauna versija, Canto informē jūs, un **Iestatījumi → Atjauninājumi** tiek atjaunināti ar vienu klikšķi.

> [!PIEZĪME]
> Instalēšanas programmas vēl nav parakstītas ar kodu: SmartScreen (Windows) un Gatekeeper (macOS) brīdina pirmajā palaišanas reizē.
> Pirms palaišanas automātiskie atjauninājumi tiek pārbaudīti pēc paša projekta paraksta.

Gatavi winget un Homebrew manifesti (kā arī Flatpak skelets, pašlaik bloķēts) dzīvo
[`packaging/`](packaging/README.md) — sagatavots un pārbaudīts lokāli, bet vēl nav publicēts tiem
repozitoriji: publicēšana ir uzturētāja manuāls lēmums un darbība.

## 🔒 Drošība īsumā

| Slānis | Aizsardzība |
|---|---|
| Velve | Argon2id (19 MiB, t=2) → AES-256-GCM, jauns ieraksts katrā rakstīšanas reizē, atomu rakstīšana ar `fsync` |
| Atslēga | Tikai operatīvā atmiņa, bloķēta nulle; konfigurējama automātiskā bloķēšana (5 līdz 60 min dīkstāve, 15 min pēc noklusējuma) |
| Tīkls | tikai process Rust sazinās ar tīklu; tīmekļa skatam nav attālās izcelsmes (CSP), un tas nekad neredz marķierus |
| Google | pēc izvēles, tikai `calendar.events.readonly`, `directory.readonly` (Darbvietas kolēģu fotogrāfijas viesu sarakstā) plus profils, OAuth ar PKCE un cilpu |
| GitHub | neobligāts, šifrēts marķieris; vienumi tiek atvērti tikai tad, ja saite ir `https://github.com/` |
| GitLab | izvēles, šifrēta adrese un marķieris; Tikai `https://`, bez novirzīšanas, saites tikai no konfigurētās instances |
| Atjauninājumi | instalē tikai pakotni, kas parakstīta ar projekta atslēgu; manipulēta lejupielāde tiek atmesta pirms |

Pilns modelis, dublēšana, sapludināšana dažādās iekārtās un katra faila atrašanās vieta: [docs/seguranca.md](docs/seguranca.md).
Vai atradāt trūkumu? [SECURITY.md](SECURITY.md).

## 📚 Dokumentācija

| Dokuments | Kas tajā ir |
|---|---|
| 📖 [User guide](docs/uso.md) | cilnes, periodiski uzdevumi, saīsnes, apvalki, pieejamība, logs, atjauninājumi un sāciet ar sistēmu |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google darba kārtība un GitHub (personīgā pilnvara vai ierīces plūsma) |
| 🛡️ [Security and data](docs/seguranca.md) | draudu modelis, `.canto` dublēšana, sapludināšana, paroles maiņa, faili diskā |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify un skaļuma testi |
| 📝 [CHANGELOG](CHANGELOG.md) | kas mainījās katrā versijā |
| 🤝 [How to contribute](CONTRIBUTING.md) | vide, testi, PRs un laidiena publicēšana |
| 🤖 [Agent guide](AGENTS.md) | līgumi un slazdi ikvienam, kas rediģē kodu ar AI |

## 🛠️ Attīstība

Priekšnosacījumi: [Bun](https://bun.sh) ≥ 1,2, stabils Rust ≥ 1,85 un
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) jūsu sistēmai.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Tīmekļa skati tiek izveidoti pēc Rust stāvokļa, un tekne ir inicializēta, tāpēc startēšanas IPC izsaukumi nevar veikt iestatīšanu.

Katrs PR palaiž CI operētājsistēmās Windows, macOS un Linux. Parastās `fix`, `feat` un laužošās saistības ir apvienotas `main`
iegūstiet SemVer tagu, ģenerētas izlaiduma piezīmes un parakstītus instalētājus, kas izveidoti paralēli; laidiens tiek publicēts pēc pārbaudes (sīkāka informācija ir
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licence

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Izgatavots ar 🦀 Rust, ⚛️ React un ☕ tiem, kas dzīvo starp sapulcēm.</sub></div>
