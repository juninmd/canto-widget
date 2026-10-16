<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · **עברית** · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **משימות עם תזכורות, הערות, היסטוריית לוח, סדר יום עם התראות פגישות, תמלילים וה-GitHub PRs שלך
> בחלון קטן המוצמד לפינת המסך.** קופץ עם `Ctrl+Alt+Space`, מסתיר כשלא צריך
> זה ושומר הכל מוצפן במחשב שלך, ללא חשבון וללא שרת.

## 🌐 שפות

Canto מציע **42 שפות ממשק**, כל אחת עם README משלה. בחר את שלך ב-**הגדרות → שפה**;
הבוחר הניתן לחיפוש משתמש בשמות שפות מקומיות, והמצב האוטומטי עוקב אחר שפת המערכת הראשית שלך.
ערבית, עברית ופרסית משתמשות בטקסט מימין לשמאל. קטלוגי שפות נוספים נטענים לפי דרישה.

40 קטלוגי הממשק החדשים ו-31 תרגומי README החדשים הם תרגומי מכונה ולא עברו
נבדק על ידי דוברי שפת אם. פורטוגזית ואנגלית נותרו קטלוגי הממשק המקוריים. תוויות מגשים ו
כותרות ההתראות עוקבות אחר השפה שנבחרה; כמה פרטי התראות אינטגרציה חוזרים לאנגלית,
ושגיאות עורפי נשארות בפורטוגזית. תחביר כותרת המשימה שומר על מילות המפתח הקיימות בפורטוגזית ובאנגלית.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ למה Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

אם אתה חי בין פגישות, PRs ופריטים קטנים בהמתנה, בסופו של דבר יהיו לך חמש אפליקציות פתוחות. Canto מכניס הכל
מקום אחד.

🔒 **מוצפן כברירת מחדל.** Argon2id + AES-256-GCM עם סיסמת אב; המפתח קיים רק ב-RAM.
Windows Hello אופציונלי.

🏠 **הנתונים שלך נשארים איתך.** אפס טלמטריה, אפס שרת, אין צורך בחשבון. הגיבוי הוא יחיד מוצפן
קובץ `.canto`.

⏰ **לא תפספסו את זה.** דקה אחת לפני פגישה ובזמן התזכורת, הווידג'ט צץ, משמיע צליל ו
שולח התראה, עם **נודניק 10 דקות**.

🪶 **קל.** Tauri v2 (Rust + תצוגת האינטרנט של המערכת) במקום Electron: מתקין 3.5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **תמיד מעודכן.** עדכונים מתוך האפליקציה ומתקין רק את מה שנחתם במפתח של הפרויקט עצמו.

</td>
</tr>
</table>

## 🧰 תכונות

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ משימות שמזכירות לך

רשימת בדיקה יומית עם זמן וחזרה (כל יום, ימי חול או שבוע). הקלד **`Daily at 9:30am`** וה-
reminder is already set; add **`!high`** (or `!alta`, `!média`, `!baixa`) for the priority, or click the dot on the row to cycle it. Long titles wrap instead of being cut off. **Focus timer** on any task: give it an estimate, press ▶ and a bar pinned under every tab counts the time against it (red once you go over); the time is saved to the vault every minute. **Day summary** ready to paste (tasks, focused time, meetings with total time, PRs/MRs opened, merged, reviewed and closed without merging), a **weekly and monthly report** in markdown, and **pull over pending items** from yesterday. **Quick capture** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` on macOS) jots a task or a note from any app, without opening the widget.

</td>
</tr>
<tr>
<td>

### 📅 מתחילה פגישה? זה אומר לך.

הצטרף לפגישה הבאה עם `Ctrl+Alt+M` (`Ctrl+Cmd+M` ב-macOS). אם הרישום נכשל, Canto מנסה
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` ב-macOS); תפריט המגש נשאר זמין אם שניהם אינם זמינים.

