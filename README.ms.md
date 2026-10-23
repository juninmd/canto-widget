<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · **Bahasa Melayu** · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Tugas dengan peringatan, nota, sejarah papan keratan, agenda dengan makluman mesyuarat, transkrip dan GitHub PRs anda
> dalam tetingkap kecil yang disematkan pada penjuru skrin.** Muncul dengan `Ctrl+Alt+Space`, bersembunyi apabila anda tidak perlu
> ia dan memastikan segala-galanya disulitkan pada mesin anda, tanpa akaun dan pelayan.

## 🌐 Bahasa

Canto menawarkan **42 bahasa antara muka**, setiap satu dengan README sendiri. Pilih milik anda dalam **Tetapan → Bahasa**;
pemilih yang boleh dicari menggunakan nama bahasa ibunda dan mod automatik mengikut bahasa sistem utama anda.
Arab, Ibrani dan Parsi menggunakan teks kanan ke kiri. Katalog bahasa tambahan dimuatkan atas permintaan.

40 katalog antara muka baharu dan 31 terjemahan README baharu ialah terjemahan mesin dan belum
disemak oleh penutur asli. Portugis dan Inggeris kekal sebagai katalog antara muka asal. Label dulang dan
tajuk pemberitahuan mengikut bahasa yang dipilih; beberapa butiran amaran penyepaduan kembali kepada bahasa Inggeris,
dan ralat bahagian belakang kekal dalam bahasa Portugis. Sintaks tajuk tugasan mengekalkan kata kunci bahasa Portugis dan Inggeris sedia ada.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Mengapa Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Jika anda tinggal di antara mesyuarat, PRs dan item kecil yang belum selesai, anda akan mendapat lima apl dibuka. Canto meletakkan semuanya
satu tempat.

🔒 **Disulitkan secara lalai.** Argon2id + AES-256-GCM dengan kata laluan induk; kunci hanya wujud dalam RAM.
Windows Hello pilihan.

🏠 **Data anda kekal bersama anda.** Telemetri sifar, pelayan sifar, tiada akaun diperlukan. Sandaran ialah satu yang disulitkan
`.canto` fail.

⏰ **Anda tidak akan terlepasnya.** 1 minit sebelum mesyuarat dan pada masa peringatan, widget muncul, memainkan bunyi dan
menghantar pemberitahuan, dengan **tunda 10 min**.

🪶 **Ringan.** Tauri v2 (Rust + paparan web sistem) dan bukannya Electron: pemasang 3.5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Sentiasa terkini.** Kemas kini dari dalam apl dan hanya memasang apa yang ditandatangani oleh kunci projek itu sendiri.

</td>
</tr>
</table>

## 🧰 Ciri-ciri

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Tugasan yang mengingatkan anda

Senarai semak harian dengan masa dan berulang (setiap hari, hari bekerja atau mingguan). Taip **`Daily at 9:30am`** dan
peringatan telah ditetapkan; tambah **`!high`** (atau `!alta`, `!média`, `!baixa`) untuk keutamaan, atau klik titik pada baris untuk mengitarnya. Tajuk panjang membalut bukannya dipotong. **Pemasa fokus** pada sebarang tugasan: berikan anggaran, tekan ▶ dan bar yang disematkan di bawah setiap tab mengira masa menentangnya (merah sebaik sahaja anda melepasi); masa disimpan ke bilik kebal setiap minit. **Ringkasan hari** sedia untuk ditampal (tugas, masa yang difokuskan, mesyuarat dengan jumlah masa, PRs/MRs dibuka, digabungkan, disemak dan ditutup tanpa digabungkan), **laporan mingguan dan bulanan** dalam penurunan nilai dan **tarik semula item yang belum selesai** dari semalam. **Tangkapan pantas** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` pada macOS) mencatat tugas atau nota daripada mana-mana apl, tanpa membuka widget.

</td>
</tr>
<tr>
<td>

### 📅 Mesyuarat bermula? Ia memberitahu anda.

Sertai mesyuarat seterusnya dengan `Ctrl+Alt+M` (`Ctrl+Cmd+M` pada macOS). Jika pendaftaran gagal, Canto cuba
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` pada macOS); menu dulang kekal tersedia jika kedua-duanya tidak tersedia.

