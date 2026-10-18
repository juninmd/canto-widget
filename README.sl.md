<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · **Slovenščina** · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Opravila z opomniki, opombami, zgodovino odložišča, dnevnim redom z opozorili o sestankih, prepisi in vašimi GitHub PRs
> v majhnem oknu, pripetem v kotu zaslona.** Pojavi se z `Ctrl+Alt+Space`, skrije, ko ne potrebujete
> in ohranja vse šifrirano na vašem računalniku, brez računa in strežnika.

## 🌐 Jeziki

Canto ponuja **42 jezikov vmesnika**, od katerih ima vsak svoj README. Izberite svojega v **Nastavitve → Jezik**;
izbirnik, po katerem je mogoče iskati, uporablja imena maternih jezikov, samodejni način pa sledi vašemu primarnemu sistemskemu jeziku.
Arabščina, hebrejščina in perzijščina uporabljajo besedilo od desne proti levi. Dodatni jezikovni katalogi se naložijo na zahtevo.

40 novih katalogov vmesnikov in 31 novih prevodov README so strojni prevodi in niso bili
pregledali naravni govorci. Portugalski in angleški jezik ostajata izvirna kataloga vmesnikov. Etikete na pladnjih in
naslovi obvestil sledijo izbranemu jeziku; nekateri podatki opozorila o integraciji so v angleščini,
in napake v ozadju ostanejo v portugalščini. Sintaksa naslova opravila ohranja obstoječe portugalske in angleške ključne besede.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Zakaj Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Če živite med sestanki, PRs in majhnimi čakajočimi elementi, imate na koncu odprtih pet aplikacij. Canto vsebuje vse
eno mesto.

🔒 **Privzeto šifrirano.** Argon2id + AES-256-GCM z glavnim geslom; ključ obstaja le v RAM-u.
Windows Hello neobvezno.

🏠 **Vaši podatki ostanejo pri vas.** Nič telemetrije, nič strežnika, račun ni potreben. Varnostna kopija je enojno šifrirana
`.canto` datoteka.

⏰ **Ne boste ga zamudili.** 1 minuto pred sestankom in ob času opomnika se pripomoček prikaže, predvaja zvok in
pošlje obvestilo z **dremež 10 min**.

🪶 **Light.** Tauri v2 (Rust + spletni pogled sistema) namesto Electron: 3,5 MB namestitveni program.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Vedno posodobljen.** Posodablja znotraj aplikacije in namesti samo tisto, kar je podpisano z lastnim ključem projekta.

</td>
</tr>
</table>

## 🧰 Lastnosti

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Naloge, ki te spominjajo

Dnevni kontrolni seznam s časom in ponavljanjem (vsak dan, med tednom ali tedensko). Vnesite **`Daily at 9:30am`** in
opomnik je že nastavljen; dodajte **`!high`** (ali `!alta`, `!média`, `!baixa`) za prednost ali kliknite piko v vrstici, da jo krožite. Dolgi naslovi se zavijejo, namesto da bi bili odrezani. **Osredotočite časovnik** na katero koli opravilo: ocenite ga, pritisnite ▶ in vrstica, pripeta pod vsakim zavihkom, odšteje čas glede na to (rdeča, ko greste čez); čas se vsako minuto shrani v trezor. **Povzetek dneva**, pripravljen za lepljenje (opravila, osredotočeni čas, sestanki s skupnim časom, PRs/MRs odprtih, združenih, pregledanih in zaprtih brez združevanja), **tedensko in mesečno poročilo** v oznaki in **povlecite čakajoče elemente** od včeraj. **Hitro zajemanje** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` v sistemu macOS) zapiše nalogo ali opombo iz katere koli aplikacije, ne da bi morali odpreti gradnik.

</td>
</tr>
<tr>
<td>

### 📅 Se srečanje začenja? To vam pove.

Pridružite se naslednjemu sestanku z `Ctrl+Alt+M` (`Ctrl+Cmd+M` v macOS). Če registracija ne uspe, poskusi Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` v macOS); meni pladnja ostane na voljo, če oba nista na voljo.

