<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · **Kiswahili** · [Català](README.ca.md)</sub>

</div>

<br>

> **Majukumu yenye vikumbusho, madokezo, historia ya ubao wa kunakili, ajenda yenye arifa za mkutano, nakala na GitHub PRs yako
> katika kidirisha kidogo kilichobandikwa kwenye kona ya skrini.** Inatokea na `Ctrl+Alt+Space`, hujificha wakati huhitaji
> na huweka kila kitu kwa njia fiche kwenye mashine yako, bila akaunti na seva.

## 🌐 Lugha

Canto inatoa **lugha 42 za kiolesura**, kila moja ikiwa na README yake. Chagua yako katika **Mipangilio → Lugha**;
kiteuzi kinachotafutwa hutumia majina ya lugha asilia, na hali ya kiotomatiki hufuata lugha yako msingi ya mfumo.
Kiarabu, Kiebrania na Kiajemi hutumia maandishi kutoka kulia kwenda kushoto. Katalogi za lugha za ziada hupakia inapohitajika.

Katalogi mpya 40 za kiolesura na tafsiri 31 mpya za README ni tafsiri za mashine na hazijafanywa
kukaguliwa na wazungumzaji asilia. Kireno na Kiingereza zinasalia kuwa katalogi za kiolesura asili. Maandiko ya tray na
vichwa vya arifa hufuata lugha iliyochaguliwa; baadhi ya maelezo ya arifa ya muunganisho yanarudi kwa Kiingereza,
na makosa ya nyuma yanasalia kwa Kireno. Sintaksia ya kichwa cha kazi huweka maneno msingi ya Kireno na Kiingereza yaliyopo.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Kwa nini Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ikiwa unaishi kati ya mikutano, PRs na vipengee vidogo vinavyosubiri, utaishia na programu tano zimefunguliwa. Canto inaweka yote ndani
sehemu moja.

🔒 **Imesimbwa kwa chaguo-msingi.** Argon2id + AES-256-GCM yenye nenosiri kuu; ufunguo huwapo tu kwenye RAM.
Windows Hello hiari.

🏠 **Data yako itasalia nawe.** Telemetry sifuri, seva sifuri, hakuna akaunti inayohitajika. Hifadhi rudufu ni moja iliyosimbwa
`.canto` faili.

⏰ **Hutaikosa.** Dakika 1 kabla ya mkutano na wakati wa ukumbusho, wijeti hujitokeza, hucheza sauti na
hutuma arifa, na **ahirisha kwa dakika 10**.

🪶 **Nyepesi.** Tauri v2 (Rust + mwonekano wa tovuti wa mfumo) badala ya Electron: kisakinishi cha MB 3.5.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Imesasishwa kila wakati.** Masasisho kutoka ndani ya programu na husakinisha tu kile kilichotiwa saini na ufunguo wa mradi wenyewe.

</td>
</tr>
</table>

## 🧰 Vipengele

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Kazi zinazokukumbusha

Orodha ya ukaguzi ya kila siku yenye wakati na marudio (kila siku, siku za wiki au kila wiki). Andika **`Daily at 9:30am`** na
reminder is already set; add **`!high`** (or `!alta`, `!média`, `!baixa`) for the priority, or click the dot on the row to cycle it. Long titles wrap instead of being cut off. **Focus timer** on any task: give it an estimate, press ▶ and a bar pinned under every tab counts the time against it (red once you go over); the time is saved to the vault every minute. **Day summary** ready to paste (tasks, focused time, meetings with total time, PRs/MRs opened, merged, reviewed and closed without merging), a **weekly and monthly report** in markdown, and **pull over pending items** from yesterday. **Quick capture** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` on macOS) jots a task or a note from any app, without opening the widget.

</td>
</tr>
<tr>
<td>

### 📅 Mkutano unaanza? Inakuambia.

Jiunge na mkutano unaofuata na `Ctrl+Alt+M` (`Ctrl+Cmd+M` kwenye macOS). Usajili ukishindwa, Canto hujaribu
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` kwenye macOS); menyu ya trei inabaki inapatikana ikiwa zote mbili hazipatikani.

