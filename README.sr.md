<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · **Српски** · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Задаци са подсетницима, белешкама, историјом клипборда, дневним редом са обавештењима о састанцима, транскриптима и вашим GitHub PRs
> у малом прозору закаченом за угао екрана.** Појављује се са `Ctrl+Alt+Space`, сакрива се када вам није потребно
> и чува све шифровано на вашој машини, без налога и сервера.

## 🌐 Језици

Canto нуди **42 језика интерфејса**, од којих сваки има сопствени РЕАДМЕ. Изаберите свој у **Подешавања → Језик**;
бирач за претрагу користи називе матерњег језика, а аутоматски режим прати ваш примарни системски језик.
Арапски, хебрејски и персијски користе текст с десна на лево. Додатни каталози језика се учитавају на захтев.

40 нових каталога интерфејса и 31 нови РЕАДМЕ превод су машински преводи и нису били
прегледали изворни говорници. Португалски и енглески остају оригинални каталози интерфејса. Налепнице за лежиште и
наслови обавештења прате изабрани језик; неки детаљи упозорења о интеграцији се враћају на енглески,
а грешке у позадини остају на португалском. Синтакса наслова задатка задржава постојеће португалске и енглеске кључне речи.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Зашто Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ако живите између састанака, PRs и малих ставки на чекању, на крају ћете имати пет отворених апликација. Canto ставља све
једно место.

🔒 **Подразумевано шифровано.** Argon2id + AES-256-GCM са главном лозинком; кључ увек постоји само у РАМ-у.
Windows Hello опционо.

🏠 **Ваши подаци остају са вама.** Нема телеметрије, нула сервера, налог није потребан. Резервна копија је једноструко шифрована
`.canto` датотека.

⏰ **Нећете га пропустити.** 1 минут пре састанка и у време подсетника, виџет се појављује, пушта звук и
шаље обавештење, са **одложи 10 мин**.

🪶 **Лигхт.** Tauri в2 (Rust + системски веб-приказ) уместо Electron: инсталатер од 3,5 МБ.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Увек ажурно.** Ажурира се из апликације и инсталира само оно што је потписано сопственим кључем пројекта.

</td>
</tr>
</table>

## 🧰 Карактеристике

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Задаци који вас подсећају

Дневна контролна листа са временом и понављањем (сваког дана, радним данима или седмично). Унесите **`Daily at 9:30am`** и
подсетник је већ подешен; додајте **`!high`** (или `!alta`, `!média`, `!baixa`) за приоритет или кликните на тачку у реду да бисте га циклирали. Дуги наслови се умотавају уместо да буду одсечени. **Фокусирајте тајмер** на било који задатак: дајте му процену, притисните ▶ и трака закачена испод сваке картице рачуна време према њему (црвена када пређете); време се чува у трезору сваког минута. **Дневни резиме** спреман за лепљење (задаци, фокусирано време, састанци са укупним временом, PRs/MRs отворен, спојен, прегледан и затворен без спајања), **недељни и месечни извештај** са смањењем вредности и **повлачење ставки на чекању** од јуче.

</td>
</tr>
<tr>
<td>

### 📅 Састанак почиње? То ти говори.