Današnji dogodki prihajajo iz koledarja Google (samo za branje). Minuto prej gradnik skoči na zaslon z
**pridružite se Meet**, predvaja zvok in pošlje sistemsko obvestilo, ne glede na to, na katerem zavihku ste ali četudi je skrit.
Vsaka kartica prikazuje značko z vašim odgovorom (sprejeto, morda, zavrnjeno, čaka). Kliknite dogodek, da vidite, kdo ga je organiziral
to, dnevni red, vsak gost z začetnicami avatarja in njihovim odgovorom ter priponke, kot so Geminijevi zapiski.
Zgornja vrstica vam pove **naslednji prosti termin** za vsaj 15 minut (zavrnjena povabila in celodnevni dogodki ne
štetje), dogodki, ki se prekrivajo, pa dobijo značko **konflikt**, ki poimenuje drugi dogodek. Pogled **Danes** vodi s sestankom v teku (preostali čas, gumb za pridružitev, opozorilo o sporu) ali naslednjim, nato pa **dan v eni vrstici** (sestanki, opravila in prosti čas med delovnimi urami, s preštetimi časi sestankov, prostim časom in konflikti) in eno časovnico, kjer so sestanki, opravila s časom in proste vrzeli vrstice zase: vrzel ponuja, da se prilega neodmerjenemu opravilu, in kar je že čez, se zloži stran.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Beležke kot kartice

