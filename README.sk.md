<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · **Slovenčina** · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Úlohy s pripomienkami, poznámkami, históriou schránky, agendou s upozorneniami na stretnutia, prepismi a vašimi GitHub PRs
> v malom okne pripnutom k rohu obrazovky.** Zobrazí sa s `Ctrl+Alt+Space` a skryje sa, keď ho nepotrebujete
> a uchováva všetko zašifrované na vašom počítači, bez účtu a servera.

## 🌐 Jazyky

Canto ponúka **42 jazykov rozhrania**, z ktorých každý má svoj vlastný súbor README. Vyberte si ten svoj v **Nastavenia → Jazyk**;
vyhľadávateľný výber používa názvy v rodnom jazyku a automatický režim sa riadi vaším primárnym jazykom systému.
Arabčina, hebrejčina a perzština používajú text písaný sprava doľava. Ďalšie jazykové katalógy sa načítavajú na požiadanie.

40 nových katalógov rozhraní a 31 nových prekladov README sú strojové preklady a neboli
recenzované rodenými hovorcami. Pôvodnými katalógmi rozhraní zostáva portugalčina a angličtina. Podnosové štítky a
nadpisy upozornení sa riadia zvoleným jazykom; niektoré podrobnosti integračných upozornení sa vrátia do angličtiny,
a backend chyby zostávajú v portugalčine. Syntax názvu úlohy zachováva existujúce portugalské a anglické kľúčové slová.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Prečo Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ak žijete medzi stretnutiami, PRs a malými čakajúcimi položkami, skončíte s otvorenými piatimi aplikáciami. Canto dáva do toho všetko
jedno miesto.

🔒 **V predvolenom nastavení šifrované.** Argon2id + AES-256-GCM s hlavným heslom; kľúč vždy existuje iba v RAM.
Windows Hello voliteľné.

🏠 **Vaše dáta zostanú s vami.** Nulová telemetria, nulový server, nie je potrebný žiadny účet. Záloha je jediná šifrovaná
`.canto` súbor.

⏰ **Nezmeškáte to.** 1 minútu pred stretnutím a v čase pripomenutia sa miniaplikácia objaví, prehrá zvuk a
odošle upozornenie s **odložením o 10 minút**.

🪶 **Svetlo.** Tauri v2 (Rust + webové zobrazenie systému) namiesto Electron: 3,5 MB inštalačný program.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Vždy aktuálne.** Aktualizuje sa z aplikácie a nainštaluje iba to, čo je podpísané vlastným kľúčom projektu.

</td>
</tr>
</table>

## 🧰 Funkcie

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Úlohy, ktoré vám pripomenú

Denný kontrolný zoznam s časom a opakovaním (každý deň, v pracovné dni alebo týždenne). Napíšte **`Daily at 9:30am`** a
pripomienka je už nastavená; pridajte **`!high`** (alebo `!alta`, `!média`, `!baixa`) ako prioritu alebo kliknite na bodku v riadku, aby ste ho mohli prepínať. Dlhé nadpisy sa zabalia namiesto toho, aby boli odrezané. **Časovač zaostrenia** na akúkoľvek úlohu: urobte odhad, stlačte ▶ a pruh pripnutý pod každou záložkou odpočítava čas (po prejdení červený); čas sa ukladá do trezoru každú minútu. **Zhrnutie dňa** pripravené na prilepenie (úlohy, sústredený čas, stretnutia s celkovým časom, PRs/MRs otvorené, zlúčené, skontrolované a zatvorené bez zlúčenia), **týždenný a mesačný prehľad** v znížení ceny a **vytiahnutie čakajúcich položiek** zo včera. **Rýchle snímanie** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` na macOS) zaznamená úlohu alebo poznámku z ľubovoľnej aplikácie bez otvorenia miniaplikácie.

</td>
</tr>
<tr>
<td>

### 📅 Začína sa stretnutie? Hovorí vám to.

Pripojte sa k ďalšej schôdzi s `Ctrl+Alt+M` (`Ctrl+Cmd+M` v systéme macOS). Ak registrácia zlyhá, pokúsi sa Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` v systéme macOS); ponuka zásobníka zostane dostupná, ak nie sú dostupné obe.