Acara hari ini datang daripada Google Kalendar (baca sahaja). Satu minit sebelum itu, widget melompat ke skrin dengan
**sertai Meet**, memainkan bunyi dan menghantar pemberitahuan sistem, mana-mana tab yang anda gunakan atau walaupun ia disembunyikan.
Setiap kad menunjukkan lencana dengan jawapan anda (diterima, mungkin, ditolak, menunggu). Klik acara untuk melihat siapa yang menganjurkan
ia, agenda, setiap tetamu dengan avatar inisial dan jawapan mereka, dan lampiran, seperti nota Gemini.
Baris teratas memberitahu anda **slot percuma seterusnya** sekurang-kurangnya 15 minit (jemputan ditolak dan acara sepanjang hari tidak
kiraan), dan acara yang bertindih mendapat lencana **konflik** yang menamakan acara lain. Pandangan **Hari ini** mendahului dengan mesyuarat sedang berlangsung (tinggal masa, butang sertai, amaran pertembungan) atau yang seterusnya, kemudian **hari dalam satu baris** (mesyuarat, tugasan dan masa lapang sepanjang waktu kerja, dengan masa mesyuarat, masa lapang dan konflik dikira) dan satu garis masa di mana mesyuarat, tugasan dengan masa dan ruang kosong adalah barisan mereka sendiri: satu jurang yang ditawarkan untuk memenuhinya.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Nota sebagai kad