Iskalne kartice z `#tags`, pripenjanje na vrh in filter oznak z enim klikom; vsaka kartica prikazuje začetek **upodobljene** opombe (naslovi, kontrolni seznami, koda, povezave), ne neobdelane oznake. **Urejevalnik WYSIWYG** s kompaktnim
vrstica za oblikovanje (krepko, ležeče, koda, naslov, seznami, kontrolni seznami, ki jih označite neposredno v besedilu, bloki kode s sintakso
označevanje, povezave, slike) in bližnjice za označevanje med tipkanjem (`# `, `- `, `[ ] `, ` ``` `); preklop **MD**
prikazuje neobdelano oznako, kar je še vedno način, kako se zapiski shranjujejo, iščejo, sinhronizirajo in izvažajo. Povezave se odprejo z
`Ctrl`+klik, samo http(s). Prilepite, spustite ali priložite slike (PNG, JPEG, GIF, WebP do 2 MB), vsaka zapečatena v svojem
šifrirana datoteka, prikazana znotraj beležke in kot sličice na kartici; ostanejo na tem stroju, zunaj `.canto`
varnostne kopije. Obdeluje na tisoče zapiskov: seznam je listan in iskanje zajema vse.

</td>
</tr>
<tr>
<td>

### 📋 Odložišče, ki nikoli ne pozabi (ali pušča)

Šifrirana zgodovina z iskanjem in pin-om; prepozna povezave, barve in kodo. Premaknite miškin kazalec na element, da ga **prepišete**:
JSON formatiran ali strnjen, besedilo v eni vrstici, VELIKE ali male ČRKE (vnos v zgodovino ostane tak, kot je bil). Ogromna kopija (100 MB dnevnika) ne
zamrzni karkoli: obdrži začetek in te opozori. V sistemu Windows preskoči vse, kar upravitelji gesel označijo kot
občutljiva.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Vaš GitHub na prvi pogled

**Zahtevan pregled**, dodeljen meni, PRs in težave, ki sem jih odprl, z PR ali ikono težave in kdo je odprl
to. Izstopajo osnutki, PRs **čakajo na vaš pregled** in PRs **zastoj** en teden, vsak PR pa vsebuje majhno
**Značka CI** (opravljeno, neuspešno, v teku ali brez CI) iz preverjanj njegove glavne potrditve. Ko nekdo **zahteva vašo
pregled**, vam sporoči obvestilo OS (privzeto vklopljeno, izklopite v nastavitvah). Filtrirajte po besedilu, `repo:` ali `label:`, samo PRs ali samo težave, razvrstite po posodobitvi, ustvarjanju ali komentarjih in
pomaknite se s **pokaži več**. Preklopite na pogled **Komentarji**, če si želite ogledati mrežo **Kataloga komentatorjev** vseh, ki so komentirali vaš PRs (avatarji, značke med ljudmi in roboti, število komentarjev, iskanje, filter botov, progresivno številčenje strani) in njihove komentarje. Podpira tudi **GitLab.com in GitLab** s 5-minutnim predpomnilnikom, ki
upošteva omejitev stopnje. Prijavite se z osebnim žetonom samo za branje ali iz brskalnika (pretok naprave).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam, ne da bi zapustili pripomoček

Štirje podzavihki za Steam: **ponudbe na seznamu želja** (najprej največji popust, vsak s svojim prihrankom), **najbolje prodajani**
razvrščeno, **igraj zdaj** (vsaka igra Steam poroča za zadnja dva tedna) in **katalog, razvrščen po oceni**, strani
z **naloži več**, da doseže preostalo trgovino. Vsaka vrstica nosi **umetnost kapsule**, **oceno ocene**
z lastnim besedilom Steam in številom ocen šteje, prečrtano ceno, ceno v realih in kaj
popust prihrani — in seznam sešteje skupni prihranek. Javni seznami potrebujejo samo vaš **SteamID64**; neobvezno
**Steam Web API tipka** doda nedavne igre z njihovimi igralnimi časi. Zavihek se privzeto začne, eno potrditveno polje stran
v nastavitvah.

</td>
</tr>
<tr>
<td>

### ⚙️ Nastavitve in samodejne posodobitve

Sprememba glavnega gesla, varnostna kopija Windows Hello, `.canto`, sinhronizirana mapa s samodejnim spajanjem (Dropbox,
OneDrive, Syncthing ...), začnite s sistemom in razdelkom **Posodobitve**, z **nameščeno različico** in
**najnovejše objavljene** enega ob drugem in gumb za posodobitev in ponovni zagon.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Ima tudi 🎙️ **Sestanke**, podzavihek dnevnega reda poleg seznama in dneva: Geminijeve opombe in prepisi iz
zadnja dva tedna ter prepisi `.vtt`, `.srt`, `.txt` in `.md` iz lokalne mape, očiščeni in po njih je mogoče iskati.

🤖 **Modeli AI** (v vrstici z zavihki privzeto, **brez ključa API ali računa**): LLM-ji, razvrščeni po
[Artificial Analysis](https://artificialanalysis.ai) **Inteligenčni indeks**, preberite na njegovi javni strani lestvice najboljših,
z lestvico rezultatov, ustvarjalcem, ceno za 1 milijon žetonov in hitrostjo, razvrstljivo po inteligenci, ceni ali hitrosti. Pridobi pri
večinoma enkrat na 3 ure, privolitev 🔔 pa vas obvesti, ko a
model **vstopi med prvih 10** ali **spleza znotraj nje** (preverjeno vsakih 6 ur, ko je trezor odklenjen), z
značke "novo" in "zgoraj" za en teden.

🌙 **Ne moti:** v nastavitvah ali na pladnju utišajte opozorila o sestankih, opomnike za opravila, opozorila o stanju in vsako
sistemsko obveščanje 30 min, 1 h, 2 h, do jutri ali dokler ga ne izklopite. V zgornji vrstici se prikaže luna
ko se konča; en klik ga ponovno izklopi. Preživi ponovni zagon in se konča sam.

🔔 **Vsako opozorilo na enem zaslonu:** zvonec v glavi (štetje in barva, ko je karkoli na čakanju) odpre
opozorila čez celotno okno v katerem koli načinu: ena kartica na opozorilo z dejanji, **opusti vse** in kaj je bilo
rešeno danes pod njimi — brez ničesar čakajočega, tako še vedno pridete do današnjega dnevnika. Iz doka, klik
še vedno odpre to eno samo opozorilo na vrhu običajnega okna.

⌨️ **Vse s tipkovnico:** `Alt+1`…`Alt+7` preklaplja med zavihki, `N` ustvarja, `/` išče, `F11` celozaslonski način, `Alt+L`
zaklene in `?` navede bližnjice. `Ctrl+Shift+P` (`Cmd+Shift+P` v macOS) odpre **ukazno paleto** z vsakim
dejanje po imenu: pojdi na zavihek, novo opravilo ali beležko, pridruži se naslednjemu sestanku, kopiraj povzetek dneva, zamenjaj preobleko, zakleni.

## 🎨 Šest preoblek

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Privzeto</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Steklo</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

In **Follow system**, ki preklaplja med svetlobo in temo skupaj z OS. Vsi prestanejo AA kontrast.

<details>
<summary>🖥️ Več zaslonov: vkrcanje, globalno iskanje, paleta ukazov, GitLab, podopravila, urejevalnik zapiskov, varnost, sinhronizacija, gostota in več</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Dobrodošli v prvi vožnji | Globalno iskanje (`Ctrl+K`) | Samostojni zavihek GitLab | Opozorilo o srečanju |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Naloga s podnalogami, prioriteto in PR | Urejevalnik opomb | Več vrst odložišča | Varnost: samodejno zaklepanje in odklepanje |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Sinhronizirana mapa | Kompaktna gostota | Zaklenjen trezor | Poveži GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Nastavitve v skupinah, z iskanjem | Iskanje filtrira skupine | Offline čip v glavi | Potrdite pred brisanjem odložišča |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Zavrzi neshranjen osnutek zapiska |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Načini: Mini, Skrito, Normalno, Povečano | Mini način: opozorila na robu zaslona |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Kliknite opozorilo v vrstici | Povečano: celotno okno za odprt zavihek |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Zvonec odpre opozorila čez celotno okno |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: meni načina se odpre znotraj okna priklopne postaje |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Zavihki, ki se ne prilegajo, čakajo v meniju »več« |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Igre in cel zaslon: opozorila počakajo, dokler ne zapustite |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Dremež: 1, 5 ali 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Opomnik za nalogo | Spremeni glavno geslo | Status API (zavihek za prijavo) | Jezik: angleščina, portugalščina ali španščina |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopiraj prepisan posnetek | Opozorilo o sestanku s pripravo |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Prenova: zavihek Opravila, pred in za |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Prenova: vsak zavihek, pred (zgoraj) in za (spodaj) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI ni uspel, z okvarjenimi opravili | Nekdo me je omenil | Njihova stikala v nastavitvah |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Omeni opozorilo s tem, kdo ga je napisal |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Opozorilo o omembi s predogledom besedila |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Več opozoril o mojem delu |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| Opozorilo o dnevnem povzetku | Nastavitev dnevnega povzetka |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Podzavihek Omembe (GitHub in GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Geslo spremenjeno, ena datoteka čaka | Dnevni povzetek |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Tedensko poročilo | Dnevni red: naslednji prosti čas in konflikti |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Dnevni red: brezplačno takoj | Paleta ukazov (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Ne moti | Slika v opombi |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Značka CI na vsakem PR | Pregled obvestil o zahtevah |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Opomba slik kot sličic | WYSIWYG urejevalnik zapiskov |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Urejevalnik opomb: surovo znižanje (MD) | Urejevalnik opomb na svetli koži |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Naloge: prioriteta v vrsti, dolgi naslovi ovijanje | Seznam opomb z upodobljeno oznako |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Modeli umetne inteligence, razvrščeni po indeksu inteligence |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: najbolje prodajani, oštevilčeni | Steam: zadnjih pet odigranih iger, z obema igralnima časoma |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalog po ocenah, z "naloži več" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Eno opozorilo za vse, kar je v teku: izpade, sestanke, naloge in nove modele AI |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Moje končne točke: ploščice z najnovejšo zakasnitvijo | Odprta končna točka: grafikon zakasnitev, nastavitve omejitev in opozoril | Dodajanje DNS + preverjanje potrdila |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Dnevni red za kateri koli dan: puščice za prejšnji in naslednji dan, izbirnik datuma in gumb za vrnitev na današnji dan |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Opravila: trenutno opravilo s časovnikom in razvrščenim seznamom | GitHub: trak s povzetki nad seznami | GitLab: isti trak, brez ploščice CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Časovnik fokusa, pripet pod vsakim zavihkom | Dnevni red kot dan, naloge poleg sestankov |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dnevni pogled: prekrivajoči se dogodki si delijo širino drug poleg drugega |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Pregled radarja: najprej najstarejša zahteva, zamuda v rdeči barvi, dremež |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Sestanki kot podzavihek dnevnega reda, poleg seznama in dneva |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Zavihek dejavnosti (privzeto izklopljen) | Povzetek z izbranim časom in zaprtim PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Zavihek Aktivnost, zadnjih 7 dni | Zavihek dejavnosti, izklopljen | Zavihek dejavnosti v širokem oknu |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Zavihek **Dejavnost** se začne skrit (vklopite ga pod Nastavitve → vidni zavihki). Zapisuje samo ime
osredotočena aplikacija, medtem ko uporabljate računalnik, v zapečateni lokalni datoteki, ki nikoli ne doseže varnostnih kopij ali sinhronizacije (Wayland
ne more prijaviti izbranega okna, zato tam ostane nedosegljivo). Izklopljeno, dokler se ne odločite in na prvem zaslonu piše, kaj
se hrani in kar nikoli ni.

- **Dan**: krof po kategoriji s skupnim zneskom v notranjosti, katerega legenda skriva kategorijo, sprememba glede na dan
pred in čas nedejavnosti (brez tipkovnice ali miške 2 minuti). Pod njim je dnevni cilj s poudarkom na kodi s svojo serijo in
ena pika na dan, trije poudarki (najdaljši odsek v eni aplikaciji, preklopi med aplikacijami, največja ura), časovna premica, na kateri je celotna
dan, mirovanje se razteza in najbolj obremenjene aplikacije si delijo eno časovno os z oznako "zdaj" in seznamom aplikacij
(dotaknite se enega, da spremenite njegovo kategorijo) ali opravil, pri katerih se je izvajal časovnik fokusa.
- **Teden**: zloženi stolpci na dan s črto povprečja in piko pod vsakim dnem, ki je dosegel cilj, urni toplotni zemljevid
z vašim vrhom in isti seznami za ves teden.
- **Postavitev in preobleke**: en stolpec v privzetem oknu, dva, ko je široko (maksimirano); vsaka koža ima svojega
barve kategorije, preverjen kontrast. Meni zraven dneva ga kopira kot besedilo.

<sub>Vsi posnetki zaslona uporabljajo izmišljene podatke.</sub>

## ⚖️ V primerjavi s tem, kar je tam zunaj

Nobeno od raziskanih orodij ne pokriva več kot dveh od teh front hkrati. Viri in podrobnosti v
[docs/benchmark.md](docs/benchmark.md).

| | Naloge + opomnik | Opombe | Odložišče | Srečanja | GitHub | Privzeto lokalno šifriranje |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ samo sinhronizacija |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Enako | — | — | ✅ | — | — | ➖ neobvezno |
| MeetingBar | — | — | — | ✅ | — | ni na voljo |
| Gitify | — | — | — | — | ✅ | ni na voljo |

<sub>✅ izvorno · ➖ delno, prek razširitve ali izbirno · — brez · ? neobjavljeno · n/a ne shranjuje uporabniških podatkov</sub>

Kaj je merilo uspešnosti prineslo tukaj: **čas prav v naslovu opravila** (Todoist/TickTick), **dremež opozorila**
(TickTick) in **odložišče, ki upošteva upravitelje gesel** (CopyQ/Ditto).

## ⬇️ Namestite

Prenesite namestitveni program za svojo platformo iz **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistem | Datoteka |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (priporočeno) ali `.msi` |
| 🍎 macOS | `.dmg` za Apple Silicon ali Intel |
| 🐧 Linux | `.AppImage`, `.deb` ali `.rpm` |

1. Ob prvem zagonu ustvarite **glavno geslo**. Ni obnovitve: izgubite geslo, izgubite podatke.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` v macOS) prikaže in skrije gradnik.
3. Končano. Ko je poslana nova različica, vas Canto obvesti in **Nastavitve → Posodobitve** se posodobi z enim klikom.

