<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · **Lietuvių** · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Užduotys su priminimais, pastabomis, iškarpinės istorija, darbotvarke su įspėjimais apie susitikimą, stenogramomis ir jūsų GitHub PRs
> mažame lange, prisegtame prie ekrano kampo.** Pasirodo su `Ctrl+Alt+Space`, pasislepia, kai nereikia
> jį ir išlaiko viską užšifruotą jūsų kompiuteryje, be paskyros ir jokio serverio.

## 🌐 Kalbos

Canto siūlo **42 sąsajos kalbas**, kurių kiekviena turi savo README. Pasirinkite savo skiltyje **Nustatymai → Kalba**;
Paieškos rinkiklis naudoja gimtosios kalbos pavadinimus, o automatinis režimas atitinka jūsų pagrindinę sistemos kalbą.
Arabų, hebrajų ir persų kalbomis vartojamas tekstas iš dešinės į kairę. Papildomi kalbų katalogai įkeliami pagal poreikį.

40 naujų sąsajų katalogų ir 31 naujas README vertimas yra mašininiai vertimai ir dar nebuvo
peržiūrėjo gimtakalbiai. Portugalų ir anglų kalbos išlieka originaliais sąsajų katalogais. Padėklų etiketės ir
pranešimų antraštės seka pasirinkta kalba; kai kurios integracijos įspėjimų detalės grįžta į anglų kalbą,
ir backend klaidos lieka portugalų kalba. Užduoties pavadinimo sintaksėje išlaikomi esami portugalų ir anglų kalbos raktiniai žodžiai.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Kodėl Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Jei gyvenate tarp susitikimų, PRs ir nedidelių laukiančių elementų, atidarysite penkias programas. Canto pateikia viską
viena vieta.

🔒 **Šifruota pagal numatytuosius nustatymus.** Argon2id + AES-256-GCM su pagrindiniu slaptažodžiu; raktas visada egzistuoja tik RAM.
Windows Hello neprivaloma.

🏠 **Jūsų duomenys lieka su jumis.** Nulinė telemetrija, nulis serverio, nereikia paskyros. Atsarginė kopija yra viena užšifruota
`.canto` failą.

⏰ **Nepraleisite.** Likus 1 minutei iki susitikimo ir priminimo metu, valdiklis iššoka, paleidžia garsą ir
siunčia pranešimą su **snausti 10 min**.

🪶 **Light.** Tauri v2 (Rust + sistemos žiniatinklio rodinys) vietoj Electron: 3,5 MB diegimo programa.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Visada atnaujinama.** Atnaujinama iš programos ir įdiegiama tik tai, kas pasirašyta paties projekto raktu.

</td>
</tr>
</table>

## 🧰 ypatybės

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Užduotys, kurios jums primena

Kasdieninis kontrolinis sąrašas su laiku ir pasikartojimu (kasdien, darbo dienomis arba kas savaitę). Įveskite **`Daily at 9:30am`** ir
priminimas jau nustatytas; pridėkite **`!high`** (arba `!alta`, `!média`, `!baixa`) kaip prioritetą arba spustelėkite tašką eilutėje, kad ją pakeistumėte. Ilgi pavadinimai apvyniojami, o ne nukirpti. **Sufokusuokite laikmatį** atliekant bet kokią užduotį: pateikite įvertinimą, paspauskite ▶ ir po kiekvienu skirtuku prisegta juosta skaičiuos laiką (raudona, kai peržengsite); kas minutę laikas išsaugomas saugykloje. **Dienos suvestinė** paruošta įklijuoti (užduotys, skirtas laikas, susitikimai su visu laiku, PRs/MRs atidarytas, sujungtas, peržiūrėtas ir uždarytas nesujungus), **savaitės ir mėnesio ataskaita** sumažinta ir **atsitraukti laukiančius elementus** nuo vakar. **Greitas fiksavimas** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` sistemoje „MacOS“) įrašo užduotį arba pastabą iš bet kurios programos neatidarius valdiklio.

</td>
</tr>
<tr>
<td>

### 📅 Susitikimas prasideda? Tai tau sako.

Prisijunkite prie kito susitikimo naudodami `Ctrl+Alt+M` (`Ctrl+Cmd+M` sistemoje „macOS“). Jei registracija nepavyksta, Canto bando
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` „MacOS“); dėklo meniu lieka pasiekiamas, jei abu nepasiekiami.

