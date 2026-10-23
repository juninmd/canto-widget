<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · **Čeština** · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Úkoly s připomenutími, poznámkami, historií schránky, agendou s upozorněními na schůzky, přepisy a vašimi GitHub PRs
> v malém okně připnutém k rohu obrazovky.** Zobrazí se s `Ctrl+Alt+Space`, skryje se, když nepotřebujete
> to a uchovává vše zašifrované na vašem počítači, bez účtu a serveru.

## 🌐 Jazyky

Canto nabízí **42 jazyků rozhraní**, každý s vlastním README. Vyberte si svůj v **Nastavení → Jazyk**;
prohledávatelný výběr používá názvy v rodném jazyce a automatický režim se řídí vaším primárním jazykem systému.
Arabština, hebrejština a perština používají text zprava doleva. Další jazykové katalogy se načítají na vyžádání.

40 nových katalogů rozhraní a 31 nových překladů README jsou strojové překlady a dosud nebyly
recenzované rodilými mluvčími. Portugalština a angličtina zůstávají původní katalogy rozhraní. Zásobníkové štítky a
nadpisy oznámení se řídí zvoleným jazykem; některé podrobnosti upozornění na integraci se vrátí do angličtiny,
a backend chyby zůstávají v portugalštině. Syntaxe názvu úlohy zachovává stávající portugalská a anglická klíčová slova.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Proč Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Pokud žijete mezi schůzkami, PRs a malými nevyřízenými položkami, skončíte s pěti otevřenými aplikacemi. Canto dává všechno
jedno místo.

🔒 **Ve výchozím nastavení šifrováno.** Argon2id + AES-256-GCM s hlavním heslem; klíč existuje vždy pouze v paměti RAM.
Windows Hello volitelné.

🏠 **Vaše data zůstanou s vámi.** Nulová telemetrie, nulový server, není potřeba žádný účet. Záloha je jednorázově zašifrovaná
`.canto` soubor.

⏰ **Už to nezmeškáte.** 1 minutu před schůzkou a v době připomenutí se widget objeví, přehraje zvuk a
odešle upozornění s **odložením o 10 minut**.

🪶 **Světlo.** Tauri v2 (Rust + webové zobrazení systému) namísto Electron: 3,5 MB instalační program.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Vždy aktuální.** Aktualizuje se z aplikace a instaluje pouze to, co je podepsáno vlastním klíčem projektu.

</td>
</tr>
</table>

## 🧰 Funkce

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Úkoly, které vám připomínají

Denní kontrolní seznam s časem a opakováním (každý den, ve všední dny nebo týdně). Zadejte **`Daily at 9:30am`** a
připomínka je již nastavena; přidejte **`!high`** (nebo `!alta`, `!média`, `!baixa`) pro prioritu, nebo kliknutím na tečku na řádku jej cyklujte. Dlouhé nadpisy se zabalí místo toho, aby byly odříznuty. **Časovač zaostření** na jakýkoli úkol: zadejte odhad, stiskněte ▶ a pruh připnutý pod každou záložkou odpočítává čas (červený, jakmile přejdete); čas se ukládá do trezoru každou minutu. **Shrnutí dne** připraveno k vložení (úkoly, soustředěný čas, schůzky s celkovým časem, PRs/MRs otevřeno, sloučeno, zkontrolováno a uzavřeno bez sloučení), **týdenní a měsíční zpráva** ve snížení a **přetažení nevyřízených položek** ze včerejška. **Rychlé snímání** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` na macOS) zaznamenává úkol nebo poznámku z libovolné aplikace, aniž by bylo nutné otevřít widget.

</td>
</tr>
<tr>
<td>

### 📅 Začíná schůzka? Říká vám to.

Připojte se k další schůzce s `Ctrl+Alt+M` (`Ctrl+Cmd+M` na macOS). Pokud se registrace nezdaří, pokusí se Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` v systému macOS); nabídka zásobníku zůstane dostupná, pokud nejsou obě dostupné.

Dnešní události pocházejí z kalendáře Google (pouze pro čtení). Před minutou widget skočí na obrazovku s
**připojte se k Meet**, přehraje zvuk a odešle systémové upozornění, bez ohledu na to, na které kartě se nacházíte, nebo i když je skrytá.
Každá karta zobrazuje odznak s vaší odpovědí (přijato, možná, odmítnuto, čeká). Kliknutím na událost zjistíte, kdo ji zorganizoval
to, program, každý host s iniciálami avataru a jeho odpovědí a přílohami, jako jsou Blížence poznámky.
V horním řádku je uveden **další volný slot** v délce alespoň 15 minut (odmítnuté pozvánky a celodenní akce ne
počet) a události, které se překrývají, získají odznak **konflikt** s názvem druhé události. Zobrazení **Dnes** vede probíhající schůzkou (zbývající čas, tlačítko připojit se, varování před střetem) nebo další, poté **den v jednom řádku** (schůzky, úkoly a volný čas v rámci pracovní doby, se započítáním času na schůzky, volný čas a konflikty) a jedna časová osa, kde jsou schůzky, úkoly s časem a volné mezery samy o sobě řadami: mezera nabízí, aby se vešla nečasovaná úloha.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Poznámky jako karty