Kad yang boleh dicari dengan `#tags`, pin ke atas dan penapis teg satu klik; setiap kad menunjukkan permulaan nota **diberikan** (tajuk, senarai semak, kod, pautan), bukan penurunan harga mentah. **Editor WYSIWYG** dengan padat
bar pemformatan (tebal, condong, kod, tajuk, senarai, senarai semak yang anda tandakan terus dalam teks, blok kod dengan sintaks
penonjolan, pautan, imej) dan pintasan markdown semasa anda menaip (`# `, `- `, `[ ] `, ` ``` `); togol **MD**
menunjukkan penurunan harga mentah, iaitu cara nota disimpan, dicari, disegerakkan dan dieksport. Pautan dibuka dengan
`Ctrl`+klik, http(s) sahaja. Tampal, lepaskan atau lampirkan imej (PNG, JPEG, GIF, WebP sehingga 2 MB), setiap satu dimeterai dalam imejnya sendiri
fail yang disulitkan, ditunjukkan di dalam nota dan sebagai lakaran kecil pada kad; mereka kekal di mesin ini, di luar `.canto`
sandaran. Mengendalikan beribu-ribu nota: senarai dihalakan halaman dan carian meliputi kesemuanya.

</td>
</tr>
<tr>
<td>

### 📋 Papan klip yang tidak pernah lupa (atau bocor)

Sejarah yang disulitkan dengan carian dan pin; mengenali pautan, warna dan kod. Tuding item untuk **menyalinnya ditulis semula**:
JSON berformat atau padat, teks pada satu baris, HURUF BESAR atau huruf kecil (entri sejarah kekal seperti sedia ada). Salinan gergasi (log 100 MB) tidak
bekukan apa-apa: ia mengekalkan permulaan dan memberi amaran kepada anda. Pada Windows, ia melangkau sebarang tanda pengurus kata laluan sebagai
sensitif.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub anda sekali imbas

**Semakan diminta daripada saya**, diberikan kepada saya, PRs dan isu yang saya buka, dengan ikon PR atau isu dan siapa yang membuka
ia. Draf, PRs **menunggu semakan anda** dan PRs **terhenti** selama seminggu terserlah, dan setiap PR membawa sekeping kecil
**Lencana CI** (lulus, gagal, berjalan atau tiada CI) daripada semakan komit utamanya. Apabila seseorang **meminta anda
semakan**, pemberitahuan OS memberitahu anda (dihidupkan secara lalai, matikannya dalam Tetapan). Tapis mengikut teks, `repo:` atau `label:`, PRs sahaja atau isu sahaja, mengisih mengikut kemas kini, penciptaan atau ulasan dan
tatal dengan **tunjukkan lagi**. Beralih ke paparan **Ulasan** untuk melihat grid **Katalog Pengulas** semua orang yang mengulas pada PRs anda (avatar, lencana manusia lwn bot, kiraan ulasan, carian, penapis bot, penomboran progresif) dan ulasan mereka. Juga menyokong **GitLab.com dan GitLab** yang dihoskan sendiri, dengan cache 5 minit yang
menghormati had kadar. Log masuk dengan token peribadi baca sahaja atau daripada penyemak imbas (aliran peranti).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam tanpa meninggalkan widget

Empat subtab untuk Steam: **tawaran senarai keinginan** (diskaun terbesar dahulu, setiap satu dengan apa yang jimat), **terlaris**
berperingkat, **main sekarang** (setiap perlawanan Steam melaporkan selama dua minggu lepas) dan **katalog yang dipesan mengikut rating**, dihalakan halaman
dengan **muatkan lebih** supaya ia sampai ke seluruh kedai. Setiap baris membawa **seni kapsul**, **skor ulasan**
dengan perkataan Steam sendiri dan berapa banyak ulasan yang dikira, harga yang dicoret, harga dalam reais dan berapa
penjimatan diskaun — dan senarai itu menambah jumlah penjimatan. Senarai awam hanya memerlukan **SteamID64** anda; pilihan
**Steam Web API kunci** menambahkan permainan terbaru dengan masa permainan mereka. Tab bermula secara lalai, satu kotak pilihan lagi
dalam Tetapan.

</td>
</tr>
<tr>
<td>

### ⚙️ Tetapan dan kemas kini automatik

Tukar kata laluan induk, Windows Hello, sandaran `.canto`, folder yang disegerakkan dengan gabungan automatik (Dropbox,
OneDrive, Syncthing...), mulakan dengan sistem dan bahagian **Kemas kini**, dengan **versi terpasang** dan
**terbaru diterbitkan** sebelah menyebelah dan butang untuk mengemas kini dan memulakan semula.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Juga mempunyai 🎙️ **Mesyuarat**, sub-tab Agenda di sebelah Senarai dan Hari: nota dan transkrip Gemini daripada
dua minggu lepas, ditambah `.vtt`, `.srt`, `.txt` dan `.md` transkrip daripada folder setempat, dibersihkan dan boleh dicari.

🤖 **Model AI** (pada bar tab secara lalai, **tiada kunci atau akaun API**): LLM ditarafkan mengikut
[Artificial Analysis](https://artificialanalysis.ai) **Indeks Perisikan**, baca dari halaman papan pendahulu awamnya,
dengan bar skor, pencipta, harga setiap token 1M dan kelajuan, boleh diisih mengikut kecerdasan, harga atau kelajuan. Ia diambil pada
kebanyakannya sekali setiap 3 jam, dan ikut serta 🔔 memberitahu anda apabila a
model **masuk 10 teratas** atau **mendaki di dalamnya** (diperiksa setiap 6 jam semasa peti besi tidak berkunci), dengan
lencana "baharu" dan "atas" selama seminggu.

🌙 **Jangan ganggu:** dalam Tetapan atau dulang, senyapkan makluman mesyuarat, peringatan tugas, makluman status dan setiap
pemberitahuan sistem selama 30 minit, 1 jam, 2 jam, sehingga esok atau sehingga anda mematikannya. Bulan di bar atas menunjukkan
apabila ia berakhir; satu klik mematikannya kembali. Ia bertahan apabila dimulakan semula dan berakhir dengan sendirinya.

🔔 **Setiap makluman dalam satu skrin:** loceng dalam pengepala (kira dan warna apabila ada yang belum selesai) membuka
makluman pada seluruh tetingkap dalam mana-mana mod: satu kad setiap makluman dengan tindakannya, **tolak semua** dan apa yang
diselesaikan hari ini di bawah mereka — tanpa menunggu apa-apa, begitulah cara anda masih mencapai log hari ini. Dari dok, satu klik
masih membuka amaran tunggal itu di atas tetingkap biasa.

⌨️ **Semuanya mengikut papan kekunci:** `Alt+1`…`Alt+7` tukar tab, `N` mencipta, `/` carian, `F11` skrin penuh, `Alt+L`
kunci dan `?` menyenaraikan pintasan. `Ctrl+Shift+P` (`Cmd+Shift+P` pada macOS) membuka **palet arahan** dengan setiap
tindakan mengikut nama: pergi ke tab, tugasan baharu atau nota, sertai mesyuarat seterusnya, salin ringkasan hari itu, tukar kulit, kunci.

## 🎨 Enam kulit

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Default</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

Dan **Ikuti sistem**, yang bertukar antara terang dan gelap bersama-sama dengan OS. Semua melepasi kontras AA.

<details>
<summary>🖥️ Lebih banyak skrin: onboarding, carian global, palet arahan, GitLab, subtugas, editor nota, keselamatan, penyegerakan, ketumpatan dan banyak lagi</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Sambutan pertama | Carian global (`Ctrl+K`) | Tab GitLab yang dihoskan sendiri | Makluman mesyuarat |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Tugasan dengan subtugasan, keutamaan dan PR | Editor nota | Lagi jenis papan keratan | Keselamatan: autokunci dan buka kunci |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Folder disegerakkan | Ketumpatan padat | Bilik kebal berkunci | Sambungkan GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Tetapan dalam kumpulan, dengan carian | Carian menapis kumpulan | Cip luar talian dalam pengepala | Sahkan sebelum mengosongkan papan keratan |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Buang draf nota yang belum disimpan |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Mod: Mini, Tersembunyi, Normal, Maksimum | Mod mini: makluman pada tepi skrin |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klik makluman dalam dok | Dimaksimumkan: keseluruhan tetingkap untuk tab terbuka |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Loceng membuka makluman di seluruh tingkap |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: menu mod dibuka di dalam tetingkap dok |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Tab yang tidak sesuai menunggu dalam menu "lagi" |
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

| Permainan dan skrin penuh: makluman tunggu sehingga anda meninggalkan |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Tunda: 1, 5 atau 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Peringatan tugas | Tukar kata laluan induk | Status API (tab ikut serta) | Bahasa: Inggeris, Portugis atau Sepanyol |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Salin klip yang ditulis semula | Makluman mesyuarat dengan persediaan |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Reka bentuk semula: tab Tugasan, sebelum dan selepas |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Reka bentuk semula: setiap tab, sebelum (atas) dan selepas (bawah) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI gagal, dengan kerja yang rosak | Seseorang menyebut saya | Suis mereka dalam Tetapan |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Sebut makluman dengan siapa yang menulisnya |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Sebut makluman dengan pratonton teks |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Lagi makluman tentang kerja saya sendiri |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Makluman ringkasan hari | Tetapan ringkasan hari |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Menyebut subtab (GitHub dan GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Kata laluan ditukar, satu fail belum selesai | Ringkasan hari |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Laporan mingguan | Agenda: masa lapang seterusnya dan konflik |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: percuma sekarang | Palet arahan (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Jangan ganggu | Imej dalam nota |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Lencana CI pada setiap PR | Semak pemberitahuan permintaan |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Perhatikan imej sebagai lakaran kecil | editor nota WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Editor nota: penurunan harga mentah (MD) | Editor nota pada kulit cerah |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Tugasan: keutamaan pada baris, tajuk panjang membalut | Senarai nota dengan penurunan harga yang diberikan |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Model AI disenaraikan mengikut Indeks Perisikan |
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

| Satu tindanan amaran untuk semua yang belum selesai: gangguan, mesyuarat, tugas dan model AI baharu |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Titik akhir saya: jubin dengan kependaman terkini | Titik akhir terbuka: carta kependaman, tetapan had dan makluman | Menambah DNS + semakan sijil |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda mana-mana hari: anak panah sebelumnya dan seterusnya, pemilih tarikh dan butang kembali ke hari ini |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Tugasan: tugas semasa dengan pemasa dan senarai berkumpulan | GitHub: jalur ringkasan di atas senarai | GitLab: jalur yang sama, tanpa jubin CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Pemasa fokus disematkan di bawah setiap tab | Agenda sebagai hari, tugasan di samping mesyuarat |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Paparan hari: acara bertindih berkongsi lebar sebelah menyebelah |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Semak radar: permintaan tertua dahulu, tertunggak dalam warna merah, tunda |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Mesyuarat sebagai sub-tab Agenda, di sebelah Senarai dan Hari |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Tab aktiviti (dimatikan secara lalai) | Ringkasan dengan masa fokus dan ditutup PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Tab aktiviti, 7 hari lepas | Tab aktiviti, dimatikan | Tab aktiviti pada tetingkap lebar |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Tab **Aktiviti** mula disembunyikan (hidupkannya di bawah Tetapan → tab kelihatan). Ia hanya merekodkan nama
aplikasi terfokus semasa anda menggunakan komputer, dalam fail tempatan tertutup yang tidak pernah mencapai sandaran atau penyegerakan (Wayland
tidak dapat melaporkan tetingkap fokus, jadi ia kekal tidak tersedia di sana). Mati sehingga anda ikut serta dan skrin pertama menyatakan apa
disimpan dan yang tidak pernah ada.

- **Hari**: donat mengikut kategori dengan jumlah di dalam, yang legendanya menyembunyikan kategori, perubahan terhadap hari itu
sebelum dan masa melahu (tiada papan kekunci atau tetikus selama 2 minit). Di bawahnya, matlamat fokus kod harian dengan coretan dan
satu titik setiap hari, tiga sorotan (regangan paling lama dalam satu apl, suis apl, waktu puncak), garis masa yang keseluruhannya
hari, regangan melahu dan apl paling sibuk berkongsi satu paksi masa dengan penanda "sekarang" dan senarai aplikasi
(ketik satu untuk menukar kategorinya) atau tugasan pemasa fokus dijalankan.
- **Minggu**: lajur bertindan setiap hari dengan garis purata dan titik di bawah setiap hari yang mencapai matlamat, peta haba sejam
dengan kemuncak anda, dan senarai yang sama untuk sepanjang minggu.
- **Susun atur dan kulit**: satu lajur dalam tetingkap lalai, dua sekali ia lebar (dimaksimumkan); setiap kulit ada yang tersendiri
warna kategori, diperiksa untuk kontras. Menu di sebelah hari menyalinnya sebagai teks.

<sub>Semua tangkapan skrin menggunakan data rekaan.</sub>

## ⚖️ Berbanding dengan apa yang ada di luar sana

Tiada alat yang dikaji meliputi lebih daripada dua bahagian ini sekaligus. Sumber dan butiran dalam
[docs/benchmark.md](docs/benchmark.md).

| | Tugasan + peringatan | Nota | Papan klip | Mesyuarat | GitHub | Penyulitan setempat secara lalai |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ penyegerakan sahaja |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ pilihan |
| Bar Mesyuarat | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ asli · ➖ separa, melalui sambungan atau pilihan · — tiada · ? tidak diterbitkan · n/a tidak menyimpan data pengguna</sub>

Perkara yang dibawa oleh penanda aras ke sini: **masa tepat dalam tajuk tugasan** (Todoist/TickTick), **tunda amaran**
(TickTick) dan **papan klip yang menghormati pengurus kata laluan** (CopyQ/Ditto).

## ⬇️ Pasang

Muat turun pemasang untuk platform anda daripada **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistem | Fail |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (disyorkan) atau `.msi` |
| 🍎 macOS | `.dmg` untuk Apple Silicon atau Intel |
| 🐧 Linux | `.AppImage`, `.deb` atau `.rpm` |

1. Pada larian pertama anda mencipta **kata laluan induk**. Tiada pemulihan: hilang kata laluan, hilang data.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` pada macOS) menunjukkan dan menyembunyikan widget.
3. Selesai. Apabila versi baharu dihantar, Canto memberitahu anda dan **Tetapan → Kemas Kini** mengemas kini dengan satu klik.

