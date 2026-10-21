<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · **Български** · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Задачи с напомняния, бележки, история на клипборда, дневен ред с предупреждения за срещи, преписи и вашите GitHub PRs
> в малък прозорец, закачен в ъгъла на екрана.** Изскача с `Ctrl+Alt+Space`, скрива се, когато не ви трябва
> го и пази всичко криптирано на вашата машина, без акаунт и сървър.

## 🌐 Езици

Canto предлага **42 интерфейсни езика**, всеки със собствен README. Изберете своя в **Настройки → Език**;
средството за избор с възможност за търсене използва имена на родния език, а автоматичният режим следва основния ви системен език.
Арабски, иврит и персийски използват текст отдясно наляво. Допълнителни езикови каталози се зареждат при поискване.

40-те нови интерфейсни каталога и 31 нови превода на README са машинни преводи и не са били
прегледани от носители на езика. Португалският и английският остават каталозите на оригиналния интерфейс. Етикети за тави и
заглавията на известията следват избрания език; някои подробности за предупреждение за интеграция се връщат на английски,
и грешките в задната част остават на португалски. Синтаксисът на заглавието на задачата запазва съществуващите португалски и английски ключови думи.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Защо Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ако живеете между срещи, PRs и малки висящи елементи, в крайна сметка имате пет отворени приложения. Canto влага всичко
едно място.

🔒 **Шифровано по подразбиране.** Argon2id + AES-256-GCM с главна парола; ключът съществува само в RAM.
Windows Hello по избор.

🏠 **Вашите данни остават с вас.** Нулева телеметрия, нулев сървър, не се изисква акаунт. Архивирането е единично криптирано
`.canto` файл.

⏰ **Няма да го пропуснете.** 1 минута преди среща и по време на напомняне джаджата изскача, възпроизвежда звук и
изпраща известие с **отлагане за 10 минути**.

🪶 **Лек.** Tauri v2 (Rust + системният уеб изглед) вместо Electron: 3,5 MB инсталатор.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Винаги актуален.** Актуализира от приложението и инсталира само това, което е подписано от собствения ключ на проекта.

</td>
</tr>
</table>

## 🧰 Характеристики

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Задачи, които ви напомнят

Ежедневен контролен списък с време и повторение (всеки ден, през делничните дни или седмично). Въведете **`Daily at 9:30am`** и
напомнянето вече е зададено; добавете **`!high`** (или `!alta`, `!média`, `!baixa`) за приоритет или щракнете върху точката в реда, за да го превключите. Дългите заглавия се увиват, вместо да се отрязват. **Фокусирайте таймера** върху всяка задача: дайте му приблизителна оценка, натиснете ▶ и лента, закрепена под всеки раздел, отчита времето спрямо него (червена, след като преминете); времето се записва в трезора всяка минута. **Резюме за деня**, готово за поставяне (задачи, фокусирано време, срещи с общо време, PRs/MRs отворени, обединени, прегледани и затворени без обединяване), **седмичен и месечен отчет** в маркдаун и **изтегляне на висящи елементи** от вчера. **Бързо заснемане** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` на macOS) записва задача или бележка от всяко приложение, без да отваряте изпълнимия модул.

</td>
</tr>
<tr>
<td>

### 📅 Започва ли срещата? То ви казва.

Присъединете се към следващата среща с `Ctrl+Alt+M` (`Ctrl+Cmd+M` на macOS). Ако регистрацията е неуспешна, Canto опитва
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` на macOS); менюто в панела остава достъпно, ако и двете не са налични.

Днешните събития идват от календара Google (само за четене). Една минута преди това джаджата скача на екрана с
**присъединете се към Meet**, възпроизвежда звук и изпраща системно известие, независимо от раздела, в който се намирате, или дори ако е скрит.
Всяка карта показва значка с вашия отговор (приет, може би, отказан, чакащ). Кликнете върху събитието, за да видите кой е организирал
това, дневният ред, всеки гост с аватар с инициали и техния отговор и прикачени файлове, като бележките на Джемини.
Горният ред ви казва **следващия безплатен слот** от поне 15 минути (отхвърлените покани и целодневните събития не
брой), а събитията, които се припокриват, получават значка **конфликт**, наименуваща другото събитие. Изгледът **Днес** води с текущата среща (оставащо време, бутон за присъединяване, предупреждение за сблъсък) или следващата, след това **деня в един ред** (срещи, задачи и свободно време през работното време, с отчитане на времето за срещи, свободното време и конфликтите) и една времева линия, където срещите, задачите с време и свободните празнини са редове сами по себе си: празнината предлага да побере незапланувана задача, а това, което вече е над, се сгъва.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Бележки като карти