Придружите се следећем састанку са `Ctrl+Alt+M` (`Ctrl+Cmd+M` на мацОС-у). Ако регистрација не успе, Canto покушава
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` на мацОС-у); мени траке остаје доступан ако оба нису доступна.

Данашњи догађаји потичу из Google календара (само за читање). Минут пре тога, виџет скаче на екран са
**придружите се Meet**, пушта звук и шаље системско обавештење, на којој год картици да се налазите или чак и ако је скривена.
Свака картица приказује значку са вашим одговором (прихваћено, можда, одбијено, чекање). Кликните на догађај да видите ко је организовао
то, дневни ред, сваки гост са иницијалима аватара и њиховим одговором, и прилозима, попут Близанаца.
Горња линија вам говори **следећи бесплатни термин** од најмање 15 минута (одбијени позиви и целодневни догађаји не
цоунт), а догађаји који се преклапају добијају значку **конфликт** која именује други догађај. Приказ **Данас** води до састанка у току (преостало време, дугме за придруживање, упозорење о сукобу) или следећег, затим **дан у једном реду** (састанци, задаци и слободно време током радног времена, рачунајући време састанка, слободно време и сукоби) и једна временска линија на којој су састанци, задаци са временом и слободним празнинама редови сами по себи, а оно што је удаљено је већ преклопљено.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒 Белешке као картице

Картице које се могу претраживати са `#tags`, закачењем на врх и филтером ознака једним кликом; свака картица приказује почетак **рендероване** белешке (наслови, контролне листе, код, везе), а не необрађено смањење. **ВИСИВИГ уређивач** са компакт
трака за форматирање (подебљано, курзив, код, наслов, листе, контролне листе које означите директно у тексту, блокови кода са синтаксом
истицање, везе, слике) и пречице за смањење док куцате (`# `, `- `, `[ ] `, ` ``` `); **МД** прекидач
приказује сирово смањење, што је и даље начин на који се белешке чувају, претражују, синхронизују и извозе. Везе се отварају са
`Ctrl`+клик, само хттп(с). Налепите, испустите или приложите слике (ПНГ, ЈПЕГ, ГИФ, ВебП до 2 МБ), свака запечаћена за себе
шифрована датотека, приказана унутар белешке и као сличице на картици; они остају на овој машини, изван `.canto`
резервне копије. Рукује хиљадама белешки: листа је страница и претрага покрива све њих.

</td>
</tr>
<tr>
<td>

### 📋 Међуспремник који никада не заборавља (или цури)

Шифрована историја са претрагом и пин; препознаје везе, боје и код. Пређите показивачем миша на ставку да бисте је **копирали поново написану**:
ЈСОН форматиран или компактан, текст у једном реду, ВЕЛИКА или мала слова (унос историје остаје исти као што је био). Огромна копија (лог од 100 МБ) не
замрзните било шта: задржава старт и упозорава вас. На Виндовс-у прескаче све што менаџери лозинки означе као
осетљива.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Ваш GitHub на први поглед

**Затражен је преглед од мене**, додељен мени, PRs и проблеми које сам отворио, са PR иконом проблема и ко је отворио
то. Нацрти, PRs **чекају вашу рецензију** и PRs **заустављен** недељу дана се истичу, а сваки PR носи мали
**Значка ЦИ** (положен, неуспешан, покренут или без ЦИ) из провера главног урезивања. Када неко **затражи ваше
прегледа**, обавештење о ОС-у вам каже (подразумевано укључено, искључите га у подешавањима). Филтрирајте по тексту, `repo:` или `label:`, PRs само или само по проблемима, сортирајте према ажурирању, креирању или коментарима и
скролујте са **прикажи више**. Такође подржава **GitLab.цом и самостално хостован GitLab**, са 5-минутним кешом који
поштује ограничење стопе. Пријавите се помоћу личног токена само за читање или из прегледача (ток уређаја).

</td>
</tr>
<tr>
<td>

### ⚙ Подешавања и аутоматска ажурирања

Промена главне лозинке, резервна копија Windows Hello, `.canto`, синхронизовани директоријум са аутоматским спајањем (Дропбок,
ОнеДриве, Синцтхинг...), почните са системом и одељком **Ажурирања**, са **инсталираном верзијом** и
**најновији објављен** један поред другог и дугме за ажурирање и поновно покретање.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Такође има 🎙 **Састанци**, подкартицу дневног реда поред Листа и дан: белешке и транскрипти Близанаца са
последње две недеље, плус транскрипти `.vtt`, `.srt`, `.txt` и `.md` из локалног фолдера, очишћени и претраживи.

🤖 **АИ модели** (на траци са картицама подразумевано, **нема кључа или налога API**): ЛЛМ рангирани према
[Artificial Analysis](https://artificialanalysis.ai) **Индекс интелигенције**, прочитан са његове јавне странице са најбољим резултатима,
са траком резултата, креатором, ценом по 1М токена и брзином, која се може сортирати према интелигенцији, цени или брзини. Доноси на
најчешће једном свака 3 сата, а опција за пријаву 🔔 вас обавештава када а
модел **улази у првих 10** или **пење унутар њега** (проверава се сваких 6 сати док је трезор откључан), са
"нове" и "горе" значке за недељу дана.

🌙 **Не узнемиравај:** у подешавањима или на траци, утишајте обавештења о састанцима, подсетници за задатке, обавештења о статусу и сваки
системско обавештење на 30 мин, 1 х, 2 х, до сутра или док га не искључите. Приказује се месец у горњој траци
када се заврши; једним кликом се поново искључује. Преживљава поновно покретање и завршава се сам.

⌨ **Све помоћу тастатуре:** `Alt+1`…`Alt+7` мења картице, `N` креира, `/` претраге, `F11` цео екран, `Alt+L`
закључава и `?` наводи пречице. `Ctrl+Shift+P` (`Cmd+Shift+P` на мацОС-у) отвара **командну палету** са сваким
радња по имену: идите на картицу, нови задатак или белешку, придружите се следећем састанку, копирајте резиме дана, промените кожу, закључајте.

## 🎨 Пет скинова

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Подразумевано</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Хуецо Мундо</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Драцула</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Лигхт</b></td>
</tr>
</table>

И **Систем за праћење**, који заједно са оперативним системом пребацује између светлих и тамних. Сви пролазе АА контраст.

<details>
<summary>🖥 Још екрана: укључење, глобална претрага, палета команди, GitLab, подзадаци, уређивач белешки, безбедност, синхронизација, густина и још много тога</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| Добродошли у први мах | Глобална претрага (`Ctrl+K`) | Картица GitLab самостално хостована | Упозорење о састанку |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Задатак са подзадацима, приоритет и PR | Уредник белешки | Више типова међуспремника | Сигурност: аутоматско закључавање и откључавање |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Синхронизована фасцикла | Збијена густина | Лоцкед трезор | Повежи GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Режими: Мини, Хидден, Нормал, Макимизед | Мини режим: упозорења на ивици екрана |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Кликните на упозорење на доку | Максимално: задаци и обавештења, са разделником који се може превући |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| Мини: мени режима се отвара унутар док прозора |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Картице које се не уклапају чекају у менију „више“ |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Игре и цео екран: упозорења чекају док не одете |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Одлагање: 1, 5 или 10 мин |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Подсетник за задатак | Промени главну лозинку | Статус API (картица за укључивање) | Језик: енглески или португалски |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Копирај клип преписан | Упозорење о састанку са припремом |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Редизајн: картица Задаци, пре и после |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Редизајн: свака картица, пре (горе) и после (доле) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| ЦИ није успео, са прекинутим пословима | Неко ме је поменуо | Њихови прекидачи у подешавањима |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: CI failed, PR without a review for 24, 48 or 72 hours, and mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Лозинка је промењена, једна датотека је на чекању | Резиме дана |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Недељни извештај | Дневни ред: следеће слободно време и сукоби |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Дневни ред: бесплатно одмах | Командна палета (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Не узнемиравај | Слика у белешци |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| ЦИ значка на сваком PR | Прегледајте обавештења о захтевима |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Забележите слике као сличице | ВИСИВИГ уређивач белешки |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Уређивач белешки: сирова маркдовн (МД) | Уређивач белешки на светлој кожи |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Задаци: приоритет у реду, премотавање дугих наслова | Листа белешки са приказаним смањењем |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| АИ модели рангирани према Индексу интелигенције |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Једно преклапање упозорења за све на чекању: прекиде, састанке, задатке и нове АИ моделе |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Моје крајње тачке: плочице са најновијим кашњењем | Отворена крајња тачка: графикон кашњења, ограничења и подешавања упозорења | Додавање провере DNS + сертификата |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Дневни ред за било који дан: стрелице за претходни и следећи, бирач датума и дугме за повратак на данас |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Задаци: тренутни задатак са тајмером и груписаном листом | GitHub: трака са резимеом изнад листа | GitLab: иста трака, без ЦИ плочице |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Тајмер фокуса је закачен испод сваке картице | Дневни ред као дан, задаци поред састанака |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Дневни приказ: догађаји који се преклапају деле ширину један поред другог |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Прегледни радар: најстарији захтев први, касни у црвеном, одложи |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Састанци као подкартица дневног реда, поред Листа и Дан |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Картица Активности (подразумевано искључено) | Резиме са фокусираним временом и затвореним PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Картица активности, последњих 7 дана | Картица Активности, искључена | Картица активности на широком прозору |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Картица **Активност** почиње сакривена (укључите је под Подешавања → видљиве картице). Записује само име
фокусирану апликацију док користите рачунар, у запечаћеној локалној датотеци која никада не стиже до резервних копија или синхронизације (Ваиланд
не може да пријави фокусирани прозор, тако да остаје недоступан тамо). Искључено док се не укључите, а први екран каже шта
чува се и што никад није.

- **Дан**: крофна по категорији са укупном унутрашњошћу, чија легенда скрива категорију, промену у односу на дан
пре и време мировања (без тастатуре или миша 2 минута). Испод њега, дневни циљ са фокусом на код са својим низом и
једна тачка дневно, три нагласка (најдужи период у једној апликацији, пребацивање апликација, вршни сат), временска линија на којој се
дан, време мировања се продужава и најпрометније апликације деле једну временску осу са маркером „сада“ и листом апликација
(тапните на један да бисте променили његову категорију) или од задатака на којима је радио тајмер фокуса.
- **Недеља**: наслагане колоне по дану са просечном линијом и тачком испод сваког дана који је испунио циљ, једночасовна топлотна мапа
са својим врхунцем, и исте листе за целу недељу.
- **Лаиоут и скинови**: једна колона у подразумеваном прозору, две када је широк (максимизиран); свака кожа има своје
боје категорије, проверени контраст. Мени поред дана га копира као текст.

<sub>Сви снимци екрана користе фиктивне податке.</sub>

## ⚖ У поређењу са оним што постоји

Ниједан од истражених алата не покрива више од два ова фронта одједном. Извори и детаљи у
[docs/benchmark.md](docs/benchmark.md).

| | Задаци + подсетник | Нотес | Цлипбоард | Састанци | GitHub | Локално шифровање подразумевано |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Тодоист / ТицкТицк | ✅ | ➖ | — | — | — | — |
| Обсидиан / Јоплин | ➖ | ✅ | — | — | — | ➖ само синхронизација |
| Раицаст | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| ЦопиК / Исто | — | — | ✅ | — | — | ➖ опционо |
| МеетингБар | — | — | — | ✅ | — | н/а |
| Гитифи | — | — | — | — | ✅ | н/а |

<sub>✅ изворно · ➖ делимично, преко проширења или опционо · — ниједно · ? необјављено · н/а не чува корисничке податке</sub>

Шта је референтна вредност донела овде: **тачно време у наслову задатка** (Тодоист/ТицкТицк), **одложите упозорење**
(ТицкТицк) и **међуспремник који поштује менаџере лозинки** (ЦопиК/Дитто).

## ⬇ Инсталирај

Преузмите инсталациони програм за своју платформу са **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Систем | Филе |
|---|---|
| 🪟 Виндовс 10/11 | `Canto_x.y.z_x64-setup.exe` (препоручено) или `.msi` |
| 🍎 мацОС | `.dmg` за Аппле Силицон или Интел |
| 🐧 Линук | `.AppImage`, `.deb` или `.rpm` |

1. Приликом првог покретања креирате **главну лозинку**. Нема опоравка: изгубите лозинку, изгубите податке.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` на мацОС-у) приказује и сакрива виџет.
3. Готово. Када се нова верзија пошаље, Canto вас обавештава, а **Подешавања → Ажурирања** се ажурира једним кликом.

