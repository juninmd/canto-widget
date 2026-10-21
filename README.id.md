<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · **Bahasa Indonesia** · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Tugas dengan pengingat, catatan, riwayat papan klip, agenda dengan peringatan rapat, transkrip, dan GitHub PRs Anda
> di jendela kecil yang disematkan di sudut layar.** Muncul dengan `Ctrl+Alt+Space`, bersembunyi saat Anda tidak membutuhkannya
> dan menjaga semuanya tetap terenkripsi di mesin Anda, tanpa akun dan tanpa server.

## 🌐 Bahasa

Canto menawarkan **42 bahasa antarmuka**, masing-masing dengan README-nya sendiri. Pilih milik Anda di **Pengaturan → Bahasa**;
pemilih yang dapat dicari menggunakan nama bahasa asli, dan mode otomatis mengikuti bahasa sistem utama Anda.
Arab, Ibrani dan Persia menggunakan teks kanan ke kiri. Katalog bahasa tambahan dimuat sesuai permintaan.

40 katalog antarmuka baru dan 31 terjemahan README baru adalah terjemahan mesin dan belum pernah ada
ditinjau oleh penutur asli. Bahasa Portugis dan Inggris tetap menjadi katalog antarmuka asli. Label baki dan
judul pemberitahuan mengikuti bahasa yang dipilih; beberapa detail peringatan integrasi kembali ke bahasa Inggris,
dan kesalahan backend tetap dalam bahasa Portugis. Sintaks judul tugas mempertahankan kata kunci Portugis dan Inggris yang ada.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Mengapa Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Jika Anda tinggal di antara rapat, PRs, dan item kecil yang tertunda, Anda akan mendapatkan lima aplikasi yang terbuka. Canto memasukkan semuanya
satu tempat.

🔒 **Terenkripsi secara default.** Argon2id + AES-256-GCM dengan kata sandi utama; kuncinya hanya ada di RAM.
Windows Hello opsional.

🏠 **Data Anda tetap bersama Anda.** Tanpa telemetri, tanpa server, tanpa perlu akun. Cadangan adalah satu-satunya yang terenkripsi
`.canto` berkas.

⏰ **Anda tidak akan melewatkannya.** 1 menit sebelum rapat dan pada waktu pengingat, widget muncul, memutar suara dan
mengirimkan notifikasi, dengan **tunda 10 menit**.

🪶 **Ringan.** Tauri v2 (Rust + tampilan web sistem) alih-alih Electron: penginstal 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Selalu terkini.** Pembaruan dari dalam aplikasi dan hanya menginstal apa yang ditandatangani oleh kunci proyek itu sendiri.

</td>
</tr>
</table>

## 🧰 Fitur

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Tugas yang mengingatkan Anda

Daftar periksa harian dengan waktu dan pengulangan (setiap hari, hari kerja, atau mingguan). Ketik **`Daily at 9:30am`** dan
pengingat sudah disetel; tambahkan **`!high`** (atau `!alta`, `!média`, `!baixa`) untuk prioritas, atau klik titik pada baris untuk memutarnya. Judul yang panjang dibungkus bukannya dipotong. **Pengatur waktu fokus** pada tugas apa pun: berikan perkiraan, tekan ▶ dan bilah yang disematkan di bawah setiap tab menghitung waktu yang dibutuhkan (berwarna merah setelah Anda menyelesaikannya); waktu disimpan ke brankas setiap menit. **Ringkasan hari** siap untuk ditempel (tugas, waktu fokus, rapat dengan total waktu, PRs/MRs dibuka, digabungkan, ditinjau, dan ditutup tanpa digabungkan), **laporan mingguan dan bulanan** dalam penurunan harga, dan **menarik item yang tertunda** dari kemarin. **Pengambilan cepat** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` di macOS) mencatat tugas atau catatan dari aplikasi apa pun, tanpa membuka widget.

</td>
</tr>
<tr>
<td>

### 📅 Rapat dimulai? Ini memberitahu Anda.

Bergabunglah dalam pertemuan berikutnya dengan `Ctrl+Alt+M` (`Ctrl+Cmd+M` di macOS). Jika pendaftaran gagal, Canto mencoba
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` di macOS); menu baki tetap tersedia jika keduanya tidak tersedia.