Šios dienos įvykiai pateikiami iš Google Kalendoriaus (tik skaitoma). Prieš minutę valdiklis peršoka į ekraną su
**prisijunkite prie Meet**, paleidžia garsą ir siunčia sistemos pranešimą, neatsižvelgiant į tai, kuriame skirtuke esate arba net jei jis paslėptas.
Kiekvienoje kortelėje rodomas ženklelis su jūsų atsakymu (priimta, galbūt, atmesta, laukiama). Spustelėkite įvykį, kad pamatytumėte, kas jį organizavo
tai, dienotvarkė, kiekvienas svečias su inicialais avataras ir jų atsakymas bei priedai, kaip Dvynių užrašai.
Viršutinėje eilutėje nurodomas **kitas nemokamas laikas** mažiausiai 15 minučių (atmesti kvietimai ir visos dienos renginiai
skaičius), o įvykiai, kurie sutampa, gauna **konflikto** ženklelį, įvardijantį kitą įvykį. Rodinyje **Šiandien** rodomas vykstantis susitikimas (liko laikas, prisijungimo mygtukas, įspėjimas apie susidūrimą) arba kitas, tada **diena vienoje eilutėje** (susitikimai, užduotys ir laisvas laikas darbo valandomis, skaičiuojant susitikimo laiką, laisvą laiką ir konfliktus) ir viena laiko juosta, kurioje susitikimai, užduotys su laiku ir laisvos spragos jau siūlo savo užduočių eilutes.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Užrašai kaip kortelės