Карти с възможност за търсене с `#tags`, закачане в горната част и филтър за етикети с едно щракване; всяка карта показва началото на **изобразената** бележка (заглавия, контролни списъци, код, връзки), а не необработено маркиране. **WYSIWYG редактор** с компактен
лента за форматиране (удебелен, курсив, код, заглавие, списъци, контролни списъци, които отбелязвате точно в текста, кодови блокове със синтаксис
подчертаване, връзки, изображения) и преки пътища за маркиране, докато пишете (`# `, `- `, `[ ] `, ` ``` `); превключвател **MD**
показва необработената маркдаун, която все още е начинът, по който бележките се съхраняват, търсят, синхронизират и експортират. Връзките се отварят с
`Ctrl`+щракване, само http(s). Поставете, пуснете или прикачете изображения (PNG, JPEG, GIF, WebP до 2 MB), всяко запечатано в собствено
криптиран файл, показан в бележката и като миниатюри на картата; те остават на тази машина, извън `.canto`
резервни копия. Обработва хиляди бележки: списъкът е разграфен и търсенето обхваща всички тях.

</td>
</tr>
<tr>
<td>

### 📋 Клипборд, който никога не забравя (или изтича)

Криптирана история с търсене и щифт; разпознава връзки, цветове и код. Задръжте курсора на мишката върху елемент, за да го **копирате пренаписан**:
JSON форматиран или компактен, текст на един ред, ГЛАВНИ или малки букви (записът в хронологията остава както е бил). Гигантско копие (дневник от 100 MB) не го прави
замразяване на всичко: запазва старта и ви предупреждава. В Windows той пропуска каквото мениджърите на пароли маркират като
чувствителен.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Вашият GitHub с един поглед

**Поискана проверка от мен**, възложена на мен, PRs и проблеми, които отворих, с PR или икона на проблем и кой е отворил
то. Чернови, PRs **очаква преглед** и PRs **застоял** за една седмица се открояват и всеки PR носи малък
**CI значка** (преминала, неуспешна, работеща или без CI) от проверките на главния комит. Когато някой **поиска вашите
преглед**, ви казва известие от операционната система (включено по подразбиране, изключете го в настройките). Филтриране по текст, `repo:` или `label:`, PRs само или само проблеми, сортиране по актуализация, създаване или коментари и
превъртете с **покажи още**. Превключете към изгледа **Коментари**, за да видите таблица **Каталог с коментатори** на всички, които са коментирали вашия PRs (аватари, значки за хора срещу ботове, брой коментари, търсене, филтър за ботове, прогресивно страници) и техните коментари. Също така поддържа **GitLab.com и самостоятелно хостван GitLab**, с 5-минутен кеш, който
спазва ограничението на скоростта. Влезте с личен токен само за четене или от браузъра (поток на устройството).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam, без да напускате джаджата

Четири подраздела за Steam: **оферти в списъка с желания** (първо най-голямата отстъпка, всяка с това, което спестява), **най-продаваните**
класиран, **играйте сега** (всяка игра Steam отчети за последните две седмици) и **каталогът, подреден по рейтинг**, разпределен
с **зареди повече**, така че да достигне останалата част от магазина. Всеки ред носи **капсулното изкуство**, **оценката на рецензията**
със собствената формулировка на Steam и колко прегледа отчита, зачеркнатата цена, цената в реали и какво
спестява отстъпка — и списъкът събира общото спестяване. Публичните списъци се нуждаят само от вашите **SteamID64**; по избор
**Steam Web API ключ** добавя скорошните игри с техните часове за игра. Разделът започва по подразбиране, на едно квадратче за отметка
в Настройки.

</td>
</tr>
<tr>
<td>

### ⚙️ Настройки и автоматични актуализации

Промяна на главната парола, архивиране на Windows Hello, `.canto`, синхронизирана папка с автоматично обединяване (Dropbox,
OneDrive, Syncthing...), започнете със системата и раздела **Актуализации**, с **инсталираната версия** и
**последните публикувани** един до друг и бутон за актуализиране и рестартиране.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Също така има 🎙️ **Срещи**, подраздел на Дневен ред до Списък и Ден: Бележки и преписи на Джемини от
последните две седмици, плюс `.vtt`, `.srt`, `.txt` и `.md` преписи от локална папка, почистени и с възможност за търсене.

🤖 **AI модели** (в лентата с раздели по подразбиране, **без API ключ или акаунт**): LLMs, класирани по
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, прочетете от неговата публична страница с класации,
с лента с резултати, създател, цена за 1 милион токени и скорост, сортирани по интелигентност, цена или скорост. Извлича при
най-много веднъж на всеки 3 часа, а опцията за включване 🔔 ви уведомява, когато a
модел **влиза в топ 10** или **се изкачва в него** (проверява се на всеки 6 часа, докато трезорът е отключен), с
"нови" и "нагоре" значки за една седмица.

🌙 **Не безпокойте:** в Настройки или в панела, заглушаване на сигнали за срещи, напомняния за задачи, сигнали за състояние и всеки
системно известие за 30 минути, 1 час, 2 часа, до утре или докато не го изключите. Показва се луна в горната лента
когато свърши; едно щракване го изключва отново. Оцелява при рестартиране и завършва сам.

🔔 **Всеки сигнал в един екран:** камбанката в заглавката (преброяване и цвят, когато нещо чака) отваря
предупреждения в целия прозорец във всеки режим: една карта на предупреждение с неговите действия, **отхвърляне на всички** и какво беше
разрешено днес под тях — без нищо чакащо, това е начинът, по който все още достигате до днешния дневник. От дока, щракване
все още отваря този единичен сигнал в горната част на нормалния прозорец.

⌨️ **Всичко чрез клавиатура:** `Alt+1`…`Alt+7` превключване на раздели, `N` създаване, `/` търсения, `F11` цял екран, `Alt+L`
заключва и `?` изброява преките пътища. `Ctrl+Shift+P` (`Cmd+Shift+P` на macOS) отваря **командна палитра** с всеки
действие по име: отидете на раздел, нова задача или бележка, присъединете се към следващата среща, копирайте резюмето за деня, превключете кожата, заключване.

## 🎨 Шест скина

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>По подразбиране</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Дракула</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Стъкло</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

И **Follow system**, която превключва между светло и тъмно заедно с операционната система. Всички преминават AA контраст.

<details>
<summary>🖥️ Още екрани: адаптиране, глобално търсене, командна палитра, GitLab, подзадачи, редактор на бележки, сигурност, синхронизиране, плътност и още</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Първоначално добре дошли | Глобално търсене (`Ctrl+K`) | Самостоятелно хостван раздел GitLab | Предупреждение за среща |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Задача с подзадачи, приоритет и PR | Редактор на бележки | Още типове клипборд | Сигурност: автоматично заключване и отключване |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Синхронизирана папка | Компактна плътност | Заключен трезор | Свържете GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Настройки в групи, с търсене | Търсене филтрира групите | Офлайн чип в заглавката | Потвърдете, преди да изчистите клипборда |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Отхвърляне на незаписана чернова на бележка |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Режими: Мини, Скрит, Нормален, Максимизиран | Мини режим: предупреждения по ръба на екрана |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Щракнете върху предупреждение в дока | Увеличен: целият прозорец за отворения раздел |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Камбанката отваря известията в целия прозорец |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Мини: менюто за режим се отваря в докинг прозореца |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Раздели, които не се побират, чакат в меню „още“ |
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

| Игри и цял екран: известията чакат, докато напуснете |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Отлагане: 1, 5 или 10 минути |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Напомняне за задача | Промяна на главната парола | Статус API (раздел за включване) | Език: английски, португалски или испански |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Копиране на пренаписан клип | Предупреждение за среща с подготовка |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Редизайн: раздела Задачи, преди и след |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Редизайн: всеки раздел, преди (отгоре) и след (отдолу) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI се провали със счупените задачи | Някой ме спомена | Техните превключватели в Настройки |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Споменаване на предупреждение с кой го е написал |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Предупреждение за споменаване с преглед на текста |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Още сигнали за собствената ми работа |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Обобщен сигнал за деня | Обобщена настройка за деня |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Подраздел Споменавания (GitHub и GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Паролата е променена, един файл чака | Резюме за деня |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Седмичен отчет | Дневен ред: следващо свободно време и конфликти |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Дневен ред: безплатно в момента | Палета с команди (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Не безпокойте | Изображение в бележка |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI значка на всеки PR | Преглед на известията за заявки |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Отбележете изображения като миниатюри | WYSIWYG редактор на бележки |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Редактор на бележки: необработено намаление (MD) | Редактор на бележки върху светлата кожа |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Задачи: приоритет на реда, обвиване на дълги заглавия | Списък с бележки с рендирана маркдаун |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI модели, класирани по индекса на интелигентността |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: най-продаваните, номерирани | Steam: последните пет изиграни игри, с двете времена за игра |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: каталогът по рейтинг, с "зареди още" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Едно наслагване за предупреждение за всичко чакащо: прекъсвания, срещи, задачи и нови AI модели |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Моите крайни точки: плочки с най-новата латентност | Отворена крайна точка: диаграма на латентност, ограничения и настройки за предупреждение | Добавяне на DNS + проверка на сертификат |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Дневен ред за всеки ден: стрелки за предишен и следващ, инструмент за избор на дата и бутон за връщане към днешния ден |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Задачи: текущата задача с таймер и групиран списък | GitHub: обобщена лента над списъците | GitLab: същата лента, без CI плочката |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Таймерът за фокусиране е фиксиран под всеки раздел | Дневен ред като ден, задачи до срещи |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Дневен изглед: припокриващите се събития споделят ширината едно до друго |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Преглед на радар: първо най-старата заявка, просрочена в червено, отлагане |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Срещи като подраздел на дневния ред, до Списък и Ден |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Раздел за активност (изключен по подразбиране) | Резюме с фокусирано време и затворен PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Раздел активност, последните 7 дни | Раздел за активност, изключен | Раздел за активност в широк прозорец |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Разделът **Активност** започва скрит (включете го в Настройки → видими раздели). Той записва само името на
фокусирано приложение, докато използвате компютъра, в запечатан локален файл, който никога не достига до резервни копия или синхронизиране (Wayland
не може да отчете фокусирания прозорец, така че той остава недостъпен там). Изключено, докато не се включите и първият екран каже какво
се пази и това, което никога не е.

- **Ден**: поничка по категория с общата сума вътре, чиято легенда крие категория, промяната спрямо деня
преди и времето на неактивност (без клавиатура или мишка за 2 минути). Под него ежедневна цел с фокус върху кода със своята серия и
една точка на ден, три акцента (най-дългият участък в едно приложение, превключване на приложения, пиков час), времева линия, където цялата
ден, бездействието се удължава и най-натоварените приложения споделят една времева ос с маркер „сега“ и списък с приложения
(докоснете едно, за да промените категорията му) или от задачите, върху които е работил таймерът за фокусиране.
- **Седмица**: подредени колони на ден със средна линия и точка под всеки ден, който е изпълнил целта, часова топлинна карта
с вашия пик и същите списъци за цялата седмица.
- **Оформление и кожи**: една колона в прозореца по подразбиране, две, когато е широк (увеличен); всяка кожа има своя собствена
категория цветове, проверени за контраст. Менюто до деня го копира като текст.

<sub>Всички екранни снимки използват измислени данни.</sub>

## ⚖️ В сравнение с това, което е там

Нито един от изследваните инструменти не покрива повече от два от тези фронтове наведнъж. Източници и подробности в
[docs/benchmark.md](docs/benchmark.md).

| | Задачи + напомняне | Бележки | Клипборд | Срещи | GitHub | Локално криптиране по подразбиране |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Обсидиан / Джоплин | ➖ | ✅ | — | — | — | ➖ само синхронизиране |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Същото | — | — | ✅ | — | — | ➖ по избор |
| MeetingBar | — | — | — | ✅ | — | няма |
| Gitify | — | — | — | — | ✅ | няма |

<sub>✅ родно · ➖ частично, чрез разширение или по избор · — няма · ? непубликуван · n/a не съхранява потребителски данни</sub>

Какво донесе бенчмаркът тук: **време точно в заглавието на задачата** (Todoist/TickTick), **отлагане на аларма**
(TickTick) и **клипборд, който зачита мениджърите на пароли** (CopyQ/Ditto).

## ⬇️ Инсталирайте

Изтеглете инсталатора за вашата платформа от **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Система | Файл |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (препоръчително) или `.msi` |
| 🍎 macOS | `.dmg` за Apple Silicon или Intel |
| 🐧 Linux | `.AppImage`, `.deb` или `.rpm` |

1. При първото стартиране създавате **главната парола**. Няма възстановяване: загубете паролата, загубете данните.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` на macOS) показва и скрива изпълнимия модул.
3. Готово. Когато се доставя нова версия, Canto ви уведомява и **Настройки → Актуализации** се актуализира с едно щракване.