Acara hari ini berasal dari Kalender Google (hanya baca). Satu menit sebelumnya, widget melompat ke layar dengan
**bergabung dengan Meet**, memutar suara dan mengirimkan pemberitahuan sistem, di tab mana pun Anda berada atau meskipun tab itu tersembunyi.
Setiap kartu menunjukkan lencana dengan jawaban Anda (diterima, mungkin, ditolak, menunggu). Klik acara tersebut untuk melihat siapa yang menyelenggarakannya
itu, agendanya, setiap tamu dengan inisial avatar dan jawabannya, serta lampirannya, seperti catatan Gemini.
Baris paling atas memberi tahu Anda **slot gratis berikutnya** setidaknya 15 menit (undangan yang ditolak dan acara sepanjang hari tidak
count), dan acara yang tumpang tindih akan mendapatkan lencana **konflik** yang memberi nama acara lainnya. Tampilan **Hari ini** dimulai dengan rapat yang sedang berlangsung (waktu tersisa, tombol gabung, peringatan bentrok) atau tampilan berikutnya, lalu **hari dalam satu baris** (rapat, tugas, dan waktu luang sepanjang jam kerja, dengan waktu rapat, waktu luang, dan konflik dihitung) dan satu garis waktu tempat rapat, tugas dengan waktu, dan jeda kosong adalah barisnya sendiri: jeda menawarkan untuk menyesuaikan tugas yang belum waktunya, dan apa yang sudah terlampaui.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Catatan sebagai kartu

