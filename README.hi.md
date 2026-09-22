<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: आपका पूरा दिन स्क्रीन के कोने में। विजेट विंडो में टास्क, GitHub और मीटिंग अलर्ट।" width="100%">

<br><br>

[![डाउनलोड](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20%E0%A4%A1%E0%A4%BE%E0%A4%89%E0%A4%A8%E0%A4%B2%E0%A5%8B%E0%A4%A1-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT लाइसेंस](https://img.shields.io/badge/%E0%A4%B2%E0%A4%BE%E0%A4%87%E0%A4%B8%E0%A5%87%E0%A4%82%E0%A4%B8-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-%E0%A4%8F%E0%A4%A8%E0%A5%8D%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%AA%E0%A5%8D%E0%A4%9F%E0%A5%87%E0%A4%A1%20%E0%A4%95%E0%A5%8B%E0%A4%B0-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[फीचर्स](#-फीचर्स)** · **[स्किन](#-पाँच-स्किन)** · **[इंस्टॉल](#%EF%B8%8F-इंस्टॉल)** · **[सुरक्षा](#-एक-नज़र-में-सुरक्षा)** · **[दस्तावेज़ीकरण](#-दस्तावेज़ीकरण)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · **हिन्दी**</sub>

</div>

<br>

> **रिमाइंडर वाले टास्क, नोट्स, क्लिपबोर्ड हिस्ट्री, मीटिंग अलर्ट वाला एजेंडा, ट्रांसक्रिप्ट और आपके GitHub PR,**
> सब स्क्रीन के कोने में टिकी एक छोटी विंडो में। `Ctrl+Alt+Space` से खुलता है, ज़रूरत न हो तो छिप जाता है
> और सब कुछ आपकी मशीन पर एन्क्रिप्टेड रखता है, बिना किसी अकाउंट या सर्वर के।

## ✨ Canto क्यों

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tasks, Notes, Clipboard, Agenda और GitHub टैब, मीटिंग अलर्ट और स्किन का टूर" width="300"></td>
<td>

अगर आप मीटिंग्स, PR और छोटे-छोटे पेंडिंग कामों के बीच जीते हैं, तो आखिर में पाँच ऐप्स खुले रह जाते हैं। Canto
यह सब एक ही जगह लाता है।

🔒 **डिफ़ॉल्ट रूप से एन्क्रिप्टेड।** मास्टर पासवर्ड के साथ Argon2id + AES-256-GCM; की सिर्फ़ RAM में रहती है।
Windows Hello वैकल्पिक है।

🏠 **आपका डेटा आपके पास रहता है।** ज़ीरो टेलीमेट्री, ज़ीरो सर्वर, किसी अकाउंट की ज़रूरत नहीं। बैकअप एक
एन्क्रिप्टेड `.canto` फ़ाइल है।

⏰ **आप इसे मिस नहीं करेंगे।** मीटिंग से 1 मिनट पहले और रिमाइंडर के समय, विजेट पॉप अप होता है, आवाज़ बजाता है
और नोटिफिकेशन भेजता है, साथ में **10 मिनट का स्नूज़**।

🪶 **हल्का।** Electron की जगह Tauri v2 (Rust + सिस्टम वेबव्यू): सिर्फ़ 3.5 MB का इंस्टॉलर।
[मापे गए आँकड़े](docs/benchmark.md#footprint-medido)।

🔄 **हमेशा अप टू डेट।** ऐप के अंदर से ही अपडेट होता है और सिर्फ़ प्रोजेक्ट की अपनी की से साइन किया हुआ ही इंस्टॉल करता है।

</td>
</tr>
</table>

## 🧰 फीचर्स

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="समय और पुनरावृत्ति के साथ आज के टास्क"></td>
<td>

### ✅ टास्क जो याद दिलाते हैं

समय और पुनरावृत्ति (रोज़, कार्यदिवस या साप्ताहिक) वाली एक डेली चेकलिस्ट। **`Daily at 9:30am`** टाइप करें और
रिमाइंडर सेट हो जाता है। पेस्ट करने के लिए तैयार **डे समरी** और कल के **पेंडिंग आइटम खींच लाना**।

</td>
</tr>
<tr>
<td>

### 📅 मीटिंग शुरू होने वाली है? यह बता देता है।

आज के इवेंट Google Calendar (रीड-ओनली) से आते हैं। एक मिनट पहले, विजेट स्क्रीन पर उछल कर **Meet जॉइन करें** के
साथ आता है, आवाज़ बजाता है और सिस्टम नोटिफिकेशन भेजता है, चाहे आप किसी भी टैब पर हों या यह छिपा हो। इवेंट पर
क्लिक करके आयोजक, एजेंडा, गेस्ट और अटैचमेंट देखें, जैसे Gemini के नोट्स।

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="आयोजक, गेस्ट और Gemini नोट्स के साथ इवेंट डीटेल"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="टैग और पिन किए नोट के साथ नोट कार्ड्स"></td>
<td>

### 🗒️ कार्ड के रूप में नोट्स

`#tags`, ऊपर पिन करने और एक-क्लिक टैग फ़िल्टर वाले सर्च योग्य कार्ड्स। हज़ारों नोट्स संभालता है: लिस्ट पेज्ड
है और सर्च सभी को कवर करती है।

</td>
</tr>
<tr>
<td>

### 📋 क्लिपबोर्ड जो न भूलता है, न लीक करता है

सर्च और पिन के साथ एन्क्रिप्टेड हिस्ट्री; लिंक, रंग और कोड पहचानता है। एक बड़ा कॉपी (100 MB का लॉग) कुछ भी
फ़्रीज़ नहीं करता: यह शुरुआत रखता है और आगाह करता है। Windows पर, यह वह सब छोड़ देता है जिसे पासवर्ड मैनेजर
संवेदनशील मार्क करते हैं।

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="लिंक, बड़े लॉग और कोड के साथ क्लिपबोर्ड हिस्ट्री"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="रिव्यू रिक्वेस्ट, असाइन और ओपन PR के साथ GitHub टैब"></td>
<td>

### 🐙 एक नज़र में आपका GitHub

**मुझसे रिव्यू रिक्वेस्ट**, मुझे असाइन किए गए, मेरे खोले PR और इश्यू, PR या इश्यू आइकन और खोलने वाले के साथ।
टेक्स्ट, `repo:` या `label:` से फ़िल्टर करें, सिर्फ़ PR या सिर्फ़ इश्यू, अपडेट, क्रिएशन या कमेंट से सॉर्ट करें,
और **और दिखाएँ** से स्क्रॉल करें। **GitLab.com और सेल्फ़-होस्टेड GitLab** भी सपोर्ट करता है, रेट लिमिट का
ध्यान रखने वाले 5 मिनट के कैश के साथ। रीड-ओनली पर्सनल टोकन से या ब्राउज़र से (डिवाइस फ़्लो) साइन इन करें।

</td>
</tr>
<tr>
<td>

### ⚙️ सेटिंग्स और ऑटोमैटिक अपडेट

मास्टर पासवर्ड बदलना, Windows Hello, `.canto` बैकअप, ऑटोमैटिक मर्ज वाला सिंक फ़ोल्डर (Dropbox, OneDrive,
Syncthing...), सिस्टम के साथ स्टार्ट और **Updates** सेक्शन, जिसमें **इंस्टॉल्ड वर्ज़न** और **नवीनतम प्रकाशित**
वर्ज़न साथ-साथ दिखते हैं, अपडेट और रीस्टार्ट के बटन के साथ।

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="इंस्टॉल्ड वर्ज़न, नवीनतम प्रकाशित वर्ज़न और अपडेट बटन दिखाती सेटिंग्स"></td>
</tr>
</table>

इसमें 🎙️ **Meetings** भी है: पिछले दो हफ़्तों के Gemini नोट्स और ट्रांसक्रिप्ट, साथ ही लोकल फ़ोल्डर से
`.vtt`, `.srt`, `.txt` और `.md` ट्रांसक्रिप्ट, साफ़ किए और सर्च योग्य।

⌨️ **सब कुछ कीबोर्ड से:** `Alt+1`…`Alt+7` टैब बदलते हैं, `N` बनाता है, `/` सर्च करता है, `F11` फ़ुलस्क्रीन,
`Alt+L` लॉक करता है और `?` शॉर्टकट लिस्ट करता है।

## 🎨 पाँच स्किन

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="डिफ़ॉल्ट स्किन" width="200"><br><b>डिफ़ॉल्ट</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo स्किन" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula स्किन" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="लाइट स्किन" width="200"><br><b>लाइट</b></td>
</tr>
</table>

और **सिस्टम फ़ॉलो करें**, जो OS के साथ लाइट और डार्क के बीच बदलता है। सभी AA कंट्रास्ट पास करती हैं।

<details>
<summary>🖥️ और स्क्रीन: ऑनबोर्डिंग, ग्लोबल सर्च, GitLab, सबटास्क, मार्कडाउन, सुरक्षा, सिंक, डेंसिटी और बहुत कुछ</summary>

<br>

![फ़ुलस्क्रीन में GitHub टैब](docs/prints/app/12-tela-cheia.png)

| पहली बार का वेलकम | ग्लोबल सर्च (`Ctrl+K`) | सेल्फ़-होस्टेड GitLab टैब | मीटिंग अलर्ट |
|---|---|---|---|
| ![ज़रूरी शॉर्टकट के साथ ऑनबोर्डिंग](docs/prints/app/19-onboarding.png) | ![टास्क, नोट्स और क्लिपबोर्ड में एक साथ सर्च](docs/prints/app/20-busca-global.png) | ![सेल्फ़-होस्टेड GitLab पर रिव्यू रिक्वेस्ट, असाइन और इश्यू](docs/prints/app/21-gitlab.png) | ![Meet जॉइन और स्नूज़ के साथ मीटिंग अलर्ट](docs/prints/app/07-aviso-reuniao.png) |

| सबटास्क, प्रायोरिटी और PR वाला टास्क | मार्कडाउन में नोट | और क्लिपबोर्ड टाइप | सुरक्षा: ऑटो-लॉक और अनलॉक |
|---|---|---|---|
| ![टास्क पर चेकलिस्ट, प्रायोरिटी और PR लिंक](docs/prints/app/23-tarefas-detalhes.png) | ![टास्क से लिंक्ड मार्कडाउन में रेंडर हुआ नोट](docs/prints/app/24-notas-markdown.png) | ![लिंक, रंग, json, ई-मेल और फ़ोन पहचानता क्लिपबोर्ड](docs/prints/app/25-clipboard-tipos.png) | ![कॉन्फ़िगर करने योग्य ऑटो-लॉक और हाल के अनलॉक का लॉग](docs/prints/app/26-ajustes-seguranca.png) |

| सिंक फ़ोल्डर | कॉम्पैक्ट डेंसिटी | लॉक्ड वॉल्ट | GitHub कनेक्ट करें |
|---|---|---|---|
| ![Dropbox फ़ोल्डर की ओर इशारा करती सेटिंग्स](docs/prints/app/27-ajustes-sync.png) | ![Tasks टैब पर कॉम्पैक्ट इंटरफ़ेस](docs/prints/app/28-densidade-compacta.png) | ![Windows Hello के साथ पासवर्ड स्क्रीन](docs/prints/app/09-cofre-trancado.png) | ![टोकन से या ब्राउज़र से कनेक्ट करें](docs/prints/app/10-github-conectar.png) |

| टास्क रिमाइंडर | मास्टर पासवर्ड बदलें |
|---|---|
| ![पूरा करने और स्नूज़ के साथ रिमाइंडर](docs/prints/app/08-lembrete-tarefa.png) | ![पासवर्ड बदलने का फ़ॉर्म](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>सभी स्क्रीनशॉट काल्पनिक डेटा का इस्तेमाल करते हैं।</sub>

## ⚖️ बाज़ार में जो मौजूद है, उससे तुलना

अध्ययन किए गए किसी भी टूल में एक साथ इनमें से दो से ज़्यादा मोर्चे कवर नहीं होते। सोर्स और डीटेल
[docs/benchmark.md](docs/benchmark.md) में।

| | टास्क + रिमाइंडर | नोट्स | क्लिपबोर्ड | मीटिंग्स | GitHub | डिफ़ॉल्ट लोकल एन्क्रिप्शन |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ सिर्फ़ सिंक |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ वैकल्पिक |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ नेटिव · ➖ आंशिक, एक्सटेंशन या वैकल्पिक के ज़रिए · — कोई नहीं · ? अप्रकाशित · n/a यूज़र डेटा स्टोर नहीं करता</sub>

बेंचमार्क से यहाँ क्या आया: **टास्क टाइटल में ही समय** (Todoist/TickTick), **अलर्ट स्नूज़ करना**
(TickTick) और **क्लिपबोर्ड जो पासवर्ड मैनेजर का सम्मान करता है** (CopyQ/Ditto)।

## ⬇️ इंस्टॉल

अपने प्लेटफ़ॉर्म के लिए इंस्टॉलर **[Releases](https://github.com/juninmd/canto-widget/releases)** से डाउनलोड करें:

| सिस्टम | फ़ाइल |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (अनुशंसित) या `.msi` |
| 🍎 macOS | Apple Silicon या Intel के लिए `.dmg` |
| 🐧 Linux | `.AppImage`, `.deb` या `.rpm` |

1. पहली बार चलाने पर आप **मास्टर पासवर्ड** बनाते हैं। कोई रिकवरी नहीं है: पासवर्ड खोया तो डेटा खोया।
2. `Ctrl+Alt+Space` (macOS पर `Cmd+Alt+Space`) विजेट को दिखाता और छिपाता है।
3. बस हो गया। जब नया वर्ज़न आता है, Canto आपको सूचित करता है, और **Settings → Updates** एक क्लिक में अपडेट कर देता है।

> [!NOTE]
> इंस्टॉलर अभी कोड-साइन नहीं हैं: SmartScreen (Windows) और Gatekeeper (macOS) पहली बार चलाने पर चेतावनी देते हैं।
> ऑटोमैटिक अपडेट चलने से पहले प्रोजेक्ट के अपने सिग्नेचर के मुक़ाबले वेरिफ़ाई किए जाते हैं।

winget और Homebrew के लिए तैयार मैनिफ़ेस्ट (साथ ही फ़िलहाल ब्लॉक्ड Flatpak के लिए एक स्केलेटन)
[`packaging/`](packaging/README.md) में हैं — लोकल रूप से तैयार और वेरिफ़ाई किए गए, पर अभी उन रिपॉज़िटरी में
प्रकाशित नहीं: प्रकाशित करना मेंटेनर का मैनुअल फ़ैसला और काम है।

## 🔒 एक नज़र में सुरक्षा

| लेयर | सुरक्षा |
|---|---|
| वॉल्ट | Argon2id (19 MiB, t=2) → AES-256-GCM, हर राइट पर नया nonce, `fsync` के साथ एटॉमिक राइट |
| की | सिर्फ़ RAM, लॉक होने पर ज़ीरो हो जाती है; कॉन्फ़िगर करने योग्य ऑटो-लॉक (5 से 60 मिनट निष्क्रियता, डिफ़ॉल्ट 15 मिनट) |
| नेटवर्क | सिर्फ़ Rust प्रोसेस नेटवर्क से बात करती है; वेबव्यू का कोई रिमोट ओरिजिन नहीं (CSP) और वह टोकन कभी नहीं देखती |
| Google | वैकल्पिक, सिर्फ़ `calendar.events.readonly` और प्रोफ़ाइल, PKCE और लूपबैक के साथ OAuth |
| GitHub | वैकल्पिक, एन्क्रिप्टेड टोकन; आइटम तभी खुलते हैं जब लिंक `https://github.com/` हो |
| GitLab | वैकल्पिक, एन्क्रिप्टेड एड्रेस और टोकन; सिर्फ़ `https://`, कोई रीडायरेक्ट नहीं, लिंक सिर्फ़ कॉन्फ़िगर की गई इंस्टेंस से |
| अपडेट | सिर्फ़ प्रोजेक्ट की की से साइन किया पैकेज इंस्टॉल होता है; छेड़छाड़ किया डाउनलोड चलने से पहले ही हटा दिया जाता है |

पूरा मॉडल, मशीनों के बीच बैकअप, मर्ज और हर फ़ाइल कहाँ रहती है: [docs/seguranca.md](docs/seguranca.md)।
कोई खामी मिली? [SECURITY.md](SECURITY.md)।

## 📚 दस्तावेज़ीकरण

| दस्तावेज़ | उसमें क्या है |
|---|---|
| 📖 [यूज़र गाइड](docs/uso.md) | टैब, पुनरावर्ती टास्क, शॉर्टकट, स्किन, एक्सेसिबिलिटी, विंडो, अपडेट और सिस्टम के साथ स्टार्ट |
| 🔌 [इंटीग्रेशन](docs/integracoes.md) | Google एजेंडा और GitHub (पर्सनल टोकन या डिवाइस फ़्लो) |
| 🛡️ [सुरक्षा और डेटा](docs/seguranca.md) | थ्रेट मॉडल, `.canto` बैकअप, मर्ज, पासवर्ड बदलना, डिस्क पर फ़ाइलें |
| 📊 [बेंचमार्क](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify और वॉल्यूम टेस्ट |
| 📝 [CHANGELOG](CHANGELOG.md) | हर वर्ज़न में क्या बदला |
| 🤝 [योगदान कैसे करें](CONTRIBUTING.md) | एनवायरनमेंट, टेस्ट, PR और रिलीज़ कैसे पब्लिश करें |
| 🤖 [एजेंट गाइड](AGENTS.md) | AI से कोड एडिट करने वालों के लिए कॉन्ट्रैक्ट और ट्रैप |

## 🛠️ डेवलपमेंट

ज़रूरी: [Bun](https://bun.sh) ≥ 1.2, स्टेबल Rust ≥ 1.85 और आपके सिस्टम के लिए
[Tauri v2 डिपेंडेंसी](https://v2.tauri.app/start/prerequisites/)।

```bash
bun install
bun run tauri dev                                        # हॉट रीलोड के साथ ऐप
bun run lint && bun test                                 # टाइप और UI टेस्ट
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # मौजूदा प्लेटफ़ॉर्म के लिए इंस्टॉलर
```

हर PR पर Windows, macOS और Linux पर CI चलता है। एक `v*` टैग अपडेट के लिए साइन किए इंस्टॉलर एक ड्राफ़्ट
रिलीज़ में बनाता है (कदम-दर-कदम [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão) में)।

## 📄 लाइसेंस

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>🦀 Rust, ⚛️ React और ☕ के साथ, मीटिंग्स के बीच जीने वालों के लिए बना।</sub></div>
</content>