> [!ЗАБЕЛЕЖКА]
> Инсталаторите все още не са подписани с код: SmartScreen (Windows) и Gatekeeper (macOS) предупреждават при първото стартиране.
> Автоматичните актуализации се проверяват спрямо собствения подпис на проекта преди стартиране.

Готови манифести за winget и Homebrew (плюс скелет за Flatpak, понастоящем блокиран) живеят в
[`packaging/`](packaging/README.md) — подготвен и проверен локално, но все още не е публикуван за тези
хранилища: публикуването е ръчно решение и действие от поддържащия.

## 🔒 Сигурността с един поглед

| Слой | Защита |
|---|---|
| Трезор | Argon2id (19 MiB, t=2) → AES-256-GCM, нов nonce при всяко записване, атомарно писане с `fsync` |
| Ключ | Само RAM, нулиран при заключване; конфигурируемо автоматично заключване (5 до 60 минути неактивен, 15 минути по подразбиране) |
| Мрежа | само процесът Rust говори с мрежата; уеб изгледът няма отдалечен произход (CSP) и никога не вижда токени |
| Google | по избор, само `calendar.events.readonly`, `directory.readonly` (снимки на колеги от Workspace в списъка с гости) плюс профил, OAuth с PKCE и loopback |
| GitHub | незадължителен, криптиран токен; елементите се отварят само ако връзката е `https://github.com/` |
| GitLab | незадължителен, криптиран адрес и токен; Само `https://`, без пренасочвания, връзки само от конфигурирания екземпляр |
| Актуализации | инсталира само пакет, подписан от ключа на проекта; подправено изтегляне се отхвърля преди стартиране |