האירועים של היום מגיעים מלוח השנה Google (לקריאה בלבד). דקה אחת לפני, הווידג'ט קופץ למסך עם
**הצטרף ל-Meet**, משמיע צליל ושולח הודעת מערכת, באיזו כרטיסייה אתה נמצא או אפילו אם היא מוסתרת.
כל כרטיס מציג תג עם התשובה שלך (התקבלה, אולי, נדחתה, ממתינה). לחץ על האירוע כדי לראות מי ארגן
זה, סדר היום, כל אורח עם אווטאר של ראשי תיבות והתשובה שלו, וקבצים מצורפים, כמו ההערות של מזל תאומים.
השורה העליונה אומרת לך את **המשבצת החינמית הבאה** של לפחות 15 דקות (הזמנות שנדחו ואירועים כל היום לא
ספירה), ואירועים חופפים מקבלים תג **קונפליקט** המעניק שם לאירוע השני. תצוגת **היום** מובילה עם הפגישה בעיצומה (זמן שנותר, כפתור הצטרפות, אזהרת התנגשות) או הבאה, ואז **היום בשורה אחת** (פגישות, משימות וזמן פנוי לאורך שעות העבודה, עם זמן פגישות, זמן פנוי וקונפליקטים נספרים) וציר זמן אחד שבו פגישות, משימות עם זמן והפערים הפנויים הם שורות משל עצמן, מה שזמן פנוי כבר נסגר, זמן פנוי.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ הערות כקלפים

