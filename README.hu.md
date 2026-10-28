<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · **Magyar** · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Feladatok emlékeztetőkkel, jegyzetekkel, vágólap előzményekkel, napirend értekezletekkel, átiratokkal és a GitHub PRs
> a képernyő sarkára rögzített kis ablakban.** Megjelenik a `Ctrl+Alt+Space`, és elrejti, ha nincs szüksége
> és mindent titkosítva tart a gépeden, fiók és szerver nélkül.

## 🌐 Nyelvek

A Canto **42 interfésznyelvet** kínál, mindegyik saját README-val. Válassza ki a sajátját a **Beállítások → Nyelv** menüpontban;
a kereshető választó anyanyelvi neveket használ, az automatikus mód pedig az elsődleges rendszernyelvet követi.
Az arab, a héber és a perzsa nyelven jobbról balra haladó szöveget használnak. Igény szerint további nyelvi katalógusok tölthetők be.

A 40 új interfészkatalógus és 31 új README-fordítás gépi fordítás, és nem is az
anyanyelvi beszélők véleményezték. A portugál és az angol továbbra is az eredeti interfészkatalógus. Tálcacímkék és
az értesítési fejlécek a kiválasztott nyelvet követik; egyes integrációs figyelmeztetések részlete angol nyelvű,
és a háttérhibák portugálul maradnak. A feladatcím szintaxisa megtartja a meglévő portugál és angol kulcsszavakat.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Miért Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ha megbeszélések, PRs és kisebb függőben lévő elemek között él, akkor végül öt alkalmazás nyílik meg. A Canto mindent belead
egy hely.

🔒 **Alapértelmezés szerint titkosítva.** Argon2id + AES-256-GCM fő jelszóval; a kulcs mindig csak a RAM-ban létezik.
Windows Hello opcionális.

🏠 **Az adatok nálad maradnak.** Nulla telemetria, nulla szerver, nincs szükség fiókra. A biztonsági mentés egyetlen titkosított
`.canto` fájl.

⏰ **Nem fogsz lemaradni.** 1 perccel a megbeszélés előtt és az emlékeztető idején a widget felugrik, lejátszik egy hangot és
értesítést küld, **szundi 10 perc**.

🪶 **Light.** Tauri v2 (Rust + a rendszer webnézete) a Electron helyett: 3,5 MB-os telepítő.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Mindig naprakész.** Az alkalmazáson belül frissít, és csak azt telepíti, amit a projekt saját kulcsa aláírt.

</td>
</tr>
</table>

## 🧰 Jellemzők

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Feladatok, amelyek emlékeztetnek

Napi ellenőrző lista idővel és ismétlődéssel (minden nap, hétköznap vagy hetente). Írja be a **`Daily at 9:30am`** parancsot, majd a
emlékeztető már be van állítva; adja hozzá a **`!high`** (vagy `!alta`, `!média`, `!baixa`) értéket a prioritásként, vagy kattintson a pontra a sorban a váltáshoz. A hosszú címek ahelyett, hogy levágnák őket, burkolnak. **Fókuszálás az időzítőre** bármilyen feladatra: adja meg a becslést, nyomja meg a ▶ gombot, és a minden fül alatt rögzített sáv számolja az időt (piros, ha áthalad); az időt percenként menti a trezor. **Napi összefoglaló** beillesztésre készen (feladatok, koncentrált idő, értekezletek teljes idővel, PRs/MRs megnyitott, egyesített, áttekintett és összevonás nélkül lezárt), **heti és havi jelentés** leértékelésben, és **a függőben lévő tételek áthúzása** tegnapról. **Gyors rögzítés** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` macOS-en) a widget megnyitása nélkül rögzít egy feladatot vagy jegyzetet bármely alkalmazásból.

</td>
</tr>
<tr>
<td>

### 📅 Kezdődik a találkozó? Azt mondja neked.

Csatlakozzon a következő megbeszéléshez a következővel: `Ctrl+Alt+M` (`Ctrl+Cmd+M` macOS-en). Ha a regisztráció sikertelen, a Canto megpróbálja
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` macOS-en); a tálca menü elérhető marad, ha mindkettő nem elérhető.

