<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · **العربية** · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> ** المهام التي تحتوي على تذكيرات وملاحظات وسجل الحافظة وجدول أعمال يتضمن تنبيهات الاجتماعات والنصوص وGitHub PRs
> في نافذة صغيرة مثبتة في زاوية الشاشة.** ينبثق بـ `Ctrl+Alt+Space`، ويختفي عندما لا تحتاج إليه
> ويحافظ على كل شيء مشفرًا على جهازك، بدون حساب ولا خادم.

## 🌐 اللغات

يقدم Canto **42 لغة واجهة**، لكل منها ملف README الخاص بها. اختر ما يناسبك في **الإعدادات → اللغة**؛
يستخدم المنتقي القابل للبحث أسماء اللغات الأصلية، ويتبع الوضع التلقائي لغة النظام الأساسية لديك.
تستخدم العربية والعبرية والفارسية نصًا من اليمين إلى اليسار. يتم تحميل كتالوجات اللغات الإضافية عند الطلب.

إن كتالوجات الواجهة الأربعين الجديدة وترجمات README الجديدة البالغ عددها 31 ترجمة هي ترجمات آلية ولم تكن كذلك
تمت المراجعة من قبل المتحدثين الأصليين. تظل البرتغالية والإنجليزية هي كتالوجات الواجهة الأصلية. تسميات صينية و
عناوين الإشعارات تتبع اللغة المحددة؛ تعود بعض تفاصيل تنبيه التكامل إلى اللغة الإنجليزية،
وتظل أخطاء الواجهة الخلفية باللغة البرتغالية. يحافظ بناء جملة عنوان المهمة على الكلمات الأساسية البرتغالية والإنجليزية الموجودة.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ لماذا Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

إذا كنت تعيش بين الاجتماعات، PRs والعناصر الصغيرة المعلقة، فسينتهي بك الأمر مع خمسة تطبيقات مفتوحة. Canto يضع كل شيء في مكانه
مكان واحد.

🔒 **مشفر افتراضيًا.** Argon2id + AES-256-GCM بكلمة مرور رئيسية؛ المفتاح موجود فقط في ذاكرة الوصول العشوائي (RAM).
Windows Hello اختياري.

🏠 **تبقى بياناتك معك.** لا يوجد أي تتبع عن بعد، ولا يوجد خادم، ولا يلزم وجود حساب. النسخ الاحتياطي هو واحد مشفر
`.canto` الملف.

⏰ **لن تفوتك.** قبل دقيقة واحدة من الاجتماع وفي وقت التذكير، تنبثق الأداة، وتقوم بتشغيل صوت و
يرسل إشعارًا يتضمن **غفوة لمدة 10 دقائق**.

🪶 **Light.** Tauri v2 (Rust + عرض ويب النظام) بدلاً من Electron: أداة تثبيت بحجم 3.5 ميغابايت.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **محدث دائمًا.** التحديثات من داخل التطبيق وتثبيت فقط ما تم توقيعه بواسطة مفتاح المشروع الخاص.

</td>
</tr>
</table>

## 🧰 المميزات

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ المهام التي تذكرك

قائمة مرجعية يومية بالوقت والتكرار (كل يوم أو أيام الأسبوع أو أسبوعيًا). اكتب **`Daily at 9:30am`** و
تم ضبط التذكير بالفعل؛ أضف **`!high`** (أو `!alta`، `!média`، `!baixa`) للأولوية، أو انقر فوق النقطة الموجودة في الصف لتدويرها. العناوين الطويلة تلتف بدلاً من أن تتقطع. **مؤقت التركيز** على أي مهمة: قم بتقديرها، ثم اضغط على ◀ وسيقوم شريط مثبت أسفل كل علامة تبويب باحتساب الوقت مقابلها (باللون الأحمر بمجرد تجاوزها)؛ يتم حفظ الوقت في القبو كل دقيقة. **ملخص اليوم** جاهز للصقه (المهام، وقت التركيز، الاجتماعات ذات الوقت الإجمالي، PRs/MRs المفتوحة والمدمجة والمراجعة والمغلقة دون دمج)، و**تقرير أسبوعي وشهري** في عملية التخفيض، و**سحب العناصر المعلقة** من الأمس. **التقاط سريع** (`Ctrl+Alt+N`، `Ctrl+Cmd+N` على نظام التشغيل macOS) يسجل مهمة أو ملاحظة من أي تطبيق، دون فتح الأداة.