Dnešné udalosti pochádzajú z Google Kalendára (iba na čítanie). Minútu predtým miniaplikácia preskočí na obrazovku s
**pripojte sa k Meet**, prehrá zvuk a odošle systémové upozornenie bez ohľadu na to, na ktorej karte sa nachádzate, alebo aj keď je skrytá.
Každá karta zobrazuje odznak s vašou odpoveďou (prijatá, možno, odmietnutá, čaká). Kliknutím na udalosť zistíte, kto ju organizoval
to, program, každý hosť s iniciálami avatara a ich odpoveďou a prílohami, ako sú Blížencove poznámky.
V hornom riadku nájdete **ďalší voľný slot** v trvaní najmenej 15 minút (odmietnuté pozvánky a celodenné udalosti
počet) a udalosti, ktoré sa prekrývajú, dostanú odznak **konflikt** s názvom inej udalosti. Zobrazenie **Dnes** vedie s prebiehajúcou schôdzou (zostávajúci čas, tlačidlo pripojiť sa, varovanie pred konfliktom) alebo nasledujúcou, potom **deň v jednom riadku** (stretnutia, úlohy a voľný čas v rámci pracovnej doby, s časom stretnutia, voľný čas a konflikty) a jedna časová os, kde sú schôdze, úlohy s časom a voľné medzery riadky samy o sebe: medzera ponúka, aby sa zmestila nečasovaná úloha.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Poznámky ako karty