Ieškomos kortelės su `#tags`, smeigtuku viršuje ir žymos filtru vienu spustelėjimu; kiekvienoje kortelėje rodoma užrašo pradžia **pateikta** (pavadinimai, kontroliniai sąrašai, kodas, nuorodos), o ne neapdorotas žymėjimas. **WYSIWYG redaktorius** su kompaktiškumu
formatavimo juosta (pusjuodis, kursyvas, kodas, antraštė, sąrašai, kontroliniai sąrašai, kuriuos pažymite tiesiai tekste, kodų blokai su sintaksė
paryškinimas, nuorodos, vaizdai) ir žymėjimo spartieji klavišai vedant tekstą (`# `, `- `, `[ ] `, ` ``` `); **MD** jungiklis
rodo neapdorotą žymėjimą, kuris vis dar yra kaip užrašai saugomi, ieškomi, sinchronizuojami ir eksportuojami. Nuorodos atidaromos su
`Ctrl`+paspaudimas, tik http (-iai). Įklijuokite, numeskite arba pridėkite vaizdus (PNG, JPEG, GIF, WebP iki 2 MB), kiekvienas uždarytas atskirai
užšifruotas failas, rodomas užrašo viduje ir kaip miniatiūros kortelėje; jie lieka šiame įrenginyje, už `.canto`
atsargines kopijas. Tvarko tūkstančius užrašų: sąrašas yra puslapiuose, o paieška apima juos visus.

</td>
</tr>
<tr>
<td>

### 📋 Iškarpinė, kuri niekada nepamiršta (arba nenuteka)

Šifruota istorija su paieška ir PIN kodu; atpažįsta nuorodas, spalvas ir kodą. Užveskite žymeklį ant elemento, kad **nukopijuotumėte jį perrašytą**:
JSON formatuotas arba kompaktiškas, tekstas vienoje eilutėje, DIDŽIOSIOS arba mažosios raidės (istorijos įrašas lieka toks, koks buvo). Milžiniška kopija (100 MB žurnalas) ne
užšaldyti bet ką: išlaiko pradžią ir įspėja. Sistemoje „Windows“ jis praleidžia bet kokius slaptažodžių tvarkykles kaip pažymėtus
jautrus.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Jūsų GitHub žvilgsnis

**Manęs paprašytas peržiūrėti**, priskirtas man, PRs ir mano atidarytos problemos su PR arba problemos piktograma ir kas atidarė
tai. Juodraščiai, PRs **laukiu jūsų peržiūros** ir PRs **užstojo** savaitei, išsiskiria ir kiekvienas PR turi mažą
**CI ženklelis** (išlaikytas, neišlaikytas, veikia arba nėra CI) iš pagrindinio atlikto patikrinimo. Kai kas nors ** prašo jūsų
peržiūra**, apie tai praneš OS pranešimas (įjungta pagal numatytuosius nustatymus, išjunkite jį nustatymuose). Filtruokite pagal tekstą, tik `repo:` arba `label:`, PRs arba tik problemas, rūšiuokite pagal naujinimą, kūrimą ar komentarus ir
slinkite naudodami **rodyti daugiau**. Perjunkite į **Komentarų** rodinį, kad pamatytumėte **Komentatorių katalogo** tinklelį su visų, kurie pakomentavo jūsų PRs (avatarai, žmogaus ir roboto ženkleliai, komentarų skaičius, paieška, robotų filtras, laipsniškas puslapių rūšiavimas) ir jų komentarus. Taip pat palaiko **GitLab.com ir savarankiškai priglobtą GitLab** su 5 minučių talpykla, kuri
laikosi normos ribos. Prisijunkite naudodami tik skaitomą asmeninį prieigos raktą arba naudodami naršyklę (įrenginio srautas).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam neišeinant iš valdiklio

Keturi Steam antriniai skirtukai: **pageidavimų sąrašo pasiūlymai** (pirmiausia didžiausia nuolaida, su kiekvienu sutaupoma), **perkamiausi**
reitinguojamas, **žaisk dabar** (paskutines dvi savaites praneša apie kiekvieną žaidimą Steam) ir **katalogas, išdėstytas pagal įvertinimą**, puslapiuose
su **įkelkite daugiau**, kad pasiektų likusią parduotuvės dalį. Kiekvienoje eilutėje yra **kapsulės paveikslėlis**, **apžvalgos balas**
su paties Steam formuluote ir kiek atsiliepimų ji skaičiuojama, perbraukta kaina, kaina realais ir kokia
sutaupo nuolaida – ir sąraše pridedama visa sutaupyta suma. Viešiesiems sąrašams reikia tik jūsų **SteamID64**; neprivalomas
**Steam Žiniatinklio API klavišas** prideda naujausius žaidimus su jų žaidimo laiku. Skirtukas paleidžiamas pagal numatytuosius nustatymus, už vieno žymės langelio
nustatymuose.

</td>
</tr>
<tr>
<td>

### ⚙️ Nustatymai ir automatiniai atnaujinimai

Pagrindinis slaptažodžio keitimas, Windows Hello, `.canto` atsarginė kopija, sinchronizuotas aplankas su automatiniu sujungimu (Dropbox,
OneDrive, sinchronizavimas...), pradėkite nuo sistemos ir skyriaus **Atnaujinimai**, **įdiegta versija** ir
**naujausias paskelbtas** vienas šalia kito ir mygtukas atnaujinti ir paleisti iš naujo.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Taip pat yra 🎙️ **Susitikimai**, darbotvarkės antrinis skirtukas šalia Sąrašas ir diena: Dvynių užrašai ir nuorašai iš
paskutines dvi savaites, taip pat `.vtt`, `.srt`, `.txt` ir `.md` nuorašus iš vietinio aplanko, išvalyti ir galima ieškoti.

🤖 **AI modeliai** (pagal numatytuosius nustatymus skirtukų juostoje, **nėra API rakto ar paskyros**): LLM reitinguojami pagal
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, skaitomas iš jo viešo pirmaujančiųjų sąrašo puslapio,
su taškų juosta, kūrėju, kaina už 1 mln. žetonų ir greičiu, rūšiuojama pagal intelektą, kainą arba greitį. Jis atsineša
dažniausiai kartą per 3 valandas, o pasirinkimo funkcija 🔔 praneša, kai a
modelis **patenka į 10 geriausių** arba **lipa į jį** (tikrinama kas 6 valandas, kol saugykla atrakinta), su
ženkleliai „nauji“ ir „aukštyn“ savaitei.

🌙 **Netrukdyti:** nustatymuose arba dėkle nutildykite susitikimo įspėjimus, užduočių priminimus, būsenos įspėjimus ir kiekvieną
sistemos pranešimas 30 min., 1 val., 2 val., iki rytojaus arba kol jį išjungsite. Viršutinėje juostoje rodomas mėnulis
kai jis baigiasi; vienu paspaudimu jis vėl išjungiamas. Jis išgyvena iš naujo ir baigiasi savaime.

🔔 **Kiekvienas įspėjimas viename ekrane:** varpelis antraštėje (skaičiuokite ir nuspalvinkite, kai laukiama) atidaro
įspėjimai visame lange bet kuriuo režimu: viena kortelė kiekvienam įspėjimui su jo veiksmais, **atmesti visus** ir kas buvo
išspręsta šiandien pagal juos – nieko nelaukiant, taip vis dar pasieksite šiandienos žurnalą. Iš doko spustelėjimas
vis tiek atidaro tą vienintelį įspėjimą įprasto lango viršuje.

⌨️ **Viskas naudojant klaviatūrą:** `Alt+1`…`Alt+7` perjunkite skirtukus, `N` kuria, `/` ieško, `F11` viso ekrano, `Alt+L`
užrakina ir `?` pateikia sparčiųjų klavišų sąrašą. `Ctrl+Shift+P` (`Cmd+Shift+P` sistemoje „MacOS“) atidaro **komandų paletę** su kiekviena
veiksmas pagal pavadinimą: eikite į skirtuką, naują užduotį ar pastabą, prisijunkite prie kito susitikimo, nukopijuokite dienos suvestinę, pakeiskite apvalkalą, užrakinkite.

## 🎨 Šeši skinai

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Numatytasis</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Stiklas</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

Ir **Sekite sistemą**, kuri kartu su OS persijungia iš šviesios ir tamsios. Visi praeina AA kontrastą.

<details>
<summary>🖥️ Daugiau ekranų: įjungimas, visuotinė paieška, komandų paletė, GitLab, papildomos užduotys, pastabų rengyklė, sauga, sinchronizavimas, tankis ir daugiau</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Sveiki atvykę į pirmą kartą | Pasaulinė paieška (`Ctrl+K`) | Savarankiškai priglobtas skirtukas GitLab | Susitikimo įspėjimas |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Užduotis su papildomomis užduotimis, prioritetu ir PR | Pastabų redaktorius | Daugiau iškarpinės tipų | Apsauga: automatinis užrakinimas ir atrakinimas |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Sinchronizuotas aplankas | Kompaktiškas tankis | Užrakintas skliautas | Prijunkite GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Nustatymai grupėse, su paieška | Paieška filtruoja grupes | Lustas neprisijungus antraštėje | Patvirtinkite prieš išvalydami iškarpinę |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Išmeskite neišsaugotą užrašo juodraštį |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Režimai: Mini, Paslėptas, Normalus, Maksimalus | Mini režimas: įspėjimai ekrano krašte |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Spustelėkite įspėjimą doke | Maksimalus: visas atidaryto skirtuko langas |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Varpelis atidaro įspėjimus visame lange |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: režimo meniu atsidaro doko lange |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Skirtukai, kurie netelpa, laukia meniu „daugiau“ |
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

| Žaidimai ir visas ekranas: įspėjimai palaukite, kol išeisite |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Snausti: 1, 5 arba 10 min. |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Užduočių priminimas | Keisti pagrindinį slaptažodį | Būsena API (pasirinkimo skirtukas) | Kalba: anglų, portugalų arba ispanų |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Nukopijuokite perrašytą klipą | Įspėjimas apie susitikimą su pasiruošimu |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Pertvarkymas: skirtukas Užduotys, prieš ir po |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Pertvarkymas: kiekvienas skirtukas, prieš (viršuje) ir po (apačioje) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI nepavyko, su nutrauktais darbais | Kažkas paminėjo mane | Jų jungikliai nustatymuose |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Paminėkite įspėjimą, kas jį parašė |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Paminėkite įspėjimą su teksto peržiūra |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Daugiau įspėjimų apie mano darbą |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Dienos suvestinės įspėjimas | Dienos suvestinės nustatymas |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Pamini antrinį skirtuką (GitHub ir GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Slaptažodis pakeistas, vienas failas laukia | Dienos santrauka |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Savaitės ataskaita | Dienotvarkė: kitas laisvas laikas ir konfliktai |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Dienotvarkė: šiuo metu nemokama | Komandų paletė (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Netrukdyti | Vaizdas pastaboje |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI ženklelis kiekvieną PR | Peržiūrėti užklausų pranešimus |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Pastaba vaizdus kaip miniatiūras | WYSIWYG užrašų rengyklė |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Pastabų redaktorius: neapdorotas žymėjimas (MD) | Pastabų redaktorius šviesiai odai |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Užduotys: pirmenybė eilutėje, ilgų pavadinimų įvyniojimas | Pastabų sąrašas su pateiktu žymėjimu |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI modeliai reitinguojami pagal intelekto indeksą |
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

| Viena įspėjimo perdanga apie viską, kas laukiama: gedimai, susitikimai, užduotys ir nauji AI modeliai |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Mano galutiniai taškai: plytelės su naujausia delsa | Atviras galutinis taškas: delsos diagrama, apribojimai ir įspėjimų nustatymai | DNS + sertifikato patikrinimo pridėjimas |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Bet kurios dienos dienotvarkė: ankstesnė ir kita rodyklės, datos rinkiklis ir mygtukas Grįžti į šiandieną |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Užduotys: dabartinė užduotis su laikmačiu ir sugrupuotu sąrašu | GitHub: suvestinės juostelė virš sąrašų | GitLab: ta pati juosta, be CI plytelės |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Fokusavimo laikmatis prisegtas po kiekvienu skirtuku | Darbotvarkė kaip diena, užduotys šalia posėdžių |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dienos vaizdas: persidengiantys įvykiai dalijasi pločiu greta |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Peržiūrėti radarą: pirmiausia seniausia užklausa, vėluojama raudonai, snausti |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Susirinkimai kaip darbotvarkės antrinis skirtukas, šalia Sąrašas ir Diena |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Veiklos skirtukas (pagal numatytuosius nustatymus išjungtas) | Santrauka su sutelktu laiku ir uždaryta PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Veiklos skirtukas, pastarosios 7 dienos | Veiklos skirtukas, išjungtas | Veiklos skirtukas plačiame lange |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Skirtukas **Veikla** pradedamas paslėpti (įjunkite jį skiltyje Nustatymai → matomi skirtukai). Jis įrašo tik pavadinimą
sufokusuota programa, kai naudojate kompiuterį, uždarame vietiniame faile, kuris niekada nepasiekia atsarginių kopijų arba sinchronizuoja (Wayland
negali pranešti apie paryškintą langą, todėl jis ten nepasiekiamas). Išjungta, kol pasirinksite, ir pirmame ekrane bus parodyta, kas
yra saugomas ir kas niekada nėra.

- **Diena**: spurga pagal kategoriją su visa viduje, kurios legenda slepia kategoriją, pokytį nuo dienos
prieš ir neveikimo laiką (2 minutes be klaviatūros ar pelės). Po juo – kasdienis į kodą orientuotas tikslas su jo eiga ir
vienas taškas per dieną, trys akcentai (ilgiausias vienos programos ruožas, programų jungikliai, piko valanda), laiko juosta, kurioje visa
dieną, tuščioji eiga užsitęsia, o aktyviausios programos dalijasi viena laiko ašimi su žymekliu „dabar“ ir programų sąrašu
(palieskite vieną, kad pakeistumėte jo kategoriją) arba užduočių, kurias paleido fokusavimo laikmatis.
- **Savaitė**: sukrauti stulpeliai per dieną su vidutine linija ir tašku po kiekviena dieną, kuri pasiekė tikslą, valandos šilumos žemėlapis
su savo piko, ir tie patys sąrašai visai savaitei.
- **Išdėstymas ir apvalkalai**: vienas stulpelis numatytame lange, du, kai jis yra platus (padidintas); kiekviena oda turi savo
kategorijos spalvos, patikrintas kontrastas. Šalia dienos esantis meniu nukopijuoja jį kaip tekstą.

<sub>Visose ekrano kopijose naudojami fiktyvūs duomenys.</sub>

## ⚖️ Palyginti su tuo, kas ten yra

Nė vienas iš tirtų įrankių neapima daugiau nei dviejų iš šių frontų vienu metu. Šaltiniai ir detalės
[docs/benchmark.md](docs/benchmark.md).

| | Užduotys + priminimas | Pastabos | Iškarpinė | Susitikimai | GitHub | Vietinis šifravimas pagal numatytuosius nustatymus |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidianas / Joplin | ➖ | ✅ | — | — | — | ➖ sinchronizuoti tik |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Tas pats | — | — | ✅ | — | — | ➖ neprivaloma |
| Susitikimų juosta | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ gimtoji · ➖ dalinė, per plėtinį arba pasirenkama · — nėra · ? nepaskelbta · n/a nesaugo vartotojo duomenų</sub>

Ką čia atnešė etalonas: ** laikas tiesiai užduoties pavadinime** (Todoist / TickTick), ** įspėjimo snaudimas**
(„TickTick“) ir **iškarpinė, kuri gerbia slaptažodžių tvarkykles** („CopyQ/Ditto“).

## ⬇️ Įdiegti

Atsisiųskite savo platformos diegimo programą iš **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistema | Failas |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (rekomenduojama) arba `.msi` |
| 🍎 macOS | `.dmg` Apple Silicon arba Intel |
| 🐧 Linux | `.AppImage`, `.deb` arba `.rpm` |

1. Pirmą kartą paleidus sukuriate **pagrindinį slaptažodį**. Atkūrimo nėra: pameskite slaptažodį, praraskite duomenis.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` sistemoje „macOS“) rodo ir paslepia valdiklį.
3. Atlikta. Kai pristatoma nauja versija, Canto praneš apie tai, o **Nustatymai → Atnaujinimai** atnaujina vienu paspaudimu.

