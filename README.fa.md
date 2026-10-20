<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · **فارسی** · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> ** وظایف با یادآوری، یادداشت، تاریخچه کلیپ بورد، دستور کار با هشدارهای جلسه، رونوشت ها و GitHub PRs شما
> در یک پنجره کوچک که به گوشه صفحه سنجاق شده است.** با `Ctrl+Alt+Space` ظاهر می شود، در صورت عدم نیاز پنهان می شود
> و همه چیز را بدون حساب و سرور روی دستگاه شما رمزگذاری می کند.

## 🌐 زبانها

Canto **42 زبان رابط** را ارائه می دهد که هر کدام README مخصوص به خود را دارند. مورد خود را در **تنظیمات → زبان** انتخاب کنید.
انتخابگر قابل جستجو از نام های زبان مادری استفاده می کند و حالت خودکار از زبان سیستم اصلی شما پیروی می کند.
عربی، عبری و فارسی از متن راست به چپ استفاده می کنند. کاتالوگ های زبان اضافی بر حسب تقاضا بارگذاری می شوند.

40 کاتالوگ رابط جدید و 31 ترجمه جدید README ترجمه ماشینی هستند و تاکنون انجام نشده است.
توسط افراد بومی بررسی شده است. پرتغالی و انگلیسی کاتالوگ های رابط اصلی باقی می مانند. برچسب سینی و
عناوین اعلان ها از زبان انتخاب شده پیروی می کنند. برخی از جزئیات هشدار ادغام به انگلیسی باز می گردد،
و خطاهای باطن در پرتغالی باقی می مانند. نحو عنوان کار، کلمات کلیدی پرتغالی و انگلیسی موجود را حفظ می کند.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ چرا Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

اگر بین جلسات، PRs و موارد معلق کوچک زندگی می کنید، در نهایت پنج برنامه باز خواهید داشت. Canto همه چیز را وارد می کند
یک مکان

🔒 **به طور پیش فرض رمزگذاری شده است.** Argon2id + AES-256-GCM با رمز عبور اصلی؛ کلید فقط در RAM وجود دارد.
Windows Hello اختیاری است.

🏠 **اطلاعات شما نزد شما می ماند.** تله متری صفر، سرور صفر، بدون نیاز به حساب کاربری. پشتیبان گیری یک رمزگذاری شده است
فایل `.canto`.

⏰ **شما آن را از دست نخواهید داد.** 1 دقیقه قبل از جلسه و در زمان یادآوری، ویجت ظاهر می شود، یک صدا پخش می شود و
یک اعلان با **تعویق 10 دقیقه** ارسال می کند.

🪶 **Light.** Tauri v2 (Rust + نمای وب سیستم) به جای Electron: یک نصب کننده 3.5 مگابایتی.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **همیشه به روز است.** از داخل برنامه به روز می شود و فقط مواردی را که با کلید پروژه امضا شده است نصب می کند.

</td>
</tr>
</table>

## 🧰 ویژگی ها

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ وظایفی که به شما یادآوری می کنند

چک لیست روزانه با زمان و تکرار (هر روز، روزهای هفته یا هفتگی). **`Daily at 9:30am`** را تایپ کنید و
یادآوری قبلاً تنظیم شده است. **`!high`** (یا `!alta`، `!média`، `!baixa`) را برای اولویت اضافه کنید، یا روی نقطه روی ردیف کلیک کنید تا آن را چرخه کنید. عناوین طولانی به جای قطع شدن، بسته می شوند. **تمرکز تایمر** روی هر کاری: آن را تخمین بزنید، ▶ را فشار دهید و نواری که در زیر هر برگه سنجاق شده است، زمان را در مقابل آن می شمارد (به محض رفتن قرمز). زمان در هر دقیقه در خرک ذخیره می شود. **خلاصه روز** آماده چسباندن (وظایف، زمان متمرکز، جلسات با کل زمان، PRs/MRs باز، ادغام، بازبینی و بسته شدن بدون ادغام)، **گزارش هفتگی و ماهانه** در علامت گذاری، و **از دیروز موارد معلق** را جمع آوری کنید. **عکسبرداری سریع** (`Ctrl+Alt+N`، `Ctrl+Cmd+N` در macOS) بدون باز کردن ویجت، یک کار یا یادداشت را از هر برنامه ای یادداشت می کند.