Kartu yang dapat dicari dengan `#tags`, sematkan ke atas dan filter tag sekali klik; setiap kartu menunjukkan awal catatan **yang diberikan** (judul, daftar periksa, kode, tautan), bukan penurunan harga mentah. **Editor WYSIWYG** dengan compact
bilah pemformatan (tebal, miring, kode, judul, daftar, daftar periksa yang Anda centang tepat di teks, blok kode dengan sintaksis
penyorotan, tautan, gambar) dan pintasan penurunan harga saat Anda mengetik (`# `, `- `, `[ ] `, ` ``` `); tombol **MD**
menunjukkan penurunan harga mentah, yang masih merupakan cara catatan disimpan, dicari, disinkronkan, dan diekspor. Tautan terbuka dengan
`Ctrl`+klik, http(s) saja. Tempel, jatuhkan, atau lampirkan gambar (PNG, JPEG, GIF, WebP hingga 2 MB), masing-masing disegel tersendiri
file terenkripsi, ditampilkan di dalam catatan dan sebagai thumbnail di kartu; mereka tetap berada di mesin ini, di luar `.canto`
cadangan. Menangani ribuan catatan: daftarnya diberi halaman dan pencarian mencakup semuanya.

</td>
</tr>
<tr>
<td>

### 📋 Papan klip yang tidak pernah lupa (atau bocor)

Riwayat terenkripsi dengan pencarian dan pin; mengenali tautan, warna, dan kode. Arahkan kursor ke item untuk **menyalinnya dan menulis ulang**:
Berformat JSON atau ringkas, teks dalam satu baris, HURUF BESAR atau huruf kecil (entri riwayat tetap seperti semula). Salinan raksasa (log 100 MB) tidak
membekukan apa pun: ia terus memulai dan memperingatkan Anda. Di Windows, ia melewatkan apa pun yang ditandai oleh pengelola kata sandi
sensitif.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Sekilas GitHub Anda

**Peninjauan diminta dari saya**, diberikan kepada saya, PRs dan terbitan yang saya buka, dengan PR atau ikon terbitan dan siapa yang membuka
itu. Draf, PRs **menunggu tinjauan Anda** dan PRs **terhenti** selama seminggu menonjol, dan masing-masing PR membawa sedikit
**Lencana CI** (lulus, gagal, berjalan, atau tidak ada CI) dari pemeriksaan penerapan utamanya. Ketika seseorang **meminta Anda
review**, pemberitahuan OS memberitahu Anda (diaktifkan secara default, nonaktifkan di Pengaturan). Filter menurut teks, `repo:` atau `label:`, hanya PRs atau hanya masalah, urutkan berdasarkan pembaruan, pembuatan atau komentar, dan
gulir dengan **tampilkan lebih banyak**. Beralih ke tampilan **Komentar** untuk melihat kisi **Katalog komentator** berisi semua orang yang mengomentari PRs Anda (avatar, lencana manusia vs bot, jumlah komentar, penelusuran, filter bot, penomoran halaman progresif) dan komentar mereka. Juga mendukung **GitLab.com dan GitLab** yang dihosting sendiri, dengan cache 5 menit yang
menghormati batas tarif. Masuk dengan token pribadi hanya-baca atau dari browser (alur perangkat).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam tanpa meninggalkan widget

Empat sub-tab untuk Steam: **penawaran daftar keinginan** (diskon terbesar terlebih dahulu, masing-masing dengan penghematannya), **penjual teratas**
diberi peringkat, **main sekarang** (setiap game Steam melaporkan selama dua minggu terakhir) dan **katalog diurutkan berdasarkan peringkat**, diberi halaman
dengan **memuat lebih banyak** sehingga menjangkau seluruh toko. Setiap baris membawa **seni kapsul**, **skor ulasan**
dengan kata-kata Steam sendiri dan berapa banyak ulasan yang dihitung, harga yang dicoret, harga dalam reais dan berapa
penghematan diskon — dan daftarnya menjumlahkan total penghematan. Daftar publik hanya memerlukan **SteamID64**; sebuah opsional
**Steam Kunci web API** menambahkan game terbaru dengan waktu bermainnya. Tab dimulai secara default, hanya berjarak satu kotak centang
di Pengaturan.

</td>
</tr>
<tr>
<td>

### ⚙️ Pengaturan dan pembaruan otomatis

Perubahan kata sandi utama, Windows Hello, cadangan `.canto`, folder yang disinkronkan dengan penggabungan otomatis (Dropbox,
OneDrive, Syncthing...), mulai dengan sistem dan bagian **Pembaruan**, dengan **versi terinstal** dan
**terbaru diterbitkan** satu sisi dan tombol untuk memperbarui dan memulai ulang.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Juga memiliki 🎙️ **Rapat**, sub-tab Agenda di sebelah Daftar dan Hari: Catatan dan transkrip Gemini dari
dua minggu terakhir, ditambah transkrip `.vtt`, `.srt`, `.txt` dan `.md` dari folder lokal, dibersihkan dan dapat dicari.

🤖 **Model AI** (di bilah tab secara default, **tidak ada kunci atau akun API**): LLM diberi peringkat berdasarkan
[Artificial Analysis](https://artificialanalysis.ai) **Indeks Intelijen**, dibaca dari halaman papan peringkat publiknya,
dengan bilah skor, pencipta, harga per 1 juta token dan kecepatan, dapat diurutkan berdasarkan kecerdasan, harga atau kecepatan. Itu diambil pada
paling banyak sekali setiap 3 jam, dan keikutsertaan 🔔 memberi tahu Anda ketika a
model **masuk 10 teratas** atau **naik ke dalamnya** (diperiksa setiap 6 jam saat brankas tidak terkunci), dengan
lencana "baru" dan "naik" selama seminggu.

🌙 **Jangan ganggu:** di Pengaturan atau baki, senyapkan peringatan rapat, pengingat tugas, peringatan status, dan lainnya
notifikasi sistem selama 30 menit, 1 jam, 2 jam, hingga besok atau hingga Anda mematikannya. Bulan di bilah atas muncul
kapan itu berakhir; satu klik mematikannya kembali. Ia bertahan jika dimulai ulang dan berakhir dengan sendirinya.

🔔 **Setiap peringatan dalam satu layar:** bel di header (hitung dan warnai ketika ada sesuatu yang tertunda) membuka
peringatan di seluruh jendela dalam mode apa pun: satu kartu per peringatan dengan tindakannya, **tutup semua**, dan apa yang terjadi
diselesaikan hari ini di bawah mereka — tanpa ada yang tertunda, begitulah cara Anda masih mencapai catatan hari ini. Dari dok, sekali klik
masih membuka satu peringatan di atas jendela normal.

⌨️ **Semuanya dengan keyboard:** `Alt+1`…`Alt+7` beralih tab, `N` membuat, `/` penelusuran, `F11` layar penuh, `Alt+L`
kunci dan `?` mencantumkan pintasan. `Ctrl+Shift+P` (`Cmd+Shift+P` di macOS) membuka **palet perintah** dengan setiap
tindakan berdasarkan nama: buka tab, tugas atau catatan baru, bergabung ke rapat berikutnya, salin ringkasan hari itu, ganti kulit, kunci.

## 🎨 Enam kulit

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Default</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Drakula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Kaca</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Cahaya</b></td>
</tr>
</table>

Dan **Ikuti sistem**, yang beralih antara terang dan gelap seiring dengan OS. Semua melewati kontras AA.

<details>
<summary>🖥️ Layar lainnya: orientasi, pencarian global, palet perintah, GitLab, subtugas, editor catatan, keamanan, sinkronisasi, kepadatan, dan banyak lagi</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Selamat datang pertama kali | Pencarian global (`Ctrl+K`) | Tab GitLab yang dihosting sendiri | Peringatan rapat |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Tugas dengan subtugas, prioritas dan PR | Penyunting catatan | Jenis papan klip lainnya | Keamanan: mengunci dan membuka kunci otomatis |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Folder yang disinkronkan | Kepadatan kompak | Lemari besi terkunci | Hubungkan GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Pengaturan dalam grup, dengan pencarian | Pencarian memfilter grup | Chip offline di header | Konfirmasikan sebelum membersihkan clipboard |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Buang draf catatan yang belum disimpan |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Mode: Mini, Tersembunyi, Normal, Dimaksimalkan | Mode mini: peringatan di tepi layar |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Klik peringatan di dok | Dimaksimalkan: seluruh jendela untuk tab yang terbuka |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Lonceng membuka peringatan di seluruh jendela |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: menu mode terbuka di dalam jendela dok |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Tab yang tidak muat tunggu di menu "lainnya" |
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

| Permainan dan layar penuh: peringatan tunggu sampai Anda berangkat |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Tunda: 1, 5 atau 10 menit |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Pengingat tugas | Ubah kata sandi utama | Status API (tab keikutsertaan) | Bahasa: Inggris, Portugis atau Spanyol |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Salin klip yang ditulis ulang | Peringatan pertemuan dengan persiapan |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Desain ulang: tab Tugas, sebelum dan sesudah |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Desain ulang: setiap tab, sebelum (atas) dan sesudah (bawah) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI gagal, dengan pekerjaan yang rusak | Seseorang menyebut saya | Sakelarnya di Pengaturan |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Sebutkan waspada dengan siapa yang menulisnya |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Sebutkan peringatan dengan pratinjau teks |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Peringatan lebih lanjut tentang karya saya sendiri |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Peringatan ringkasan hari | Pengaturan ringkasan hari |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Sebutkan subtab (GitHub dan GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Kata sandi diubah, satu file tertunda | Ringkasan hari |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Laporan mingguan | Agenda: waktu luang dan konflik berikutnya |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: gratis sekarang | Palet perintah (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Jangan ganggu | Gambar dalam catatan |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Lencana CI di setiap PR | Tinjau pemberitahuan permintaan |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Catat gambar sebagai thumbnail | Editor catatan WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Editor catatan: penurunan harga mentah (MD) | Editor catatan pada kulit terang |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Tugas: prioritas pada baris, bungkus judul panjang | Daftar catatan dengan penurunan harga yang diberikan |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Model AI diberi peringkat berdasarkan Indeks Intelijen |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: terlaris, bernomor | Steam: lima pertandingan terakhir dimainkan, dengan kedua waktu bermain |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalog berdasarkan peringkat, dengan "muat lebih banyak" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Satu hamparan peringatan untuk segala hal yang tertunda: pemadaman listrik, rapat, tugas, dan model AI baru |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Titik akhir saya: ubin dengan latensi terbaru | Titik akhir terbuka: bagan latensi, pengaturan batas dan peringatan | Menambahkan DNS + cek sertifikat |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda hari apa pun: panah sebelumnya dan berikutnya, pemilih tanggal, dan tombol kembali ke hari ini |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Tugas: tugas saat ini dengan pengatur waktu dan daftar yang dikelompokkan | GitHub: strip ringkasan di atas daftar | GitLab: strip yang sama, tanpa ubin CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Pengatur waktu fokus disematkan di bawah setiap tab | Agenda sehari-hari, tugas selain rapat |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Tampilan hari: peristiwa yang tumpang tindih berbagi lebar secara berdampingan |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Tinjau radar: permintaan terlama terlebih dahulu, terlambat dalam warna merah, tunda |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Rapat sebagai sub-tab Agenda, di samping Daftar dan Hari |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Tab aktivitas (dinonaktifkan secara default) | Ringkasan dengan waktu terfokus dan ditutup PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Tab aktivitas, 7 hari terakhir | Tab aktivitas, dimatikan | Tab aktivitas di jendela lebar |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Tab **Aktivitas** mulai tersembunyi (aktifkan pada Pengaturan → tab terlihat). Ini hanya mencatat nama
aplikasi terfokus saat Anda menggunakan komputer, dalam file lokal tersegel yang tidak pernah mencapai cadangan atau sinkronisasi (Wayland
tidak dapat melaporkan jendela fokus, sehingga tetap tidak tersedia di sana). Nonaktif hingga Anda ikut serta, dan layar pertama menunjukkan apa
disimpan dan apa yang tidak pernah ada.

- **Hari**: donat berdasarkan kategori dengan total di dalamnya, yang legendanya menyembunyikan kategori, perubahan terhadap hari
sebelumnya dan waktu idle (tidak ada keyboard atau mouse selama 2 menit). Di bawahnya, sasaran fokus kode harian dengan garis dan
satu titik per hari, tiga sorotan (regangan terpanjang dalam satu aplikasi, peralihan aplikasi, jam sibuk), garis waktu di mana keseluruhannya
hari, rentang waktu menganggur dan aplikasi tersibuk berbagi satu sumbu waktu dengan penanda "sekarang", dan daftar aplikasi
(ketuk salah satu untuk mengubah kategorinya) atau tugas yang dijalankan pengatur waktu fokus.
- **Minggu**: kolom bertumpuk per hari dengan garis rata-rata dan titik di bawah setiap hari yang memenuhi sasaran, peta panas satu jam
dengan puncak Anda, dan daftar yang sama sepanjang minggu.
- **Tata letak dan tampilan**: satu kolom di jendela default, dua kolom setelah lebarnya (dimaksimalkan); setiap kulit memiliki miliknya sendiri
warna kategori, diperiksa kontrasnya. Menu di sebelah hari menyalinnya sebagai teks.

<sub>Semua tangkapan layar menggunakan data fiktif.</sub>

## ⚖️ Dibandingkan dengan apa yang ada di luar sana

Tak satu pun dari alat yang diteliti mencakup lebih dari dua bidang ini sekaligus. Sumber dan detail di
[docs/benchmark.md](docs/benchmark.md).

| | Tugas + pengingat | Catatan | Papan klip | Rapat | GitHub | Enkripsi lokal secara default |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / CentangTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ sinkronisasi saja |
| Siaran sinar | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| SalinQ / Ditto | — | — | ✅ | — | — | ➖ opsional |
| Bilah Rapat | — | — | — | ✅ | — | tidak ada |
| Gitifikasi | — | — | — | — | ✅ | tidak ada |

<sub>✅ asli · ➖ sebagian, melalui ekstensi atau opsional · — tidak ada · ? tidak diterbitkan · t/a tidak menyimpan data pengguna</sub>

Apa yang dibawa tolok ukur di sini: **waktu tepat di judul tugas** (Todoist/TickTick), **tunda peringatan**
(TickTick) dan **papan klip yang menghormati pengelola kata sandi** (CopyQ/Ditto).

## ⬇️ Instal

Unduh penginstal untuk platform Anda dari **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistem | Berkas |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (disarankan) atau `.msi` |
| 🍎 macOS | `.dmg` untuk Apple Silicon atau Intel |
| 🐧Linux | `.AppImage`, `.deb` atau `.rpm` |

1. Saat pertama kali dijalankan, Anda membuat **kata sandi utama**. Tidak ada pemulihan: kehilangan kata sandi, kehilangan data.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` di macOS) menampilkan dan menyembunyikan widget.
3. Selesai. Saat versi baru dikirimkan, Canto akan memberi tahu Anda, dan **Pengaturan → Pembaruan** diperbarui dengan satu klik.