A mai események a Google Naptárból származnak (csak olvasható). Egy perccel azelőtt a widget a következővel ugrik a képernyőre
**csatlakozik a Meet**-hoz, hangot ad le, és rendszerértesítést küld, függetlenül attól, hogy melyik lapon van, vagy ha rejtve van.
Minden kártyán egy jelvény látható a válaszoddal (elfogadva, esetleg, elutasítva, vár). Kattintson az eseményre, hogy megtudja, ki szervezte
ez, a napirend, minden vendég kezdőbetűs avatarral és válaszukkal, valamint mellékletekkel, például Ikrek jegyzeteivel.
A felső sorban a **következő ingyenes idő** legalább 15 perce látható (az elutasított meghívók és az egész napos események nem
szám), és az egymást átfedő események **konfliktus** jelvényt kapnak a másik esemény megnevezésével. A **Ma** nézet a folyamatban lévő értekezletre (még hátralévő idő, csatlakozási gomb, összecsapásra figyelmeztetés) vagy a következőre vezet, majd **a nap egy sorban** (az értekezletek, feladatok és szabadidő a munkaidőn keresztül, az értekezletek, a szabadidő és a konfliktusok számlálásával) és egy idővonal, ahol az értekezletek, a feladatok egy időponttal és a szabad hézagok már sorakoznak a feladaton, hogy összeillessze a s ga istime.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Jegyzetek kártyaként

