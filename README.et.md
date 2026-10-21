<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · **Eesti** · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Meeldetuletuste, märkmete, lõikepuhvri ajaloo, koosolekumärguannete päevakava, ärakirjade ja teie GitHub PRs ülesanded
> väikeses aknas, mis on kinnitatud ekraani nurka.** Ilmub koos `Ctrl+Alt+Space`, peidab, kui te ei vaja
> seda ja hoiab kõik teie arvutis krüpteerituna ilma konto ja serverita.

## 🌐 Keeled

Canto pakub **42 liidese keelt**, millest igaühel on oma README. Valige oma menüüs **Seaded → Keel**;
otsitav valija kasutab emakeele nimesid ja automaatrežiim järgib teie peamist süsteemikeelt.
Araabia, heebrea ja pärsia keeles kasutatakse paremalt vasakule kirjutatavat teksti. Täiendavad keelekataloogid laaditakse nõudmisel.

40 uut liideste kataloogi ja 31 uut README tõlget on masintõlked ja seda pole olnud
üle vaadanud emakeelena kõnelejad. Algseteks liidesekataloogideks jäävad portugali ja inglise keel. Salve sildid ja
teatiste pealkirjad järgivad valitud keelt; osa integratsioonihoiatuste üksikasju on inglise keeles,
ja taustaprogrammi vead jäävad portugali keelde. Ülesande pealkirja süntaks säilitab olemasolevad portugali ja inglise keele märksõnad.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Miks Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Kui elate koosolekute, PRs ja väikeste ootel olevate üksuste vahel, on lõpuks avatud viis rakendust. Canto paneb selle kõik sisse
üks koht.

🔒 **Vaikimisi krüptitud.** Argon2id + AES-256-GCM põhiparooliga; võti eksisteerib ainult RAM-is.
Windows Hello valikuline.

🏠 **Teie andmed jäävad teie juurde.** Null telemeetriat, null server, kontot pole vaja. Varukoopia on üks krüpteeritud
`.canto` faili.

⏰ **Te ei jää sellest ilma.** 1 minut enne koosolekut ja meeldetuletuse ajal avaneb vidin, esitab heli ja
saadab märguande **lükka 10 min**.

🪶 **Light.** Tauri v2 (Rust + süsteemi veebivaade) Electron asemel: 3,5 MB installiprogramm.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Alati ajakohane.** Värskendab rakenduse seest ja installib ainult selle, mis on allkirjastatud projekti enda võtmega.

</td>
</tr>
</table>

## 🧰 Funktsioonid

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Ülesanded, mis meenutavad

Igapäevane kontrollnimekiri aja ja kordusega (iga päev, nädalapäevad või nädalad). Tippige **`Daily at 9:30am`** ja
meeldetuletus on juba seatud; lisage prioriteediks **`!high`** (või `!alta`, `!média`, `!baixa`) või klõpsake selle tsükli muutmiseks real punkti. Pikad pealkirjad mähivad selle asemel, et neid ära lõigata. **Fokustage taimer** mis tahes ülesandele: andke sellele hinnang, vajutage ▶ ja iga vahelehe alla kinnitatud riba arvestab aega selle vastu (punane, kui üle lähete); iga minut salvestatakse aeg varahoidlasse. **Päeva kokkuvõte** on kleepimiseks valmis (ülesanded, keskendunud aeg, koosolekud koguajaga, PRs/MRs avatud, liidetud, üle vaadatud ja suletud ilma ühendamiseta), **nädala- ja kuuaruanne** allahindluses ja **ootelolevate üksuste eemaldamine** eilsest. **Kiire jäädvustamine** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` macOS-is) salvestab ülesande või märkme mis tahes rakendusest ilma vidinat avamata.

</td>
</tr>
<tr>
<td>

### 📅 Kohtumine algab? See ütleb teile.

Liituge järgmise koosolekuga rakendusega `Ctrl+Alt+M` (`Ctrl+Cmd+M` macOS-is). Kui registreerimine ebaõnnestub, proovib Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` macOS-is); salve menüü jääb kättesaadavaks, kui mõlemad pole saadaval.