</td>
</tr>
<tr>
<td>

### 📅 هل سيبدأ الاجتماع؟ يخبرك.

انضم إلى الاجتماع التالي مع `Ctrl+Alt+M` (`Ctrl+Cmd+M` على نظام التشغيل macOS). إذا فشل التسجيل، Canto يحاول
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` على نظام التشغيل macOS)؛ تظل قائمة الدرج متاحة في حالة عدم توفرهما.

تأتي أحداث اليوم من تقويم Google (للقراءة فقط). قبل دقيقة واحدة، تنتقل الأداة إلى الشاشة
**انضم إلى Meet**، وقم بتشغيل صوت وإرسال إشعار النظام، بغض النظر عن علامة التبويب التي تستخدمها أو حتى إذا كانت مخفية.
تعرض كل بطاقة شارة بإجابتك (مقبولة، ربما، مرفوضة، في انتظار). انقر فوق الحدث لمعرفة من قام بتنظيمه
ذلك، وجدول الأعمال، وكل ضيف مع الصورة الرمزية للأحرف الأولى وإجابته، والمرفقات، مثل ملاحظات الجوزاء.
يخبرك السطر العلوي بـ **الفتحة المجانية التالية** التي لا تقل عن 15 دقيقة (لا يتم الإبلاغ عن الدعوات المرفوضة والأحداث التي تستمر طوال اليوم)
العد)، والأحداث المتداخلة تحصل على شارة **تعارض** تسمي الحدث الآخر. يؤدي عرض **اليوم** إلى بدء الاجتماع (الوقت المتبقي، زر الانضمام، تحذير الصدام) أو العرض التالي، ثم **اليوم في سطر واحد** (الاجتماعات والمهام ووقت الفراغ عبر ساعات العمل، مع احتساب وقت الاجتماع ووقت الفراغ والتعارضات) ومخطط زمني واحد حيث تكون الاجتماعات والمهام ذات الوقت والفجوات الحرة عبارة عن صفوف خاصة بها: تعرض الفجوة لتناسب مهمة غير محددة بوقت، وما تم تجاوزه بالفعل.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ ملاحظات على شكل بطاقات

بطاقات قابلة للبحث مع `#tags`، مثبتة في الأعلى ومرشح العلامات بنقرة واحدة؛ تعرض كل بطاقة بداية الملاحظة **المقدمة** (العناوين، وقوائم المراجعة، والكود، والروابط)، وليس تخفيض السعر الأولي. **محرر WYSIWYG** ذو حجم مضغوط
شريط التنسيق (غامق، مائل، رمز، عنوان، قوائم، قوائم المراجعة التي تحددها مباشرة في النص، كتل التعليمات البرمجية مع بناء الجملة
التمييز والروابط والصور) واختصارات تخفيض السعر أثناء الكتابة (`# `، `- `، `[ ] `، ` ``` `)؛ تبديل **MD**
يعرض تخفيض السعر الأولي، والذي لا يزال يمثل كيفية تخزين الملاحظات والبحث فيها ومزامنتها وتصديرها. الروابط مفتوحة مع
`Ctrl`+نقر، http(s) فقط. قم بلصق أو إسقاط أو إرفاق الصور (PNG، JPEG، GIF، WebP حتى 2 ميجابايت)، كل واحدة مختومة في مكانها
ملف مشفر، يظهر داخل الملاحظة وعلى شكل صور مصغرة على البطاقة؛ يبقون على هذا الجهاز، بالخارج `.canto`
النسخ الاحتياطية. يعالج آلاف الملاحظات: القائمة مقسمة إلى صفحات ويغطي البحث جميعها.

</td>
</tr>
<tr>
<td>

### 📋 الحافظة التي لا تُنسى أبدًا (أو تتسرب)

التاريخ المشفر مع البحث والدبوس. يتعرف على الروابط والألوان والتعليمات البرمجية. قم بتمرير عنصر ما **لنسخه بعد إعادة كتابته**:
بتنسيق JSON أو مضغوط، نص على سطر واحد، بأحرف كبيرة أو صغيرة (يظل إدخال السجل كما كان). النسخة العملاقة (سجل 100 ميجابايت) لا تفعل ذلك
تجميد أي شيء: فهو يحافظ على البداية ويحذرك. على نظام التشغيل Windows، فإنه يتخطى أي شيء يضعه مديرو كلمات المرور على أنه
حساس.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub الخاص بك في لمحة

**المراجعة المطلوبة مني**، المخصصة لي، PRs والمشكلات التي فتحتها، مع PR أو رمز المشكلة ومن فتحها
ذلك. تبرز المسودات، PRs **في انتظار مراجعتك** وPRs **المتوقفة** لمدة أسبوع، وكل PR تحمل قطعة صغيرة
** شارة CI ** (ناجحة أو فاشلة أو قيد التشغيل أو لا يوجد CI) من فحوصات الالتزام الرئيسية الخاصة بها. عندما يطلب شخص ما ** الخاص بك
مراجعة**، يخبرك إشعار نظام التشغيل (يتم تشغيله بشكل افتراضي، قم بإيقاف تشغيله في الإعدادات). قم بالتصفية حسب النص، `repo:` أو `label:`، PRs فقط أو الأعداد فقط، والفرز حسب التحديث أو الإنشاء أو التعليقات، و
قم بالتمرير باستخدام **إظهار المزيد**. قم بالتبديل إلى عرض **التعليقات** لرؤية شبكة **كتالوج المعلقين** لكل من علقوا على PRs (الصور الرمزية، وشارات الإنسان مقابل الروبوت، وعدد التعليقات، والبحث، وفلتر الروبوت، والصفحات التقدمية) وتعليقاتهم. يدعم أيضًا **GitLab.com وGitLab** المستضاف ذاتيًا، مع ذاكرة تخزين مؤقت مدتها 5 دقائق
يحترم الحد الأقصى للسعر. قم بتسجيل الدخول باستخدام رمز شخصي للقراءة فقط أو من المتصفح (تدفق الجهاز).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam دون مغادرة القطعة

أربع علامات تبويب فرعية لـ Steam: **صفقات قائمة الرغبات** (الخصم الأكبر أولاً، كل منها بما توفره)، **الأكثر مبيعًا**
مرتبة، **العب الآن** (كل لعبة Steam تقدم تقريرًا خلال الأسبوعين الماضيين) و **الكتالوج مرتب حسب التصنيف**، مقسم إلى صفحات
مع **تحميل المزيد** حتى يصل إلى بقية المتجر. يحتوي كل صف على **صورة الكبسولة** و**نتيجة المراجعة**
مع صياغة Steam الخاصة وعدد المراجعات التي يتم احتسابها، والسعر المشطوب، والسعر بالريال وما هو
يحفظ الخصم - وتضيف القائمة إجمالي التوفير. القوائم العامة تحتاج فقط إلى **SteamID64**; اختياري
يضيف مفتاح **Steam الويب API** أحدث الألعاب وأوقات اللعب الخاصة بها. تبدأ علامة التبويب بشكل افتراضي، على بعد خانة اختيار واحدة
في الإعدادات.

</td>
</tr>
<tr>
<td>

### ⚙️ الإعدادات والتحديثات التلقائية

تغيير كلمة المرور الرئيسية، Windows Hello، `.canto` النسخ الاحتياطي، مجلد متزامن مع الدمج التلقائي (Dropbox،
OneDrive، Syncthing...)، ابدأ بالنظام وقسم **التحديثات**، مع **الإصدار المثبت** و
**أحدث المنشورات** جنبًا إلى جنب وزر للتحديث وإعادة التشغيل.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

تحتوي أيضًا على 🎙️ **الاجتماعات**، وهي علامة تبويب فرعية لجدول الأعمال بجوار القائمة واليوم: ملاحظات الجوزاء والنصوص من
الأسبوعين الماضيين، بالإضافة إلى نصوص `.vtt` و`.srt` و`.txt` و`.md` من مجلد محلي، نظيفة وقابلة للبحث.

🤖 **نماذج الذكاء الاصطناعي** (في شريط علامات التبويب بشكل افتراضي، **لا يوجد مفتاح أو حساب API**): تم تصنيف ماجستير إدارة الأعمال حسب
[Artificial Analysis](https://artificialanalysis.ai) **مؤشر الذكاء**، يمكن قراءته من صفحة لوحة المتصدرين العامة،
مع شريط النتائج، والمنشئ، والسعر لكل مليون رمز وسرعة، يمكن فرزها حسب الذكاء أو السعر أو السرعة. يجلب عند
على الأغلب مرة واحدة كل 3 ساعات، وسيقوم خيار الاشتراك 🔔 بإعلامك عند حدوث
النموذج **يدخل أعلى 10** أو **يتسلق داخلها** (يتم تحديده كل 6 ساعات عندما يكون القبو مفتوحًا)، مع
شارات "جديدة" و"أعلى" لمدة أسبوع.

🌙 **عدم الإزعاج:** في الإعدادات أو الدرج، يمكنك كتم صوت تنبيهات الاجتماعات وتذكيرات المهام وتنبيهات الحالة وكل شيء
إشعار النظام لمدة 30 دقيقة، ساعة واحدة، ساعتين، حتى الغد أو حتى تقوم بإيقاف تشغيله. يظهر القمر في الشريط العلوي
عندما ينتهي؛ نقرة واحدة تؤدي إلى إيقاف تشغيله. إنه ينجو من إعادة التشغيل وينتهي من تلقاء نفسه.

🔔 **كل تنبيه في شاشة واحدة:** يفتح الجرس الموجود في الرأس (العد واللون عند وجود أي شيء معلق)
تنبيهات على النافذة بأكملها في أي وضع: بطاقة واحدة لكل تنبيه مع إجراءاته، **تجاهل الكل**، وما كان
تم حلها اليوم بموجبها - مع عدم وجود أي شيء معلق، فهذه هي الطريقة التي لا تزال تصل بها إلى سجل اليوم. من قفص الاتهام، نقرة واحدة
لا يزال يفتح هذا التنبيه الفردي أعلى النافذة العادية.

⌨️ **كل شيء عن طريق لوحة المفاتيح:** `Alt+1`...`Alt+7` تبديل علامات التبويب، `N` إنشاء، `/` عمليات بحث، `F11` ملء الشاشة، `Alt+L`
الأقفال و`?` يسرد الاختصارات. `Ctrl+Shift+P` (`Cmd+Shift+P` على نظام التشغيل macOS) يفتح **لوحة الأوامر** مع كل
الإجراء بالاسم: انتقل إلى علامة تبويب أو مهمة أو ملاحظة جديدة، وانضم إلى الاجتماع التالي، وانسخ ملخص اليوم، وقم بتبديل المظهر، والقفل.

## 🎨 ستة جلود

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Default</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>دراكولا</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

و **نظام المتابعة** الذي يقوم بالتبديل بين الضوء والظلام مع نظام التشغيل. كل تمرير التباين AA.

<details>
<summary>🖥️ المزيد من الشاشات: الإعداد، البحث الشامل، لوحة الأوامر، GitLab، المهام الفرعية، محرر الملاحظات، الأمان، المزامنة، الكثافة والمزيد</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| ترحيب لأول مرة | بحث عالمي (`Ctrl+K`) | علامة التبويب GitLab ذاتية الاستضافة | تنبيه الاجتماع |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across today's tasks, agenda, notes, transcripts and clipboard at once](docs/prints/melhorias/busca-global-fontes.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Context reminder on a task | Search result jumping to a transcript |
|---|---|
| ![Tasks waiting for an app or a Wi-Fi, with the app picker open on a task](docs/prints/melhorias/lembrete-por-contexto.png) | ![A transcript picked in the global search opens the Meetings view with the query filled in](docs/prints/melhorias/busca-global-transcricao.png) |

| مهمة ذات مهام فرعية وأولوية وPR | محرر الملاحظات | المزيد من أنواع الحافظة | الأمان: القفل التلقائي وفتح القفل |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| المجلد المتزامن | كثافة مدمجة | قبو مقفل | تواصل GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| الإعدادات في مجموعات، مع البحث | البحث يقوم بتصفية المجموعات | شريحة غير متصلة بالإنترنت في الرأس | قم بالتأكيد قبل مسح الحافظة |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| تجاهل مسودة ملاحظة غير محفوظة |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| الأوضاع: صغير، مخفي، عادي، مكبر | الوضع المصغر: تنبيهات على حافة الشاشة |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| انقر فوق تنبيه في قفص الاتهام | مكبر: النافذة بأكملها لعلامة التبويب المفتوحة |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| الجرس يفتح التنبيهات على كامل النافذة |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: تفتح قائمة الوضع داخل نافذة الإرساء |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| علامات التبويب غير المناسبة تنتظر في قائمة "المزيد" |
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

| الألعاب وملء الشاشة: التنبيهات تنتظر حتى تغادر |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| الغفوة: 1 أو 5 أو 10 دقائق |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| تذكير بالمهمة | تغيير كلمة المرور الرئيسية | الحالة API (علامة تبويب الاشتراك) | اللغة: الإنجليزية أو البرتغالية أو الإسبانية |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| نسخ مقطع إعادة كتابته | تنبيه الاجتماع مع الإعدادية |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| إعادة التصميم: علامة التبويب "المهام"، قبل وبعد |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| إعادة التصميم: كل علامة تبويب، قبل (أعلى) وبعد (أسفل) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| فشل CI، مع الوظائف المعطلة | ذكرني أحد | مفاتيحهم في الإعدادات |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| تنبيه الذكر مع من كتبه |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| تنبيه بالذكر مع معاينة النص |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| المزيد من التنبيهات حول أعمالي الخاصة |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| تنبيه ملخص اليوم | إعداد ملخص اليوم |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| علامة التبويب الفرعية للإشارات (GitHub وGitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| تم تغيير كلمة المرور، هناك ملف واحد معلق | ملخص اليوم |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| التقرير الأسبوعي | جدول الأعمال: وقت الفراغ القادم والصراعات |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| جدول الأعمال: مجاني الآن | لوحة الأوامر (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| لا تزعج | صورة في مذكرة |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| شارة CI على كل PR | إشعارات طلب المراجعة |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| لاحظ الصور كصور مصغرة | محرر الملاحظات WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| محرر الملاحظات: تخفيض السعر الخام (MD) | محرر الملاحظات على البشرة الفاتحة |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| المهام: الأولوية على الصف، التفاف العناوين الطويلة | قائمة الملاحظات مع تخفيض السعر المقدم |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| نماذج الذكاء الاصطناعي مرتبة حسب مؤشر الذكاء |
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

| تراكب تنبيه واحد لكل شيء معلق: الانقطاعات والاجتماعات والمهام ونماذج الذكاء الاصطناعي الجديدة |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| نقاط النهاية الخاصة بي: المربعات ذات زمن الوصول الأخير | نقطة نهاية مفتوحة: مخطط زمن الوصول وإعدادات الحد والتنبيه | إضافة DNS + فحص الشهادة |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| جدول أعمال أي يوم: الأسهم السابقة والتالية ومنتقي التاريخ وزر العودة إلى اليوم |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| المهام: المهمة الحالية مع مؤقت وقائمة مجمعة | GitHub: شريط التلخيص أعلى القوائم | GitLab: نفس الشريط، بدون بلاط CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| مؤقت التركيز مثبت أسفل كل علامة تبويب | جدول الأعمال كيوم، والمهام بجانب الاجتماعات |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| عرض اليوم: الأحداث المتداخلة تشترك في العرض جنبًا إلى جنب |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| رادار المراجعة: الطلب الأقدم أولاً، تأخر موعد تقديمه باللون الأحمر، غفوة |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| الاجتماعات كعلامة تبويب فرعية في جدول الأعمال، بجوار القائمة واليوم |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| علامة تبويب النشاط (متوقفة بشكل افتراضي) | ملخص مع وقت التركيز ومغلق PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| علامة تبويب النشاط، آخر 7 أيام | علامة تبويب النشاط، متوقفة | علامة تبويب النشاط في نافذة واسعة |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

تبدأ علامة التبويب **النشاط** مخفية (قم بتشغيلها ضمن الإعدادات → علامات التبويب المرئية). ويسجل فقط اسم
تطبيق مركز أثناء استخدام الكمبيوتر، في ملف محلي مغلق لا يصل أبدًا إلى النسخ الاحتياطية أو المزامنة (Wayland
لا يمكن الإبلاغ عن النافذة التي تم التركيز عليها، لذا تظل غير متاحة هناك). إيقاف حتى تقوم بالاشتراك، والشاشة الأولى تقول ماذا
يتم الاحتفاظ به وما لا يكون أبدًا.

- **اليوم**: كعكة دائرية حسب الفئة مع الإجمالي بداخلها، والذي يخفي مفتاحه فئة ما، والتغيير مقابل اليوم
قبل ووقت الخمول (لا تستخدم لوحة المفاتيح أو الماوس لمدة دقيقتين). أسفله، يوجد هدف يومي للتركيز على الكود مع خطه و
نقطة واحدة في اليوم، وثلاث نقاط بارزة (أطول امتداد في تطبيق واحد، ومفاتيح التطبيق، وساعة الذروة)، ومخطط زمني حيث يتم عرض الكل
في اليوم، تشترك فترات الخمول والتطبيقات الأكثر ازدحامًا في محور زمني واحد مع علامة "الآن" وقائمة من التطبيقات
(انقر فوق واحدة لتغيير فئتها) أو المهام التي تم تشغيل مؤقت التركيز عليها.
- **الأسبوع**: أعمدة مكدسة يوميًا مع خط المتوسط ونقطة أسفل كل يوم حقق الهدف، وخريطة حرارية لمدة ساعة
مع ذروتك، ونفس القوائم طوال الأسبوع.
- **التخطيط والأسطح**: عمود واحد في النافذة الافتراضية، وعمودان عندما تصبح واسعة (تكبير)؛ كل بشرة لها خاصتها
ألوان الفئة، والتحقق من التباين. تقوم القائمة المجاورة لليوم بنسخها كنص.

<sub>جميع لقطات الشاشة تستخدم بيانات وهمية.</sub>

## ⚖️ مقارنة بما هو موجود هناك

ولا تغطي أي من الأدوات التي تم بحثها أكثر من اثنتين من هذه الجبهات في وقت واحد. المصادر والتفاصيل في
[docs/benchmark.md](docs/benchmark.md).

| | مهام + تذكير | ملاحظات | الحافظة | اجتماعات | GitHub | التشفير المحلي بشكل افتراضي |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| تودويست / تيك تيك | ✅ | ➖ | — | — | — | — |
| سبج / جوبلين | ➖ | ✅ | — | — | — | ➖ مزامنة فقط |
| رايكاست | ➖ | ✅ | ✅ | ➖ | ➖ | ؟ |
| CopyQ / كما سبق | — | — | ✅ | — | — | ➖ اختياري |
| شريط الاجتماعات | — | — | — | ✅ | — | غير متوفر |
| جيتيفاي | — | — | — | — | ✅ | غير متوفر |

<sub> ✅ أصلي · ➖ جزئي، عبر الامتداد أو اختياري · — لا شيء · ? غير منشورة · غير متاح لا يقوم بتخزين بيانات المستخدم</sub>

ما جلبه المعيار هنا: **الوقت المناسب في عنوان المهمة** (Todoist/TickTick)، **أجل التنبيه**
(TickTick) و**الحافظة التي تحترم مديري كلمات المرور** (CopyQ/Ditto).

## ⬇️ التثبيت

قم بتنزيل برنامج التثبيت لنظامك الأساسي من **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| النظام | ملف |
|---|---|
| 🪟 ويندوز 10/11 | `Canto_x.y.z_x64-setup.exe` (مستحسن) أو `.msi` |
| 🍎 ماك | `.dmg` لشركة Apple Silicon أو Intel |
| 🐧 لينكس | `.AppImage`، `.deb` أو `.rpm` |

1. عند التشغيل لأول مرة، يمكنك إنشاء **كلمة المرور الرئيسية**. لا يوجد استرداد: تفقد كلمة المرور، وتفقد البيانات.
2. يعرض `Ctrl+Alt+Space` (`Cmd+Shift+Space` على نظام التشغيل macOS) الأداة ويخفيها.
3. تم. عند إصدار إصدار جديد، يقوم Canto بإعلامك، ويتم تحديث **الإعدادات → التحديثات** بنقرة واحدة.

> [!ملاحظة]
> لم يتم توقيع المثبتات بالرمز بعد: يتم تحذير SmartScreen (Windows) وGatekeeper (macOS) عند التشغيل لأول مرة.
> يتم التحقق من التحديثات التلقائية مقابل توقيع المشروع قبل التشغيل.

البيانات الجاهزة لـ Winget وHomebrew (بالإضافة إلى هيكل عظمي لـ Flatpak، المحظورة حاليًا).
[`packaging/`](packaging/README.md) — تم إعداده والتحقق منه محليًا، ولكن لم يتم نشره لهم بعد
المستودعات: النشر هو قرار وإجراء يدوي من قبل المشرف.

## 🔒 الأمن في لمحة

| طبقة | الحماية |
|---|---|
| قبو | Argon2id (19 MiB, t=2) → AES-256-GCM، نونس جديد في كل كتابة، كتابة ذرية باستخدام `fsync` |
| مفتاح | ذاكرة الوصول العشوائي (RAM) فقط، مثبتة على القفل؛ قفل تلقائي قابل للتكوين (من 5 إلى 60 دقيقة في وضع الخمول، و15 دقيقة بشكل افتراضي) |
| الشبكة | فقط عملية Rust تتحدث إلى الشبكة؛ لا يحتوي عرض الويب على أصل بعيد (CSP) ولا يرى الرموز المميزة |
| Google | اختياري، فقط `calendar.events.readonly`، `directory.readonly` (صور زملاء العمل في قائمة الضيوف) بالإضافة إلى الملف الشخصي، OAuth مع PKCE والاسترجاع |
| GitHub | رمز اختياري مشفر؛ يتم فتح العناصر فقط إذا كان الرابط `https://github.com/` |
| GitLab | عنوان ورمز اختياري ومشفر؛ `https://` فقط، لا توجد عمليات إعادة توجيه، روابط فقط من المثيل الذي تم تكوينه |
| التحديثات | يقوم فقط بتثبيت الحزمة الموقعة بواسطة مفتاح المشروع؛ يتم تجاهل التنزيل الذي تم العبث به قبل تشغيل |

النموذج الكامل والنسخ الاحتياطي والدمج عبر الأجهزة ومكان وجود كل ملف: [docs/seguranca.md](docs/seguranca.md).
وجدت الخلل؟ [SECURITY.md](SECURITY.md).

## 📚 التوثيق

| وثيقة | ما فيه |
|---|---|
| 📖 [User guide](docs/uso.md) | علامات التبويب والمهام المتكررة والاختصارات والجلود وإمكانية الوصول والنافذة والتحديثات والبدء بالنظام |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google جدول الأعمال و GitHub (الرمز الشخصي أو تدفق الجهاز) |
| 🛡️ [Security and data](docs/seguranca.md) | نموذج التهديد، `.canto` النسخ الاحتياطي، الدمج، تغيير كلمة المرور، الملفات الموجودة على القرص |
| 📊 [Benchmark](docs/benchmark.md) | Todoist، TickTick، Obsidian، Joplin، Raycast، PowerToys، CopyQ، Ditto، MeetingBar، Gitify واختبارات مستوى الصوت |
| 📝 [CHANGELOG](CHANGELOG.md) | ما تغير في كل نسخة |
| 🤝 [How to contribute](CONTRIBUTING.md) | البيئة والاختبارات وPRs وكيفية نشر الإصدار |
| 🤖 [Agent guide](AGENTS.md) | العقود والفخاخ لأي شخص يقوم بتحرير الكود باستخدام الذكاء الاصطناعي |

## 🛠️ التطوير

المتطلبات الأساسية: [Bun](https://bun.sh) ≥ 1.2، مستقر Rust ≥ 1.85 و
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) لنظامك.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

يتم إنشاء عروض الويب بعد حالة Rust ويتم تهيئة الدرج، لذا لا يمكن لاستدعاءات IPC عند بدء التشغيل أن تتنافس مع الإعداد.

يقوم كل PR بتشغيل CI على أنظمة التشغيل Windows وmacOS وLinux. تم دمج `fix` التقليدي و`feat` وكسر الالتزامات في `main`
الحصول على علامة SemVer وملاحظات الإصدار التي تم إنشاؤها والمثبتات الموقعة المضمنة بالتوازي؛ يتم نشر الإصدار بعد التحقق (التفاصيل في
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 الترخيص

[MIT](LICENSE) © أنطونيو كارلوس

<div align="center"><sub>مصنوع باستخدام 🦀 Rust و⚛️ React و☕ لأولئك الذين يعيشون بين الاجتماعات.</sub></div>