> [!PASTABA]
> Diegimo programos dar nepasirašytos kodu: „SmartScreen“ („Windows“) ir „Gatekeeper“ („MacOS“) įspėja pirmą kartą paleidžiant.
> Prieš paleidžiant, automatiniai naujinimai tikrinami pagal paties projekto parašą.

Paruošti winget ir Homebrew manifestai (taip pat Flatpak skeletas, šiuo metu užblokuotas) gyvena
[`packaging/`](packaging/README.md) – parengta ir patikrinta vietoje, bet dar nepaskelbta tiems
saugyklos: publikavimas yra prižiūrėtojo rankinis sprendimas ir veiksmas.

## 🔒 Apsauga iš pirmo žvilgsnio

| Sluoksnis | Apsauga |
|---|---|
| Skliautas | Argon2id (19 MiB, t = 2) → AES-256-GCM, naujas įrašas kiekvieno rašymo metu, atominis rašymas su `fsync` |
| Raktas | Tik RAM, užrakintas nulis; konfigūruojamas automatinis užraktas (nuo 5 iki 60 min. tuščiąja eiga, 15 min pagal numatytuosius nustatymus) |
| Tinklas | tik Rust procesas bendrauja su tinklu; žiniatinklio rodinys neturi nuotolinės kilmės (CSP) ir niekada nemato prieigos raktų |
| Google | neprivaloma, tik `calendar.events.readonly`, `directory.readonly` (darbo vietos kolegų nuotraukos svečių sąraše) plius profilis, OAuth su PKCE ir atgalinis ryšys |
| GitHub | neprivalomas, šifruotas prieigos raktas; elementai atidaromi tik tada, jei nuoroda yra `https://github.com/` |
| GitLab | neprivalomas, užšifruotas adresas ir prieigos raktas; Tik `https://`, jokių peradresavimų, nuorodos tik iš sukonfigūruoto egzemplioriaus |
| Atnaujinimai | diegia tik paketą, pasirašytą projekto raktu; sugadintas atsisiuntimas atmetamas prieš paleidžiant |