> [!OPOMBA]
> Namestitveni programi še niso podpisani s kodo: SmartScreen (Windows) in Gatekeeper (macOS) opozorita ob prvem zagonu.
> Samodejne posodobitve se pred zagonom preverijo glede na lastni podpis projekta.

Pripravljeni manifesti za winget in Homebrew (plus okostje za Flatpak, trenutno blokiran) živijo v
[`packaging/`](packaging/README.md) — pripravljeno in preverjeno lokalno, vendar še ni objavljeno
repozitoriji: objava je ročna odločitev in dejanje vzdrževalca.

## 🔒 Varnost na prvi pogled

| Plast | Zaščita |
|---|---|
| Trezor | Argon2id (19 MiB, t=2) → AES-256-GCM, svež nonce ob vsakem pisanju, atomsko pisanje z `fsync` |
| Ključ | Samo RAM, na ničlo ob zaklepanju; nastavljivo samodejno zaklepanje (5 do 60 min mirovanja, 15 min privzeto) |
| Omrežje | samo proces Rust komunicira z omrežjem; spletni pogled nima oddaljenega izvora (CSP) in nikoli ne vidi žetonov |
| Google | neobvezno, samo `calendar.events.readonly`, `directory.readonly` (fotografije sodelavcev iz delovnega prostora na seznamu gostov) plus profil, OAuth z PKCE in povratno zanko |
| GitHub | neobvezen, šifriran žeton; predmeti se odprejo le, če je povezava `https://github.com/` |
| GitLab | neobvezen, šifriran naslov in žeton; Samo `https://`, brez preusmeritev, povezave samo iz konfiguriranega primerka |
| Posodobitve | namesti samo paket, podpisan s ključem projekta; prirejen prenos se pred izvajanjem zavrže |