Tänased sündmused pärinevad Google kalendrist (kirjutuskaitstud). Minut enne hüppab vidin ekraanile klahviga
**liituge rakendusega Meet**, esitab heli ja saadab süsteemi teatise olenevalt sellest, millisel vahekaardil olete või isegi kui see on peidetud.
Igal kaardil on teie vastusega märk (aktsepteeritud, võib-olla, tagasi lükatud, ootel). Klõpsake sündmusel, et näha, kes korraldas
see, päevakava, iga külaline koos initsiaalidega avatari ja nende vastusega ning manused, nagu Kaksikute märkmed.
Ülemine rida näitab vähemalt 15-minutilist **järgmist tasuta pesa** (keeldud kutsetest ja kogu päeva kestvatest sündmustest
count) ja kattuvad sündmused saavad **konflikt** märgi, mis nimetab teist sündmust. Vaade **Täna** kuvab poolelioleva koosoleku (jäänud aega, liitumisnupp, kokkupõrkehoiatus) või järgmisega, seejärel **päev ühel real** (koosolekud, ülesanded ja vaba aeg töötundide lõikes koos koosolekuaja, vaba aja ja konfliktide loendamisega) ja ühe ajaskaala, kus koosolekud, ülesanded koos ajaga ja vabad lüngad pakuvad juba ridamisi, et sobitada ülesanded, a s.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Märkmed kaartidena