</td>
</tr>
<tr>
<td>

### 📅 جلسه شروع شد؟ به شما می گوید.

به جلسه بعدی با `Ctrl+Alt+M` (`Ctrl+Cmd+M` در macOS) بپیوندید. اگر ثبت نام انجام نشد، Canto تلاش می کند
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` در macOS)؛ اگر هر دو در دسترس نباشند، منوی سینی در دسترس باقی می ماند.

رویدادهای امروز از تقویم Google (فقط خواندنی) می آیند. یک دقیقه قبل از آن، ویجت با پرش روی صفحه نمایش
**به Meet** بپیوندید، یک صدا پخش می کند و یک اعلان سیستم ارسال می کند، هر برگه ای که در آن هستید یا حتی اگر پنهان باشد.
هر کارت نشانی با پاسخ شما نشان می دهد (پذیرفته شده، شاید رد شده، در انتظار). روی رویداد کلیک کنید تا ببینید چه کسی سازماندهی کرده است
آن، دستور کار، هر مهمان با یک آواتار حروف اول و پاسخ آنها، و پیوست‌ها، مانند یادداشت‌های جمینی.
خط برتر **موقعیت رایگان بعدی** حداقل 15 دقیقه ای را به شما می گوید (دعوت های رد شده و رویدادهای تمام روز اینطور نیست
شمارش)، و رویدادهایی که همپوشانی دارند، نشان **تعارض** به نام رویداد دیگر دریافت می کنند. نمای **امروز** با جلسه در حال انجام است (زمان باقی مانده، دکمه پیوستن، هشدار برخورد) یا جلسه بعدی، سپس **روز در یک خط** (جلسات، وظایف و زمان آزاد در ساعات کاری، با شمارش زمان جلسه، زمان آزاد و درگیری ها) و یک جدول زمانی که در آن جلسات، وظایف با یک زمان و شکاف های رایگان، ردیف هایی هستند که از قبل با یک کار کنار گذاشته شده اند.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ یادداشت ها به عنوان کارت

کارت‌های قابل جستجو با `#tags`، پین کردن به بالا و فیلتر برچسب با یک کلیک؛ هر کارت شروع یادداشت **ارائه شده** (عناوین، چک لیست ها، کدها، پیوندها) را نشان می دهد، نه علامت گذاری خام. یک **ویرایشگر WYSIWYG** با یک ویرایشگر فشرده
نوار قالب بندی (پررنگ، مورب، کد، عنوان، لیست ها، چک لیست هایی که درست در متن تیک می زنید، بلوک های کد با نحو
برجسته کردن، پیوندها، تصاویر) و میانبرهای علامت گذاری در حین تایپ (`# `، `- `، `[ ] `، ` ``` `). ضامن **MD**
علامت گذاری خام را نشان می دهد، که همچنان نحوه ذخیره، جستجو، همگام سازی و صادر کردن یادداشت ها است. پیوندها با باز می شوند
`Ctrl`+ کلیک کنید، فقط http(s). چسباندن، رها کردن یا پیوست کردن تصاویر (PNG، JPEG، GIF، WebP تا 2 مگابایت)، که هر کدام به تنهایی مهر و موم شده است
فایل رمزگذاری شده، در داخل یادداشت و به صورت ریز عکسها روی کارت نشان داده شده است. آنها در این دستگاه، خارج از `.canto` می مانند
پشتیبان گیری هزاران یادداشت را مدیریت می کند: فهرست صفحه بندی شده است و جستجو همه آنها را پوشش می دهد.

</td>
</tr>
<tr>
<td>

### 📋 کلیپ‌بوردی که هرگز فراموش نمی‌شود (یا درز نمی‌کند)

تاریخچه رمزگذاری شده با جستجو و پین. پیوندها، رنگ ها و کدها را تشخیص می دهد. یک مورد را برای **کپی بازنویسی** نگه دارید:
فرمت JSON یا فشرده، نوشتار در یک خط، حروف بزرگ یا کوچک (ورود تاریخچه همانطور که بود باقی می ماند). یک کپی غول پیکر (یک لاگ 100 مگابایتی) اینطور نیست
فریز کردن هر چیزی: شروع را حفظ می کند و به شما هشدار می دهد. در ویندوز، از هر چیزی که مدیران رمز عبور به عنوان علامت گذاری می کنند، صرف نظر می کند
حساس

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub شما در یک نگاه

**بازبینی از من درخواست شد**، به من اختصاص داده شد، PRs و مسائلی که باز کردم، با نماد PR یا شماره و اینکه چه کسی باز شد
آن را پیش‌نویس‌ها، PRs **منتظر بازبینی شما** و PRs ** متوقف شده** به مدت یک هفته برجسته هستند، و هر PR مقدار کمی را به همراه دارد
**نشان CI** (گذرانده، ناموفق، در حال اجرا یا عدم وجود CI) از چک های اصلی آن. وقتی کسی ** از شما درخواست می کند
بررسی **، یک اعلان سیستم عامل به شما می گوید (به طور پیش فرض روشن است، آن را در تنظیمات خاموش کنید). فیلتر بر اساس متن، `repo:` یا `label:`، PRs فقط یا فقط مشکلات، مرتب‌سازی بر اساس به‌روزرسانی، ایجاد یا نظرات، و
با **نمایش بیشتر** پیمایش کنید. به نمای **نظرات** بروید تا یک شبکه **کاتالوگ نظرات** از همه کسانی که روی PRs شما نظر داده اند (آواتارها، نشان های انسان در مقابل ربات، تعداد نظرات، جستجو، فیلتر ربات، صفحه بندی پیشرونده) و نظرات آنها را مشاهده کنید. همچنین از **GitLab.com و میزبانی خود GitLab** پشتیبانی می کند، با یک کش 5 دقیقه ای که
محدودیت نرخ را رعایت می کند. با یک نشانه شخصی فقط خواندنی یا از مرورگر (جریان دستگاه) وارد شوید.

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam بدون خروج از ویجت

چهار زبانه فرعی برای Steam: **تخفیف های لیست آرزوها** (بزرگترین تخفیف در ابتدا، هر کدام با چیزی که پس انداز می کند)، **فروشندگان برتر**
رتبه‌بندی شده، **اکنون بازی کنید** (هر بازی Steam گزارش‌های دو هفته گذشته را گزارش می‌کند) و **کاتالوگ به ترتیب رتبه‌بندی**، صفحه‌بندی شده
با **بار بیشتر** تا به بقیه فروشگاه برسد. هر ردیف دارای **هنر کپسولی**، **نمره نقد** است.
با عبارات خود Steam و تعداد بررسی ها، قیمت خط خورده، قیمت واقعی و مقدار
تخفیف صرفه جویی می کند - و فهرست کل پس انداز را جمع می کند. لیست های عمومی فقط به **SteamID64** شما نیاز دارند. یک اختیاری
**Steam کلید وب API** بازی های اخیر را با زمان پخش آنها اضافه می کند. برگه به طور پیش فرض شروع می شود، یک کادر انتخاب دورتر
در تنظیمات

</td>
</tr>
<tr>
<td>

### ⚙️ تنظیمات و به روز رسانی خودکار

تغییر رمز اصلی، Windows Hello، پشتیبان گیری `.canto`، یک پوشه همگام سازی شده با ادغام خودکار (Dropbox،
OneDrive، Syncthing...)، با سیستم و بخش **به روز رسانی** شروع کنید، با **نسخه نصب شده** و
**آخرین منتشر شده** در کنار هم و دکمه ای برای به روز رسانی و راه اندازی مجدد.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

همچنین دارای 🎙️ **جلسات**، یک برگه فرعی از دستور کار در کنار لیست و روز: یادداشت ها و رونوشت های جمینی از
دو هفته گذشته، به‌علاوه رونوشت‌های `.vtt`، `.srt`، `.txt` و `.md` از یک پوشه محلی، پاکسازی شده و قابل جستجو هستند.

🤖 **مدل‌های هوش مصنوعی** (به طور پیش‌فرض در نوار برگه، **بدون کلید API یا حساب**): LLM‌های رتبه‌بندی شده توسط
[Artificial Analysis](https://artificialanalysis.ai) **شاخص هوش**، از صفحه تابلوی امتیازات عمومی آن بخوانید،
با نوار امتیاز، سازنده، قیمت هر 1 میلیون توکن و سرعت، قابل مرتب‌سازی بر اساس هوش، قیمت یا سرعت. در واکشی می شود
اکثراً هر 3 ساعت یک بار، و انتخاب کردن 🔔 به شما اطلاع می دهد که یک
مدل ** وارد 10 برتر می شود** یا **در داخل آن صعود می کند** (هر 6 ساعت یکبار در حالی که قفل خرک باز است بررسی می شود)، با
نشان های "جدید" و "بالا" برای یک هفته.

🌙 **مزاحم نشوید:** در تنظیمات یا سینی، بی‌صدا کردن هشدارهای جلسه، یادآوری‌های کار، هشدارهای وضعیت و هر
اعلان سیستم به مدت 30 دقیقه، 1 ساعت، 2 ساعت، تا فردا یا تا زمانی که آن را خاموش کنید. یک ماه در نوار بالا نشان می دهد
وقتی تمام می شود؛ یک کلیک آن را خاموش می کند. از راه اندازی مجدد جان سالم به در می برد و خود به خود به پایان می رسد.

🔔 **هر هشدار در یک صفحه:** زنگ در هدر (شمارش و رنگ در زمانی که چیزی در انتظار است) باز می شود
هشدارها در کل پنجره در هر حالت: یک کارت در هر هشدار با اقداماتش، **رد کردن همه**، و آنچه بود
امروز تحت آنها حل شد - بدون هیچ چیز معلق، اینگونه است که شما هنوز به گزارش امروز می رسید. از بارانداز، یک کلیک
همچنان آن هشدار واحد را در بالای پنجره معمولی باز می کند.

⌨️ **همه چیز بر اساس صفحه کلید:** `Alt+1`…`Alt+7` تغییر زبانه ها، `N` ایجاد، `/` جستجو، `F11` تمام صفحه، `Alt+L`
قفل می کند و `?` میانبرها را فهرست می کند. `Ctrl+Shift+P` (`Cmd+Shift+P` در macOS) یک **پالت فرمان** را با هر
اقدام بر اساس نام: رفتن به یک برگه، کار یا یادداشت جدید، پیوستن به جلسه بعدی، کپی کردن خلاصه روز، تغییر پوسته، قفل کردن.

## 🎨 شش پوست

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>پیش فرض</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

و **سیستم را دنبال کنید** که به همراه سیستم عامل بین روشن و تاریک سوئیچ می کند. همه از کنتراست AA عبور می کنند.

<details>
<summary>🖥️ صفحات بیشتر: ورود، جستجوی جهانی، پالت فرمان، GitLab، وظایف فرعی، ویرایشگر یادداشت، امنیت، همگام سازی، تراکم و موارد دیگر</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| خوش آمدید اولین بار | جستجوی جهانی (`Ctrl+K`) | تب GitLab خود میزبان | هشدار جلسه |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| کار با وظایف فرعی، اولویت و PR | ویرایشگر یادداشت | انواع کلیپ بورد بیشتر | امنیت: قفل و باز کردن خودکار |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| پوشه همگام سازی شده | چگالی فشرده | طاق قفل شده | اتصال GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| تنظیمات در گروه، با جستجو | جستجو گروه ها را فیلتر می کند | تراشه آفلاین در هدر | قبل از پاک کردن کلیپ بورد تایید کنید |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| دور انداختن پیش نویس یادداشت ذخیره نشده |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| حالت ها: مینی، پنهان، عادی، حداکثر | حالت مینی: هشدار در لبه صفحه نمایش |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| روی یک هشدار در حوض کلیک کنید | حداکثر شده: کل پنجره برای برگه باز |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| زنگ هشدارها را در کل پنجره باز می کند |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: منوی حالت در داخل پنجره داک باز می شود |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| برگه هایی که جا نمی شوند در منوی "بیشتر" منتظر می مانند |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| بازی‌ها و تمام صفحه: هشدارها منتظر می‌مانند تا شما را ترک کنید |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| به تعویق انداختن: 1، 5 یا 10 دقیقه |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| یادآوری کار | تغییر رمز اصلی | وضعیت API (برگه انتخاب کردن) | زبان: انگلیسی، پرتغالی یا اسپانیایی |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| کپی یک کلیپ بازنویسی شده | هشدار جلسه با آمادگی |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| طراحی مجدد: تب Tasks، قبل و بعد |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| طراحی مجدد: هر برگه، قبل (بالا) و بعد (پایین) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI شکست خورد، با مشاغل شکسته | یکی از من نام برد | سوئیچ های آنها در تنظیمات |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| ذکر هشدار با کسی که آن را نوشته است |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| ذکر هشدار با پیش نمایش متن |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| هشدارهای بیشتر درباره کار خودم |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| هشدار خلاصه روز | تنظیم خلاصه روز |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| از زبانه فرعی نام برد (GitHub و GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| رمز عبور تغییر کرد، یک فایل در انتظار | خلاصه روز |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| گزارش هفتگی | دستور کار: اوقات فراغت بعدی و درگیری |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| دستور کار: در حال حاضر رایگان | پالت فرمان (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| مزاحم نشوید | تصویر در یادداشت |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| نشان CI در هر PR | بررسی اعلان های درخواست |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| به تصاویر به عنوان ریز عکسها توجه کنید | ویرایشگر یادداشت WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| ویرایشگر یادداشت: علامت گذاری خام (MD) | ویرایشگر یادداشت روی پوست روشن |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| وظایف: اولویت در ردیف، عناوین طولانی بسته بندی | لیست یادداشت ها با علامت گذاری ارائه شده |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| رتبه بندی مدل های هوش مصنوعی بر اساس شاخص هوش |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: فروشندگان برتر، شماره گذاری شده | Steam: پنج بازی آخر انجام شده، با هر دو زمان بازی |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: کاتالوگ بر اساس رتبه بندی، با "بار بیشتر" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| یک پوشش هشدار برای همه چیز در انتظار: قطع، جلسات، وظایف و مدل‌های جدید هوش مصنوعی |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| نقاط پایانی من: کاشی هایی با آخرین تاخیر | نقطه پایانی باز: نمودار تأخیر، تنظیمات محدودیت و هشدار | افزودن DNS + بررسی گواهی |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| دستور کار هر روز: فلش های قبلی و بعدی، انتخابگر تاریخ و دکمه بازگشت به امروز |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| وظایف: کار فعلی با تایمر و لیست گروه بندی شده | GitHub: نوار خلاصه بالای لیست ها | GitLab: همان نوار، بدون کاشی CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| تایمر فوکوس زیر هر برگه پین ​​شده است | دستور کار به عنوان یک روز، وظایف در کنار جلسات |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| نمای روز: رویدادهای همپوشانی عرض را در کنار هم به اشتراک می گذارند |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| رادار بررسی: ابتدا قدیمی‌ترین درخواست، به رنگ قرمز عقب افتاده، چرت |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| جلسات به عنوان برگه فرعی دستور کار، در کنار فهرست و روز |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| برگه فعالیت (به طور پیش فرض خاموش) | خلاصه با زمان متمرکز و بسته PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| برگه فعالیت، 7 روز گذشته | برگه فعالیت، خاموش | برگه فعالیت در یک پنجره گسترده |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

برگه **فعالیت** مخفی شروع می شود (آن را در زیر تنظیمات → برگه های قابل مشاهده روشن کنید). فقط نام آن را ثبت می کند
برنامه متمرکز در حین استفاده از رایانه، در یک فایل محلی مهر و موم شده که هرگز به نسخه پشتیبان یا همگام سازی نمی رسد (Wayland
نمی تواند پنجره متمرکز شده را گزارش کند، بنابراین در آنجا در دسترس نمی ماند). خاموش می شود تا زمانی که شرکت کنید، و صفحه اول چه چیزی را نشان دهد
نگه داشته می شود و آنچه هرگز نیست.

- **روز**: یک دونات بر اساس دسته با کل داخل، که افسانه آن دسته بندی را پنهان می کند، تغییر در برابر روز
قبل و زمان بیکار (بدون صفحه کلید یا ماوس به مدت 2 دقیقه). در زیر آن، هدف تمرکز کد روزانه با رگه و
یک نقطه در روز، سه نقطه برجسته (طولانی ترین کشش در یک برنامه، سوئیچ های برنامه، ساعت اوج مصرف)، یک جدول زمانی که در آن کل
روز، حالت بیکار کشیده می شود و شلوغ ترین برنامه ها یک محور زمانی را با یک نشانگر "اکنون" و لیستی از برنامه ها به اشتراک می گذارند.
(برای تغییر دسته آن روی یکی ضربه بزنید) یا از کارهایی که تایمر فوکوس روی آنها اجرا شده است.
- **هفته**: ستون های انباشته در هر روز با خط متوسط و یک نقطه زیر هر روز که به هدف می رسد، یک ساعت نقشه حرارتی
با اوج خود، و لیست های یکسان برای کل هفته.
- **طراحی و پوسته**: یک ستون در پنجره پیش فرض، دو ستون پس از پهن شدن (به حداکثر رساندن). هر پوستی خاص خودش را دارد
رنگ های دسته بندی، برای کنتراست بررسی شده است. منوی کنار روز آن را به صورت متن کپی می کند.

<sub>همه اسکرین شات ها از داده های ساختگی استفاده می کنند.</sub>

## ⚖️ در مقایسه با آنچه در خارج وجود دارد

هیچ یک از ابزارهای مورد تحقیق بیش از دو مورد از این جبهه ها را در یک زمان پوشش نمی دهد. منابع و جزئیات در
[docs/benchmark.md](docs/benchmark.md).

| | وظایف + یادآوری | یادداشت ها | کلیپ بورد | جلسات | GitHub | رمزگذاری محلی به طور پیش فرض |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| ابسیدین / جاپلین | ➖ | ✅ | — | — | — | ➖ فقط همگام سازی |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ اختیاری |
| Meeting Bar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ بومی · ➖ جزئی، از طریق پسوند یا اختیاری · — هیچ کدام · ? منتشر نشده · n/a داده های کاربر ذخیره نمی شود</sub>

آنچه معیار در اینجا آورده است: **زمان درست در عنوان کار** (Todoist/TickTick)، **به تعویق انداختن هشدار**
(TickTick) و ** clipboard که به مدیران رمز عبور احترام می گذارد ** (CopyQ/Ditto).

## ⬇️ نصب کنید

نصب کننده پلتفرم خود را از **[Releases](https://github.com/juninmd/canto-widget/releases)** دانلود کنید:

| سیستم | فایل |
|---|---|
| 🪟 ویندوز 10/11 | `Canto_x.y.z_x64-setup.exe` (توصیه می شود) یا `.msi` |
| 🍎 macOS | `.dmg` برای Apple Silicon یا Intel |
| 🐧 لینوکس | `.AppImage`، `.deb` یا `.rpm` |

1. در اولین اجرا، **رمز عبور اصلی** را ایجاد می کنید. هیچ بازیابی وجود ندارد: رمز عبور را گم کنید، داده ها را از دست بدهید.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` در macOS) ویجت را نشان داده و پنهان می کند.
3. انجام شد. هنگامی که نسخه جدید ارسال می شود، Canto به شما اطلاع می دهد و **تنظیمات → به روز رسانی** با یک کلیک به روز می شود.