Kereshető kártyák `#tags`, rögzítéssel a tetejére és egy kattintásos címkeszűrővel; minden kártya a **megjelenített** jegyzet elejét mutatja (címek, ellenőrző listák, kód, linkek), nem pedig nyers leértékelés. Egy **WYSIWYG szerkesztő** kompakttal
formázási sáv (félkövér, dőlt, kód, címsor, listák, ellenőrző listák, amelyeket közvetlenül a szövegben pipál ki, kódblokkok szintaxissal
kiemelés, linkek, képek) és leíró parancsikonok gépelés közben (`# `, `- `, `[ ] `, ` ``` `); egy **MD** kapcsoló
A nyers leértékelést mutatja, amely továbbra is a jegyzetek tárolásának, keresésének, szinkronizálásának és exportálásának módja. A hivatkozások nyílnak meg
`Ctrl`+kattintás, csak http(ek) Illesszen be, dobjon be vagy csatoljon képeket (PNG, JPEG, GIF, WebP legfeljebb 2 MB-ig), mindegyiket külön zárva
titkosított fájl, amely a jegyzet belsejében és a kártyán miniatűrökként jelenik meg; ezen a gépen maradnak, `.canto` kívül
biztonsági mentések. Több ezer jegyzetet kezel: a lista lapozva van, és a keresés mindegyikre kiterjed.

</td>
</tr>
<tr>
<td>

### 📋 Vágólap, amely soha nem felejt (vagy kiszivárog)

Titkosított előzmények kereséssel és PIN-kóddal; felismeri a hivatkozásokat, a színeket és a kódot. Vigye az egérmutatót egy elemre, hogy **átírva másolja**:
JSON formázott vagy kompakt, szöveg egy sorban, NAGYBETŰ vagy kisbetű (az előzmények bejegyzése a régiben marad). Egy óriási példány (100 MB-os napló) nem
lefagy bármit: megtartja az indítást és figyelmeztet. Windows rendszeren kihagyja a jelszókezelők által megjelölteket
érzékeny.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 A GitHub egy pillantásra

**Felülvizsgálatot kértek tőlem**, hozzám rendelve, PRs és az általam megnyitott problémák, PR vagy probléma ikonnal és ki nyitotta meg
azt. A piszkozatok, a PRs **az értékelésére várva** és a PRs **egy hétig leállt** kiemelkedik, és mindegyik PR tartalmaz egy kis
**CI-jelvény** (megfelelt, megbukott, fut vagy nincs CI) a fő-kötelezettségi ellenőrzésekből. Amikor valaki **kéri Önt
felülvizsgálat**, az operációs rendszer értesítése közli (alapértelmezés szerint be, kapcsolja ki a Beállításokban). Szűrés szöveg szerint, csak `repo:` vagy `label:`, PRs vagy csak problémák, rendezés frissítés, létrehozás vagy megjegyzések szerint, és
görgessen a **show more** gombbal. Váltson a **Megjegyzések** nézetre, hogy megtekinthesse a **Hozzászólók katalógusának** rácsát mindenkiről, aki megjegyzést fűzött a PRs-hoz (avatarok, ember és bot jelvények, megjegyzések számlálása, keresés, botszűrő, progresszív oldalszámozás) és azok megjegyzései. Támogatja a **GitLab.com-ot és a saját üzemeltetésű GitLab** webhelyet is, 5 perces gyorsítótárral
tiszteletben tartja a díjszabást. Jelentkezzen be csak olvasható személyes tokennel vagy a böngészőből (eszközfolyamat).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam a widget elhagyása nélkül

Négy allap a Steam számára: **kívánságlista-ajánlatok** (első a legnagyobb kedvezmény, mindegyik azzal, amit megtakarít), a **legkeresettebb**
rangsorolt, **játssz most** (minden játék Steam jelentése az elmúlt két hétről) és a **katalógus értékelés szerint rendezve**, lapozva
a **tölts be többet**, hogy elérje az üzlet többi részét. Minden sor tartalmazza a **kapszula festményt**, a **áttekintési pontszámot**
Steam saját megfogalmazásával, és hány véleményt számít, az áthúzott árral, reálban kifejezett árral és
kedvezményes megtakarítások — és a lista összeadja a teljes megtakarítást. A nyilvános listákhoz csak a **SteamID64**; egy opcionális
**Steam Web API kulcs** hozzáadja a legutóbbi játékokat a játékidővel együtt. A lap alapértelmezés szerint egy jelölőnégyzettől távolabb indul
a Beállításokban.

</td>
</tr>
<tr>
<td>

### ⚙️ Beállítások és automatikus frissítések

Fő jelszómódosítás, Windows Hello, `.canto` biztonsági mentés, szinkronizált mappa automatikus egyesítéssel (Dropbox,
OneDrive, Syncthing...), kezdje a rendszerrel és a **Frissítések** szakaszsal, a **telepített verzióval** és
a **legutóbbi közzététel** egymás mellett, és egy gomb a frissítéshez és újraindításhoz.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Ezenkívül a 🎙️ **Meetings**, a Napirend allapja a Lista és a nap mellett: Ikrek jegyzetei és átiratai
az elmúlt két hét, valamint `.vtt`, `.srt`, `.txt` és `.md` átiratok egy helyi mappából, megtisztítva és kereshetően.

🤖 **AI modellek** (alapértelmezés szerint a lapsávon, **nincs API kulcs vagy fiók**): LLM-ek rangsorolása
[Artificial Analysis](https://artificialanalysis.ai) **Intelligencia-index**, olvasható a nyilvános ranglista oldalán,
pontozósávval, készítővel, 1 millió tokenenkénti árral és sebességgel, intelligencia, ár vagy sebesség szerint rendezve. Elhozza a
leggyakrabban 3 óránként, és az opt-in 🔔 értesíti Önt, ha a
a modell **bekerül a legjobb 10-be** vagy **felmászik azon** (6 óránként ellenőrzik, amíg a páncélszekrény nincs zárolva),
"új" és "feljebb" jelvények egy hétig.

🌙 **Ne zavarjanak:** a Beállításokban vagy a tálcán, elnémíthatja a megbeszélések figyelmeztetéseit, feladatemlékeztetőit, állapotfigyelmeztetéseit és minden
rendszerértesítés 30 percig, 1 óráig, 2 óráig, holnapig vagy amíg ki nem kapcsolja. A felső sávban egy hold látható
amikor véget ér; egy kattintás visszakapcsolja. Túlél egy újraindítást és magától véget ér.

🔔 **Minden riasztás egy képernyőn:** a fejlécben lévő csengő (számlálás és színezés, ha valami függőben van) megnyitja a
riasztások az egész ablakban, bármilyen módban: riasztásonként egy kártya a műveletekkel, **minden elvetése** és mi volt
ma megoldódott alattuk – nincs függőben semmi, így érheti el a mai naplót. A dokkolóból egy kattintás
továbbra is ezt az egyetlen figyelmeztetést nyitja meg a normál ablak tetején.

⌨️ **Minden a billentyűzet segítségével:** `Alt+1`…`Alt+7` lapváltás, `N` létrehozás, `/` keresés, `F11` teljes képernyő, `Alt+L`
zárolja és a `?` listázza a parancsikonokat. `Ctrl+Shift+P` (`Cmd+Shift+P` macOS-en) megnyit egy **parancspalettát** minden
művelet név szerint: ugrás egy lapra, új feladatra vagy jegyzetre, csatlakozzon a következő értekezlethez, másolja a napi összefoglalót, cserélje ki a felületet, zárolja.

## 🎨 Hat skin

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Alapértelmezett</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Üveg</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

És a **Follow system**, amely az operációs rendszerrel együtt vált a világos és a sötét között. Mindegyik átmegy AA kontraszton.

<details>
<summary>🖥️ További képernyők: beépítés, globális keresés, parancspaletta, GitLab, részfeladatok, jegyzetszerkesztő, biztonság, szinkronizálás, sűrűség és egyebek</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Üdvözöljük az első futásban | Globális keresés (`Ctrl+K`) | Saját üzemeltetésű GitLab lap | Értekezlet riasztás |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across today's tasks, agenda, notes, transcripts and clipboard at once](docs/prints/melhorias/busca-global-fontes.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Context reminder on a task | Search result jumping to a transcript |
|---|---|
| ![Tasks waiting for an app or a Wi-Fi, with the app picker open on a task](docs/prints/melhorias/lembrete-por-contexto.png) | ![A transcript picked in the global search opens the Meetings view with the query filled in](docs/prints/melhorias/busca-global-transcricao.png) |

| Feladat részfeladatokkal, prioritással és PR | Jegyzetszerkesztő | További vágólap-típusok | Biztonság: automatikus zár és feloldás |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Szinkronizált mappa | Kompakt sűrűség | Lezárt páncélszekrény | Csatlakozás GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Beállítások csoportokban, kereséssel | A keresés szűri a csoportokat | Offline chip a fejlécben | Erősítse meg a vágólap törlése előtt |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Nem mentett jegyzetvázlat elvetése |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Üzemmódok: Mini, Rejtett, Normál, Maximális | Mini mód: figyelmeztetések a képernyő szélén |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Kattintson egy figyelmeztetésre a dokkban | Maximális: a megnyitott lap teljes ablaka |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| A csengő megnyitja a figyelmeztetéseket az egész ablakban |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: a mód menü a dokkolóablak belsejében nyílik meg |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| A nem megfelelő lapok a "továbbiak" menüben várnak |
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

| AI models: the full sheet | AI models: Compare | AI models: metric by metric |
|---|---|---|
| ![AI models with one model opened: release, context, weights, input, output and blended price, speed, first token, reasoning, the three indexes with their place and the modalities](docs/prints/app/116-modelos-ficha.png) | ![The Compare sub-tab with three picked models, presets, a summary in sentences and a radar](docs/prints/app/117-modelos-comparar.png) | ![Compare: one bar per metric with the best starred and the full side-by-side table](docs/prints/app/118-modelos-comparar-metricas.png) |

| Játékok és teljes képernyő: a figyelmeztetések várják meg, amíg kilép |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Szundi: 1, 5 vagy 10 perc |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Feladat emlékeztető | Fő jelszó módosítása | Állapot API (feliratkozási lap) | Nyelv: angol, portugál vagy spanyol |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Újraírt klip másolása | Értekezletkészítő |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Újratervezés: a Feladatok lap előtt és után |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Újratervezés: minden lap, előtte (fent) és utána (alul) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| A CI meghiúsult, megszakadt munkákkal | Valaki megemlített | A kapcsolóik a Beállítások |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Említse meg a figyelmeztetést azzal, hogy ki írta |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Figyelmeztetés említése a szöveg előnézetével |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| További figyelmeztetések a saját munkámmal kapcsolatban |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Napi összefoglaló riasztás | Napi összefoglaló beállítás |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Megemlíti az allapot (GitHub és GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Jelszó megváltozott, egy fájl függőben van | Napi összefoglaló |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Heti jelentés | Napirend: következő szabadidő és konfliktusok |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Napirend: most ingyenes | Parancspaletta (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Ne zavarjanak | Kép a jegyzetben |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI-jelvény minden PR | Kérelemértesítések áttekintése |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Megjegyzés képek miniatűrökként | WYSIWYG jegyzetszerkesztő |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Jegyzetszerkesztő: nyers leértékelés (MD) | Jegyzetszerkesztő a világos bőrön |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Feladatok: prioritás a sorban, hosszú címek tördelése | Jegyzetlista renderelt leértékeléssel |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Az Intelligence Index szerint rangsorolt ​​mesterséges intelligencia modellek |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: the changelog of your games' updates | Steam: the wishlist with sales of 75% or more highlighted |
|---|---|
| ![Steam tab, updates sub-tab: fictitious patch notes with game art, unread dots, how long ago, one expanded with its list of changes and a link to the full notes](docs/prints/app/120-steam-atualizacoes.png) | ![Steam tab, wishlist sub-tab: counters for games on the list, on sale and at 75% or more, sort chips and fictitious games with discount badges, old and new prices and what each saves](docs/prints/app/121-steam-desejos.png) |

| Steam: the most played games right now | Steam: play now as a list and as a grid |
|---|---|
| ![Steam tab, most played sub-tab: total players in the top 100, an only mine toggle and fictitious games ranked with player counts, today's peak, rank movement and a badge on the ones you own](docs/prints/app/122-steam-mais-jogados.png) | ![Steam tab, play now sub-tab in the grid view: fictitious game covers in columns with recent and installed badges](docs/prints/app/98-steam-biblioteca.png) |

| Steam: wishlist deals | Steam: the top sellers, numbered |
|---|---|
| ![Steam tab, deals sub-tab: fictitious games with capsule art, review score, discount badges, crossed-out prices and the new price in the chosen currency](docs/prints/app/87-steam.png) | ![Steam tab, trending sub-tab: fictitious games ranked with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) |

| Egyetlen riasztási fedvény minden függőben lévő dologhoz: leállások, értekezletek, feladatok és új AI-modellek |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Saját végpontjaim: csempék a legújabb késleltetéssel | Nyitott végpont: késleltetési diagram, határérték és riasztási beállítások | DNS + tanúsítvány-ellenőrzés hozzáadása |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Minden nap napirendje: előző és következő nyilak, dátumválasztó és vissza a mai naphoz gomb |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Feladatok: az aktuális feladat időzítővel és csoportosított listával | GitHub: összefoglaló sáv a listák felett | GitLab: ugyanaz a szalag, CI csempe nélkül |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fókuszidőzítő minden lap alá rögzítve | Napirend mint nap, feladatok az ülések mellett |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Napi nézet: az átfedő események egymás mellett megosztják a szélességet |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Radar áttekintése: először a legrégebbi kérés, pirossal lejárt, szundi |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Az értekezletek a Napirend allapjaként, a Lista és a Nap |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Tevékenység lap (alapértelmezés szerint ki) | Összegzés fókuszált idővel és zárt PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Tevékenység lap, elmúlt 7 nap | Tevékenység lap, kikapcsolva | Tevékenység lap széles ablakon |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

A **Tevékenység** lap rejtett állapotban kezdődik (kapcsolja be a Beállítások → látható lapok menüpontban). Csak a nevét rögzíti
fókuszált alkalmazás a számítógép használata közben, egy lezárt helyi fájlban, amely soha nem éri el a biztonsági mentéseket vagy a szinkronizálást (Wayland
nem tudja jelenteni a fókuszált ablakot, így ott nem elérhető). Kikapcsolva, amíg nem jelentkezik, és az első képernyőn megjelenik, hogy mit
megtartják, és amit soha.

- **Nap**: kategóriánkénti fánk, benne az összesített számmal, amelynek legendája egy kategóriát rejt, a változás a naphoz képest
előtt és az üresjárati idő (2 percig nincs billentyűzet vagy egér). Alatta napi kód-fókusz cél a sorozatával és
napi egy pont, három kiemelés (leghosszabb szakasz egy alkalmazásban, alkalmazásváltások, csúcsidő), egy idővonal, ahol az egész
nap, az üresjárat megnyúlik, és a legforgalmasabb alkalmazások egy időtengelyen osztoznak a "most" jelölővel és az alkalmazások listájával
(koppintson az egyikre a kategória módosításához), vagy azon feladatok közül, amelyeken a fókuszidőzítő fut.
- **Hét**: halmozott oszlopok naponta az átlagos vonallal és egy ponttal minden nap alatt, amely elérte a célt, óra hőtérkép
a csúcsoddal, és ugyanazokkal a listákkal egész hétre.
- **Elrendezés és felületek**: egy oszlop az alapértelmezett ablakban, kettő, ha széles (maximális); minden bőrnek megvan a maga
kategóriájú színek, kontraszt ellenőrzése. A nap melletti menü szövegként másolja.

<sub>Minden képernyőkép fiktív adatokat használ.</sub>

## ⚖️ Ahhoz képest, ami ott van

A vizsgált eszközök egyike sem fed le egyszerre kettőnél több frontot. Források és részletek itt
[docs/benchmark.md](docs/benchmark.md).

| | Feladatok + emlékeztető | Megjegyzések | Vágólap | Találkozók | GitHub | Alapértelmezés szerint helyi titkosítás |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obszidián / Joplin | ➖ | ✅ | — | — | — | ➖ csak szinkronizálás |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ugyanígy | — | — | ✅ | — | — | ➖ opcionális |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ natív · ➖ részleges, kiterjesztéssel vagy opcionális · — nincs · ? közzé nem tett · n/a nem tárol felhasználói adatokat</sub>

Amit a benchmark hozott ide: **időpont a feladat címében** (Todoist/TickTick), **riasztás elhalasztása**
(TickTick) és **vágólap, amely tiszteletben tartja a jelszókezelőket** (CopyQ/Ditto).

## ⬇️ Telepítés

Töltse le a platform telepítőjét a **[Releases](https://github.com/juninmd/canto-widget/releases)** webhelyről:

| Rendszer | Fájl |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (ajánlott) vagy `.msi` |
| 🍎 macOS | `.dmg` Apple Silicon vagy Intel |
| 🐧 Linux | `.AppImage`, `.deb` vagy `.rpm` |

1. Első futtatáskor létrehozza a **fő jelszót**. Nincs helyreállítás: elveszíti a jelszót, elveszíti az adatokat.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` macOS-en) megjeleníti és elrejti a widgetet.
3. Kész. Amikor egy új verzió érkezik, a Canto értesíti Önt, és a **Beállítások → Frissítések** egy kattintással frissít.