Otsitavad kaardid `#tags`, nööpnõelaga ja ühe klõpsuga sildifiltriga; iga kaart näitab märkme algust **renderdatud** (pealkirjad, kontrollnimekirjad, kood, lingid), mitte töötlemata allahindlust. **WYSIWYG-redaktor** koos kompaktse seadmega
vormindusriba (paks, kaldkiri, kood, pealkiri, loendid, kontrollnimekirjad, mille märgistate otse tekstis, koodiplokid koos süntaksiga
esiletõstmine, lingid, pildid) ja allahindluste otseteed tippimise ajal (`# `, `- `, `[ ] `, ` ``` `); **MD** lüliti
näitab töötlemata allahindlust, mis on ikkagi see, kuidas märkmeid salvestatakse, otsitakse, sünkroonitakse ja eksporditakse. Lingid avanevad
`Ctrl`+klõps, ainult http(id). Kleepige, pukseerige või lisage pilte (PNG, JPEG, GIF, WebP kuni 2 MB), igaüks eraldi suletud
krüptitud fail, mida näidatakse märkme sees ja pisipiltidena kaardil; nad jäävad sellesse masinasse, väljaspool `.canto`
varukoopiad. Käsitseb tuhandeid märkmeid: loend on leheküljeline ja otsing hõlmab neid kõiki.

</td>
</tr>
<tr>
<td>

### 📋 Lõikelaud, mis ei unusta kunagi (või lekib)

Krüpteeritud ajalugu otsingu ja PIN-koodiga; tunneb ära lingid, värvid ja koodi. Hõljutage kursorit üksuse **ümberkirjutatuna kopeerimiseks**:
JSON-vormingus või kompaktne, tekst ühel real, SUURTÄHED või väiketähed (ajaloo kirje jääb samaks). Hiiglaslik koopia (100 MB logi) seda ei tee
külmutada kõik: see hoiab algust ja hoiatab teid. Windowsis jätab see vahele kõik, mis paroolihaldurid märgivad
tundlik.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Teie GitHub lühidalt

**Minult taotleti ülevaatust**, määratud mulle, PRs ja minu avatud probleemid, PR või probleemiikooniga ja kes avas
seda. Mustandid, PRs **ootavad teie arvustust** ja PRs **seiskunud** nädalaks paistavad silma ning igal PR on väike
**CI-märk** (läbitud, ebaõnnestunud, töötab või puudub CI) oma peamiste kontrollide kaudu. Kui keegi **soovib teie
ülevaade**, teatab OS-i märguanne (vaikimisi sees, lülitage see seadetes välja). Filtreerige teksti järgi, ainult `repo:` või `label:`, PRs või ainult probleemide järgi, sortige värskenduse, loomise või kommentaaride järgi ja
kerige nupuga **näita rohkem**. Lülituge vaatele **Kommentaarid**, et näha **Kommenteerijate kataloogi** võrgustikku kõigist, kes kommenteerisid teie PRs (avatarid, inimeste ja robotite märgid, kommentaaride arv, otsing, robotite filter, järkjärguline lehekülgede järjekord) ja nende kommentaare. Toetab ka **GitLab.com ja isehostitavat GitLab** 5-minutilise vahemäluga
austab intressipiirangut. Logige sisse kirjutuskaitstud isikliku loaga või brauserist (seadme voog).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam vidinast lahkumata

Neli alamvahekaarti Steam jaoks: **sooviloendi pakkumised** (kõigepealt suurim allahindlus, millest igaühel on kokkuhoid), **enimmüüdud**
järjestatud, **mängige kohe** (iga mäng Steam kajastab viimase kahe nädala jooksul) ja **reitingu järgi järjestatud kataloog**, lehel
**laadige rohkem**, et see jõuaks ülejäänud poodi. Igal real on **kapsli kujundus**, **ülevaate skoor**
Steam enda sõnastusega ja arvustuste arvuga, läbikriipsutatud hinnaga, reaalides oleva hinnaga ja
allahindlussäästu — ja loend liidab kogu säästu. Avalikud loendid vajavad ainult teie **SteamID64**; valikuline
**Steam Veebiklahv API** lisab hiljutised mängud koos nende mänguaegadega. Vaikimisi algab vahekaart ühe märkeruudu kaugusel
jaotises Seaded.

</td>
</tr>
<tr>
<td>

### ⚙️ Seaded ja automaatsed värskendused

Põhiparooli muutmine, Windows Hello, `.canto` varukoopia, automaatse liitmisega sünkroonitud kaust (Dropbox,
OneDrive, sünkroonimine...), alustage süsteemist ja jaotisest **Uuendused**, **installitud versioonist** ja
**viimati avaldatud** kõrvuti ja nupp värskendamiseks ja taaskäivitamiseks.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Seal on ka 🎙️ **Koosolekud**, päevakorra alamvahekaart loendi ja päeva kõrval: Kaksikute märkmed ja ärakirjad alates
viimased kaks nädalat, lisaks `.vtt`, `.srt`, `.txt` ja `.md` ärakirjad kohalikust kaustast, puhastatud ja otsitavad.

🤖 **AI mudelid** (vaikimisi vahekaardiribal, **ei API võtit ega kontot**): LLM-id järjestatakse
[Artificial Analysis](https://artificialanalysis.ai) **Intelligentsusindeks**, loe selle avalikult edetabeli lehelt,
koos tulemusriba, looja, 1 miljoni märgi hinna ja kiirusega, sorteeritav intelligentsuse, hinna või kiiruse järgi. See saabub kell
kõige sagedamini iga 3 tunni järel ja luba 🔔 annab teile teada, kui a
mudel **saab 10 parima hulka** või **ronib selle sees** (kontrollitakse iga 6 tunni järel, kui varahoidla on lukustamata),
"uued" ja "üles" märgid nädalaks.

🌙 **Mitte segada:** menüüs Seaded või salves vaigistage koosoleku märguanded, ülesannete meeldetuletused, olekuteated ja kõik
süsteemi märguanne 30 min, 1 h, 2 h homseni või kuni selle välja lülitate. Kuu ülemisel ribal näitab
kui see lõpeb; üks klõps lülitab selle uuesti välja. See elab üle taaskäivitamise ja lõpeb iseenesest.

🔔 **Iga märguanne ühel ekraanil:** päises olev kelluke (loendage ja värvige, kui midagi on ootel) avab
hoiatused kogu aknas mis tahes režiimis: üks kaart hoiatuse kohta koos selle toimingutega, **loobu kõik** ja mis oli
lahendatud täna nende all — kui midagi pole pooleli, nii jõuad ikka tänase logini. Dokilt klõps
avab ikkagi selle ühe hoiatuse tavalise akna peal.

⌨️ **Kõik klaviatuuri abil:** `Alt+1`…`Alt+7` vahekaartide vahetamine, `N` loomine, `/` otsimine, `F11` täisekraan, `Alt+L`
lukustab ja `?` loetleb otseteed. `Ctrl+Shift+P` (`Cmd+Shift+P` macOS-is) avab **käsupaleti** iga
toiming nime järgi: minge vahekaardile, uuele ülesandele või märkmele, liituge järgmise koosolekuga, kopeerige päeva kokkuvõte, vahetage nahka, lukustage.

## 🎨 Kuus nahka

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Vaikimisi</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Klaas</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

Ja **Jälgi süsteemi**, mis lülitub koos OS-iga heleda ja tumeda vahel. Kõik läbivad AA kontrasti.

<details>
<summary>🖥️ Rohkem ekraane: liitumine, globaalne otsing, käsupalett, GitLab, alamülesanded, märkmete redaktor, turvalisus, sünkroonimine, tihedus ja palju muud</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Esmakordselt teretulnud | Globaalne otsing (`Ctrl+K`) | Ise hostitud vahekaart GitLab | Koosoleku märguanne |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Ülesanne alamülesannete, prioriteedi ja PR | Märkme redaktor | Rohkem lõikepuhvri tüüpe | Turvalisus: automaatne lukustus ja avamine |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Sünkroonitud kaust | Kompaktne tihedus | Lukustatud varahoidla | Ühendage GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Seadistused rühmades, otsinguga | Otsing filtreerib rühmad | Võrguühenduseta kiip päises | Kinnitage enne lõikepuhvri tühjendamist |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Loobu salvestamata märkme mustand |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Režiimid: mini, peidetud, tavaline, maksimeeritud | Minirežiim: hoiatused ekraani serval |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klõpsake dokis märguandel | Maksimeeritud: kogu avatud vahelehe aken |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Kelluke avab hoiatused kogu aknas |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: režiimimenüü avaneb dokiaknas |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Vahekaardid, mis ei sobi, ootavad menüüs "veel" |
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

| Mängud ja täisekraan: hoiatused ootavad, kuni lahkute |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Edasilükkamine: 1, 5 või 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Ülesande meeldetuletus | Peaparooli muutmine | Olek API (lubamise vahekaart) | Keel: inglise, portugali või hispaania keel |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopeerige ümber kirjutatud klipp | Koosoleku hoiatus koos ettevalmistusega |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Kujunda ümber: vahekaart Ülesanded, enne ja pärast |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Ümberkujundamine: iga vahekaart, enne (ülemine) ja pärast (alumine) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI ebaõnnestus, katkised töökohad | Keegi mainis mind | Nende lülitid menüüs Seaded |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Mainige hoiatus koos selle kirjutajaga |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Mainige hoiatus koos teksti eelvaatega |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Rohkem teateid minu enda töö kohta |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Päeva kokkuvõtte märguanne | Päeva kokkuvõtte seadistus |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mainib alamvahekaarti (GitHub ja GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Parool muudetud, üks fail ootel | Päeva kokkuvõte |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Nädalaaruanne | Päevakava: järgmine vaba aeg ja konfliktid |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Päevakava: praegu tasuta | Käsupalett (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Mitte segada | Pilt märkuses |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI märk igal PR | Vaadake üle taotluse teatised |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Märkige pildid pisipiltidena | WYSIWYG märkmete redaktor |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Märkmete redaktor: töötlemata allahindlus (MD) | Märkme redaktor heledal nahal |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Ülesanded: prioriteedid real, pikad pealkirjad murravad | Märkmete loend renderdatud allahindlusega |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Intelligentsusindeksi järgi järjestatud AI mudelid |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: enimmüüdud, nummerdatud | Steam: viimased viis mängitud mängu mõlema mänguajaga |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: kataloog hinnangute järgi koos "laadimisega rohkem" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Üks märguannete ülekate kõige ootel oleva kohta: katkestused, koosolekud, ülesanded ja uued AI mudelid |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Minu lõpp-punktid: paanid uusima latentsusajaga | Avatud lõpp-punkt: latentsusgraafik, limiit ja hoiatusseaded | DNS + sertifikaadi kontrolli lisamine |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Iga päeva päevakord: eelmine ja järgmine nool, kuupäevavalija ja nupp tagasi tänasesse päeva |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Ülesanded: praegune ülesanne koos taimeriga ja rühmitatud loendiga | GitHub: kokkuvõtteriba loendite kohal | GitLab: sama riba, ilma CI-plaadita |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fookuse taimer on kinnitatud iga vahelehe alla | Päevakava kui päev, ülesanded koosolekute kõrval |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Päevavaade: kattuvad sündmused jagavad laiust kõrvuti |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Ülevaate radar: vanim taotlus kõigepealt, tähtaeg on hilinenud punaselt, edasi lükata |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Koosolekud päevakorra alamvahekaardil Nimekiri ja Päev |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Tegevuse vahekaart (vaikimisi väljas) | Kokkuvõte keskendunud ajaga ja suletud PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Vahekaart Tegevus, viimased 7 päeva | Tegevuse vahekaart, välja lülitatud | Aktiivsuse vahekaart laias aknas |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Vahekaart **Tegevus** on peidetud (lülitage see sisse jaotises Seaded → nähtavad vahelehed). See salvestab ainult selle nime
fokuseeritud rakendus arvuti kasutamise ajal suletud kohalikus failis, mis ei jõua kunagi varukoopiateni ega sünkroonimiseni (Wayland
ei saa fokuseeritud aknast teatada, seega jääb see seal kättesaamatuks). Väljas, kuni lubate, ja esimene ekraan ütleb, mida
hoitakse ja mida kunagi ei hoita.

- **Päev**: sõõrik kategooriate kaupa, mille sees on kogusumma, mille legend peidab kategooriat, muutus päevast
enne ja jõudeaeg (2 minutit ei klaviatuuri ega hiirt). Selle all on igapäevane koodifookuse eesmärk oma jada ja
üks punkt päevas, kolm esiletõstmist (pikim osa ühes rakenduses, rakenduste lülitid, tipptund), ajaskaala, kus
päeval, tühikäik venib ja kõige aktiivsemad rakendused jagavad ühte ajatelge, millel on marker "nüüd" ja rakenduste loend
(puudutage ühte, et muuta selle kategooriat) või ülesannetest, mida fookuse taimer käivitas.
- **Nädal**: virnastatud veerud päevas keskmise joone ja punktiga iga eesmärgi täitnud päeva all, tunni soojuskaart
oma tipuga ja samad nimekirjad terveks nädalaks.
- **Paigutus ja nahad**: vaikeaknas üks veerg, kaks, kui see on lai (maksimeeritud); igal nahal on oma
kategooria värvid, kontrollitud kontrastsust. Päeva kõrval olev menüü kopeerib selle tekstina.

<sub>Kõik ekraanipildid kasutavad fiktiivseid andmeid.</sub>

## ⚖️ Võrreldes sellega, mis seal on

Ükski uuritud tööriist ei hõlma korraga rohkem kui kahte neist rinnetest. Allikad ja üksikasjad sisse
[docs/benchmark.md](docs/benchmark.md).

| | Ülesanded + meeldetuletus | Märkmed | Lõikelaud | Koosolekud | GitHub | Kohalik krüptimine vaikimisi |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidiaan / Joplin | ➖ | ✅ | — | — | — | ➖ ainult sünkroonimine |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Sama | — | — | ✅ | — | — | ➖ valikuline |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ algne · ➖ osaline, laienduse kaudu või valikuline · — puudub · ? avaldamata · n/a ei salvesta kasutajaandmeid</sub>

Mida võrdlusalus siia tõi: **aeg otse ülesande pealkirjas** (Todoist/TickTick), **hoiatuse edasilükkamine**
(TickTick) ja **lõikepuhver, mis austab paroolihaldureid** (CopyQ/Ditto).

## ⬇️ Installige

Laadige oma platvormi installiprogramm alla saidilt **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Süsteem | Fail |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (soovitatav) või `.msi` |
| 🍎 macOS | `.dmg` Apple Siliconile või Intelile |
| 🐧 Linux | `.AppImage`, `.deb` või `.rpm` |

1. Esimesel käivitamisel loote **peaparooli**. Taastamist pole: kaotage parool, kaotage andmed.
2. `Ctrl+Alt+Space` (macOS-is `Cmd+Shift+Space`) näitab ja peidab vidina.
3. Valmis. Uue versiooni tarnimisel Canto teavitab teid ja **Seaded → Värskendused** värskendab ühe klõpsuga.

> [!MÄRKUS]
> Installerid pole veel koodiga allkirjastatud: SmartScreen (Windows) ja Gatekeeper (macOS) hoiatavad esimesel käivitamisel.
> Automaatsed värskendused kontrollitakse enne käivitamist projekti enda allkirja alusel.

Valmis manifestid wingeti ja Homebrew jaoks (pluss Flatpaki skelett, praegu blokeeritud) elavad
[`packaging/`](packaging/README.md) – kohapeal koostatud ja kinnitatud, kuid neile pole veel avaldatud
hoidlad: avaldamine on hooldaja käsitsi tehtud otsus ja tegevus.

## 🔒 Turvalisus lühidalt

| Kiht | Kaitse |
|---|---|
| Vault | Argon2id (19 MiB, t=2) → AES-256-GCM, värske nonce igal kirjutamisel, aatomi kirjutamine `fsync` |
| Võti | Ainult RAM, lukustatud nulliga; konfigureeritav automaatne lukustus (5–60 min tühikäigul, vaikimisi 15 min) |
| Võrk | ainult protsess Rust räägib võrguga; veebivaatel puudub kauglähtekoht (CSP) ja see ei näe kunagi märke |
| Google | valikuline, ainult `calendar.events.readonly`, `directory.readonly` (Külaliste loendis on tööruumi kolleegide fotod) pluss profiil, OAuth koos PKCE ja loopbackiga |
| GitHub | valikuline krüptitud žetoon; üksused avanevad ainult siis, kui link on `https://github.com/` |
| GitLab | valikuline krüptitud aadress ja tunnus; Ainult `https://`, ümbersuunamisi pole, lingid ainult konfigureeritud eksemplarilt |
| Värskendused | installib ainult projekti võtmega allkirjastatud paketi; rikutud allalaadimine visatakse enne | käivitamist kõrvale

Täielik mudel, varundamine, masinate ühendamine ja iga faili asukoht: [docs/seguranca.md](docs/seguranca.md).
Leidsid vea? [SECURITY.md](SECURITY.md).

## 📚 Dokumentatsioon

| Dokument | Mis selles on |
|---|---|
| 📖 [User guide](docs/uso.md) | vahelehed, korduvad ülesanded, otseteed, nahad, juurdepääsetavus, aken, värskendused ja alustage süsteemiga |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google päevakord ja GitHub (isiklik luba või seadme voog) |
| 🛡️ [Security and data](docs/seguranca.md) | ohumudel, `.canto` varundamine, ühendamine, parooli muutmine, failid kettal |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify ja helitugevuse testid |
| 📝 [CHANGELOG](CHANGELOG.md) | mis igas versioonis muutus |
| 🤝 [How to contribute](CONTRIBUTING.md) | keskkond, testid, PRs ja väljalase avaldamine |
| 🤖 [Agent guide](AGENTS.md) | lepingud ja lõksud kõigile, kes redigeerivad koodi AI-ga |

## 🛠️ Areng

Eeltingimused: [Bun](https://bun.sh) ≥ 1,2, stabiilne Rust ≥ 1,85 ja
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) teie süsteemi jaoks.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Veebivaated luuakse pärast oleku Rust olekut ja salv initsialiseeritakse, nii et käivitus-IPC-kutsed ei saa häälestusega rassida.

Igas PR töötab Windowsis, macOS-is ja Linuxis CI. Tavalised `fix`, `feat` ja rikkuvad kohustused liideti `main`
hankige paralleelselt ehitatud SemVer silt, genereeritud väljalaskemärkmed ja allkirjastatud installiprogrammid; väljaanne avaldatakse pärast kinnitamist (üksikasjad
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Litsents

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Tehtud: 🦀 Rust, ⚛️ React ja ☕ neile, kes elavad koosolekute vahepeal.</sub></div>