Matukio ya leo yanatoka Google Kalenda (kusoma-tu). Dakika moja kabla, wijeti inaruka kwenye skrini na
**jiunge na Meet**, hucheza sauti na kutuma arifa ya mfumo, kwa kichupo kipi umewasha au hata ikiwa imefichwa.
Kila kadi inaonyesha beji na jibu lako (imekubaliwa, labda, imekataliwa, inasubiri). Bofya tukio ili kuona ni nani aliyepanga
hiyo, ajenda, kila mgeni aliye na avatar ya mwanzo na jibu lake, na viambatisho, kama maelezo ya Gemini.
Mstari wa juu unakuambia **nafasi inayofuata ya bila malipo** inayofuata ya angalau dakika 15 (mialiko iliyokataliwa na matukio ya siku nzima hayafanyiki.
count), na matukio yanayopishana hupata beji ya **migogoro** inayotaja tukio lingine. Mwonekano wa **Leo** unaongoza mkutano ukiendelea (muda uliosalia, kitufe cha kujiunga, onyo la mgongano) au unaofuata, kisha **siku katika mstari mmoja** (mikutano, majukumu na muda wa bure katika saa za kazi, wakati wa mkutano, muda wa bure na mizozo ikihesabiwa) na rekodi moja ya matukio ambapo mikutano, majukumu yaliyo na muda na mapengo yasiyolipishwa ni safu mlalo zenyewe: pengo ambalo tayari limetolewa ili kutosheleza jambo ambalo halijaisha.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Vidokezo kama kadi