> [!MEGJEGYZÉS]
> A telepítők még nincsenek kóddal aláírva: a SmartScreen (Windows) és a Gatekeeper (macOS) figyelmeztet az első indításkor.
> Az automatikus frissítések ellenőrzése a projekt saját aláírása alapján történik futás előtt.

A winget és a Homebrew kész manifesztjei (plusz egy csontváz a Flatpakhoz, jelenleg blokkolva) élnek
[`packaging/`](packaging/README.md) — helyileg elkészítve és ellenőrzött, de még nem publikálva
adattárak: a közzététel a fenntartó kézi döntése és tevékenysége.

## 🔒 Biztonság egy pillantással

| Réteg | Védelem |
|---|---|
| Vault | Argon2id (19 MiB, t=2) → AES-256-GCM, minden írásnál friss nonce, atomi írás `fsync` |
| Kulcs | Csak RAM, zároláskor nullázva; konfigurálható automatikus zárolás (5–60 perc üresjárat, alapértelmezés szerint 15 perc) |
| Hálózat | csak a Rust folyamat beszél a hálózattal; a webnézetnek nincs távoli eredete (CSP), és soha nem lát tokeneket |
| Google | opcionális, csak `calendar.events.readonly`, `directory.readonly` (Munkaterületi kollégák fényképei a vendéglistában) plusz profil, OAuth PKCE és loopback |
| GitHub | opcionális, titkosított token; az elemek csak akkor nyílnak meg, ha a hivatkozás `https://github.com/` |
| GitLab | opcionális, titkosított cím és token; Csak `https://`, nincs átirányítás, csak hivatkozások a beállított példányból |
| Frissítések | csak a projekt kulcsával aláírt csomagot telepíti; a manipulált letöltést a rendszer a futtatás előtt elveti |