> [!CATATAN]
> Pemasang belum menandatangani kode: SmartScreen (Windows) dan Gatekeeper (macOS) memperingatkan pada peluncuran pertama.
> Pembaruan otomatis diverifikasi berdasarkan tanda tangan proyek sebelum dijalankan.

Manifes siap pakai untuk winget dan Homebrew (ditambah kerangka untuk Flatpak, saat ini diblokir) sudah ada
[`packaging/`](packaging/README.md) — disiapkan dan diverifikasi secara lokal, namun belum dipublikasikan kepada mereka
repositori: penerbitan adalah keputusan dan tindakan manual oleh pengelola.

## 🔒 Sekilas tentang keamanan

| Lapisan | Perlindungan |
|---|---|
| Gudang | Argon2id (19 MiB, t=2) → AES-256-GCM, nilai baru pada setiap penulisan, penulisan atom dengan `fsync` |
| Kunci | Hanya RAM, memusatkan perhatian pada kunci; kunci otomatis yang dapat dikonfigurasi (5 hingga 60 menit menganggur, 15 menit secara default) |
| Jaringan | hanya proses Rust yang berbicara ke jaringan; tampilan web tidak memiliki asal jarak jauh (CSP) dan tidak pernah melihat token |
| Google | opsional, hanya `calendar.events.readonly`, `directory.readonly` (Foto rekan kerja di daftar tamu) ditambah profil, OAuth dengan PKCE dan loopback |
| GitHub | opsional, token terenkripsi; item hanya terbuka jika linknya `https://github.com/` |
| GitLab | opsional, alamat dan token terenkripsi; `https://` saja, tidak ada pengalihan, tautan hanya dari instance yang dikonfigurasi |
| Pembaruan | hanya menginstal paket yang ditandatangani oleh kunci proyek; unduhan yang dirusak dibuang sebelum dijalankan |

