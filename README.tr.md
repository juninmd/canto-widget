<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: gününüzün tamamı ekranın köşesinde. Widget pencerelerinde görevler, GitHub ve toplantı uyarıları." width="100%">

<br><br>

[![İndir](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20%C4%B0ndir-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT Lisansı](https://img.shields.io/badge/lisans-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-%C5%9Fifreli%20%C3%A7ekirdek-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Özellikler](#-özellikler)** · **[Temalar](#-beş-tema)** · **[Kurulum](#%EF%B8%8F-kurulum)** · **[Güvenlik](#-güvenliğe-genel-bakış)** · **[Dokümantasyon](#-dokümantasyon)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · **Türkçe** · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **Zaman ayarlı hatırlatıcılara sahip görevler, notlar, pano geçmişi, toplantı uyarılı bir ajanda, transkriptler ve
> GitHub PR'larınız ekranın köşesine sabitlenmiş küçük bir pencerede.** `Ctrl+Alt+Space` ile açılır, ihtiyacınız
> olmadığında gizlenir ve her şeyi hesap ya da sunucu olmadan makinenizde şifreli tutar.

## ✨ Neden Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Görevler, Notlar, Pano, Ajanda ve GitHub sekmeleri, toplantı uyarısı ve temalar arasında tur" width="300"></td>
<td>

Toplantılar, PR'lar ve küçük bekleyen işler arasında yaşıyorsanız beş farklı uygulama açık kalır. Canto hepsini
tek bir yerde toplar.

🔒 **Varsayılan olarak şifreli.** Ana parola ile Argon2id + AES-256-GCM; anahtar yalnızca RAM'de var olur.
İsteğe bağlı Windows Hello.

🏠 **Verileriniz sizde kalır.** Sıfır telemetri, sıfır sunucu, hesap gerekmez. Yedekleme tek bir şifreli
`.canto` dosyasıdır.

⏰ **Kaçırmazsınız.** Toplantıdan 1 dakika önce ve hatırlatma zamanında widget açılır, bir ses çalar ve
bildirim gönderir; **10 dakika ertele** seçeneğiyle.

🪶 **Hafif.** Electron yerine Tauri v2 (Rust + sistem webview'i): 3.5 MB'lık bir kurulum dosyası.
[Ölçülen rakamlar](docs/benchmark.md#footprint-medido).

🔄 **Her zaman güncel.** Güncellemeler uygulama içinden yapılır ve yalnızca projenin kendi anahtarıyla
imzalanmış olan yüklenir.

</td>
</tr>
</table>

## 🧰 Özellikler

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Saati ve tekrarı ile bugünün görevleri"></td>
<td>

### ✅ Sizi hatırlatan görevler

Saat ve tekrar (her gün, hafta içi ya da haftalık) içeren günlük bir kontrol listesi. **`Her gün saat 09:30'da`**
yazın, hatırlatma zaten ayarlanmış olsun. **Gün özeti** yapıştırmaya hazır ve dünden **bekleyen öğeleri aktarın**.

</td>
</tr>
<tr>
<td>

### 📅 Toplantı mı başlıyor? Size haber verir.

Bugünün etkinlikleri Google Takvim'den gelir (salt okunur). Bir dakika önce widget, hangi sekmede olursanız olun
ya da gizli olsa bile, **Meet'e katıl** butonuyla ekrana atlar, bir ses çalar ve sistem bildirimi gönderir.
Etkinliğe tıklayarak organizatörü, gündemi, davetlileri ve Gemini'nin notları gibi ekleri görebilirsiniz.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Organizatör, davetliler ve Gemini notlarıyla etkinlik ayrıntıları"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Etiketli not kartları ve sabitlenmiş bir not"></td>
<td>

### 🗒️ Kart olarak notlar

`#etiketler` ile aranabilir kartlar, üste sabitleme ve tek tıkla etiket filtresi. Binlerce notu kaldırır: liste
sayfalanır ve arama hepsini kapsar.

</td>
</tr>
<tr>
<td>

### 📋 Asla unutmayan (ya da sızdırmayan) pano

Arama ve sabitlemeyle şifreli geçmiş; bağlantıları, renkleri ve kodu tanır. Dev bir kopyalama (100 MB'lık bir
günlük) hiçbir şeyi dondurmaz: başlangıcı tutar ve sizi uyarır. Windows'ta, parola yöneticilerinin hassas olarak
işaretlediği her şeyi atlar.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Bir bağlantı, büyük bir günlük ve kod içeren pano geçmişi"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="İnceleme istenen, atanan ve açık PR'ları gösteren GitHub sekmesi"></td>
<td>

### 🐙 GitHub'ınız bir bakışta

**Benden inceleme istenenler**, bana atananlar, açtığım PR ve issue'lar; PR ya da issue simgesi ve kimin açtığı
bilgisiyle. Metne, `repo:` veya `label:`'a göre filtreleyin, yalnızca PR ya da yalnızca issue gösterin, güncelleme,
oluşturulma ya da yorum sayısına göre sıralayın ve **daha fazla göster** ile kaydırın. Ayrıca **GitLab.com ve
kendi barındırılan GitLab**'ı da destekler; hız sınırına uyan 5 dakikalık bir önbellekle. Salt okunur kişisel bir
token ile ya da tarayıcıdan (device flow) oturum açın.

</td>
</tr>
<tr>
<td>

### ⚙️ Ayarlar ve otomatik güncellemeler

Ana parola değişimi, Windows Hello, `.canto` yedeği, otomatik birleştirmeli senkronize bir klasör (Dropbox,
OneDrive, Syncthing...), sistemle başlatma ve **yüklü sürüm** ile **yayınlanan son sürümü** yan yana gösteren,
güncelleyip yeniden başlatma butonlu **Güncellemeler** bölümü.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Yüklü sürümü, yayınlanan son sürümü ve güncelleme butonunu gösteren ayarlar"></td>
</tr>
</table>

Ayrıca 🎙️ **Toplantılar** var: son iki haftanın Gemini notları ve transkriptleri, artı yerel bir klasörden
temizlenmiş ve aranabilir `.vtt`, `.srt`, `.txt` ve `.md` transkriptleri.

⌨️ **Her şey klavyeyle:** `Alt+1`…`Alt+7` sekmeler arasında geçer, `N` oluşturur, `/` arar, `F11` tam ekran,
`Alt+L` kilitler ve `?` kısayolları listeler.

## 🎨 Beş Tema

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Varsayılan tema" width="200"><br><b>Varsayılan</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo teması" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula teması" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Açık tema" width="200"><br><b>Açık</b></td>
</tr>
</table>

Ve işletim sistemiyle birlikte açık ve koyu arasında geçiş yapan **Sistemi izle**. Hepsi AA kontrastını geçer.

<details>
<summary>🖥️ Daha fazla ekran: ilk kurulum, genel arama, GitLab, alt görevler, markdown, güvenlik, senkronizasyon, yoğunluk ve daha fazlası</summary>

<br>

![Tam ekranda GitHub sekmesi](docs/prints/app/12-tela-cheia.png)

| İlk çalıştırma karşılama | Genel arama (`Ctrl+K`) | Kendi barındırılan GitLab sekmesi | Toplantı uyarısı |
|---|---|---|---|
| ![Temel kısayollarla ilk kurulum](docs/prints/app/19-onboarding.png) | ![Görevler, notlar ve panoda aynı anda arama](docs/prints/app/20-busca-global.png) | ![Kendi barındırılan GitLab'da inceleme istenen, atanan ve issue'lar](docs/prints/app/21-gitlab.png) | ![Meet'e katıl ve erteleme seçenekli toplantı uyarısı](docs/prints/app/07-aviso-reuniao.png) |

| Alt görevli, öncelikli ve PR'lı görev | Markdown'da not | Daha fazla pano türü | Güvenlik: otomatik kilit ve kilit açmalar |
|---|---|---|---|
| ![Bir görevde kontrol listesi, öncelik ve PR bağlantısı](docs/prints/app/23-tarefas-detalhes.png) | ![Bir göreve bağlı, markdown olarak işlenmiş not](docs/prints/app/24-notas-markdown.png) | ![Bağlantı, renk, json, e-posta ve telefonu tanıyan pano](docs/prints/app/25-clipboard-tipos.png) | ![Yapılandırılabilir otomatik kilit ve son kilit açmaların günlüğü](docs/prints/app/26-ajustes-seguranca.png) |

| Senkronize klasör | Kompakt yoğunluk | Kilitli kasa | GitHub'a bağlan |
|---|---|---|---|
| ![Bir Dropbox klasörünü gösteren ayarlar](docs/prints/app/27-ajustes-sync.png) | ![Görevler sekmesinde kompakt arayüz](docs/prints/app/28-densidade-compacta.png) | ![Windows Hello ile parola ekranı](docs/prints/app/09-cofre-trancado.png) | ![Token ile ya da tarayıcıdan bağlan](docs/prints/app/10-github-conectar.png) |

| Görev hatırlatması | Ana parolayı değiştir |
|---|---|
| ![Tamamlama ve erteleme seçenekli hatırlatma](docs/prints/app/08-lembrete-tarefa.png) | ![Parola değiştirme formu](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>Tüm ekran görüntüleri kurgusal veriler kullanır.</sub>

## ⚖️ Piyasadakilerle Karşılaştırma

İncelenen araçlardan hiçbiri bu cephelerden ikiden fazlasını aynı anda kapsamıyor. Kaynaklar ve ayrıntılar
[docs/benchmark.md](docs/benchmark.md) dosyasında.

| | Görev + hatırlatma | Notlar | Pano | Toplantılar | GitHub | Varsayılan yerel şifreleme |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ yalnızca senkronizasyon |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ isteğe bağlı |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ yerel · ➖ kısmi, eklenti üzerinden veya isteğe bağlı · — yok · ? yayınlanmamış · n/a kullanıcı verisi depolamıyor</sub>

Bu karşılaştırmanın buraya getirdiği şeyler: **görev başlığında doğrudan saat** (Todoist/TickTick), **uyarıyı
erteleme** (TickTick) ve **parola yöneticilerine saygı gösteren pano** (CopyQ/Ditto).

## ⬇️ Kurulum

Platformunuz için kurulum dosyasını **[Releases](https://github.com/juninmd/canto-widget/releases)**'ten indirin:

| Sistem | Dosya |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (önerilen) ya da `.msi` |
| 🍎 macOS | Apple Silicon ya da Intel için `.dmg` |
| 🐧 Linux | `.AppImage`, `.deb` ya da `.rpm` |

1. İlk çalıştırmada **ana parolanızı** oluşturursunuz. Kurtarma yoktur: parolayı kaybederseniz veriyi
   kaybedersiniz.
2. `Ctrl+Alt+Space` (macOS'ta `Cmd+Alt+Space`) widget'ı gösterir ve gizler.
3. Bu kadar. Yeni bir sürüm yayınlandığında Canto sizi bilgilendirir ve **Ayarlar → Güncellemeler** tek tıkla
   güncellenir.

> [!NOTE]
> Kurulum dosyaları henüz kod imzalı değil: SmartScreen (Windows) ve Gatekeeper (macOS) ilk açılışta uyarır.
> Otomatik güncellemeler çalıştırılmadan önce projenin kendi imzasına göre doğrulanır.

winget ve Homebrew için hazır manifestolar (artı şu anda engellenmiş olan Flatpak için bir iskelet)
[`packaging/`](packaging/README.md) içinde bulunur — yerel olarak hazırlanmış ve doğrulanmış, ancak henüz bu
depolara yayınlanmamıştır: yayınlamak bakımcının manuel kararı ve eylemidir.

## 🔒 Güvenliğe Genel Bakış

| Katman | Koruma |
|---|---|
| Kasa | Argon2id (19 MiB, t=2) → AES-256-GCM, her yazmada yeni bir nonce, `fsync` ile atomik yazma |
| Anahtar | Yalnızca RAM'de, kilitlenince sıfırlanır; yapılandırılabilir otomatik kilit (5 ila 60 dakika boşta, varsayılan 15 dakika) |
| Ağ | yalnızca Rust süreci ağla konuşur; webview'in uzak kaynağı yoktur (CSP) ve token'ları asla görmez |
| Google | isteğe bağlı, yalnızca `calendar.events.readonly` artı profil, PKCE ve loopback ile OAuth |
| GitHub | isteğe bağlı, şifreli token; öğeler yalnızca bağlantı `https://github.com/` ise açılır |
| GitLab | isteğe bağlı, şifreli adres ve token; yalnızca `https://`, yönlendirme yok, bağlantılar yalnızca yapılandırılan örnekten |
| Güncellemeler | yalnızca projenin anahtarıyla imzalanmış bir paketi yükler; kurcalanmış bir indirme çalıştırılmadan önce atılır |

Tam model, yedekleme, makineler arası birleştirme ve her dosyanın nerede yaşadığı: [docs/seguranca.md](docs/seguranca.md).
Bir açık mı buldunuz? [SECURITY.md](SECURITY.md).

## 📚 Dokümantasyon

| Belge | İçeriği |
|---|---|
| 📖 [Kullanıcı kılavuzu](docs/uso.md) | sekmeler, tekrarlanan görevler, kısayollar, temalar, erişilebilirlik, pencere, güncellemeler ve sistemle başlatma |
| 🔌 [Entegrasyonlar](docs/integracoes.md) | Google takvimi ve GitHub (kişisel token ya da device flow) |
| 🛡️ [Güvenlik ve veri](docs/seguranca.md) | tehdit modeli, `.canto` yedeği, birleştirme, parola değişimi, diskteki dosyalar |
| 📊 [Karşılaştırma](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify ve hacim testleri |
| 📝 [CHANGELOG](CHANGELOG.md) | her sürümde neyin değiştiği |
| 🤝 [Nasıl katkıda bulunulur](CONTRIBUTING.md) | ortam, testler, PR'lar ve bir sürümün nasıl yayınlanacağı |
| 🤖 [Ajan kılavuzu](AGENTS.md) | kodu yapay zekayla düzenleyenler için sözleşmeler ve tuzaklar |

## 🛠️ Geliştirme

Ön koşullar: [Bun](https://bun.sh) ≥ 1.2, kararlı Rust ≥ 1.85 ve sisteminiz için
[Tauri v2 bağımlılıkları](https://v2.tauri.app/start/prerequisites/).

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Her PR, Windows, macOS ve Linux üzerinde CI çalıştırır. Bir `v*` etiketi, taslak bir sürümde güncellemeler için
imzalı kurulum dosyalarını derler (adım adım [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão) içinde).

## 📄 Lisans

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Toplantılar arasında yaşayanlar için 🦀 Rust, ⚛️ React ve ☕ ile yapıldı.</sub></div>