כרטיסים ניתנים לחיפוש עם `#tags`, הצמד למעלה ומסנן תג בלחיצה אחת; כל כרטיס מציג את ההתחלה של ההערה **מעובדת** (כותרות, רשימות ביקורת, קוד, קישורים), לא סימון גולמי. **עורך WYSIWYG** עם קומפקטי
סרגל עיצוב (מודגש, נטוי, קוד, כותרת, רשימות, רשימות תיוג שאתה מסמן ישירות בטקסט, בלוקי קוד עם תחביר
הדגשה, קישורים, תמונות) וקיצורי סימון בזמן ההקלדה (`# `, `- `, `[ ] `, ` ``` `); מתג **MD**
מציג את הסימון הגולמי, שהוא עדיין האופן שבו הערות מאוחסנות, מחפשים, מסונכרנים ומיוצאים. קישורים נפתחים עם
`Ctrl`+לחץ, http(ים) בלבד. הדבק, שחרר או צרף תמונות (PNG, JPEG, GIF, WebP עד 2 MB), כל אחת אטומה בפני עצמה
קובץ מוצפן, מוצג בתוך הפתק וכתמונות ממוזערות על הכרטיס; הם נשארים על המכונה הזו, מחוץ ל-`.canto`
גיבויים. מטפל באלפי הערות: הרשימה מדפדפת והחיפוש מכסה את כולן.

</td>
</tr>
<tr>
<td>

### 📋 לוח שאף פעם לא שוכח (או דולף)

היסטוריה מוצפנת עם חיפוש והצמדה; מזהה קישורים, צבעים וקוד. העבר את העכבר על פריט כדי **להעתיק אותו שנכתב מחדש**:
JSON בפורמט או קומפקטי, טקסט בשורה אחת, באותיות גדולות או קטנות (ערך ההיסטוריה נשאר כשהיה). עותק ענק (יומן של 100 מגה-בייט) לא
להקפיא כל דבר: זה שומר על ההתחלה ומזהיר אותך. ב-Windows, הוא מדלג על כל מה שמנהלי סיסמאות מסמנים בתור
רגיש.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 ה-GitHub שלך במבט חטוף

**ביקורת מבוקשת ממני**, שהוקצתה לי, PRs ובעיות שפתחתי, עם סמל PR או בעיה ומי פתח
זה. טיוטות, PRs **מחכים לביקורת שלכם** וPRs **נתקעו** למשך שבוע בולטות, וכל PR נושא
**תג CI** (עבר, נכשל, פועל או לא CI) מהבדיקות של ה-head commit שלו. כשמישהו **מבקש שלך
סקירה**, הודעת מערכת ההפעלה אומרת לך (מופעל כברירת מחדל, כבה אותה בהגדרות). סנן לפי טקסט, `repo:` או `label:`, PRs בלבד או בעיות בלבד, מיין לפי עדכון, יצירה או הערות, וכן
scroll with **show more**. Switch to the **Comments** view to see a **Commenters catalog** grid of everyone who commented on your PRs (avatars, human vs bot badges, comment counts, search, bot filter, progressive pagination) and their comments. Also supports **GitLab.com and self-hosted GitLab**, with a 5-minute cache that
מכבד את מגבלת התעריף. היכנס עם אסימון אישי לקריאה בלבד או מהדפדפן (זרימת מכשיר).

</td>
</tr>
<tr>
<td>

### ⚙️ הגדרות ועדכונים אוטומטיים

שינוי סיסמת אב, גיבוי Windows Hello, `.canto`, תיקיה מסונכרנת עם מיזוג אוטומטי (Dropbox,
OneDrive, Syncthing...), התחל עם המערכת ומקטע **עדכונים**, עם **הגרסה המותקנת** ו
**האחרון שפורסם** זה לצד זה וכפתור לעדכון והפעלה מחדש.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

יש גם 🎙️ **פגישות**, תת לשונית של סדר היום לצד רשימה ויום: הערות ותמלילים של מזל תאומים מ
השבועיים האחרונים, בתוספת תמלילים `.vtt`, `.srt`, `.txt` ו`.md` מתיקיה מקומית, מנוקים וניתנים לחיפוש.

🤖 **דגמי AI** (בסרגל הכרטיסיות כברירת מחדל, **ללא מפתח API או חשבון**): תכניות לימודים לתואר שני מדורגים לפי
[Artificial Analysis](https://artificialanalysis.ai) **אינדקס המודיעין**, קרא מדף ה-leaderboard הציבורי שלו,
עם סרגל ניקוד, יוצר, מחיר לכל מיליון אסימונים ומהירות, שניתן למיין לפי אינטליגנציה, מחיר או מהירות. זה מגיע בשעה
לרוב אחת ל-3 שעות, וההצטרפות 🔔 מודיעה לך כאשר א
הדגם **נכנס ל-10 המובילים** או **מטפס בתוכו** (נבדק כל 6 שעות בזמן שהכספת לא נעולה), עם
תגים "חדשים" ו"מעלה" למשך שבוע.

🌙 **אל תפריע:** בהגדרות או במגש, השתקת התראות פגישות, תזכורות משימות, התראות סטטוס וכל
הודעת מערכת למשך 30 דקות, שעה אחת, שעתיים, עד מחר או עד שתכבה אותה. ירח בסרגל העליון מראה
מתי זה נגמר; לחיצה אחת מכבה אותו בחזרה. זה שורד הפעלה מחדש ומסתיים לבד.

⌨️ **הכל לפי מקלדת:** `Alt+1`...`Alt+7` מעבר לשוניות, `N` יוצר, `/` חיפושים, `F11` מסך מלא, `Alt+L`
מנעולים ו`?` מפרט את קיצורי הדרך. `Ctrl+Shift+P` (`Cmd+Shift+P` ב-macOS) פותח **פלטת פקודות** עם כל
פעולה לפי שם: עבור לטאב, משימה או הערה חדשה, הצטרף לפגישה הבאה, העתק את סיכום היום, החלף עור, נעילה.

## 🎨 Six skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>ברירת מחדל</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>דרקולה</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>אור</b></td>
</tr>
</table>

ו-**מערכת מעקב**, שעוברת בין אור לחושך יחד עם מערכת ההפעלה. כולם עוברים ניגודיות AA.

<details>
<summary>🖥️ מסכים נוספים: כניסה, חיפוש גלובלי, פלטת פקודות, GitLab, משימות משנה, עורך הערות, אבטחה, סנכרון, צפיפות ועוד</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| ברוכים הבאים לריצה ראשונה | חיפוש גלובלי (`Ctrl+K`) | אירוח עצמי הכרטיסייה GitLab | התראת פגישה |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| משימה עם משימות משנה, עדיפות וPR | עורך הערות | סוגי לוח נוספים | אבטחה: נעילה וביטול נעילה אוטומטית |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| תיקיה מסונכרנת | צפיפות קומפקטית | כספת נעולה | חבר את GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Settings in groups, with search | Search filters the groups | Offline chip in the header | Confirm before clearing the clipboard |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Discard an unsaved note draft |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| מצבים: מיני, מוסתר, רגיל, מקסימום | מצב מיני: התראות בקצה המסך |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| לחץ על התראה ברציף | מקסימום: משימות והתראות, עם מפריד הניתן לגרירה |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| The bell opens the alerts over the whole window |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| מיני: תפריט המצבים נפתח בתוך חלון המזח |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| לשוניות שלא מתאימות מחכים בתפריט "עוד" |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| משחקים ומסך מלא: התראות מחכות עד שתעזבו |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| נודניק: 1, 5 או 10 דקות |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Task reminder | Change master password | Status API (opt-in tab) | Language: English, Portuguese or Spanish |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| העתקת קליפ שנכתב מחדש | התראת פגישה עם הכנה |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| עיצוב מחדש: הכרטיסייה משימות, לפני ואחרי |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| עיצוב מחדש: כל כרטיסייה, לפני (למעלה) ואחרי (למטה) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI נכשל, עם העבודות השבורות | מישהו הזכיר אותי | המתגים שלהם בהגדרות |
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

| הסיסמה שונתה, קובץ אחד בהמתנה | סיכום יום |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| דוח שבועי | סדר היום: הזמן הפנוי הבא ועימותים |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| סדר היום: חינם עכשיו | לוח פקודות (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| אל תפריע | תמונה בהערה |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| תג CI על כל PR | בדוק הודעות בקשות |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| שימו לב לתמונות כתמונות ממוזערות | עורך הערות WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| הערה עורך: raw markdown (MD) | עורך הערות על העור הבהיר |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| משימות: עדיפות בשורה, כותרות ארוכות עוטפות | רשימת הערות עם סימון מעובד |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| מודלים של AI מדורגים לפי אינדקס המודיעין |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| שכבת התראה אחת לכל מה שממתין: הפסקות, פגישות, משימות ודגמי AI חדשים |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| נקודות הקצה שלי: אריחים עם השהיה העדכנית ביותר | נקודת קצה פתוחה: תרשים חביון, מגבלה והתראה | הוספת DNS + בדיקת אישור |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| סדר יום של כל יום: חצים קודמים ואחרים, בורר תאריכים וכפתור חזרה להיום |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| משימות: המשימה הנוכחית עם טיימר ורשימה מקובצת | GitHub: רצועת סיכום מעל הרשימות | GitLab: אותה רצועה, ללא אריח ה-CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| טיימר מיקוד מוצמד מתחת לכל כרטיסייה | סדר יום כיום, משימות לצד פגישות |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| תצוגת יום: אירועים חופפים חולקים את הרוחב זה לצד זה |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| בדיקת רדאר: הבקשה הישנה ביותר תחילה, באיחור באדום, נודניק |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| פגישות כטאב משנה של סדר היום, לצד רשימה ויום |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| כרטיסיית פעילות (כבויה כברירת מחדל) | סיכום עם זמן ממוקד וסגור PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| כרטיסיית פעילות, 7 הימים האחרונים | כרטיסיית פעילות, כבויה | לשונית פעילות בחלון רחב |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

הכרטיסייה **פעילות** מתחילה מוסתרת (הפעל אותה תחת הגדרות ← כרטיסיות גלויות). הוא רושם רק את השם של
יישום ממוקד בזמן שאתה משתמש במחשב, בקובץ מקומי אטום שלעולם לא מגיע לגיבויים או לסנכרון (Wayland
לא יכול לדווח על החלון הממוקד, אז הוא נשאר לא זמין שם). כבוי עד שאתה מצטרף, והמסך הראשון אומר מה
נשמר ומה שלעולם אין.

- **יום**: סופגניה לפי קטגוריה עם סך הכל בפנים, שהאגדה שלה מסתירה קטגוריה, השינוי מול היום
לפני וזמן הסרק (ללא מקלדת או עכבר למשך 2 דקות). מתחתיו, יעד יומי של מיקוד קוד עם הרצף שלו ו
נקודה אחת ליום, שלושה דגשים (המתיחה הארוכה ביותר באפליקציה אחת, מתגי אפליקציה, שעת שיא), ציר זמן שבו כל
ביום, הסרק נמתח והאפליקציות העמוסות ביותר חולקות ציר זמן אחד עם סמן "עכשיו" ורשימת יישומים
(הקש על אחד כדי לשנות את הקטגוריה שלו) או מהמשימות שבהן רץ טיימר המיקוד.
- **שבוע**: עמודות מוערמות ליום עם הקו הממוצע ונקודה מתחת לכל יום שעמד ביעד, מפת חום של שעה
עם השיא שלך, ואותן רשימות לכל השבוע.
- **פריסה ועורות**: עמודה אחת בחלון ברירת המחדל, שתיים לאחר שהיא רחבה (מקסימום); לכל עור יש את שלו
צבעי קטגוריה, מסומנים עבור ניגודיות. התפריט שליד היום מעתיק אותו כטקסט.

<sub>כל צילומי המסך משתמשים בנתונים פיקטיביים.</sub>

## ⚖️ בהשוואה למה שיש בחוץ

אף אחד מהכלים שנחקרו לא מכסה יותר משתי חזיתות אלה בבת אחת. מקורות ופרטים ב
[docs/benchmark.md](docs/benchmark.md).

| | משימות + תזכורת | הערות | לוח | פגישות | GitHub | הצפנה מקומית כברירת מחדל |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| אובסידיאן / ג'ופלין | ➖ | ✅ | — | — | — | ➖ סנכרון בלבד |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ אופציונלי |
| MeetingBar | — | — | — | ✅ | — | לא זמין |
| Gitify | — | — | — | — | ✅ | לא זמין |

<sub>✅ יליד · ➖ חלקי, באמצעות הרחבה או אופציונלי · — אין · ? לא פורסם · לא קיים לא שומר נתוני משתמש</sub>

מה המדד הביא לכאן: **זמן הנכון בכותרת המשימה** (Todoist/TickTick), **השהה את ההתראה**
(TickTick) ו-**לוח המכבד מנהלי סיסמאות** (CopyQ/Ditto).

## ⬇️ התקן

הורד את תוכנית ההתקנה לפלטפורמה שלך מ-**[Releases](https://github.com/juninmd/canto-widget/releases)**:

| מערכת | קובץ |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (מומלץ) או `.msi` |
| 🍎 macOS | `.dmg` עבור Apple Silicon או Intel |
| 🐧 לינוקס | `.AppImage`, `.deb` או `.rpm` |

1. בהפעלה הראשונה אתה יוצר את **סיסמת המאסטר**. אין שחזור: איבד את הסיסמה, איבד את הנתונים.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` ב-macOS) מציג ומסתיר את הווידג'ט.
3. בוצע. כאשר גרסה חדשה נשלחת, Canto מודיע לך, ו-**הגדרות → עדכונים** מתעדכן בלחיצה אחת.