> [!CATATAN]
> Pemasang belum ditandatangani kod lagi: SmartScreen (Windows) dan Gatekeeper (macOS) memberi amaran pada pelancaran pertama.
> Kemas kini automatik disahkan terhadap tandatangan projek sendiri sebelum dijalankan.

Manifes siap sedia untuk winget dan Homebrew (serta rangka untuk Flatpak, sedang disekat) tinggal di
[`packaging/`](packaging/README.md) — disediakan dan disahkan secara tempatan, tetapi belum diterbitkan kepada mereka
repositori: penerbitan adalah keputusan dan tindakan manual oleh penyelenggara.

## 🔒 Keselamatan sekilas pandang

| Lapisan | Perlindungan |
|---|---|
| Bilik kebal | Argon2id (19 MiB, t=2) → AES-256-GCM, nonce baru pada setiap tulisan, tulisan atom dengan `fsync` |
| Kunci | RAM sahaja, disifarkan pada kunci; kunci auto boleh dikonfigurasikan (5 hingga 60 min melahu, 15 min secara lalai) |
| Rangkaian | hanya proses Rust bercakap dengan rangkaian; paparan web tidak mempunyai asal jauh (CSP) dan tidak pernah melihat token |
| Google | pilihan, hanya `calendar.events.readonly`, `directory.readonly` (Foto rakan sekerja di ruang kerja dalam senarai tetamu) serta profil, OAuth dengan PKCE dan gelung balik |
| GitHub | token pilihan, disulitkan; item hanya dibuka jika pautan adalah `https://github.com/` |
| GitLab | pilihan, alamat dan token yang disulitkan; `https://` sahaja, tiada ubah hala, pautan hanya dari contoh yang dikonfigurasikan |
| Kemas kini | hanya memasang pakej yang ditandatangani oleh kunci projek; muat turun yang diusik dibuang sebelum menjalankan |