Prohledávatelné karty s `#tags`, připnutím nahoru a filtrem značek na jedno kliknutí; každá karta zobrazuje začátek poznámky **vykreslený** (názvy, kontrolní seznamy, kód, odkazy), nikoli hrubé označení. **WYSIWYG editor** s kompaktem
formátovací řádek (tučné, kurzíva, kód, nadpis, seznamy, kontrolní seznamy, které zaškrtnete přímo v textu, bloky kódu se syntaxí
zvýrazňování, odkazy, obrázky) a označovací zkratky při psaní (`# `, `- `, `[ ] `, ` ``` `); přepínač **MD**
ukazuje hrubé markdown, což je stále způsob, jakým se poznámky ukládají, prohledávají, synchronizují a exportují. Odkazy se otevírají pomocí
`Ctrl`+kliknutí, pouze http(s). Vložte, vložte nebo připojte obrázky (PNG, JPEG, GIF, WebP až do velikosti 2 MB), každý uzavřený ve svém
zašifrovaný soubor, zobrazený uvnitř poznámky a jako miniatury na kartě; zůstávají na tomto stroji mimo `.canto`
zálohy. Zvládá tisíce poznámek: seznam je stránkovaný a vyhledávání pokrývá všechny.

</td>
</tr>
<tr>
<td>

### 📋 Schránka, která se nikdy nezapomene (nebo nevyteče)

Šifrovaná historie s vyhledáváním a pinem; rozpoznává odkazy, barvy a kód. Umístěním kurzoru na položku ji **zkopírujte přepsanou**:
JSON formátovaný nebo kompaktní, text na jednom řádku, VELKÁ nebo malá písmena (položka historie zůstane tak, jak byla). Obrovská kopie (100 MB log) ne
zmrazit cokoliv: zachová start a upozorní vás. V systému Windows přeskočí všechna hesla, která správci označí jako
citlivý.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Vaše GitHub na první pohled

**Vyžádaná kontrola ode mě**, přidělená mně, PRs a problémy, které jsem otevřel, s PR nebo ikonou problému a kdo otevřel
to. Koncepty, PRs **čekající na vaši recenzi** a PRs **zastavení** na týden vynikají a každý PR nese malý
**Odznak CI** (úspěšný, neúspěšný, běžící nebo žádný CI) z kontrol hlavního odevzdání. Když někdo **požaduje vaše
review**, upozorní vás na to upozornění OS (ve výchozím nastavení zapnuto, v Nastavení vypněte). Filtrujte podle textu, `repo:` nebo `label:`, pouze PRs nebo pouze problémů, seřaďte podle aktualizace, vytvoření nebo komentářů a
rolujte pomocí **zobrazit více**. Přepněte do zobrazení **Komentáře** a zobrazte tabulku **Katalog komentátorů** všech, kteří okomentovali vaše PRs (avataři, odznaky mezi lidmi vs roboty, počty komentářů, vyhledávání, filtr botů, progresivní stránkování) a jejich komentáře. Podporuje také **GitLab.com a samostatně hostovaný GitLab** s 5minutovou mezipamětí, která
respektuje limit sazby. Přihlaste se pomocí osobního tokenu pouze pro čtení nebo z prohlížeče (tok zařízení).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam aniž byste opustili widget

Čtyři podkarty pro Steam: **nabídky na přání** (největší sleva jako první, každá s tím, co ušetří), **nejprodávanější**
hodnoceno, **hrát hned** (každá hra Steam hlásí za poslední dva týdny) a **katalog seřazený podle hodnocení**, stránkovaný
s **načíst více**, aby se dostal do zbytku obchodu. Každý řádek nese **obrázek kapsle**, **skóre recenze**
s vlastním zněním Steam a kolik recenzí se počítá, přeškrtnutá cena, cena v reálu a co
sleva ušetří — a seznam sečte celkovou úsporu. Veřejné seznamy potřebují pouze vaše **SteamID64**; volitelný
**Steam Web API klíč** přidává nejnovější hry s jejich hracími časy. Karta se ve výchozím nastavení spustí, o jedno zaškrtávací políčko
v Nastavení.

</td>
</tr>
<tr>
<td>

### ⚙️ Nastavení a automatické aktualizace

Změna hlavního hesla, Windows Hello, záloha `.canto`, synchronizovaná složka s automatickým sloučením (Dropbox,
OneDrive, Syncthing...), začněte systémem a sekcí **Aktualizace**, **nainstalovanou verzí** a
**nejnovější zveřejněné** vedle sebe a tlačítko pro aktualizaci a restart.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Má také 🎙️ **Schůzky**, podzáložku Agenda vedle Seznam a Den: Blíženci poznámky a přepisy z
poslední dva týdny plus `.vtt`, `.srt`, `.txt` a `.md` přepisy z místní složky, vyčištěné a prohledávatelné.

🤖 **Modely AI** (ve výchozím nastavení na liště karet, **žádný klíč nebo účet API**): LLM seřazené podle
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, přečteno z jeho veřejné stránky žebříčku,
s ukazatelem skóre, tvůrcem, cenou za 1 milion tokenů a rychlostí, seřazenými podle inteligence, ceny nebo rychlosti. Vyzvedává se v
většinou jednou za 3 hodiny a přihlášení 🔔 vás upozorní, když a
model **vstoupí do top 10** nebo **vstoupí do ní** (kontrolováno každých 6 hodin, když je trezor odemčen),
"nové" a "nahoru" odznaky na týden.

🌙 **Nerušit:** v Nastavení nebo na panelu můžete ztišit upozornění na schůzky, připomenutí úkolů, upozornění na stav a další
systémové upozornění po dobu 30 min, 1 h, 2 h, do zítřka nebo dokud jej nevypnete. Zobrazí se měsíc v horní liště
když skončí; jedním kliknutím jej opět vypnete. Přežije restart a skončí sám.

🔔 **Každé upozornění na jedné obrazovce:** zvonek v záhlaví (počet a barva, když něco čeká) otevře
výstrahy přes celé okno v libovolném režimu: jedna karta na výstrahu s jejími akcemi, **zavřít vše** a co bylo
vyřešeno dnes pod nimi — bez čekání, takto se stále dostanete k dnešnímu protokolu. Z doku, kliknutí
stále otevře toto jediné upozornění v horní části normálního okna.

⌨️ **Vše pomocí klávesnice:** `Alt+1`…`Alt+7` přepínání karet, `N` vytváření, `/` vyhledávání, `F11` celá obrazovka, `Alt+L`
zámky a `?` uvádí seznam zkratek. `Ctrl+Shift+P` (`Cmd+Shift+P` na macOS) otevře **paletu příkazů** s každým
akce podle názvu: přejděte na kartu, nový úkol nebo poznámku, připojte se k další schůzce, zkopírujte shrnutí dne, přepněte vzhled, uzamkněte.

## 🎨 Šest skinů

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Výchozí</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Sklo</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Světlo</b></td>
</tr>
</table>

A **Follow system**, který spolu s OS přepíná mezi světlem a tmou. Všechny projdou AA kontrastem.

<details>
<summary>🖥️ Další obrazovky: registrace, globální vyhledávání, paleta příkazů, GitLab, dílčí úkoly, editor poznámek, zabezpečení, synchronizace, hustota a další</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| První spuštění vítáno | Globální vyhledávání (`Ctrl+K`) | Samoobslužná karta GitLab | Upozornění na schůzku |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Úkol s dílčími úkoly, prioritou a PR | Editor poznámek | Více typů schránky | Zabezpečení: automatické zamykání a odemykání |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synchronizovaná složka | Kompaktní hustota | Uzamčený trezor | Připojte GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Nastavení ve skupinách, s vyhledáváním | Vyhledávání filtruje skupiny | Offline čip v záhlaví | Před vymazáním schránky potvrďte |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Zahodit neuložený koncept poznámky |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Režimy: Mini, Skrytý, Normální, Maximalizovaný | Mini režim: upozornění na okraji obrazovky |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klikněte na upozornění v doku | Maximalizováno: celé okno pro otevřenou kartu |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Zvonek otevírá upozornění přes celé okno |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: nabídka režimu se otevře uvnitř dokovacího okna |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Záložky, které se nevejdou, čekají v nabídce "více" |
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

| Hry a celá obrazovka: upozornění čekají, až odejdete |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Odložení: 1, 5 nebo 10 minut |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Připomenutí úkolu | Změnit hlavní heslo | Stav API (záložka pro přihlášení) | Jazyk: angličtina, portugalština nebo španělština |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Zkopírujte přepsaný klip | Upozornění na schůzku s přípravou |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Přepracování: karta Úkoly, před a po |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redesign: každá záložka, před (nahoře) a za (dole) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI se nezdařilo, s přerušenými úlohami | Někdo se o mně zmínil | Jejich přepínače v Nastavení |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Uveďte upozornění, kdo to napsal |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Zmínit upozornění s náhledem textu |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Další upozornění o mé vlastní práci |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Denní souhrnné upozornění | Nastavení souhrnu dne |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Podzáložka Zmínky (GitHub a GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Heslo změněno, čeká se na jeden soubor | Shrnutí dne |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Týdenní zpráva | Agenda: příští volný čas a konflikty |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: zdarma hned teď | Paleta příkazů (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Nerušit | Obrázek v poznámce |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Odznak CI na každém PR | Oznámení žádostí o kontrolu |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Poznamenejte si obrázky jako miniatury | WYSIWYG editor poznámek |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Editor poznámek: raw markdown (MD) | Editor poznámek na světlé kůži |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Úkoly: priorita na řádku, zalomení dlouhých nadpisů | Seznam poznámek s vykresleným označením dolů |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Modely umělé inteligence hodnocené podle indexu inteligence |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: nejprodávanější, očíslované | Steam: posledních pět odehraných her, s oběma hracími časy |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalog podle hodnocení, s "načíst více" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Jedno překryvné upozornění pro vše čekající: výpadky, schůzky, úkoly a nové modely umělé inteligence |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Moje koncové body: dlaždice s nejnovější latencí | Otevřený koncový bod: graf latence, limit a nastavení výstrah | Přidání kontroly certifikátu DNS + |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Program libovolného dne: předchozí a následující šipky, výběr data a tlačítko zpět na dnešek |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Úkoly: aktuální úkol s časovačem a seskupeným seznamem | GitHub: souhrnný pruh nad seznamy | GitLab: stejný pás, bez dlaždice CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Časovač ostření připnutý pod každou záložkou | Agenda jako den, úkoly vedle porad |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Denní pohled: překrývající se události sdílejí šířku vedle sebe |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Kontrola radaru: nejdříve nejstarší požadavek, zpožděný červeně, odložit |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Schůzky jako podzáložka Agenda vedle seznamu a dne |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Záložka Aktivita (ve výchozím nastavení vypnutá) | Shrnutí se zaměřeným časem a uzavřeným PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Karta Aktivita, posledních 7 dní | Karta Aktivita, vypnutá | Karta aktivity v širokém okně |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Karta **Aktivita** se spustí skrytě (zapněte ji v části Nastavení → viditelné karty). Zaznamenává pouze název
zaměřená aplikace, když používáte počítač, v zapečetěném místním souboru, který nikdy nedosáhne zálohy nebo synchronizace (Wayland
nemůže nahlásit zaměřené okno, takže tam zůstane nedostupné). Vypnuto, dokud se nepřihlásíte a první obrazovka neřekne co
je zachováno a co nikdy není.

- **Den**: kobliha podle kategorie s celkovým počtem uvnitř, jejíž legenda skrývá kategorii, změnu oproti dni
před a po dobu nečinnosti (bez klávesnice nebo myši po dobu 2 minut). Pod ním denní cíl zaměřený na kód s pruhem a
jedna tečka za den, tři zvýraznění (nejdelší úsek v jedné aplikaci, přepínání aplikací, špička), časová osa, kde
den, nečinné úseky a nejvytíženější aplikace sdílejí jednu časovou osu se značkou „nyní“ a seznamem aplikací
(klepnutím na jednu změníte její kategorii) nebo úkolů, na kterých časovač ostření běžel.
- **Týden**: složené sloupce za den s průměrnou čarou a tečkou pod každým dnem, který splnil cíl, hodinová teplotní mapa
s vaším vrcholem a stejné seznamy na celý týden.
- **Rozvržení a vzhledy**: jeden sloupec ve výchozím okně, dva, jakmile je široké (maximální); každá kůže má své
barvy kategorie, zkontrolován kontrast. Nabídka vedle dne jej zkopíruje jako text.

<sub>Všechny snímky obrazovky používají fiktivní data.</sub>

## ⚖️ V porovnání s tím, co je venku

Žádný ze zkoumaných nástrojů nepokrývá více než dvě z těchto front najednou. Zdroje a podrobnosti v
[docs/benchmark.md](docs/benchmark.md).

| | Úkoly + připomenutí | Poznámky | Schránka | Setkání | GitHub | Místní šifrování ve výchozím nastavení |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidián / Joplin | ➖ | ✅ | — | — | — | ➖ pouze synchronizace |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ volitelné |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ nativní · ➖ částečné, přes rozšíření nebo volitelně · — žádné · ? nepublikováno · neukládá uživatelská data</sub>

Co sem benchmark přinesl: **čas přímo v názvu úkolu** (Todoist/TickTick), **odložení upozornění**
(TickTick) a **schránka, která respektuje správce hesel** (CopyQ/Ditto).

## ⬇️ Nainstalujte

Stáhněte si instalační program pro vaši platformu z **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Systém | Soubor |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (doporučeno) nebo `.msi` |
| 🍎 macOS | `.dmg` pro Apple Silicon nebo Intel |
| 🐧 Linux | `.AppImage`, `.deb` nebo `.rpm` |

1. Při prvním spuštění vytvoříte **hlavní heslo**. Neexistuje žádná obnova: ztratit heslo, ztratit data.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` v systému macOS) zobrazí a skryje widget.
3. Hotovo. Když se dodává nová verze, Canto vás upozorní a **Nastavení → Aktualizace** se aktualizuje jedním kliknutím.