Пълен модел, архивиране, сливане между машини и къде се намира всеки файл: [docs/seguranca.md](docs/seguranca.md).
Открихте недостатък? [SECURITY.md](SECURITY.md).

## 📚 Документация

| Документ | Какво има в него |
|---|---|
| 📖 [User guide](docs/uso.md) | раздели, повтарящи се задачи, преки пътища, кожи, достъпност, прозорец, актуализации и стартиране със системата |
| 🔌 [Integrations](docs/integracoes.md) | Google дневен ред и GitHub (личен токен или поток на устройство) |
| 🛡️ [Security and data](docs/seguranca.md) | модел на заплаха, `.canto` архивиране, сливане, промяна на парола, файлове на диск |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify и обемни тестове |
| 📝 [CHANGELOG](CHANGELOG.md) | какво се промени във всяка версия |
| 🤝 [How to contribute](CONTRIBUTING.md) | среда, тестове, PRs и как да публикувате версия |
| 🤖 [Agent guide](AGENTS.md) | договори и капани за всеки, който редактира кода с AI |

## 🛠️ Разработка

Необходими условия: [Bun](https://bun.sh) ≥ 1.2, стабилен Rust ≥ 1.85 и
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) за вашата система.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Уеб изгледите се създават след състояние Rust и треят се инициализира, така че IPC повикванията при стартиране не могат да се състезават при настройка.

Всеки PR изпълнява CI на Windows, macOS и Linux. Конвенционалните `fix`, `feat` и нарушаващите задълженията са обединени в `main`
вземете SemVer таг, генерирани бележки за изданието и подписани инсталатори, изградени паралелно; съобщението се публикува след проверка (подробности в
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Лиценз

[MIT](LICENSE) © Антонио Карлос

<div align="center"><sub>Направено с 🦀 Rust, ⚛️ React и ☕ за тези, които живеят между срещите.</sub></div>