Vyhľadávateľné karty s `#tags`, pripnutím navrch a filtrom značiek jedným kliknutím; každá karta zobrazuje začiatok poznámky **vykreslený** (názvy, kontrolné zoznamy, kód, odkazy), nie hrubé označenie. **WYSIWYG editor** s kompaktom
lišta formátovania (tučné, kurzíva, kód, nadpis, zoznamy, kontrolné zoznamy, ktoré začiarknete priamo v texte, bloky kódu so syntaxou
zvýrazňovanie, odkazy, obrázky) a označovacie skratky pri písaní (`# `, `- `, `[ ] `, ` ``` `); prepínač **MD**
zobrazuje hrubé zníženie, čo je stále spôsob, akým sa poznámky ukladajú, vyhľadávajú, synchronizujú a exportujú. Odkazy sa otvárajú pomocou
`Ctrl`+kliknutie, iba http(s). Prilepte, vložte alebo pripojte obrázky (PNG, JPEG, GIF, WebP do veľkosti 2 MB), každý zapečatený vo svojom
zašifrovaný súbor zobrazený vo vnútri poznámky a ako miniatúry na karte; zostávajú na tomto stroji mimo `.canto`
zálohy. Zvláda tisíce poznámok: zoznam je stránkovaný a vyhľadávanie pokrýva všetky z nich.

</td>
</tr>
<tr>
<td>

### 📋 Schránka, ktorá nikdy nezabudne (alebo nevytečie)

Šifrovaná história s vyhľadávaním a pinom; rozpoznáva odkazy, farby a kód. Umiestnite kurzor myši na položku a **skopírujte ju prepísanú**:
JSON formátovaný alebo kompaktný, text na jednom riadku, VEĽKÉ alebo malé písmená (záznam histórie zostane tak, ako bol). Obrovská kópia (100 MB denník) nie
zmraziť čokoľvek: udržiava štart a varuje vás. V systéme Windows preskočí čokoľvek, čo správcovia hesiel označia ako
citlivý.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Vaše GitHub na prvý pohľad

**Kontrola vyžiadaná odo mňa**, pridelená mne, PRs a problémy, ktoré som otvoril, s PR alebo ikonou problému a kto otvoril
to. Koncepty, PRs **čakajúce na vašu recenziu** a PRs **zastavená** na týždeň vynikajú a každá PR nesie malú
**Odznak CI** (úspešný, neúspešný, spustený alebo žiadny CI) z kontrol hlavného odovzdania. Keď vás niekto **požiada
review**, upozorní vás na to upozornenie operačného systému (v predvolenom nastavení zapnuté, v Nastaveniach ho vypnite). Filtrujte podľa textu, `repo:` alebo `label:`, iba PRs alebo iba problémov, zoraďte podľa aktualizácie, vytvorenia alebo komentárov a
posúvajte pomocou **zobraziť viac**. Prepnite na zobrazenie **Komentáre** a zobrazte **Katalóg komentátorov** mriežku všetkých, ktorí komentovali vaše PRs (avatarov, odznaky medzi ľuďmi a robotmi, počty komentárov, vyhľadávanie, filter robotov, postupné stránkovanie) a ich komentáre. Podporuje tiež **GitLab.com a vlastný GitLab** s 5-minútovou vyrovnávacou pamäťou, ktorá
rešpektuje limit sadzby. Prihláste sa pomocou osobného tokenu iba na čítanie alebo z prehliadača (postup zariadenia).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam bez opustenia miniaplikácie

Štyri podkarty pre Steam: **ponuky na prianie** (najvyššia zľava, každá s tým, čo ušetrí), **najpredávanejšie**
hodnotené, **hrať teraz** (každá hra Steam nahlási za posledné dva týždne) a **katalóg zoradený podľa hodnotenia**, stránkovaný
s **načítať viac**, aby sa dostal do zvyšku obchodu. Každý riadok nesie **obrázok kapsuly**, **skóre recenzie**
s vlastným znením Steam a koľko recenzií sa počíta, prečiarknutá cena, cena v realoch a aké
zľava šetrí – a zoznam spočíta celkovú úsporu. Verejné zoznamy potrebujú iba vaše **SteamID64**; voliteľné
**Steam Web API kľúč** pridáva najnovšie hry s ich hracími časmi. Karta sa predvolene spustí, o jedno začiarkavacie políčko ďalej
v Nastaveniach.

</td>
</tr>
<tr>
<td>

### ⚙️ Nastavenia a automatické aktualizácie

Zmena hlavného hesla, Windows Hello, záloha `.canto`, synchronizovaný priečinok s automatickým zlúčením (Dropbox,
OneDrive, Syncthing...), začnite so systémom a sekciou **Aktualizácie** s **nainštalovanou verziou** a
**najnovšie zverejnené** vedľa seba a tlačidlo na aktualizáciu a reštart.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Má tiež 🎙️ **Stretnutia**, podzáložku Agenda vedľa zoznamu a dňa: Blíženci poznámky a prepisy z
posledné dva týždne plus `.vtt`, `.srt`, `.txt` a `.md` prepisy z lokálneho priečinka, vyčistené a prehľadateľné.

🤖 **Modely AI** (predvolene na paneli kariet, **žiadny kľúč alebo účet API**): LLM zoradené podľa
[Artificial Analysis](https://artificialanalysis.ai) **Index inteligencie**, prečítajte si z jeho verejnej stránky rebríčka,
s ukazovateľom skóre, tvorcom, cenou za 1 milión tokenov a rýchlosťou, zoradené podľa inteligencie, ceny alebo rýchlosti. Prináša sa o
väčšinou raz za 3 hodiny a prihlásenie 🔔 vás upozorní, keď a
model **vstúpi do top 10** alebo **vstúpi do nej** (kontroluje sa každých 6 hodín, kým je trezor odomknutý), pričom
"nové" a "hore" odznaky na týždeň.

🌙 **Nerušiť:** v Nastaveniach alebo na paneli môžete stíšiť upozornenia na stretnutia, pripomenutia úloh, upozornenia na stav a všetky
systémové upozornenie na 30 min, 1 h, 2 h, do zajtra alebo kým ho nevypnete. Zobrazí sa mesiac v hornej lište
keď skončí; jedným kliknutím ho opäť vypnete. Prežije reštart a skončí sám.

🔔 **Každé upozornenie na jednej obrazovke:** zvonček v hlavičke (počet a farba, keď niečo čaká) otvorí
upozornenia cez celé okno v akomkoľvek režime: jedna karta na upozornenie s jeho akciami, **zavrieť všetky** a čo bolo
vyriešené dnes pod nimi — bez toho, aby ste nič čakali, takto sa stále dostanete k dnešnému denníku. Z doku, kliknutie
stále otvorí toto jediné upozornenie v hornej časti normálneho okna.

⌨️ **Všetko pomocou klávesnice:** `Alt+1`…`Alt+7` prepínanie kariet, `N` vytváranie, `/` vyhľadávanie, `F11` celá obrazovka, `Alt+L`
uzamkne a `?` zobrazí zoznam skratiek. `Ctrl+Shift+P` (`Cmd+Shift+P` v systéme MacOS) otvorí **paletu príkazov** s každým
akcia podľa názvu: prejdite na kartu, novú úlohu alebo poznámku, pripojte sa k ďalšej schôdzi, skopírujte súhrn dňa, prepnite vzhľad, uzamknite.

## 🎨 Šesť skinov

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Predvolené</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Sklo</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Svetlo</b></td>
</tr>
</table>

A **Follow system**, ktorý prepína medzi svetlom a tmou spolu s OS. Všetky prechádzajú kontrastom AA.

<details>
<summary>🖥️ Ďalšie obrazovky: vstup, globálne vyhľadávanie, paleta príkazov, GitLab, podúlohy, editor poznámok, zabezpečenie, synchronizácia, hustota a ďalšie</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Vitajte pri prvom spustení | Globálne vyhľadávanie (`Ctrl+K`) | Karta GitLab s vlastným hosťovaním | Upozornenie na stretnutie |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Úloha s podúlohami, prioritou a PR | Editor poznámok | Viac typov schránok | Zabezpečenie: automatické zamykanie a odomykanie |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synchronizovaný priečinok | Kompaktná hustota | Uzamknutý trezor | Pripojte GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Nastavenia v skupinách, s vyhľadávaním | Vyhľadávanie filtruje skupiny | Offline čip v hlavičke | Pred vymazaním schránky potvrďte |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Zahodiť neuložený koncept poznámky |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Režimy: Mini, Skrytý, Normálny, Maximalizovaný | Mini režim: upozornenia na okraji obrazovky |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Kliknite na upozornenie v doku | Maximalizované: celé okno pre otvorenú kartu |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Zvonček otvára upozornenia cez celé okno |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: ponuka režimu sa otvorí v okne doku |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Karty, ktoré sa nezmestia, čakajú v ponuke „viac“ |
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

| Hry a celá obrazovka: upozornenia čakajú, kým odídete |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Odloženie: 1, 5 alebo 10 minút |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Pripomenutie úlohy | Zmeniť hlavné heslo | Stav API (karta prihlásenia) | Jazyk: angličtina, portugalčina alebo španielčina |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Skopírujte prepísaný klip | Upozornenie na stretnutie s prípravou |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Zmena dizajnu: karta Úlohy, pred a po |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Prepracovanie: každá karta, pred (hore) a za (dole) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI zlyhala s nefunkčnými úlohami | Niekto ma spomenul | Ich prepínače v Nastaveniach |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Uveďte upozornenie, kto to napísal |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Upozornenie zmienky s náhľadom textu |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Ďalšie upozornenia o mojej vlastnej práci |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Súhrnné denné upozornenie | Nastavenie súhrnu dňa |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Podkarta zmienky (GitHub a GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Heslo zmenené, čaká sa na jeden súbor | Zhrnutie dňa |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Týždenná správa | Agenda: ďalší voľný čas a konflikty |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: zadarmo hneď teraz | Paleta príkazov (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Nerušiť | Obrázok v poznámke |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Odznak CI na každom PR | Oznámenia o preskúmaní žiadostí |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Poznamenajte si obrázky ako miniatúry | WYSIWYG editor poznámok |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Editor poznámok: raw markdown (MD) | Editor poznámok na svetlej koži |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Úlohy: priorita v riadku, zalomenie dlhých nadpisov | Zoznam poznámok s vykresleným označením |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Modely AI zoradené podľa Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: najpredávanejšie, očíslované | Steam: posledných päť odohraných zápasov s oboma hracími časmi |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalóg podľa hodnotenia, s "načítať viac" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Jedno prekrytie výstrahy pre všetko čakajúce: výpadky, stretnutia, úlohy a nové modely AI |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Moje koncové body: dlaždice s najnovšou latenciou | Otvorený koncový bod: graf latencie, limit a nastavenia upozornení | Pridanie kontroly certifikátu DNS + |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda ľubovoľného dňa: šípky predchádzajúceho a nasledujúceho dňa, výber dátumu a tlačidlo späť na dnešný deň |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Úlohy: aktuálna úloha s časovačom a zoskupeným zoznamom | GitHub: súhrnný pás nad zoznamami | GitLab: rovnaký pás, bez dlaždice CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Časovač zaostrenia pripnutý pod každou záložkou | Program ako deň, úlohy popri stretnutiach |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Zobrazenie dňa: prekrývajúce sa udalosti zdieľajú šírku vedľa seba |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Kontrola radaru: najskôr najstaršia žiadosť, oneskorená červená, odložiť |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Stretnutia ako podkarta programu, vedľa položky Zoznam a deň |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Záložka Aktivita (štandardne vypnutá) | Zhrnutie so zameraním času a uzavreté PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Karta aktivity, posledných 7 dní | Karta Aktivita, vypnutá | Karta aktivity v širokom okne |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Karta **Aktivita** sa spustí skrytá (zapnite ju v časti Nastavenia → viditeľné karty). Zaznamenáva iba názov
zameraná aplikácia, keď používate počítač, v zapečatenom lokálnom súbore, ktorý nikdy nedosiahne zálohy ani synchronizáciu (Wayland
nemôže nahlásiť zaostrené okno, takže tam zostane nedostupné). Vypnuté, kým sa neprihlásite a na prvej obrazovke sa nezobrazí čo
je zachované a čo nikdy nie je.

- **Deň**: šiška podľa kategórie s celkovým počtom vnútri, ktorej legenda ukrýva kategóriu, zmenu oproti dňu
pred a čas nečinnosti (bez klávesnice alebo myši po dobu 2 minút). Pod ním denný cieľ zameraný na kód s pruhom a
jedna bodka za deň, tri zvýraznenia (najdlhší úsek v jednej aplikácii, prepínanie aplikácií, hodina špičky), časová os, kde
deň, nečinnosť sa tiahne a najvyťaženejšie aplikácie zdieľajú jednu časovú os so značkou „teraz“ a zoznamom aplikácií
(klepnutím na jednu zmeníte jej kategóriu) alebo úloh, pri ktorých sa spúšťal časovač zaostrenia.
- **Týždeň**: zoskupené stĺpce za deň s priemernou čiarou a bodkou pod každým dňom, ktorý splnil cieľ, hodinová teplotná mapa
s vaším vrcholom a rovnaké zoznamy na celý týždeň.
- **Rozloženie a vzhľady**: jeden stĺpec v predvolenom okne, dva, keď je široké (maximalizované); každá koža má svoje
farby kategórie, skontrolovaný kontrast. Menu vedľa dňa ho skopíruje ako text.

<sub>Všetky snímky obrazovky používajú fiktívne údaje.</sub>

## ⚖️ V porovnaní s tým, čo je vonku

Žiadny zo skúmaných nástrojov nepokrýva viac ako dve z týchto frontov naraz. Zdroje a podrobnosti v
[docs/benchmark.md](docs/benchmark.md).

| | Úlohy + pripomienka | Poznámky | Schránka | Stretnutia | GitHub | Predvolene lokálne šifrovanie |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidián / Joplin | ➖ | ✅ | — | — | — | ➖ iba synchronizácia |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ voliteľné |
| MeetingBar | — | — | — | ✅ | — | neuvádza sa |
| Gitify | — | — | — | — | ✅ | neuvádza sa |

<sub>✅ natívne · ➖ čiastočné, cez rozšírenie alebo voliteľné · — žiadne · ? nepublikované · neukladá údaje používateľa</sub>

Čo tu benchmark priniesol: **čas priamo v názve úlohy** (Todoist/TickTick), **odloženie upozornenia**
(TickTick) a **schránka, ktorá rešpektuje správcov hesiel** (CopyQ/Ditto).

## ⬇️ Nainštalujte

Stiahnite si inštalačný program pre vašu platformu z **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Systém | Súbor |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (odporúčané) alebo `.msi` |
| 🍎 macOS | `.dmg` pre Apple Silicon alebo Intel |
| 🐧 Linux | `.AppImage`, `.deb` alebo `.rpm` |

1. Pri prvom spustení si vytvoríte **hlavné heslo**. Neexistuje žiadna obnova: stratíte heslo, stratíte údaje.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` v systéme macOS) zobrazí a skryje miniaplikáciu.
3. Hotovo. Keď sa odošle nová verzia, Canto vás upozorní a **Nastavenia → Aktualizácie** sa aktualizujú jedným kliknutím.