> [!הערה]
> המתקנים עדיין לא חתומים בקוד: SmartScreen (Windows) ו-Gatekeeper (macOS) מזהירים בעת ההשקה הראשונה.
> עדכונים אוטומטיים מאומתים מול החתימה של הפרויקט עצמו לפני ההפעלה.

מניפסטים מוכנים עבור winget וה-Homebrew (בתוספת שלד עבור Flatpak, חסום כרגע) חיים ב
[`packaging/`](packaging/README.md) - הוכן ומאומת באופן מקומי, אך עדיין לא פורסם לאלו
מאגרים: פרסום הוא החלטה ופעולה ידנית של המתחזק.

## 🔒 אבטחה במבט חטוף

| שכבה | הגנה |
|---|---|
| כספת | Argon2id (19 MiB, t=2) ← AES-256-GCM, נונס טרי בכל כתיבה, כתיבה אטומית עם `fsync` |
| מפתח | זיכרון RAM בלבד, מאופס בנעילה; נעילה אוטומטית הניתנת להגדרה (5 עד 60 דקות סרק, 15 דקות כברירת מחדל) |
| רשת | רק תהליך Rust מדבר עם הרשת; לתצוגת האינטרנט אין מקור מרוחק (CSP) ולעולם לא רואים אסימונים |
| Google | אופציונלי, רק `calendar.events.readonly`, `directory.readonly` (תמונות של עמיתים לעבודה ברשימת האורחים) בתוספת פרופיל, OAuth עם PKCE ו-loopback |
| GitHub | אסימון מוצפן אופציונלי; פריטים פתוחים רק אם הקישור הוא `https://github.com/` |
| GitLab | כתובת ואסימון אופציונליים, מוצפנים; `https://` בלבד, ללא הפניות מחדש, קישורים רק מהמופע המוגדר |
| עדכונים | מתקין רק חבילה חתומה על ידי מפתח הפרויקט; הורדה מבולבלת נמחקת לפני הפעלת |