Kadi zinazoweza kutafutwa zilizo na `#tags`, bandika juu na kichujio cha lebo cha mbofyo mmoja; kila kadi inaonyesha mwanzo wa noti **iliyotolewa** (majina, orodha hakiki, msimbo, viungo), si alama ghafi. Kihariri **WYSIWYG** chenye kompakt
upau wa umbizo (kwa herufi nzito, italiki, msimbo, kichwa, orodha, orodha za ukaguzi unazoweka sawa katika maandishi, vizuizi vya msimbo kwa sintaksia
kuangazia, viungo, picha) na njia za mkato za kuashiria unapoandika (`# `, `- `, `[ ] `, ` ``` `); *MD** kugeuza
inaonyesha alama ghafi, ambayo bado ni jinsi madokezo yanavyohifadhiwa, kutafutwa, kusawazishwa na kusafirishwa. Viungo hufunguliwa na
`Ctrl`+bofya, http(za) pekee. Bandika, dondosha au ambatisha picha (PNG, JPEG, GIF, WebP hadi MB 2), kila moja ikiwa imefungwa kivyake.
faili iliyosimbwa, iliyoonyeshwa ndani ya dokezo na kama vijipicha kwenye kadi; wanakaa kwenye mashine hii, nje ya `.canto`
chelezo. Hushughulikia maelfu ya noti: orodha imepangwa na utafutaji unashughulikia zote.

</td>
</tr>
<tr>
<td>

### 📋 Ubao wa kunakili ambao hausahau kamwe (au kuvuja)

Historia iliyosimbwa kwa utaftaji na pini; inatambua viungo, rangi na msimbo. Elea kipengee ili **kunakili iliyoandikwa upya**:
JSON imeumbizwa au kuunganishwa, maandishi kwenye mstari mmoja, UPPERCASE au herufi ndogo (ingizo la historia lisalia jinsi lilivyokuwa). Nakala kubwa (logi ya MB 100) haifanyi hivyo
kufungia chochote: inaweka mwanzo na inakuonya. Kwenye Windows, inaruka alama yoyote ya wasimamizi wa nenosiri kama
nyeti.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub yako kwa mtazamo tu

**Maoni yaliyoombwa kutoka kwangu**, niliyokabidhiwa, PRs na masuala niliyofungua, kwa PR aikoni ya toleo na nani alifungua
hiyo. Rasimu, PRs **inasubiri ukaguzi wako** na PRs **zilizokwama** kwa wiki moja zitatoweka, na kila PR hubeba ndogo
**beji ya CI** (iliyopitishwa, imeshindwa, inaendesha au hakuna CI) kutoka kwa ukaguzi wa ahadi yake kuu. Wakati mtu ** anaomba yako
hakiki**, arifa ya Mfumo wa Uendeshaji inakuambia (washa kwa chaguo-msingi, izime kwenye Mipangilio). Chuja kwa maandishi, `repo:` au `label:`, PRs pekee au matoleo pekee, panga kwa sasisho, uundaji au maoni, na
scroll with **show more**. Switch to the **Comments** view to see a **Commenters catalog** grid of everyone who commented on your PRs (avatars, human vs bot badges, comment counts, search, bot filter, progressive pagination) and their comments. Also supports **GitLab.com and self-hosted GitLab**, with a 5-minute cache that
inaheshimu kikomo cha viwango. Ingia kwa kutumia tokeni ya kibinafsi ya kusoma tu au kutoka kwa kivinjari (mtiririko wa kifaa).

</td>
</tr>
<tr>
<td>

### ⚙️ Mipangilio na masasisho ya kiotomatiki

Kubadilisha nenosiri kuu, Windows Hello, `.canto` chelezo, folda iliyosawazishwa na unganisho otomatiki (Dropbox,
OneDrive, Syncthing...), anza na mfumo na sehemu ya **Sasisho**, na **toleo lililosakinishwa** na
**iliyochapishwa hivi punde** kando kando na kitufe cha kusasisha na kuwasha upya.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Pia ina 🎙️ **Mikutano**, kichupo kidogo cha Ajenda karibu na Orodha na Siku: Madokezo na nakala za Gemini kutoka.
wiki mbili zilizopita, pamoja na `.vtt`, `.srt`, `.txt` na `.md` nakala kutoka kwa folda ya ndani, iliyosafishwa na kutafutwa.

🤖 **Miundo ya AI** (kwenye upau wa kichupo kwa chaguomsingi, **hakuna API ufunguo au akaunti**): LLM zimeorodheshwa kwa
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, iliyosomwa kutoka kwa ukurasa wake wa ubao wa wanaoongoza wa umma,
kwa upau wa alama, mtayarishi, bei kwa kila tokeni na kasi ya 1M, inaweza kupangwa kwa akili, bei au kasi. Inachukua saa
mara nyingi zaidi kila baada ya saa 3, na chaguo la kuingia 🔔 hukuarifu wakati a
modeli ** inaingia 10 za juu** au **inapanda ndani yake** (inaangaliwa kila baada ya saa 6 wakati kuba imefunguliwa), na
beji "mpya" na "juu" kwa wiki.

🌙 **Usisumbue:** katika Mipangilio au trei, nyamaza arifa za mkutano, vikumbusho vya kazi, arifa za hali na kila
arifa ya mfumo kwa dakika 30, 1 h, 2 h, hadi kesho au hadi uizima. Mwezi kwenye upau wa juu unaonyesha
inapoisha; mbofyo mmoja huizima. Inasalia kuanza upya na kuishia yenyewe.

⌨️ **Kila kitu kwa kibodi:** `Alt+1`…`Alt+7` badilisha vichupo, `N` huunda, `/` utafutaji, `F11` skrini nzima, `Alt+L`
kufuli na `?` kuorodhesha njia za mkato. `Ctrl+Shift+P` (`Cmd+Shift+P` kwenye macOS) hufungua **paleti ya amri** na kila
kitendo kwa jina: nenda kwenye kichupo, kazi mpya au dokezo, jiunge na mkutano unaofuata, nakili muhtasari wa siku, badilisha ngozi, funga.

## 🎨 Six skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Chaguomsingi</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Nuru</b></td>
</tr>
</table>

Na **Fuata mfumo**, ambao hubadilisha kati ya mwanga na giza pamoja na OS. Wote hupita tofauti ya AA.

<details>
<summary>🖥️ Skrini zaidi: kuabiri, utafutaji wa kimataifa, ubao wa amri, GitLab, kazi ndogo, kihariri dokezo, usalama, usawazishaji, msongamano na zaidi</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Karibu kwa mara ya kwanza | Utafutaji wa kimataifa (`Ctrl+K`) | Mwenyeji GitLab kichupo | Tahadhari ya mkutano |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Jukumu lenye majukumu madogo, kipaumbele na PR | Kihariri cha dokezo | Aina zaidi za ubao wa kunakili | Usalama: kufunga kiotomatiki na kufungua |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Folda iliyosawazishwa | Uzito wa kompakt | Jumba lililofungwa | Unganisha GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Settings in groups, with search | Search filters the groups | Offline chip in the header | Confirm before clearing the clipboard |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Discard an unsaved note draft |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Njia: Ndogo, Siri, Kawaida, Iliyokuzwa | Hali ndogo: arifa kwenye ukingo wa skrini |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Bofya tahadhari kwenye gati | Imeongezwa: kazi na arifa, na kigawanyaji kinachoweza kukokotwa |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| Mini: menyu ya modi inafungua ndani ya dirisha la kizimbani |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Vichupo ambavyo havifai subiri kwenye menyu ya "zaidi" |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Michezo na skrini nzima: arifa subiri hadi uondoke |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Ahirisha: 1, 5 au 10 dakika |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Task reminder | Change master password | Status API (opt-in tab) | Language: English, Portuguese or Spanish |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Nakili klipu iliyoandikwa upya | Tahadhari ya mkutano na maandalizi |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Panga upya: kichupo cha Majukumu, kabla na baada ya |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Sanifu upya: kila kichupo, kabla (juu) na baada (chini) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI imeshindwa, na kazi zilizovunjika | Mtu alinitaja | Swichi zao katika Mipangilio |
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

| Nenosiri limebadilishwa, faili moja inasubiri | Muhtasari wa siku |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Ripoti ya kila wiki | Agenda: wakati ujao wa bure na migogoro |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: bure sasa hivi | Ubao wa amri (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Usisumbue | Picha katika dokezo |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Beji ya CI kwenye kila PR | Kagua arifa za ombi |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Kumbuka picha kama vijipicha | Mhariri wa noti wa WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Kumbuka mhariri: ghafi markdown (MD) | Kumbuka mhariri kwenye ngozi nyepesi |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Majukumu: kipaumbele kwenye safu mlalo, mada ndefu hufunika | Orodha ya madokezo yenye alama chini |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Miundo ya AI iliyoorodheshwa kwa Kielezo cha Ujasusi |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Uwekeleaji mmoja wa tahadhari kwa kila kitu kinachosubiri: kukatika, mikutano, kazi na miundo mipya ya AI |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Vidokezo vyangu: vigae vilivyo na latency ya hivi punde | Mwisho ulio wazi: chati ya kusubiri, kikomo na mipangilio ya arifa | Inaongeza DNS + ukaguzi wa cheti |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Ajenda ya siku yoyote: mishale iliyotangulia na inayofuata, kiteua tarehe na kitufe cha kurudi hadi leo |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Kazi: kazi ya sasa na kipima muda na orodha iliyopangwa | GitHub: kipande cha muhtasari juu ya orodha | GitLab: kipande kimoja, bila kigae cha CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Kipima muda kimebandikwa chini ya kila kichupo | Ajenda kama siku, kazi kando ya mikutano |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Mwonekano wa siku: matukio yanayopishana hushiriki upana ubavu |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Kagua rada: ombi la zamani zaidi kwanza, limechelewa kwa rangi nyekundu, ahirisha |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Mikutano kama kichupo kidogo cha Ajenda, karibu na Orodha na Siku |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Kichupo cha shughuli (kizimwa kwa chaguomsingi) | Muhtasari wa muda uliowekwa na kufungwa PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Kichupo cha shughuli, siku 7 zilizopita | Kichupo cha shughuli, kimezimwa | Kichupo cha shughuli kwenye dirisha pana |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Kichupo cha **Shughuli** huanza kufichwa (kiwashe chini ya Mipangilio → vichupo vinavyoonekana). Inarekodi tu jina la
programu iliyolenga wakati unatumia kompyuta, katika faili ya ndani iliyotiwa muhuri ambayo haifikii chelezo au usawazishaji (Wayland
haiwezi kuripoti dirisha lililolengwa, kwa hivyo halipatikani hapo). Zima hadi ujijumuishe, na skrini ya kwanza itasema nini
huhifadhiwa na kile ambacho hakijawahi.

- **Siku**: donut kwa kategoria na jumla ya ndani, ambayo hadithi yake huficha kategoria, mabadiliko dhidi ya siku
kabla na wakati wa kutofanya kazi (hakuna kibodi au panya kwa dakika 2). Chini yake, lengo la kila siku la kuzingatia kanuni na mfululizo wake na
nukta moja kwa siku, mambo matatu muhimu (muda mrefu zaidi katika programu moja, swichi za programu, saa ya kilele), kalenda ya matukio ambapo nzima
siku, muda usio na kitu na programu zenye shughuli nyingi zaidi hushiriki mhimili wa wakati mmoja na alama ya "sasa", na orodha ya programu.
(gusa moja ili kubadilisha aina yake) au kati ya kazi ambazo kipima muda kilitekeleza.
- **Wiki**: safu wima zilizopangwa kwa siku zenye mstari wa wastani na nukta chini ya kila siku ambayo ilitimiza lengo, ramani ya saa ya joto
na kilele chako, na orodha sawa kwa wiki nzima.
- **Mpangilio na ngozi**: safu wima moja kwenye kidirisha chaguo-msingi, mbili mara tu ikiwa pana (iliyokuzwa zaidi); kila ngozi ina yake
rangi za kategoria, zimeangaliwa ili kutofautisha. Menyu iliyo karibu na siku inakili kama maandishi.

<sub>Picha zote za skrini hutumia data ya uwongo.</sub>

## ⚖️ Ikilinganishwa na kile kilichopo

Hakuna zana yoyote iliyofanyiwa utafiti inayofunika zaidi ya nyanja hizi mbili kwa wakati mmoja. Vyanzo na maelezo ndani
[docs/benchmark.md](docs/benchmark.md).

| | Majukumu + ukumbusho | Vidokezo | Ubao wa kunakili | Mikutano | GitHub | Usimbaji fiche wa ndani kwa chaguomsingi |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | - | - | - | - |
| Obsidian / Joplin | ➖ | ✅ | - | - | - | ➖ kusawazisha pekee |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | - | - | ✅ | - | - | ➖ hiari |
| MkutanoBar | - | - | - | ✅ | - | n/a |
| Gitify | - | - | - | - | ✅ | n/a |

<sub>✅ asili · ➖ kiasi, kupitia kiendelezi au hiari · — hakuna · ? haijachapishwa · n/a haihifadhi data ya mtumiaji</sub>

Kile ambacho kielelezo kilileta hapa: **wakati sawa katika kichwa cha kazi** (Todoist/TickTick), **ahirisha arifa**
(TikaTika) na **ubao klipu unaoheshimu wasimamizi wa nenosiri** (CopyQ/Ditto).

## ⬇️ Sakinisha

Pakua kisakinishi cha jukwaa lako kutoka **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Mfumo | Faili |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (inapendekezwa) au `.msi` |
| 🍎 macOS | `.dmg` kwa Apple Silicon au Intel |
| 🐧 Linux | `.AppImage`, `.deb` au `.rpm` |

1. Unapokimbia kwanza unaunda **nenosiri kuu**. Hakuna urejeshaji: poteza nenosiri, poteza data.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` kwenye macOS) inaonyesha na kuficha wijeti.
3. Imefanywa. Toleo jipya linaposafirishwa, Canto hukuarifu, na **Mipangilio → Masasisho** husasisha kwa mbofyo mmoja.