> [!НОТЕ]
> Инсталациони програми још увек нису потписани кодом: СмартСцреен (Виндовс) и Гатекеепер (мацОС) упозоравају при првом покретању.
> Аутоматско ажурирање се верификује према сопственом потпису пројекта пре покретања.

Готови манифести за вингет и Хомебрев (плус скелет за Флатпак, тренутно блокиран) живе у
[`packaging/`](packaging/README.md) — припремљено и потврђено локално, али још није објављено за њих
репозиторијуми: објављивање је ручна одлука и радња од стране одржаваоца.

## 🔒 Сигурност на први поглед

| Лаиер | Заштита |
|---|---|
| Ваулт | Argon2id (19 МиБ, т=2) → AES-256-GCM, ново једнократно писање при сваком упису, атомско писање са `fsync` |
| Кеи | Само РАМ, нулирано при закључавању; конфигурабилно аутоматско закључавање (5 до 60 мин мировања, 15 мин подразумевано) |
| Мрежа | само Rust процес разговара са мрежом; веб-приказ нема удаљено порекло (ЦСП) и никада не види токене |
| Google | опционо, само `calendar.events.readonly`, `directory.readonly` (фотографије колега са радног простора на листи гостију) плус профил, OAuth са PKCE и повратном петљом |
| GitHub | опциони, шифровани токен; ставке се отварају само ако је веза `https://github.com/` |
| GitLab | опциона, шифрована адреса и токен; `https://` само, без преусмеравања, везе само из конфигурисане инстанце |
| Ажурирања | инсталира само пакет потписан кључем пројекта; неовлаштено преузимање се одбацује пре покретања |