דגם מלא, גיבוי, מיזוג בין מכונות והיכן נמצא כל קובץ: [docs/seguranca.md](docs/seguranca.md).
מצאתם פגם? [SECURITY.md](SECURITY.md).

## 📚 תיעוד

| מסמך | מה יש בו |
|---|---|
| 📖 [User guide](docs/uso.md) | כרטיסיות, משימות חוזרות, קיצורי דרך, סקינים, נגישות, חלון, עדכונים והתחל עם המערכת |
| 🔌 [Integrations](docs/integracoes.md) | Google סדר יום וGitHub (אסימון אישי או זרימת מכשיר) |
| 🛡️ [Security and data](docs/seguranca.md) | מודל איום, `.canto` גיבוי, מיזוג, שינוי סיסמה, קבצים בדיסק |
| 📊 [Benchmark](docs/benchmark.md) | מבחני Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify ונפח |
| 📝 [CHANGELOG](CHANGELOG.md) | מה השתנה בכל גרסה |
| 🤝 [How to contribute](CONTRIBUTING.md) | סביבה, בדיקות, PRs וכיצד לפרסם מהדורה |
| 🤖 [Agent guide](AGENTS.md) | חוזים ומלכודות לכל מי שעורך את הקוד עם AI |

## 🛠️ פיתוח

דרישות קדם: [Bun](https://bun.sh) ≥ 1.2, יציב Rust ≥ 1.85 וה-
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) עבור המערכת שלך.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

כל PR מריץ CI ב-Windows, macOS ו-Linux. קונבנציונלי `fix`, `feat` ו-breaking commits מוזגו לתוך `main`
קבל תג SemVer, הפקת הערות שחרור ומתקינים חתומים שנבנו במקביל; השחרור מתפרסם לאחר אימות (פרטים ב
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 רישיון

[MIT](LICENSE) © אנטוניו קרלוס

<div align="center"><sub>מיוצר עם 🦀 Rust, ⚛️ React ו- ☕ למי שגר בין פגישות.</sub></div>