Celoten model, varnostna kopija, združitev med stroji in kje je posamezna datoteka: [docs/seguranca.md](docs/seguranca.md).
Ste našli napako? [SECURITY.md](SECURITY.md).

## 📚 Dokumentacija

| Dokument | Kaj je notri |
|---|---|
| 📖 [User guide](docs/uso.md) | zavihki, ponavljajoča se opravila, bližnjice, preobleke, dostopnost, okno, posodobitve in zagon s sistemom |
| 🔌 [Integrations](docs/integracoes.md) | Google dnevni red in GitHub (osebni žeton ali tok naprave) |
| 🛡️ [Security and data](docs/seguranca.md) | model groženj, varnostno kopiranje `.canto`, spajanje, sprememba gesla, datoteke na disku |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify in testi glasnosti |
| 📝 [CHANGELOG](CHANGELOG.md) | kaj se je spremenilo v posamezni različici |
| 🤝 [How to contribute](CONTRIBUTING.md) | okolje, testi, PRs in kako objaviti izdajo |
| 🤖 [Agent guide](AGENTS.md) | pogodbe in pasti za vse, ki urejajo kodo z AI |

## 🛠️ Razvoj

Predpogoji: [Bun](https://bun.sh) ≥ 1.2, stabilen Rust ≥ 1.85 in
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) za vaš sistem.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Spletni pogledi so ustvarjeni po stanju Rust in pladenj se inicializira, zato zagonski klici IPC ne morejo tekmovati pri nastavitvi.

Vsak PR izvaja CI v sistemih Windows, macOS in Linux. Običajni `fix`, `feat` in kršitve zavez združeni v `main`
pridobite oznako SemVer, ustvarjene opombe ob izdaji in podpisane namestitvene programe, zgrajene vzporedno; objava je objavljena po preverjanju (podrobnosti v
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licenca

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Made with 🦀 Rust, ⚛️ React in ☕ za tiste, ki živijo med sestanki.</sub></div>
