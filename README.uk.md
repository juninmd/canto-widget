<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · **Українська** · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Завдання з нагадуваннями, нотатками, історією буфера обміну, порядком денним зі сповіщеннями про зустрічі, стенограмами та вашими GitHub PRs
> у маленькому вікні, закріпленому в кутку екрана.** Вискакує з `Ctrl+Alt+Space`, ховається, коли вам не потрібно
> він і зберігає все зашифроване на вашій машині без облікового запису та сервера.

## 🌐 Мови

Canto пропонує **42 мови інтерфейсу**, кожна зі своїм README. Виберіть свою в **Налаштування → Мова**;
засіб вибору з можливістю пошуку використовує назви рідною мовою, а автоматичний режим відповідає вашій основній системній мові.
Арабська, іврит і перська використовують текст справа наліво. Додаткові мовні каталоги завантажуються на вимогу.

40 нових каталогів інтерфейсів і 31 новий переклад README є машинним перекладом і не були
рецензували носії мови. Португальська та англійська мови залишаються оригінальними каталогами інтерфейсу. Етикетки для лотків і
заголовки повідомлень слідують за вибраною мовою; деякі деталі сповіщень інтеграції повертаються англійською мовою,
і серверні помилки залишаються португальською мовою. Синтаксис назви завдання зберігає наявні ключові слова португальською та англійською мовами.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Чому Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Якщо ви живете між зустрічами, PRs і невеликими незавершеними елементами, у вас буде відкрито п’ять програм. Canto містить все це
одне місце.

🔒 **Зашифровано за замовчуванням.** Argon2id + AES-256-GCM з головним паролем; ключ існує лише в оперативній пам'яті.
Windows Hello необов’язковий.

🏠 **Ваші дані залишаються з вами.** Нульова телеметрія, нульовий сервер, обліковий запис не потрібен. Резервне копіювання є єдиним зашифрованим
`.canto` файл.

⏰ **Ви не пропустите.** За 1 хвилину до зустрічі та під час нагадування віджет з’являється, відтворює звук і
надсилає сповіщення з **відкласти на 10 хв**.

🪶 **Light.** Tauri v2 (Rust + веб-перегляд системи) замість Electron: інсталятор 3,5 МБ.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Завжди в актуальному стані.** Оновлення з програми та встановлює лише те, що підписане власним ключем проекту.

</td>
</tr>
</table>

## 🧰 Особливості

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Завдання, які нагадують

Щоденний контрольний список із зазначенням часу та повторення (кожен день, будні або щотижня). Введіть **`Daily at 9:30am`** і
нагадування вже встановлено; додайте **`!high`** (або `!alta`, `!média`, `!baixa`) для пріоритету або натисніть крапку в рядку, щоб змінити його. Довгі заголовки обертаються замість того, щоб бути обрізаними. **Фокусуйте таймер** на будь-якому завданні: дайте йому оцінку, натисніть ▶, і смужка, закріплена під кожною вкладкою, відраховує час проти нього (червона, коли ви переходите); час зберігається в сховищі щохвилини. **Підсумок дня**, готовий до вставлення (завдання, зосереджений час, наради із загальним часом, PRs/MRs відкриті, об’єднані, переглянуті та закриті без об’єднання), **тижневий і місячний звіт** у розмітці та **перетягнути незавершені елементи** за вчорашній день.

</td>
</tr>
<tr>
<td>

### 📅 Зустріч починається? Це говорить вам.