> [!POZNÁMKA]
> Inštalačné programy ešte nie sú podpísané kódom: SmartScreen (Windows) a Gatekeeper (macOS) varujú pri prvom spustení.
> Automatické aktualizácie sú pred spustením overené podľa vlastného podpisu projektu.

Hotové manifesty pre winget a Homebrew (plus kostra pre Flatpak, momentálne zablokovaná) žijú v
[`packaging/`](packaging/README.md) – pripravené a overené lokálne, ale zatiaľ nebolo zverejnené
repozitáre: publikovanie je manuálne rozhodnutie a činnosť správcu.

## 🔒 Bezpečnosť na prvý pohľad

| Vrstva | Ochrana |
|---|---|
| Trezor | Argon2id (19 MiB, t=2) → AES-256-GCM, nový raz pri každom zápise, atómový zápis s `fsync` |
| Kľúč | Iba RAM, vynulované na uzamknutie; konfigurovateľný automatický zámok (5 až 60 minút nečinnosti, 15 minút štandardne) |
| Sieť | iba proces Rust hovorí do siete; webview nemá vzdialený pôvod (CSP) a nikdy nevidí tokeny |
| Google | voliteľné, iba `calendar.events.readonly`, `directory.readonly` (fotografie kolegov z pracovného priestoru v zozname hostí) plus profil, OAuth s PKCE a spätnou slučkou |
| GitHub | voliteľný, šifrovaný token; položky sa otvárajú iba vtedy, ak je odkaz `https://github.com/` |
| GitLab | voliteľná, šifrovaná adresa a token; Iba `https://`, žiadne presmerovania, odkazy iba z nakonfigurovanej inštancie |
| Aktualizácie | nainštaluje iba balík podpísaný kľúčom projektu; narušené sťahovanie sa pred spustením zahodí |