> [!توجه]
> نصب‌کننده‌ها هنوز با کد امضا نشده‌اند: SmartScreen (ویندوز) و Gatekeeper (macOS) در اولین راه‌اندازی هشدار می‌دهند.
> به‌روزرسانی‌های خودکار قبل از اجرا با امضای خود پروژه تأیید می‌شوند.

مانیفست های آماده برای winget و Homebrew (به علاوه یک اسکلت برای Flatpak، در حال حاضر مسدود شده) زندگی می کنند
[`packaging/`](packaging/README.md) - به صورت محلی آماده و تأیید شده است، اما هنوز برای آن ها منتشر نشده است
مخازن: انتشار یک تصمیم و اقدام دستی توسط نگهدارنده است.

## 🔒 امنیت در یک نگاه

| لایه | حفاظت |
|---|---|
| طاق | Argon2id (19 مگابایت، t=2) → AES-256-GCM، یک نوبت جدید در هر نوشتن، نوشتن اتمی با `fsync` |
| کلید | فقط RAM، در حالت قفل صفر شده است. قفل خودکار قابل تنظیم (5 تا 60 دقیقه بیکار، 15 دقیقه به طور پیش فرض) |
| شبکه | فقط فرآیند Rust با شبکه صحبت می کند. webview منشأ راه دور (CSP) ندارد و هرگز توکن ها را نمی بیند |
| Google | اختیاری، فقط `calendar.events.readonly`، `directory.readonly` (عکس های همکاران فضای کاری در لیست مهمان) به علاوه نمایه، OAuth با PKCE و حلقه بک |
| GitHub | توکن اختیاری و رمزگذاری شده موارد فقط در صورتی باز می شوند که پیوند `https://github.com/` |
| GitLab | آدرس و رمز اختیاری، رمزگذاری شده؛ فقط `https://`، بدون تغییر مسیر، پیوندها فقط از نمونه پیکربندی شده |
| به روز رسانی | فقط بسته ای را نصب می کند که توسط کلید پروژه امضا شده باشد. دانلود دستکاری شده قبل از اجرا حذف می شود |