Приєднуйтеся до наступної зустрічі з `Ctrl+Alt+M` (`Ctrl+Cmd+M` на macOS). Якщо реєстрація не вдається, спробує Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` на macOS); меню трея залишається доступним, якщо обидва вони недоступні.

Сьогоднішні події взято з календаря Google (лише для читання). За хвилину до цього віджет вискакує на екран із
**приєднуйтеся до Meet**, відтворює звук і надсилає системне сповіщення незалежно від того, на якій вкладці ви перебуваєте чи навіть якщо вона прихована.
На кожній картці відображається значок із вашою відповіддю (прийнято, можливо, відхилено, очікує). Натисніть подію, щоб побачити, хто її організував
це, порядок денний, кожен гість з аватаром ініціалів і їхньою відповіддю, а також вкладення, як-от нотатки Близнюка.
Верхній рядок повідомляє про **наступний вільний час** щонайменше на 15 хвилин (відхилені запрошення та події, що тривають цілий день, не
кількість), а події, які збігаються, отримують значок **конфлікту** з назвою іншої події. Перегляд **Сьогодні** веде до поточної зустрічі (залишився час, кнопка приєднання, попередження про зіткнення), потім **день в одному рядку** (зустрічі, завдання та вільний час протягом робочого часу з підрахунком часу зустрічі, вільного часу та конфліктів) і одна часова шкала, де зустрічі, завдання з часом і вільні проміжки є окремими рядками: проміжок пропонує вмістити незаплановане завдання, а те, що вже закінчилося, згортається.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Нотатки як картки

Пошукові картки з `#tags`, закріплення вгорі та фільтр тегів одним клацанням; кожна картка показує початок нотатки, **відтвореної** (заголовки, контрольні списки, код, посилання), а не необроблену розмітку. **Редактор WYSIWYG** із компактним
панель форматування (жирний, курсив, код, заголовок, списки, контрольні списки, які ви відмічаєте прямо в тексті, блоки коду з синтаксисом
підсвічування, посилання, зображення) і швидкі клавіші розмітки під час введення (`# `, `- `, `[ ] `, ` ``` `); перемикач **MD**
показує необроблену розцінку, за якою все ще зберігаються, шукаються, синхронізуються та експортуються нотатки. Посилання відкриваються за допомогою
`Ctrl`+клацніть, лише http(s). Вставте, перетягніть або прикріпіть зображення (PNG, JPEG, GIF, WebP до 2 МБ), кожне запечатане окремо
зашифрований файл, показаний у нотатці та у вигляді мініатюр на картці; вони залишаються на цій машині поза `.canto`
резервні копії. Обробляє тисячі нотаток: список розгорнутий, і пошук охоплює їх усі.

</td>
</tr>
<tr>
<td>

### 📋 Буфер обміну, який ніколи не забуває (або не витікає)

Зашифрована історія з пошуком і PIN-кодом; розпізнає посилання, кольори та код. Наведіть курсор на елемент, щоб **скопіювати його переписаний**:
У форматі JSON або компактно, текст в одному рядку, ВЕРХНИМ або нижнім регістром (запис в історії залишається таким, як був). Гігантська копія (журнал розміром 100 МБ) цього не робить
заморозити будь-що: він зберігає старт і попереджає вас. У Windows він пропускає будь-які позначки менеджерів паролів
чутливий.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Ваш GitHub з першого погляду

**Мій запит на перевірку**, призначений мені, PRs і проблеми, які я відкрив, із значком PR або проблемою та тим, хто відкрив
це. Чернетки, PRs **очікує на ваш перегляд** і PRs **зупинено** на тиждень виділяються, і кожен PR містить невелику
**Значок CI** (пройшов, не пройшов, працює чи не CI) з перевірок головного коміту. Коли хтось **просить вас
переглянути**, сповіщає вас сповіщення ОС (за умовчанням увімкнено, вимкніть у налаштуваннях). Фільтрувати за текстом, `repo:` чи `label:`, лише PRs або лише проблеми, сортувати за оновленням, створенням чи коментарями та
прокрутіть за допомогою **показати більше**. Також підтримує **GitLab.com і GitLab** з 5-хвилинним кеш-пам’яттю, що
дотримується обмеження ставок. Увійдіть за допомогою персонального токена лише для читання або з браузера (потік пристрою).

</td>
</tr>
<tr>
<td>

### ⚙️ Налаштування та автоматичні оновлення

Зміна головного пароля, резервне копіювання Windows Hello, `.canto`, синхронізована папка з автоматичним об’єднанням (Dropbox,
OneDrive, Syncthing...), почніть із системи та розділу **Оновлення** з **встановленою версією** та
**останні опубліковані** поруч і кнопка для оновлення та перезапуску.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Також є 🎙️ **Зустрічі**, підвкладка Порядку денного поруч зі списком і днем: нотатки Джеміні та стенограми з
останні два тижні, а також стенограми `.vtt`, `.srt`, `.txt` та `.md` з локальної папки, очищені та доступні для пошуку.

🤖 **Моделі штучного інтелекту** (на панелі вкладок за замовчуванням, **немає ключа API або облікового запису**): магістратури, упорядковані за
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, читайте на його публічній сторінці таблиці лідерів,
із шкалою результатів, творцем, ціною за 1 млн токенів і швидкістю, сортування за інтелектом, ціною або швидкістю. Він отримує о
найчастіше кожні 3 години, і опція 🔔 сповістить вас, коли a
модель **входить до топ-10** або **піднімається в нього** (перевіряється кожні 6 годин, поки сховище розблоковано), з
«новий» і «вгору» значки на тиждень.

🌙 **Не турбувати:** у налаштуваннях або на панелі вимикання сповіщень про зустрічі, нагадувань про завдання, сповіщень про стан і кожного
сповіщення системи на 30 хв, 1 год, 2 год, до завтра або поки ви його не вимкнете. На верхній панелі відображається місяць
коли закінчується; один клік знову вимикає його. Він переживає перезапуск і закінчується самостійно.

⌨️ **Усе за допомогою клавіатури:** `Alt+1`…`Alt+7` перемикання вкладок, `N` створення, `/` пошук, `F11` на весь екран, `Alt+L`
блокує, а `?` перелічує ярлики. `Ctrl+Shift+P` (`Cmd+Shift+P` в macOS) відкриває **командну палітру** з кожним
дія за назвою: перейти до вкладки, нового завдання чи нотатки, приєднатися до наступної зустрічі, скопіювати підсумок дня, змінити оформлення, заблокувати.

## 🎨 П'ять скінів

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>За замовчуванням</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

І **Follow system**, яка перемикається між світлим і темним разом із ОС. Всі проходять АА контраст.

<details>
<summary>🖥️ Більше екранів: адаптація, глобальний пошук, палітра команд, GitLab, підзавдання, редактор нотаток, безпека, синхронізація, щільність тощо</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| Ласкаво просимо до першого запуску | Глобальний пошук (`Ctrl+K`) | Саморозміщена вкладка GitLab | Сповіщення про зустріч |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Завдання з підзадачами, пріоритетом і PR | Редактор нотаток | Інші типи буфера обміну | Безпека: автоматичне блокування та розблокування |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Синхронізована папка | Компактна щільність | Замкнене сховище | Підключіть GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Режими: міні, прихований, нормальний, розгорнутий | Міні-режим: сповіщення на краю екрана |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Клацніть сповіщення на панелі | Розгорнуто: завдання та сповіщення з розділювачем, який можна перетягнути |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| Міні: меню режиму відкривається у вікні док-станції |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Вкладки, які не поміщаються, очікують у меню «більше» |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Ігри та повний екран: сповіщення чекають, поки ви не підете |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Відкласти: 1, 5 або 10 хв |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Пам'ятка про завдання | Змінити головний пароль | Статус API (вкладка згоди) | Мова: англійська або португальська |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Копіювати перезаписаний кліп | Сповіщення про зустріч із підготовкою |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Редизайн: вкладка «Завдання», до та після |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Редизайн: кожна вкладка, до (верхня) і після (нижня) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI не вдалось, зі зламаними завданнями | Хтось згадав мене | Їх перемикачі в налаштуваннях |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: CI failed, PR without a review for 24, 48 or 72 hours, and mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Пароль змінено, один файл очікує | Підсумок дня |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Щотижневий звіт | Порядок денний: наступний вільний час і конфлікти |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Порядок денний: безкоштовно прямо зараз | Палітра команд (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Не турбувати | Зображення в примітці |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Значок CI на кожному PR | Перегляд сповіщень про запит |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Зверніть увагу на зображення як мініатюри | WYSIWYG редактор нотаток |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Редактор приміток: raw markdown (MD) | Редактор нот на світлій шкірі |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Завдання: пріоритет у рядку, довгі заголовки обгортання | Список приміток із відтвореною розміткою |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Моделі штучного інтелекту в рейтингу за індексом інтелекту |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Єдине накладення сповіщень для всього незавершеного: збоїв, зустрічей, завдань і нових моделей ШІ |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Мої кінцеві точки: плитки з останньою затримкою | Відкрита кінцева точка: діаграма затримки, налаштування ліміту та сповіщень | Додавання DNS + перевірка сертифіката |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Порядок денний на будь-який день: стрілки попереднього та наступного, вибір дати та кнопка повернення до сьогоднішнього дня |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Завдання: поточне завдання з таймером і згрупованим списком | GitHub: підсумкова смуга над списками | GitLab: та сама смуга, без плитки CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Перейти до таймера, закріпленого під кожною вкладкою | Порядок денний на день, завдання поруч із нарадами |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Перегляд дня: події, що накладаються, мають спільну ширину поруч |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Перегляньте радар: спочатку найстаріший запит, прострочений червоним, відкласти |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Зустрічі як підвкладка порядку денного поруч зі списком і днем ​​|
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Вкладка «Активність» (за умовчанням вимкнено) | Резюме з виділеним часом і закритим PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Вкладка активності, останні 7 днів | Вкладка активності, вимкнена | Вкладка активності у широкому вікні |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Вкладка **Активність** починає бути прихованою (увімкніть її в розділі Налаштування → видимі вкладки). У ньому записується лише назва
орієнтована програма під час використання комп’ютера в запечатаному локальному файлі, який ніколи не досягає резервних копій або синхронізації (Wayland
не може повідомити про вибране вікно, тому воно там залишається недоступним). Вимкнено, доки ви не погодитесь і на першому екрані не буде вказано, що
зберігається і те, чого ніколи не буває.

- **День**: пончик за категорією із загальною сумою всередині, легенда якої приховує категорію, зміна щодо дня
перед і час простою (без клавіатури чи миші протягом 2 хвилин). Під ним щоденна ціль із фокусом на коді з його смугою та
одна крапка на день, три основні моменти (найдовший відрізок в одній програмі, перемикання програм, година пік), шкала часу, де весь
день, період простою та найзавантаженіші програми мають спільну вісь часу з маркером «зараз» і списком програм
(торкніться одного, щоб змінити його категорію) або із завдань, на яких запустився таймер фокусування.
- **Тиждень**: накопичені стовпці на день із середньою лінією та крапкою під кожним днем, який досяг мети, година теплової карти
з вашим піком, і однакові списки на весь тиждень.
- **Макет і скіни**: один стовпець у вікні за замовчуванням, два, якщо воно широке (розгорнуте); у кожної шкіри вона своя
категорія кольорів, перевірена на контраст. Меню поруч із днем ​​копіює його як текст.

<sub>Усі знімки екрана використовують вигадані дані.</sub>

## ⚖️ Порівняно з тим, що є

Жоден із досліджених інструментів не охоплює більше двох із цих фронтів одночасно. Джерела та подробиці в
[docs/benchmark.md](docs/benchmark.md).

| | Завдання + нагадування | Примітки | Буфер обміну | Зустрічі | GitHub | Локальне шифрування за замовчуванням |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Обсидіан / Джоплін | ➖ | ✅ | — | — | — | ➖ тільки синхронізація |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Те саме | — | — | ✅ | — | — | ➖ необов'язково |
| MeetingBar | — | — | — | ✅ | — | не застосовується |
| Gitify | — | — | — | — | ✅ | не застосовується |

<sub>✅ нативний · ➖ частково, через розширення або необов’язково · — немає · ? не опубліковано · n/a не зберігає дані користувача</sub>

Тест привів сюди: **час прямо в назві завдання** (Todoist/TickTick), **відкласти сповіщення**
(TickTick) і **буфер обміну, який поважає менеджери паролів** (CopyQ/Ditto).

## ⬇️ Встановити

Завантажте інсталятор для вашої платформи з **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Система | Файл |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (рекомендовано) або `.msi` |
| 🍎 macOS | `.dmg` для Apple Silicon або Intel |
| 🐧 Linux | `.AppImage`, `.deb` або `.rpm` |

1. Під час першого запуску ви створюєте **головний пароль**. Немає відновлення: втратити пароль, втратити дані.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` на macOS) показує та ховає віджет.
3. Готово. Коли надходить нова версія, Canto сповіщає вас, а **Налаштування → Оновлення** оновлюється одним клацанням миші.