Úplný model, zálohovanie, zlúčenie medzi počítačmi a umiestnenie každého súboru: [docs/seguranca.md](docs/seguranca.md).
Našli ste chybu? [SECURITY.md](SECURITY.md).

## 📚 Dokumentácia

| Dokument | Čo je v ňom |
|---|---|
| 📖 [User guide](docs/uso.md) | karty, opakujúce sa úlohy, skratky, vzhľady, dostupnosť, okno, aktualizácie a štart so systémom |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda a GitHub (osobný token alebo tok zariadení) |
| 🛡️ [Security and data](docs/seguranca.md) | model hrozby, `.canto` zálohovanie, zlúčenie, zmena hesla, súbory na disku |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify a objemové testy |
| 📝 [CHANGELOG](CHANGELOG.md) | čo sa zmenilo v každej verzii |
| 🤝 [How to contribute](CONTRIBUTING.md) | prostredie, testy, PRs a ako publikovať vydanie |
| 🤖 [Agent guide](AGENTS.md) | zmluvy a pasce pre každého, kto upravuje kód pomocou AI |

## 🛠️ Vývoj

Predpoklady: [Bun](https://bun.sh) ≥ 1,2, stabilné Rust ≥ 1,85 a
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) pre váš systém.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Webviews sa vytvárajú po stave Rust a zásobník je inicializovaný, takže spúšťacie IPC volania nemôžu pretekať.

Každý PR spúšťa CI v systémoch Windows, MacOS a Linux. Konvenčné `fix`, `feat` a porušujúce odovzdania sa zlúčili do `main`
získať značku SemVer, vygenerované poznámky k vydaniu a podpísané inštalačné programy postavené paralelne; vydanie je zverejnené po overení (podrobnosti v
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licencia

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Vyrobené s 🦀 Rust, ⚛️ React a ☕ pre tých, ktorí žijú medzi stretnutiami.</sub></div>