> [!KUMBUKA]
> Visakinishi bado havijatiwa saini na msimbo: SmartScreen (Windows) na Gatekeeper (macOS) wanaonya kwenye uzinduzi wa kwanza.
> Masasisho ya kiotomatiki yanathibitishwa dhidi ya sahihi ya mradi kabla ya kutekelezwa.

Maonyesho yaliyo tayari ya Winget na Homebrew (pamoja na mifupa ya Flatpak, iliyozuiwa kwa sasa) moja kwa moja
[`packaging/`](packaging/README.md) - imetayarishwa na kuthibitishwa ndani ya nchi, lakini bado haijachapishwa kwa hizo
hazina: uchapishaji ni uamuzi wa mwongozo na hatua ya mtunzaji.

## 🔒 Usalama kwa muhtasari

| Tabaka | Ulinzi |
|---|---|
| Vault | Argon2id (19 MiB, t=2) → AES-256-GCM, nonce mpya kwa kila maandishi, andika atomiki kwa `fsync` |
| Ufunguo | RAM pekee, sifuri kwenye kufuli; kufuli kiotomatiki inayoweza kusanidiwa (dakika 5 hadi 60 bila kufanya kitu, dakika 15 kwa chaguo-msingi) |
| Mtandao | mchakato wa Rust pekee ndio huzungumza na mtandao; mwonekano wa wavuti hauna asili ya mbali (CSP) na hauoni ishara kamwe |
| Google | kwa hiari, `calendar.events.readonly` pekee, `directory.readonly` (picha za wafanyakazi wenzako katika orodha ya wageni) pamoja na wasifu, OAuth na PKCE na loopback |
| GitHub | hiari, ishara iliyosimbwa; bidhaa hufunguliwa tu ikiwa kiungo ni `https://github.com/` |
| GitLab | hiari, anwani iliyosimbwa na ishara; `https://` pekee, hakuna uelekezaji kwingine, viungo kutoka kwa mfano uliosanidiwa pekee |
| Taarifa | inasakinisha tu kifurushi kilichotiwa saini na ufunguo wa mradi; upakuaji ulioharibiwa hutupwa kabla ya kuendeshwa |