> [!POZNÁMKA]
> Instalační programy ještě nejsou podepsané kódem: SmartScreen (Windows) a Gatekeeper (macOS) varují při prvním spuštění.
> Automatické aktualizace jsou před spuštěním ověřeny podle vlastního podpisu projektu.

Hotové manifesty pro winget a Homebrew (plus kostra pro Flatpak, aktuálně blokovaná) žijí v
[`packaging/`](packaging/README.md) – připraveno a ověřeno lokálně, ale dosud nebylo zveřejněno
repozitáře: publikování je ruční rozhodnutí a akce správce.

## 🔒 Bezpečnost na první pohled

| Vrstva | Ochrana |
|---|---|
| Trezor | Argon2id (19 MiB, t=2) → AES-256-GCM, nový zápis při každém zápisu, atomový zápis s `fsync` |
| Klíč | Pouze RAM, vynulováno na zámku; konfigurovatelný automatický zámek (5 až 60 minut nečinnosti, 15 minut ve výchozím nastavení) |
| Síť | pouze proces Rust mluví se sítí; webview nemá vzdálený původ (CSP) a nikdy nevidí tokeny |
| Google | volitelné, pouze `calendar.events.readonly`, `directory.readonly` (fotografie kolegů z Workspace v seznamu hostů) plus profil, OAuth s PKCE a zpětnou smyčkou |
| GitHub | volitelný, šifrovaný token; položky se otevírají, pouze pokud je odkaz `https://github.com/` |
| GitLab | volitelná, šifrovaná adresa a token; Pouze `https://`, žádná přesměrování, odkazy pouze z nakonfigurované instance |
| Aktualizace | nainstaluje pouze balíček podepsaný klíčem projektu; manipulované stahování je před spuštěním zahozeno |