> [!ПРИМІТКА]
> Інсталятори ще не підписані кодом: SmartScreen (Windows) і Gatekeeper (macOS) попереджають під час першого запуску.
> Перед запуском автоматичні оновлення перевіряються на власний підпис проекту.

Готові маніфести для winget і Homebrew (плюс скелет для Flatpak, наразі заблокований) знаходяться в
[`packaging/`](packaging/README.md) — підготовлено та перевірено локально, але ще не опубліковано
репозиторії: публікація – це ручне рішення та дія супроводжуючого.

## 🔒 Безпека з першого погляду

| Шар | Захист |
|---|---|
| Сховище | Argon2id (19 MiB, t=2) → AES-256-GCM, свіжий nonce під час кожного запису, атомарний запис із `fsync` |
| Ключ | Лише оперативна пам'ять, обнулена при блокуванні; настроюване автоматичне блокування (від 5 до 60 хвилин бездіяльності, 15 хвилин за замовчуванням) |
| Мережа | тільки процес Rust спілкується з мережею; веб-перегляд не має віддаленого джерела (CSP) і ніколи не бачить жетони |
| Google | необов’язково, лише `calendar.events.readonly`, `directory.readonly` (фотографії колег по робочому простору в списку гостей) плюс профіль, OAuth з PKCE і loopback |
| GitHub | необов'язковий, зашифрований маркер; елементи відкриваються лише за посиланням `https://github.com/` |
| GitLab | необов'язкова, зашифрована адреса та маркер; Лише `https://`, без переспрямувань, посилання лише з налаштованого екземпляра |
| Оновлення | встановлює лише пакет, підписаний ключем проекту; підроблене завантаження відкидається перед запуском |