Muundo kamili, hifadhi rudufu, unganisha kwenye mashine na mahali ambapo kila faili huishi: [docs/seguranca.md](docs/seguranca.md).
Umepata dosari? [SECURITY.md](SECURITY.md).

## 📚 Nyaraka

| Hati | Kuna nini ndani yake |
|---|---|
| 📖 [User guide](docs/uso.md) | vichupo, kazi zinazojirudia, njia za mkato, ngozi, ufikiaji, dirisha, masasisho na anza na mfumo |
| 🔌 [Integrations](docs/integracoes.md) | Google ajenda na GitHub (tokeni ya kibinafsi au mtiririko wa kifaa) |
| 🛡️ [Security and data](docs/seguranca.md) | mfano tishio, `.canto` chelezo, unganisha, mabadiliko ya nenosiri, faili kwenye diski |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify na majaribio ya kiasi |
| 📝 [CHANGELOG](CHANGELOG.md) | nini kilibadilika katika kila toleo |
| 🤝 [How to contribute](CONTRIBUTING.md) | mazingira, majaribio, PRs na jinsi ya kuchapisha toleo |
| 🤖 [Agent guide](AGENTS.md) | mikataba na mitego kwa mtu yeyote anayehariri msimbo kwa kutumia AI |

## 🛠️ Maendeleo

Masharti: [Bun](https://bun.sh) ≥ 1.2, Rust thabiti ≥ 1.85 na
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) kwa mfumo wako.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Kila PR huendesha CI kwenye Windows, macOS na Linux. Ahadi za kawaida `fix`, `feat` na kuvunja zimeunganishwa kuwa `main`
pata lebo ya SemVer, madokezo ya kutolewa yaliyotolewa na visakinishi vilivyotiwa saini vilivyojengwa sambamba; toleo linachapishwa baada ya uthibitishaji (maelezo katika
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Leseni

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Imetengenezwa kwa 🦀 Rust, ⚛️ React na ☕ kwa wale wanaoishi kati ya mikutano.</sub></div>