مدل کامل، پشتیبان گیری، ادغام بین ماشین ها و محل زندگی هر فایل: [docs/seguranca.md](docs/seguranca.md).
ایرادی پیدا کردی؟ [SECURITY.md](SECURITY.md).

## 📚 مستندات

| سند | چه چیزی در آن است |
|---|---|
| 📖 [User guide](docs/uso.md) | زبانه ها، وظایف تکرار شونده، میانبرها، پوسته ها، دسترسی، پنجره، به روز رسانی و شروع با سیستم |
| 🔌 [Integrations](docs/integracoes.md) | دستور کار Google و GitHub (توکن شخصی یا جریان دستگاه) |
| 🛡️ [Security and data](docs/seguranca.md) | مدل تهدید، `.canto` پشتیبان گیری، ادغام، تغییر رمز عبور، فایل های روی دیسک |
| 📊 [Benchmark](docs/benchmark.md) | تست های Todoist، TickTick، Obsidian، Joplin، Raycast، PowerToys، CopyQ، Ditto، MeetingBar، Gitify و حجم |
| 📝 [CHANGELOG](CHANGELOG.md) | آنچه در هر نسخه تغییر کرد |
| 🤝 [How to contribute](CONTRIBUTING.md) | محیط، آزمایشات، PRs و نحوه انتشار نسخه |
| 🤖 [Agent guide](AGENTS.md) | قراردادها و تله ها برای هر کسی که کد را با هوش مصنوعی ویرایش می کند |

## 🛠️ توسعه

پیش نیازها: [Bun](https://bun.sh) ≥ 1.2، پایدار Rust ≥ 1.85 و
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) برای سیستم شما.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

وب‌نماها پس از حالت Rust ایجاد می‌شوند و سینی اولیه می‌شود، بنابراین تماس‌های IPC راه‌اندازی نمی‌توانند با راه‌اندازی رقابت کنند.

هر PR CI را در Windows، macOS و Linux اجرا می کند. مرسوم `fix`، `feat` و commit های شکستن در `main` ادغام شدند
یک تگ SemVer، یادداشت‌های انتشار تولید شده و نصب‌کننده‌های امضا شده که به صورت موازی ساخته شده‌اند را دریافت کنید. انتشار پس از تأیید منتشر می شود (جزئیات در
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 مجوز

[MIT](LICENSE) © آنتونیو کارلوس

<div align="center"><sub>ساخته شده با 🦀 Rust، ⚛️ React و ☕ برای کسانی که بین جلسات زندگی می کنند.</sub></div>