Комплетан модел, резервна копија, спајање на машинама и где свака датотека живи: [docs/seguranca.md](docs/seguranca.md).
Нашли сте грешку? [SECURITY.md](SECURITY.md).

## 📚 Документација

| Документ | Шта је у њему |
|---|---|
| 📖 [User guide](docs/uso.md) | картице, задаци који се понављају, пречице, скинови, приступачност, прозор, ажурирања и почните са системом |
| 🔌 [Integrations](docs/integracoes.md) | Google агенда и GitHub (лични токен или ток уређаја) |
| 🛡 [Security and data](docs/seguranca.md) | модел претње, `.canto` резервна копија, спајање, промена лозинке, датотеке на диску |
| 📊 [Benchmark](docs/benchmark.md) | Тодоист, ТицкТицк, Обсидиан, Јоплин, Раицаст, ПоверТоис, ЦопиК, Дитто, МеетингБар, Гитифи и тестови запремине |
| 📝 [CHANGELOG](CHANGELOG.md) | шта се променило у свакој верзији |
| 🤝 [How to contribute](CONTRIBUTING.md) | окружење, тестови, PRs и како објавити издање |
| 🤖 [Agent guide](AGENTS.md) | уговоре и замке за свакога ко уређује код помоћу АИ |

## 🛠 Развој

Предуслови: [Bun](https://bun.sh) ≥ 1.2, стабилно Rust ≥ 1.85 и
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) за ваш систем.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Сваки PR покреће ЦИ на Виндовс, мацОС и Линук. Конвенционалне `fix`, `feat` и урезивања за кршење спојени су у `main`
набавите СемВер ознаку, генерисане белешке о издању и потписане инсталатере изграђене паралелно; издање се објављује након верификације (детаљи у
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Лиценца

[MIT](LICENSE) © Антонио Царлос

<div align="center"><sub>Направљено са 🦀 Rust, ⚛ React и ☕ за оне који живе између састанака.</sub></div>