Visas modelis, atsarginė kopija, sujungimas įrenginiuose ir kiekvieno failo buvimo vieta: [docs/seguranca.md](docs/seguranca.md).
Radai trūkumą? [SECURITY.md](SECURITY.md).

## 📚 Dokumentacija

| Dokumentas | Kas jame |
|---|---|
| 📖 [User guide](docs/uso.md) | skirtukai, pasikartojančios užduotys, spartieji klavišai, apvalkalai, pasiekiamumas, langas, naujinimai ir pradžia nuo sistemos |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google darbotvarkė ir GitHub (asmeninis prieigos raktas arba įrenginio srautas) |
| 🛡️ [Security and data](docs/seguranca.md) | grėsmės modelis, `.canto` atsarginė kopija, sujungimas, slaptažodžio keitimas, failai diske |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify ir apimties testai |
| 📝 [CHANGELOG](CHANGELOG.md) | kas pasikeitė kiekvienoje versijoje |
| 🤝 [How to contribute](CONTRIBUTING.md) | aplinka, testai, PRs ir kaip paskelbti leidimą |
| 🤖 [Agent guide](AGENTS.md) | sutartys ir spąstai visiems, redaguojantiems kodą su AI |

## 🛠️ Plėtra

Būtinos sąlygos: [Bun](https://bun.sh) ≥ 1,2, stabilus Rust ≥ 1,85 ir
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) jūsų sistemai.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Žiniatinklio rodiniai sukuriami po Rust būsenos, o dėklas inicijuojamas, todėl paleisties IPC skambučiai negali varžytis.

Kiekviename PR veikia CI „Windows“, „MacOS“ ir „Linux“. Įprasti `fix`, `feat` ir pažeidimai sujungti į `main`
gauti SemVer žymą, sugeneruotas laidos pastabas ir pasirašytas diegimo programas, sukurtas lygiagrečiai; leidimas paskelbiamas po patikrinimo (išsamiau
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licencija

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Sukurta naudojant 🦀 Rust, ⚛️ React ir ☕ tiems, kurie gyvena tarp susitikimų.</sub></div>