Teljes modell, biztonsági mentés, gépek egyesítése és az egyes fájlok helye: [docs/seguranca.md](docs/seguranca.md).
Hibát talált? [SECURITY.md](SECURITY.md).

## 📚 Dokumentáció

| dokumentum | Mi van benne |
|---|---|
| 📖 [User guide](docs/uso.md) | lapok, ismétlődő feladatok, parancsikonok, felszínek, kisegítő lehetőségek, ablak, frissítések és kezdés a rendszerrel |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google napirend és GitHub (személyes token vagy eszközfolyam) |
| 🛡️ [Security and data](docs/seguranca.md) | fenyegetési modell, `.canto` biztonsági mentés, összevonás, jelszómódosítás, fájlok a lemezen |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify és hangerőtesztek |
| 📝 [CHANGELOG](CHANGELOG.md) | mi változott az egyes verziókban |
| 🤝 [How to contribute](CONTRIBUTING.md) | környezet, tesztek, PRs és a kiadás közzététele |
| 🤖 [Agent guide](AGENTS.md) | szerződések és csapdák mindenki számára, aki AI segítségével szerkeszti a kódot |

## 🛠️ Fejlesztés

Előfeltételek: [Bun](https://bun.sh) ≥ 1.2, stabil Rust ≥ 1.85 és a
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) az Ön rendszeréhez.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

A webnézetek a Rust állapot után jönnek létre, és a tálca inicializálva van, így az indítási IPC-hívások nem versenyezhetnek a beállítással.

Minden PR CI-t futtat Windows, macOS és Linux rendszeren. A hagyományos `fix`, `feat` és a feltörő véglegesítések egyesültek a `main`-ba
kap egy SemVer címkét, generált kiadási megjegyzéseket és párhuzamosan épített aláírt telepítőket; a kiadást ellenőrzés után teszik közzé (részletek itt
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licenc

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Készült: 🦀 Rust, ⚛️ React és ☕ azoknak, akik találkozások között élnek.</sub></div>
