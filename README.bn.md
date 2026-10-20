<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · **বাংলা** · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **অনুস্মারক, নোট, ক্লিপবোর্ড ইতিহাস, মিটিং সতর্কতা, প্রতিলিপি এবং আপনার GitHub PRs সহ একটি এজেন্ডা সহ কাজ
> স্ক্রীনের কোণায় পিন করা একটি ছোট উইন্ডোতে।** `Ctrl+Alt+Space` এর সাথে পপ আপ হয়, আপনার প্রয়োজন না হলে লুকিয়ে থাকে
> এটি এবং আপনার মেশিনে সবকিছু এনক্রিপ্ট করে রাখে, কোনো অ্যাকাউন্ট এবং কোনো সার্ভার ছাড়াই।

## 🌐 ভাষা

Canto অফার করে **42টি ইন্টারফেস ভাষা**, প্রতিটির নিজস্ব README সহ। **সেটিংস → ভাষা** এ আপনার পছন্দ করুন;
অনুসন্ধানযোগ্য পিকার স্থানীয় ভাষার নাম ব্যবহার করে এবং স্বয়ংক্রিয় মোড আপনার প্রাথমিক সিস্টেম ভাষা অনুসরণ করে।
আরবি, হিব্রু এবং ফার্সি ডান-থেকে-বামে পাঠ্য ব্যবহার করে। অতিরিক্ত ভাষার ক্যাটালগ চাহিদা অনুযায়ী লোড হয়।

40টি নতুন ইন্টারফেস ক্যাটালগ এবং 31টি নতুন README অনুবাদ হল মেশিন অনুবাদ এবং করা হয়নি
স্থানীয় ভাষাভাষীদের দ্বারা পর্যালোচনা. পর্তুগিজ এবং ইংরেজি মূল ইন্টারফেস ক্যাটালগ থেকে যায়। ট্রে লেবেল এবং
বিজ্ঞপ্তি শিরোনাম নির্বাচিত ভাষা অনুসরণ করে; কিছু ইন্টিগ্রেশন সতর্কতা বিবরণ ইংরেজিতে ফিরে আসে,
এবং ব্যাকএন্ড ত্রুটি পর্তুগিজ রয়ে গেছে. টাস্ক শিরোনাম সিনট্যাক্স বিদ্যমান পর্তুগিজ এবং ইংরেজি কীওয়ার্ড রাখে।

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ কেন Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

আপনি যদি মিটিং, PRs এবং ছোট মুলতুবি থাকা আইটেমগুলির মধ্যে থাকেন, তাহলে আপনি পাঁচটি অ্যাপ খোলা থাকবে। Canto এটি সব রাখে
এক জায়গা

🔒 **ডিফল্টরূপে এনক্রিপ্ট করা।** Argon2id + AES-256-GCM একটি মাস্টার পাসওয়ার্ড সহ; কী শুধুমাত্র RAM-তে বিদ্যমান থাকে।
Windows Hello ঐচ্ছিক।

🏠 **আপনার ডেটা আপনার সাথে থাকবে।** জিরো টেলিমেট্রি, জিরো সার্ভার, কোনো অ্যাকাউন্টের প্রয়োজন নেই। ব্যাকআপ হল একক এনক্রিপ্ট করা
`.canto` ফাইল।

⏰ **আপনি এটি মিস করবেন না।** মিটিংয়ের 1 মিনিট আগে এবং অনুস্মারক সময়ে, উইজেট পপ আপ হয়, একটি শব্দ বাজায় এবং
**স্নুজ 10 মিনিট** সহ একটি বিজ্ঞপ্তি পাঠায়।

🪶 **আলো।** Electron এর পরিবর্তে Tauri v2 (Rust + সিস্টেম ওয়েবভিউ): একটি 3.5 MB ইনস্টলার।
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **সর্বদা আপ টু ডেট।** অ্যাপের মধ্যে থেকে আপডেট এবং শুধুমাত্র প্রজেক্টের নিজস্ব কী দ্বারা স্বাক্ষরিত জিনিসগুলিই ইনস্টল করে।

</td>
</tr>
</table>

## 🧰 বৈশিষ্ট্য

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ কাজ যা আপনাকে মনে করিয়ে দেয়