Повна модель, резервне копіювання, об’єднання між машинами та місце зберігання кожного файлу: [docs/seguranca.md](docs/seguranca.md).
Знайшли недолік? [SECURITY.md](SECURITY.md).

## 📚 Документація

| Документ | Що в ньому |
|---|---|
| 📖 [User guide](docs/uso.md) | вкладки, повторювані завдання, ярлики, скіни, доступність, вікно, оновлення та запуск із системою |
| 🔌 [Integrations](docs/integracoes.md) | Google порядок денний і GitHub (персональний маркер або потік пристрою) |
| 🛡️ [Security and data](docs/seguranca.md) | модель загроз, резервне копіювання `.canto`, злиття, зміна пароля, файли на диску |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify та об’ємні тести |
| 📝 [CHANGELOG](CHANGELOG.md) | що змінилося в кожній версії |
| 🤝 [How to contribute](CONTRIBUTING.md) | середовище, тести, PRs та як опублікувати випуск |
| 🤖 [Agent guide](AGENTS.md) | контракти та пастки для тих, хто редагує код за допомогою ШІ |

## 🛠️ Розвиток

Передумови: [Bun](https://bun.sh) ≥ 1.2, стабільний Rust ≥ 1.85 і
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) для вашої системи.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Кожен PR запускає CI в Windows, macOS і Linux. Звичайні `fix`, `feat` та порушення зобов’язань об’єднано в `main`
отримати тег SemVer, згенеровані примітки до випуску та підписані інсталятори, створені паралельно; реліз публікується після перевірки (подробиці в
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Ліцензія

[MIT](LICENSE) © Антоніо Карлос

<div align="center"><sub>Made with 🦀 Rust, ⚛️ React і ☕ для тих, хто живе між зустрічами.</sub></div>