Úplný model, zálohování, sloučení mezi počítači a umístění každého souboru: [docs/seguranca.md](docs/seguranca.md).
Našli jste chybu? [SECURITY.md](SECURITY.md).

## 📚 Dokumentace

| Dokument | Co je v něm |
|---|---|
| 📖 [User guide](docs/uso.md) | karty, opakující se úlohy, zástupce, vzhledy, usnadnění, okna, aktualizace a start se systémem |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda a GitHub (osobní token nebo tok zařízení) |
| 🛡️ [Security and data](docs/seguranca.md) | model ohrožení, `.canto` zálohování, sloučení, změna hesla, soubory na disku |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify a objemové testy |
| 📝 [CHANGELOG](CHANGELOG.md) | co se změnilo v každé verzi |
| 🤝 [How to contribute](CONTRIBUTING.md) | prostředí, testy, PRs a jak publikovat vydání |
| 🤖 [Agent guide](AGENTS.md) | smlouvy a pasti pro každého, kdo upravuje kód pomocí AI |

## 🛠️ Vývoj

Předpoklady: [Bun](https://bun.sh) ≥ 1,2, stabilní Rust ≥ 1,85 a
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) pro váš systém.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Webviews se vytvářejí po stavu Rust a zásobník je inicializován, takže spouštěcí IPC volání nemohou závodit s nastavením.

Každý PR provozuje CI na Windows, macOS a Linux. Konvenční `fix`, `feat` a porušující commity sloučeny do `main`
získat značku SemVer, vygenerované poznámky k verzi a podepsané instalační programy vytvořené paralelně; vydání je zveřejněno po ověření (podrobnosti v
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licence

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Vyrobeno s 🦀 Rust, ⚛️ React a ☕ pro ty, kteří žijí mezi setkáními.</sub></div>