সময় এবং পুনরাবৃত্তি সহ একটি দৈনিক চেকলিস্ট (প্রতিদিন, সপ্তাহের দিন বা সাপ্তাহিক)। টাইপ করুন **`Daily at 9:30am`_** এবং
অনুস্মারক ইতিমধ্যে সেট করা আছে; অগ্রাধিকারের জন্য **`!high`** (বা `!alta`, `!média`, `!baixa`) যোগ করুন, অথবা সাইকেল করতে সারির বিন্দুতে ক্লিক করুন। লম্বা শিরোনাম কেটে ফেলার পরিবর্তে মোড়ানো। **ফোকাস টাইমার** যেকোনো কাজের উপর: এটির একটি অনুমান দিন, ▶ টিপুন এবং প্রতিটি ট্যাবের নীচে পিন করা একটি বার এটির বিপরীতে সময় গণনা করে (আপনি একবার উপরে গেলে লাল); সময় প্রতি মিনিটে ভল্টে সংরক্ষণ করা হয়। **দিনের সারাংশ** পেস্ট করার জন্য প্রস্তুত (কাজ, ফোকাস করা সময়, মোট সময়ের সাথে মিটিং, PRs/MRs খোলা, মার্জ করা, পর্যালোচনা করা এবং মার্জ না করে বন্ধ করা), মার্কডাউনে একটি **সাপ্তাহিক এবং মাসিক প্রতিবেদন** এবং গতকাল থেকে **মুলতুবি থাকা আইটেমগুলিকে ** টানুন। **দ্রুত ক্যাপচার** (macOS-এ `Ctrl+Alt+N`, `Ctrl+Cmd+N`) উইজেট না খুলেই যেকোনো অ্যাপ থেকে একটি টাস্ক বা নোট যোগ করে।

</td>
</tr>
<tr>
<td>

### 📅 মিটিং শুরু হচ্ছে? এটা আপনাকে বলে.