Model penuh, sandaran, cantum merentasi mesin dan tempat tinggal setiap fail: [docs/seguranca.md](docs/seguranca.md).
Terjumpa kecacatan? [SECURITY.md](SECURITY.md).

## 📚 Dokumentasi

| Dokumen | Apa yang ada di dalamnya |
|---|---|
| 📖 [User guide](docs/uso.md) | tab, tugasan berulang, pintasan, kulit, kebolehcapaian, tetingkap, kemas kini dan mulakan dengan sistem |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda dan GitHub (token peribadi atau aliran peranti) |
| 🛡️ [Security and data](docs/seguranca.md) | model ancaman, `.canto` sandaran, cantum, tukar kata laluan, fail pada cakera |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify dan ujian volum |
| 📝 [CHANGELOG](CHANGELOG.md) | apa yang berubah dalam setiap versi |
| 🤝 [How to contribute](CONTRIBUTING.md) | persekitaran, ujian, PRs dan cara menerbitkan keluaran |
| 🤖 [Agent guide](AGENTS.md) | kontrak dan perangkap untuk sesiapa yang mengedit kod dengan AI |

## 🛠️ Pembangunan

Prasyarat: [Bun](https://bun.sh) ≥ 1.2, stabil Rust ≥ 1.85 dan
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) untuk sistem anda.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Paparan web dibuat selepas keadaan Rust dan dulang dimulakan, jadi panggilan IPC permulaan tidak boleh berlumba persediaan.

Setiap PR menjalankan CI pada Windows, macOS dan Linux. Konvensional `fix`, `feat` dan melanggar komitmen digabungkan menjadi `main`
dapatkan teg SemVer, nota keluaran yang dijana dan pemasang yang ditandatangani dibina selari; keluaran diterbitkan selepas pengesahan (butiran dalam
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Lesen

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Dibuat dengan 🦀 Rust, ⚛️ React dan ☕ untuk mereka yang tinggal di antara mesyuarat.</sub></div>