Model lengkap, pencadangan, penggabungan antar mesin dan tempat setiap file berada: [docs/seguranca.md](docs/seguranca.md).
Menemukan cacat? [SECURITY.md](SECURITY.md).

## 📚 Dokumentasi

| Dokumen | Apa isinya |
|---|---|
| 📖 [User guide](docs/uso.md) | tab, tugas berulang, pintasan, skin, aksesibilitas, jendela, pembaruan, dan mulai dengan sistem |
| 🔌 [Integrations](docs/integracoes.md) | Agenda Google dan GitHub (aliran token atau perangkat pribadi) |
| 🛡️ [Security and data](docs/seguranca.md) | model ancaman, pencadangan `.canto`, penggabungan, perubahan kata sandi, file di disk |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify dan tes volume |
| 📝 [CHANGELOG](CHANGELOG.md) | apa yang berubah di setiap versi |
| 🤝 [How to contribute](CONTRIBUTING.md) | lingkungan, pengujian, PRs dan cara mempublikasikan rilis |
| 🤖 [Agent guide](AGENTS.md) | kontrak dan jebakan bagi siapa pun yang mengedit kode dengan AI |

## 🛠️ Perkembangan

Prasyarat: [Bun](https://bun.sh) ≥ 1.2, stabil Rust ≥ 1.85 dan
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) untuk sistem Anda.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Tampilan web dibuat setelah status Rust dan baki diinisialisasi, sehingga panggilan IPC startup tidak dapat mempercepat pengaturan.

Setiap PR menjalankan CI di Windows, macOS, dan Linux. `fix` konvensional, `feat` dan komitmen yang melanggar digabung menjadi `main`
dapatkan tag SemVer, catatan rilis yang dibuat, dan penginstal bertanda tangan yang dibuat secara paralel; rilis diterbitkan setelah verifikasi (detailnya ada di
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Lisensi

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Dibuat dengan 🦀 Rust, ⚛️ React dan ☕ bagi mereka yang tinggal di sela-sela pertemuan.</sub></div>