`Ctrl+Alt+M` (macOS এ `Ctrl+Cmd+M`) এর সাথে পরবর্তী মিটিংয়ে যোগ দিন। নিবন্ধন ব্যর্থ হলে, Canto চেষ্টা করে
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` macOS এ); উভয়ই অনুপলব্ধ হলে ট্রে মেনু উপলব্ধ থাকে।

আজকের ইভেন্টগুলি Google ক্যালেন্ডার থেকে এসেছে (শুধু পড়ার জন্য)। এক মিনিট আগে, উইজেটটি স্ক্রিনে ঝাঁপিয়ে পড়ে
**যোগ দিন Meet**, একটি শব্দ বাজান এবং একটি সিস্টেম বিজ্ঞপ্তি পাঠান, আপনি যে ট্যাবেই থাকুন বা লুকিয়ে থাকলেও।
প্রতিটি কার্ড আপনার উত্তরের সাথে একটি ব্যাজ দেখায় (স্বীকৃত, হতে পারে, প্রত্যাখ্যান করা, অপেক্ষা করা হচ্ছে)। কে সংগঠিত দেখতে ইভেন্ট ক্লিক করুন
এটি, এজেন্ডা, প্রতিটি অতিথির একটি আদ্যক্ষর অবতার এবং তাদের উত্তর এবং মিথুনের নোটের মতো সংযুক্তি।
উপরের লাইনটি আপনাকে কমপক্ষে 15 মিনিটের **পরবর্তী ফ্রি স্লট** বলে দেয় (প্রত্যাখ্যান করা আমন্ত্রণ এবং সারাদিনের ইভেন্টগুলি নেই
গণনা), এবং ওভারল্যাপ হওয়া ইভেন্টগুলি অন্য ইভেন্টের নামকরণ করে একটি **দ্বন্দ্ব** ব্যাজ পায়। **আজ** ভিউ মিটিং প্রক্রিয়াধীন (সময় বাকি, যোগদানের বোতাম, সংঘর্ষের সতর্কতা) বা পরেরটি, তারপর **এক লাইনে দিন** (মিটিং, কাজ এবং কর্মঘণ্টা জুড়ে ফ্রি সময়, মিটিংয়ের সময়, ফাঁকা সময় এবং দ্বন্দ্ব গণনা সহ) এবং একটি টাইমলাইন যেখানে মিটিং, একটি সময়ের সাথে কাজ এবং ফাঁকা ফাঁকগুলি তাদের নিজস্ব সারি রয়েছে: একটি টাস্ক ওভারফোল্ড করা এবং অফার করা হয়েছে দূরে

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ কার্ড হিসাবে নোট

`#tags` সহ অনুসন্ধানযোগ্য কার্ড, উপরে পিন করুন এবং এক-ক্লিক ট্যাগ ফিল্টার; প্রতিটি কার্ড **রেন্ডার করা** নোটের শুরু দেখায় (শিরোনাম, চেকলিস্ট, কোড, লিঙ্ক), কাঁচা মার্কডাউন নয়। একটি **WYSIWYG সম্পাদক** একটি কমপ্যাক্ট সহ
ফরম্যাটিং বার (বোল্ড, তির্যক, কোড, শিরোনাম, তালিকা, চেকলিস্ট আপনি টেক্সট ডানে টিক দেন, সিনট্যাক্স সহ কোড ব্লক
হাইলাইটিং, লিঙ্ক, ছবি) এবং মার্কডাউন শর্টকাটগুলি আপনি টাইপ করার সাথে সাথে (`# `, `- `, `[ ] `, ` ``` `); একটি **MD** টগল
অশোধিত মার্কডাউন দেখায়, যা এখনও কীভাবে নোট সংরক্ষণ, অনুসন্ধান, সিঙ্ক এবং রপ্তানি করা হয়। সাথে লিঙ্কগুলি খুলুন
`Ctrl`+ক্লিক, শুধুমাত্র http(গুলি)। ছবি পেস্ট, ড্রপ বা সংযুক্ত করুন (PNG, JPEG, GIF, WebP 2 MB পর্যন্ত), প্রতিটি তার নিজস্ব সিল করা হয়েছে
এনক্রিপ্ট করা ফাইল, নোটের ভিতরে এবং কার্ডে থাম্বনেইল হিসাবে দেখানো হয়েছে; তারা এই মেশিনে থাকে, `.canto` এর বাইরে
ব্যাকআপ হাজার হাজার নোট পরিচালনা করে: তালিকাটি পৃষ্ঠাযুক্ত এবং অনুসন্ধান তাদের সমস্তকে কভার করে।

</td>
</tr>
<tr>
<td>

### 📋 ক্লিপবোর্ড যা কখনো ভুলে যায় না (বা ফাঁস হয়)

অনুসন্ধান এবং পিন সহ এনক্রিপ্ট করা ইতিহাস; লিঙ্ক, রং এবং কোড স্বীকৃতি দেয়। একটি আইটেমকে **কপি করার জন্য এটিকে পুনরায় লেখা** করুন:
JSON ফরম্যাট বা কমপ্যাক্ট, এক লাইনে টেক্সট, UPPERCASE বা ছোট হাতের (ইতিহাস এন্ট্রি যেমন ছিল তেমনই থাকে)। একটি বিশাল অনুলিপি (একটি 100 এমবি লগ) তা করে না
যেকোন কিছু হিমায়িত করুন: এটি শুরুকে রাখে এবং আপনাকে সতর্ক করে। উইন্ডোজে, এটি পাসওয়ার্ড ম্যানেজাররা যা চিহ্নিত করে তা এড়িয়ে যায়
সংবেদনশীল

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 আপনার GitHub এক নজরে

**আমার কাছ থেকে পর্যালোচনার অনুরোধ করা হয়েছে**, আমাকে বরাদ্দ করা হয়েছে, PRs এবং আমি যে সমস্যাগুলি খুলেছি, একটি PR বা ইস্যু আইকন সহ এবং কে খুলেছে
এটা খসড়া, PRs **আপনার পর্যালোচনার জন্য অপেক্ষা করছে** এবং PRs **স্টলড** এক সপ্তাহের জন্য আলাদা, এবং প্রতিটি PR একটি ছোট বহন করে
**সিআই ব্যাজ** (পাশ করা, ব্যর্থ, চলমান বা কোন সিআই নেই) তার প্রধান প্রতিশ্রুতির চেক থেকে। যখন কেউ **আপনার অনুরোধ করে
পর্যালোচনা**, একটি OS বিজ্ঞপ্তি আপনাকে বলে (ডিফল্টরূপে চালু, সেটিংসে এটি বন্ধ করুন)। পাঠ্য দ্বারা ফিল্টার করুন, `repo:` বা `label:`, PRs শুধুমাত্র বা শুধুমাত্র সমস্যা, আপডেট, সৃষ্টি বা মন্তব্য দ্বারা সাজান এবং
**আরো দেখান** দিয়ে স্ক্রোল করুন। যারা আপনার PRs (অবতার, মানব বনাম বট ব্যাজ, মন্তব্যের সংখ্যা, অনুসন্ধান, বট ফিল্টার, প্রগতিশীল পৃষ্ঠা সংখ্যা) এবং তাদের মন্তব্যগুলিতে মন্তব্য করেছেন তাদের প্রত্যেকের একটি **মন্তব্যকারীর ক্যাটালগ** গ্রিড দেখতে **মন্তব্য** দৃশ্যে স্যুইচ করুন৷ এছাড়াও **GitLab.com এবং স্ব-হোস্টেড GitLab** সমর্থন করে, একটি 5-মিনিট ক্যাশ সহ
হারের সীমাকে সম্মান করে। শুধুমাত্র পঠনযোগ্য ব্যক্তিগত টোকেন দিয়ে বা ব্রাউজার থেকে সাইন ইন করুন (ডিভাইস প্রবাহ)।

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam উইজেট ছাড়াই

Steam-এর জন্য চারটি সাব-ট্যাব: **ইচ্ছা তালিকার ডিল** (প্রথমে সবচেয়ে বড় ছাড়, প্রতিটি যা সংরক্ষণ করে), **শীর্ষ বিক্রেতা**
র‍্যাঙ্ক করা হয়েছে, **এখনই খেলুন** (প্রতিটি খেলা Steam গত দুই সপ্তাহের প্রতিবেদন) এবং **রেটিং অনুসারে অর্ডার করা ক্যাটালগ**, পৃষ্ঠাযুক্ত
**আরো লোড** দিয়ে যাতে এটি স্টোরের বাকি অংশে পৌঁছায়। প্রতিটি সারি **ক্যাপসুল আর্ট**, **রিভিউ স্কোর** বহন করে
Steam-এর নিজস্ব শব্দের সাথে এবং এটি কতগুলি পর্যালোচনা গণনা করে, ক্রস-আউট মূল্য, reais-এ মূল্য এবং কী
ডিসকাউন্ট সঞ্চয় - এবং তালিকা মোট সঞ্চয় যোগ করে। সর্বজনীন তালিকার জন্য শুধুমাত্র আপনার **SteamID64**; একটি ঐচ্ছিক
**Steam ওয়েব API কী** তাদের খেলার সময়ের সাথে সাম্প্রতিক গেমগুলি যোগ করে৷ ট্যাবটি ডিফল্টরূপে শুরু হয়, একটি চেকবক্স দূরে
সেটিংসে।

</td>
</tr>
<tr>
<td>

### ⚙️ সেটিংস এবং স্বয়ংক্রিয় আপডেট

মাস্টার পাসওয়ার্ড পরিবর্তন, Windows Hello, `.canto` ব্যাকআপ, স্বয়ংক্রিয় মার্জ সহ একটি সিঙ্ক করা ফোল্ডার (ড্রপবক্স,
OneDrive, Syncthing...), সিস্টেম এবং **আপডেট** বিভাগ দিয়ে শুরু করুন, **ইনস্টল করা সংস্করণ** এবং
**সর্বশেষ প্রকাশিত** এক পাশে এবং আপডেট এবং পুনরায় চালু করার জন্য একটি বোতাম।

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

এছাড়াও রয়েছে 🎙️ **মিটিং**, তালিকা এবং দিনের পাশে এজেন্ডার একটি সাব-ট্যাব: মিথুনের নোট এবং এর থেকে প্রতিলিপি
গত দুই সপ্তাহ, প্লাস `.vtt`, `.srt`, `.txt` এবং `.md` ট্রান্সক্রিপ্ট একটি স্থানীয় ফোল্ডার থেকে, পরিষ্কার করা হয়েছে এবং অনুসন্ধানযোগ্য।

🤖 **AI মডেল** (ডিফল্টভাবে ট্যাব বারে, **কোন API কী বা অ্যাকাউন্ট** নেই): LLMগুলি
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, এর পাবলিক লিডারবোর্ড পৃষ্ঠা থেকে পড়ুন,
একটি স্কোর বার, স্রষ্টা, প্রতি 1M টোকেনের মূল্য এবং গতি, বুদ্ধিমত্তা, মূল্য বা গতি অনুসারে বাছাই করা যায়। এটা এ নিয়ে আসে
সর্বাধিক প্রতি 3 ঘন্টায় একবার, এবং অপ্ট-ইন 🔔 আপনাকে সূচিত করে যখন a
মডেল **শীর্ষ 10 এ প্রবেশ করে** অথবা **এর মধ্যে আরোহণ করে** (ভল্টটি আনলক করার সময় প্রতি 6 ঘন্টা পর পর পরীক্ষা করা হয়), সাথে
এক সপ্তাহের জন্য "নতুন" এবং "আপ" ব্যাজ।

🌙 **বিরক্ত করবেন না:** সেটিংস বা ট্রেতে, নীরব মিটিং সতর্কতা, টাস্ক রিমাইন্ডার, স্ট্যাটাস সতর্কতা এবং প্রতিটি
আগামীকাল পর্যন্ত বা আপনি এটি বন্ধ না করা পর্যন্ত 30 মিনিট, 1 ঘন্টা, 2 ঘন্টার জন্য সিস্টেম বিজ্ঞপ্তি৷ উপরের বারে একটি চাঁদ দেখায়
যখন এটি শেষ হয়; একটি ক্লিক এটি বন্ধ করে দেয়। এটি একটি পুনঃসূচনা থেকে বেঁচে থাকে এবং নিজেই শেষ হয়।

🔔 **একটি স্ক্রিনে প্রতিটি সতর্কতা:** শিরোনামের বেল (কিছু মুলতুবি থাকা অবস্থায় গণনা এবং রঙ) খোলে
যেকোন মোডে পুরো উইন্ডো জুড়ে সতর্কতা: প্রতি সতর্কতার সাথে একটি কার্ড এর ক্রিয়া, **সব খারিজ**, এবং কী ছিল
তাদের অধীনে আজ সমাধান করা হয়েছে — কিছুই মুলতুবি নেই, এটা আপনি এখনও আজকের লগ পৌঁছানোর কিভাবে. ডক থেকে, একটি ক্লিক করুন
এখনও সাধারণ উইন্ডোর উপরে সেই একক সতর্কতা খোলে।

⌨️ **কীবোর্ড দ্বারা সবকিছু:** `Alt+1`…`Alt+7` ট্যাব পাল্টান, `N` তৈরি করে, `/` অনুসন্ধান করে, `F11` পূর্ণস্ক্রীন, `Alt+L`
লক করে এবং `?` শর্টকাট তালিকা করে। `Ctrl+Shift+P` (macOS এ `Cmd+Shift+P`) প্রতিটির সাথে একটি **কমান্ড প্যালেট** খোলে
নাম অনুসারে কাজ: একটি ট্যাবে যান, নতুন টাস্ক বা নোট, পরবর্তী মিটিংয়ে যোগ দিন, দিনের সারাংশ কপি করুন, স্কিন স্যুইচ করুন, লক করুন।

## 🎨 ছয়টি চামড়া

<table>
<tr>
<td align="center">_<img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br>__<b>ডিফল্ট</b>__</td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br>__<b>Hueco Mundo</b></td>
<td align="center">_<img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br>__<b>Dracula</b>_</td>
<td align="center">_<img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br>__<b>Glass</b>__</td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br>__<b>আলো</b>__</td>
</tr>
</table>

এবং **ফলো সিস্টেম**, যা OS এর সাথে আলো এবং অন্ধকারের মধ্যে সুইচ করে। সব AA বিপরীতে পাস.

<details>
<summary>🖥️ আরও স্ক্রীন: অনবোর্ডিং, গ্লোবাল সার্চ, কমান্ড প্যালেট, GitLab, সাবটাস্ক, নোট এডিটর, নিরাপত্তা, সিঙ্ক, ঘনত্ব এবং আরও অনেক কিছু</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| প্রথম দৌড়ে স্বাগতম | বিশ্বব্যাপী অনুসন্ধান (`Ctrl+K`) | স্ব-হোস্টেড GitLab ট্যাব | মিটিং সতর্কতা |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| সাবটাস্ক, অগ্রাধিকার এবং PR | সহ টাস্ক নোট সম্পাদক | আরো ক্লিপবোর্ড প্রকার | নিরাপত্তা: অটো-লক এবং আনলক |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| সিঙ্ক করা ফোল্ডার | কমপ্যাক্ট ঘনত্ব | তালাবদ্ধ ভল্ট | সংযোগ করুন GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| গ্রুপে সেটিংস, সার্চ সহ | অনুসন্ধান গোষ্ঠীগুলিকে ফিল্টার করে | হেডারে অফলাইন চিপ | ক্লিপবোর্ড সাফ করার আগে নিশ্চিত করুন |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| একটি অসংরক্ষিত নোট খসড়া বাতিল করুন |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| মোড: মিনি, লুকানো, সাধারণ, সর্বাধিক | মিনি মোড: স্ক্রিনের প্রান্তে সতর্কতা |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| ডকে একটি সতর্কতা ক্লিক করুন | সর্বাধিক করা হয়েছে: খোলা ট্যাবের জন্য পুরো উইন্ডো |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| বেল পুরো জানালা জুড়ে সতর্কতা খোলে |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| মিনি: মোড মেনু ডক উইন্ডোর ভিতরে খোলে |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| যে ট্যাবগুলি উপযুক্ত নয় সেগুলি "আরো" মেনুতে অপেক্ষা করুন |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| গেমস এবং পূর্ণ স্ক্রীন: আপনি চলে যাওয়া পর্যন্ত সতর্কতা অপেক্ষা করুন |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| স্নুজ: 1, 5 বা 10 মিনিট |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| টাস্ক রিমাইন্ডার | মাস্টার পাসওয়ার্ড পরিবর্তন করুন | স্থিতি API (অপ্ট-ইন ট্যাব) | ভাষা: ইংরেজি, পর্তুগিজ বা স্প্যানিশ |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| একটি ক্লিপ পুনরায় লেখা কপি | প্রস্তুতির সাথে মিটিং সতর্কতা |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| পুনরায় ডিজাইন করুন: টাস্ক ট্যাব, আগে এবং পরে |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| পুনরায় ডিজাইন করুন: প্রতিটি ট্যাব, আগে (শীর্ষ) এবং পরে (নীচে) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI ব্যর্থ, ভাঙ্গা কাজ সঙ্গে | কেউ আমাকে উল্লেখ করেছে | সেটিংসে তাদের সুইচ |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| কে লিখেছে তার সাথে সতর্কতা উল্লেখ করুন |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| পাঠ্যের পূর্বরূপ সহ সতর্কতা উল্লেখ করুন |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| আমার নিজের কাজ সম্পর্কে আরও সতর্কতা |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| দিনের সারাংশ সতর্কতা | দিনের সারাংশ সেটিং |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| উল্লেখ সাবট্যাব (GitHub এবং GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| পাসওয়ার্ড পরিবর্তন, একটি ফাইল মুলতুবি | দিনের সারসংক্ষেপ |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| সাপ্তাহিক প্রতিবেদন | এজেন্ডা: পরবর্তী বিনামূল্যে সময় এবং দ্বন্দ্ব |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| এজেন্ডা: এখন বিনামূল্যে | কমান্ড প্যালেট (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| বিরক্ত করবেন না | একটি নোটে ছবি |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| প্রতি PR এ CI ব্যাজ | রিভিউ অনুরোধ বিজ্ঞপ্তি |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| থাম্বনেল হিসাবে ছবি নোট করুন | WYSIWYG নোট সম্পাদক |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| নোট সম্পাদক: কাঁচা মার্কডাউন (এমডি) | হালকা ত্বকে নোট সম্পাদক |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| কাজ: সারিতে অগ্রাধিকার, লম্বা শিরোনাম মোড়ানো | রেন্ডার করা মার্কডাউন সহ নোট তালিকা |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| ইন্টেলিজেন্স ইনডেক্স দ্বারা র্যাঙ্ক করা এআই মডেল |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: শীর্ষ বিক্রেতা, সংখ্যাযুক্ত | Steam: শেষ পাঁচটি খেলা খেলা হয়েছে, উভয় খেলার সময় সহ |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: রেটিং অনুসারে ক্যাটালগ, "আরো লোড" সহ | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| মুলতুবি থাকা সবকিছুর জন্য একটি সতর্কতা ওভারলে: বিভ্রাট, মিটিং, কাজ এবং নতুন এআই মডেল |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| আমার শেষ পয়েন্ট: সর্বশেষ লেটেন্সি সহ টাইলস | একটি খোলা শেষ পয়েন্ট: লেটেন্সি চার্ট, সীমা এবং সতর্কতা সেটিংস | একটি DNS + শংসাপত্র চেক যোগ করা হচ্ছে |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| যেকোনো দিনের আলোচ্যসূচি: পূর্ববর্তী এবং পরবর্তী তীর, একটি তারিখ পিকার এবং একটি ব্যাক-টু-টুডে বোতাম |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| কার্য: টাইমার এবং গোষ্ঠীবদ্ধ তালিকা সহ বর্তমান কাজ | GitHub: তালিকার উপরে সারাংশ স্ট্রিপ | GitLab: একই স্ট্রিপ, CI টাইল ছাড়া |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| প্রতিটি ট্যাবের নিচে ফোকাস টাইমার পিন করা আছে | দিন হিসেবে এজেন্ডা, মিটিং এর পাশে কাজ |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| দিনের দৃশ্য: ওভারল্যাপিং ইভেন্টগুলি পাশাপাশি প্রস্থ শেয়ার করে |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| রিভিউ রাডার: সবচেয়ে পুরানো অনুরোধ প্রথমে, লাল রঙে ওভারডিউ, স্নুজ |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| এজেন্ডার একটি উপ-ট্যাব হিসাবে মিটিং, তালিকা এবং দিবসের পাশে |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| কার্যকলাপ ট্যাব (ডিফল্টরূপে বন্ধ) | ফোকাস করা সময় এবং বন্ধ PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| কার্যকলাপ ট্যাব, গত 7 দিন | কার্যকলাপ ট্যাব, বন্ধ | একটি প্রশস্ত উইন্ডোতে কার্যকলাপ ট্যাব |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

**অ্যাক্টিভিটি** ট্যাবটি লুকানো শুরু হয় (সেটিংস → দৃশ্যমান ট্যাবের অধীনে এটি চালু করুন)। এটা শুধুমাত্র নাম রেকর্ড
আপনি কম্পিউটার ব্যবহার করার সময় ফোকাসড অ্যাপ্লিকেশন, একটি সিল করা স্থানীয় ফাইলে যা কখনই ব্যাকআপ বা সিঙ্কে পৌঁছায় না (ওয়েল্যান্ড
ফোকাস করা উইন্ডোটি রিপোর্ট করতে পারে না, তাই এটি সেখানে অনুপলব্ধ থাকে)। আপনি অপ্ট ইন না করা পর্যন্ত বন্ধ করুন, এবং প্রথম স্ক্রীন কি বলে
রাখা হয় এবং যা কখনও হয় না।

- **দিন**: একটি ডোনাট বিভাগ অনুসারে মোট ভিতরের অংশ, যার কিংবদন্তি একটি বিভাগ লুকিয়ে রাখে, দিনের বিপরীতে পরিবর্তন
আগে এবং নিষ্ক্রিয় সময় (2 মিনিটের জন্য কীবোর্ড বা মাউস নেই)। এটির নীচে, একটি দৈনিক কোড-ফোকাস লক্ষ্য তার স্ট্রিক সহ এবং
প্রতিদিন একটি বিন্দু, তিনটি হাইলাইট (একটি অ্যাপে দীর্ঘতম প্রসারিত, অ্যাপ সুইচ, পিক আওয়ার), একটি টাইমলাইন যেখানে পুরো
দিন, নিষ্ক্রিয় প্রসারিত এবং ব্যস্ততম অ্যাপগুলি "এখন" মার্কার এবং অ্যাপ্লিকেশনগুলির একটি তালিকা সহ এক সময়ের অক্ষ ভাগ করে
(এটির বিভাগ পরিবর্তন করতে একটিতে আলতো চাপুন) বা ফোকাস টাইমারটি যে কাজগুলিতে চলেছিল।
- **সপ্তাহ**: প্রতি দিন স্তুপীকৃত কলামগুলি গড় লাইন এবং প্রতিটি দিনের নীচে একটি বিন্দু যা লক্ষ্য পূরণ করে, এক ঘন্টা তাপ মানচিত্র
আপনার শিখর সহ, এবং পুরো সপ্তাহের জন্য একই তালিকা।
- **লেআউট এবং স্কিনস**: ডিফল্ট উইন্ডোতে একটি কলাম, একবার প্রশস্ত হলে দুটি (সর্বাধিক); প্রতিটি ত্বকের নিজস্ব আছে
বিষয়শ্রেণীর রং, বৈসাদৃশ্য জন্য চেক. দিনের পাশের মেনু এটি পাঠ্য হিসাবে অনুলিপি করে।

<sub>সমস্ত স্ক্রিনশট কাল্পনিক ডেটা ব্যবহার করে।</sub>

## ⚖️ বাইরে যা আছে তার তুলনায়

গবেষণা করা কোনো টুলই একবারে এই দুইটির বেশি ফ্রন্টকে কভার করে না। সূত্র এবং বিস্তারিত ইন
[docs/benchmark.md](docs/benchmark.md).

| | কাজ + অনুস্মারক | নোট | ক্লিপবোর্ড | মিটিং | GitHub | ডিফল্টরূপে স্থানীয় এনক্রিপশন |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| অবসিডিয়ান / জপলিন | ➖ | ✅ | — | — | — | ➖ শুধুমাত্র সিঙ্ক |
| রেকাস্ট | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ/Ditto | — | — | ✅ | — | — | ➖ ঐচ্ছিক |
| মিটিংবার | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ নেটিভ · ➖ আংশিক, এক্সটেনশনের মাধ্যমে বা ঐচ্ছিক · — কোনোটিই · ? অপ্রকাশিত · n/a ব্যবহারকারীর ডেটা সঞ্চয় করে না</sub>

বেঞ্চমার্ক এখানে যা এনেছে: **টাস্ক শিরোনামের ঠিক সময়** (টোডোইস্ট/টিকটিক), **সতর্কতা স্নুজ করুন**
(টিকটিক) এবং **ক্লিপবোর্ড যা পাসওয়ার্ড পরিচালকদের সম্মান করে** (CopyQ/Ditto)।

## ⬇️ ইনস্টল করুন

**[Releases](https://github.com/juninmd/canto-widget/releases)** থেকে আপনার প্ল্যাটফর্মের জন্য ইনস্টলারটি ডাউনলোড করুন:

| সিস্টেম | ফাইল |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (প্রস্তাবিত) বা `.msi` |
| 🍎 macOS | Apple Silicon বা Intel এর জন্য `.dmg` |
| 🐧 লিনাক্স | `.AppImage`, `.deb` বা `.rpm` |

1. প্রথম রানে আপনি **মাস্টার পাসওয়ার্ড** তৈরি করবেন। কোনো পুনরুদ্ধার নেই: পাসওয়ার্ড হারান, ডেটা হারান।
2. `Ctrl+Alt+Space` (macOS-এ `Cmd+Shift+Space`) উইজেটটি দেখায় এবং লুকিয়ে রাখে।
3. সম্পন্ন। যখন একটি নতুন সংস্করণ পাঠানো হয়, তখন Canto আপনাকে অবহিত করে এবং **সেটিংস → আপডেট** এক ক্লিকে আপডেট হয়।

> [!দ্রষ্টব্য]
> ইনস্টলাররা এখনও কোড-সাইন করা হয়নি: স্মার্টস্ক্রিন (উইন্ডোজ) এবং গেটকিপার (ম্যাকওএস) প্রথম লঞ্চের সময় সতর্ক করে৷
> স্বয়ংক্রিয় আপডেটগুলি চালানোর আগে প্রকল্পের নিজস্ব স্বাক্ষরের বিরুদ্ধে যাচাই করা হয়।

উইনগেট এবং হোমব্রু (প্লাস ফ্ল্যাটপ্যাকের জন্য একটি কঙ্কাল, বর্তমানে অবরুদ্ধ) জন্য প্রস্তুত ম্যানিফেস্টগুলি বাস করে
[`packaging/`](packaging/README.md) — স্থানীয়ভাবে প্রস্তুত এবং যাচাই করা হয়েছে, কিন্তু এখনও তাদের কাছে প্রকাশিত হয়নি
সংগ্রহস্থল: প্রকাশনা হল রক্ষণাবেক্ষণকারীর একটি ম্যানুয়াল সিদ্ধান্ত এবং পদক্ষেপ।

## 🔒 এক নজরে নিরাপত্তা

| স্তর | সুরক্ষা |
|---|---|
| ভল্ট | Argon2id (19 MiB, t=2) → AES-256-GCM, প্রতিটি লেখায় একটি নতুন নন্স, `fsync` এর সাথে পরমাণু লিখুন |
| কী | শুধুমাত্র RAM, লক অন জিরোড; কনফিগারযোগ্য স্বয়ংক্রিয়-লক (5 থেকে 60 মিনিট নিষ্ক্রিয়, ডিফল্টভাবে 15 মিনিট) |
| নেটওয়ার্ক | শুধুমাত্র Rust প্রক্রিয়া নেটওয়ার্কের সাথে কথা বলে; ওয়েবভিউ এর কোন রিমোট অরিজিন (CSP) নেই এবং টোকেন কখনই দেখে না |
| Google | ঐচ্ছিক, শুধুমাত্র `calendar.events.readonly`, `directory.readonly` (অতিথি তালিকায় কর্মক্ষেত্র সহকর্মীদের ফটো) প্লাস প্রোফাইল, OAuth এর সাথে PKCE এবং লুপব্যাক |
| GitHub | ঐচ্ছিক, এনক্রিপ্ট করা টোকেন; লিঙ্কটি `https://github.com/` | হলেই আইটেম খোলা হয়
| GitLab | ঐচ্ছিক, এনক্রিপ্ট করা ঠিকানা এবং টোকেন; `https://` শুধুমাত্র, কোন পুনঃনির্দেশ নয়, শুধুমাত্র কনফিগার করা উদাহরণ থেকে লিঙ্ক |
| আপডেট | শুধুমাত্র প্রকল্পের কী দ্বারা স্বাক্ষরিত একটি প্যাকেজ ইনস্টল করে; একটি টেম্পারড ডাউনলোড চালানোর আগে বাতিল করা হয় |

সম্পূর্ণ মডেল, ব্যাকআপ, মেশিন জুড়ে মার্জ এবং যেখানে প্রতিটি ফাইল থাকে: [docs/seguranca.md](docs/seguranca.md)।
একটি ত্রুটি খুঁজে পেয়েছেন? [SECURITY.md](SECURITY.md)

## 📚 ডকুমেন্টেশন

| দলিল | কি আছে এতে |
|---|---|
| 📖 [User guide](docs/uso.md) | ট্যাব, পুনরাবৃত্ত কাজ, শর্টকাট, স্কিন, অ্যাক্সেসিবিলিটি, উইন্ডো, আপডেট এবং সিস্টেম দিয়ে শুরু করুন |
| 🔌 [Integrations](docs/integracoes.md) | Google এজেন্ডা এবং GitHub (ব্যক্তিগত টোকেন বা ডিভাইস প্রবাহ) |
| 🛡️ [Security and data](docs/seguranca.md) | হুমকি মডেল, `.canto` ব্যাকআপ, মার্জ, পাসওয়ার্ড পরিবর্তন, ডিস্কে ফাইল |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify এবং ভলিউম পরীক্ষা |
| 📝 [CHANGELOG](CHANGELOG.md) | প্রতিটি সংস্করণে কি পরিবর্তন হয়েছে |
| 🤝 [How to contribute](CONTRIBUTING.md) | পরিবেশ, পরীক্ষা, PRs এবং কিভাবে একটি রিলিজ প্রকাশ করতে হয় |
| 🤖 [Agent guide](AGENTS.md) | যে কেউ AI এর সাথে কোড সম্পাদনা করছে তাদের জন্য চুক্তি এবং ফাঁদ |

## 🛠️ উন্নয়ন

পূর্বশর্ত: [Bun](https://bun.sh) ≥ 1.2, স্থিতিশীল Rust ≥ 1.85 এবং
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) আপনার সিস্টেমের জন্য।

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

ওয়েবভিউ Rust স্টেটের পরে তৈরি করা হয় এবং ট্রে আরম্ভ করা হয়, তাই স্টার্টআপ IPC কল রেস সেটআপ করতে পারে না।

প্রতিটি PR Windows, macOS এবং Linux-এ CI চালায়। প্রচলিত `fix`, `feat` এবং ব্রেকিং কমিট `main` এ একত্রিত হয়েছে
একটি SemVer ট্যাগ, উত্পন্ন রিলিজ নোট এবং সমান্তরালভাবে নির্মিত স্বাক্ষরিত ইনস্টলার পান; রিলিজ যাচাই করার পরে প্রকাশিত হয় (বিস্তারিত
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 লাইসেন্স

[MIT](LICENSE) © আন্তোনিও কার্লোস

<div align="center"><sub> 🦀 Rust, ⚛️ React এবং ☕ যারা মিটিং এর মধ্যে থাকে তাদের জন্য তৈরি।</sub>_</div>
