<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · **Română** · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> ** Sarcini cu mementouri, note, istoric clipboard, o agendă cu alerte de întâlnire, transcrieri și GitHub PRs
> într-o fereastră mică fixată în colțul ecranului.** Apare cu `Ctrl+Alt+Space`, se ascunde când nu aveți nevoie
> acesta și păstrează totul criptat pe mașina dvs., fără cont și fără server.

## 🌐 Limbi

Canto oferă **42 de limbi de interfață**, fiecare cu propriul README. Alegeți-l pe **Setări → Limbă**;
selectorul de căutare folosește nume de limbi materne, iar modul automat urmează limba principală a sistemului.
Arabă, ebraică și persană folosesc text de la dreapta la stânga. Cataloage de limbi suplimentare se încarcă la cerere.

Cele 40 de cataloage noi de interfață și 31 de noi traduceri README sunt traduceri automate și nu au fost
revizuit de vorbitori nativi. Portugheză și engleză rămân cataloagele originale de interfață. etichete pentru tavi si
titlurile de notificare urmează limba selectată; unele detalii de alertă de integrare revin în limba engleză,
iar erorile de backend rămân în portugheză. Sintaxa titlului sarcinii păstrează cuvintele cheie existente în portugheză și engleză.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ De ce Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Dacă locuiți între întâlniri, PRs și articole mici în așteptare, ajungeți să aveți cinci aplicații deschise. Canto pune totul
un loc.

🔒 **Ccriptat implicit.** Argon2id + AES-256-GCM cu o parolă principală; cheia există doar în RAM.
Windows Hello opțional.

🏠 **Datele tale rămân cu tine.** Telemetrie zero, server zero, nu este necesar un cont. Backup-ul este un singur criptat
`.canto` fișier.

⏰ **Nu o veți rata.** Cu 1 minut înainte de o întâlnire și la ora de memento, widget-ul apare, redă un sunet și
trimite o notificare, cu **amânare 10 min**.

🪶 **Ușoară.** Tauri v2 (Rust + vizualizarea web a sistemului) în loc de Electron: un program de instalare de 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Întotdeauna la zi.** Actualizează din interiorul aplicației și instalează doar ceea ce este semnat de propria cheie a proiectului.

</td>
</tr>
</table>

## 🧰 Caracteristici

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Sarcini care îți amintesc

O listă de verificare zilnică cu timpul și recurența (în fiecare zi, în zilele lucrătoare sau săptămânal). Tastați **`Daily at 9:30am`** și
memento-ul este deja setat; adăugați **`!high`** (sau `!alta`, `!média`, `!baixa`) pentru prioritate sau faceți clic pe punctul de pe rând pentru a-l ciclă. Titlurile lungi se împachetează în loc să fie tăiate. **Cronometrul de focalizare** pe orice sarcină: dați-i o estimare, apăsați ▶ și o bară fixată sub fiecare filă numără timpul față de ea (roșu odată ce treceți peste); timpul este salvat în seif în fiecare minut. **Rezumatul zilei** gata de inserat (sarcini, timp concentrat, întâlniri cu timpul total, PRs/MRs deschise, îmbinate, revizuite și închise fără îmbinare), un **raport săptămânal și lunar** în reducere și **retragerea articolelor în așteptare** de ieri. **Captură rapidă** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` pe macOS) notează o sarcină sau o notă din orice aplicație, fără a deschide widget-ul.

</td>
</tr>
<tr>
<td>

### 📅 Începe întâlnirea? Îți spune.

Alăturați-vă următoarei întâlniri cu `Ctrl+Alt+M` (`Ctrl+Cmd+M` pe macOS). Dacă înregistrarea eșuează, Canto încearcă
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` pe macOS); meniul tavă rămâne disponibil dacă ambele nu sunt disponibile.

Evenimentele de astăzi provin din Google Calendar (numai în citire). Cu un minut înainte, widget-ul sare pe ecran cu
**alăturați-vă Meet**, redă un sunet și trimite o notificare de sistem, indiferent de fila în care vă aflați sau chiar dacă este ascunsă.
Fiecare card prezintă o insignă cu răspunsul dvs. (acceptat, poate, refuzat, în așteptare). Faceți clic pe eveniment pentru a vedea cine a organizat
acesta, agenda, fiecare invitat cu un avatar cu inițialele și răspunsul lor și atașamente, cum ar fi notele Gemeni.
Linia de sus vă arată **următorul slot gratuit** de cel puțin 15 minute (invitațiile refuzate și evenimentele de toată ziua nu
numără), iar evenimentele care se suprapun primesc o insignă **conflict** care denumește celălalt eveniment. Vizualizarea **Azi** conduce cu întâlnirea în desfășurare (timp rămas, butonul de alăturare, avertisment de ciocnire) sau următoarea, apoi **ziua într-o singură linie** (întâlniri, sarcini și timp liber pe parcursul orelor de lucru, cu timpul de întâlnire, timpul liber și conflictele luate în considerare) și o cronologie în care întâlnirile, sarcinile cu un timp și golurile libere sunt rânduri proprii, se potrivesc cu o sarcină deja depășită: departe.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Note ca cartonașe

Carduri care pot fi căutate cu `#tags`, fixare în partea de sus și filtru de etichete cu un singur clic; fiecare card afișează începutul notei **redate** (titluri, liste de verificare, cod, linkuri), nu reducere brută. Un **editor WYSIWYG** cu un format compact
bară de formatare (bold, italic, cod, titlu, liste, liste de verificare pe care le bifați chiar în text, blocuri de cod cu sintaxă
evidențieri, link-uri, imagini) și comenzi rapide de reducere pe măsură ce tastați (`# `, `- `, `[ ] `, ` ``` `); un comutator **MD**
arată reducerea brută, care este în continuare modul în care notele sunt stocate, căutate, sincronizate și exportate. Link-urile se deschid cu
`Ctrl`+clic, numai http(e). Lipiți, plasați sau atașați imagini (PNG, JPEG, GIF, WebP de până la 2 MB), fiecare sigilată în sine
fișier criptat, afișat în interiorul notei și ca miniaturi pe card; ei rămân pe această mașină, în afara `.canto`
copii de rezervă. Gestionează mii de note: lista este paginată și căutarea le acoperă pe toate.

</td>
</tr>
<tr>
<td>

### 📋 Clipboard care nu uită niciodată (sau scurge)

Istoric criptat cu căutare și PIN; recunoaște legăturile, culorile și codul. Treceți cu mouse-ul pe un articol pentru a-l **copiați rescris**:
Format JSON sau compact, text pe o singură linie, MAJUSCULE sau minuscule (intrarea istoricului rămâne așa cum era). O copie uriașă (un jurnal de 100 MB) nu
îngheață orice: păstrează startul și te avertizează. Pe Windows, omite orice marca managerii de parole ca
sensibile.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub al tău dintr-o privire

**Recenzie solicitată de la mine**, atribuită mie, PRs și problemele pe care le-am deschis, cu o pictogramă PR sau problema și cine a deschis
ea. Schițele, PRs **așteaptă recenzia dvs.** și PRs **blocat** pentru o săptămână ies în evidență, iar fiecare PR poartă un mic
**Insigna CI** (procesată, eșuată, rulând sau fără CI) din verificările sale de comitere principală. Când cineva ** vă cere
revizuire**, vă spune o notificare a sistemului de operare (activată în mod implicit, dezactivați-o în Setări). Filtrați după text, `repo:` sau `label:`, numai PRs sau numai probleme, sortați după actualizare, creare sau comentarii și
derulați cu **afișați mai multe**. Treceți la vizualizarea **Comentarii** pentru a vedea o grilă **Catalog de comentarii** a tuturor celor care au comentat la PRs dvs. (avatare, insigne uman vs bot, număr de comentarii, căutare, filtru bot, paginare progresivă) și comentariile acestora. De asemenea, acceptă **GitLab.com și GitLab** auto-găzduit, cu un cache de 5 minute care
respectă limita de rată. Conectați-vă cu un token personal numai pentru citire sau din browser (flux de dispozitiv).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam fără a părăsi widget-ul

Patru sub-file pentru Steam: **oferte pe lista de dorințe** (cea mai mare reducere mai întâi, fiecare cu ceea ce economisește), **cele mai vândute**
clasat, **joacă acum** (fiecare joc Steam raportează pentru ultimele două săptămâni) și **catalog ordonat după evaluare**, paginat
cu **incarca mai mult** ca sa ajunga in restul magazinului. Fiecare rând conține **capsule art**, **score review**
cu formularea propriei Steam și câte recenzii contează, prețul tăiat, prețul în reali și cât
economii cu reducere — iar lista adună economiile totale. Listele publice au nevoie doar de **SteamID64**; un optional
Tasta **Steam Web API** adaugă jocurile recente cu timpul lor de joacă. Fila începe în mod implicit, la o casetă de selectare distanță
în Setări.

</td>
</tr>
<tr>
<td>

### ⚙️ Setări și actualizări automate

Schimbarea parolei principale, copie de rezervă Windows Hello, `.canto`, un folder sincronizat cu îmbinare automată (Dropbox,
OneDrive, Syncthing...), începeți cu sistemul și secțiunea **Actualizări**, cu **versiunea instalată** și
**cel mai recent publicat** unul lângă altul și un buton pentru a actualiza și a reporni.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Are, de asemenea, 🎙️ **Întâlniri**, o subfilă a Agendei lângă Listă și Zi: notele Gemeni și transcrierile din
ultimele două săptămâni, plus transcrierile `.vtt`, `.srt`, `.txt` și `.md` dintr-un folder local, curățate și care pot fi căutate.

🤖 **Modele AI** (în bara de file în mod implicit, **fără cheie API sau cont**): LLM-uri clasate după
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, citit de pe pagina sa publică de clasament,
cu o bară de scor, creator, preț pe 1 milion de jetoane și viteză, sortabil după inteligență, preț sau viteză. Se aduce la
cel mai mult o dată la 3 ore, iar opt-in-ul 🔔 vă anunță când a
modelul **intră în primele 10** sau **urcă în el** (verificat la fiecare 6 ore în timp ce seiful este deblocat), cu
insigne „nou” și „up” timp de o săptămână.

🌙 **Nu deranjați:** în Setări sau în tavă, opriți alertele de întâlnire, mementouri de sarcini, alerte de stare și fiecare
notificare de sistem timp de 30 min, 1 h, 2 h, până mâine sau până când îl opriți. În bara de sus apare o lună
când se termină; un clic îl oprește înapoi. Supraviețuiește unei reporniri și se termină de la sine.

🔔 **Fiecare alertă într-un singur ecran:** clopoțelul din antet (numărează și colorează când ceva este în așteptare) deschide
alerte pe întreaga fereastră în orice mod: un card pe alertă cu acțiunile sale, **închideți toate** și ce a fost
rezolvat astăzi sub ele - fără nimic în așteptare, așa mai ajungeți la jurnalul de astăzi. Din andocare, un clic
încă deschide acea alertă unică deasupra ferestrei normale.

⌨️ **Totul prin tastatură:** `Alt+1`…`Alt+7` comută filele, `N` creează, `/` caută, `F11` ecran complet, `Alt+L`
blochează și `?` listează comenzile rapide. `Ctrl+Shift+P` (`Cmd+Shift+P` pe macOS) deschide o **paleta de comenzi** cu fiecare
acțiune după nume: accesați o filă, o nouă sarcină sau o notă, alăturați-vă la următoarea întâlnire, copiați rezumatul zilei, schimbați skinul, blocați.

## 🎨 Şase piei

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Implicit</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Sticlă</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Lumină</b></td>
</tr>
</table>

Și **Follow system**, care comută între lumină și întuneric împreună cu sistemul de operare. Toate trec contrastul AA.

<details>
<summary>🖥️ Mai multe ecrane: onboarding, căutare globală, paletă de comenzi, GitLab, subsarcini, editor de note, securitate, sincronizare, densitate și multe altele</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Bun venit la prima rulare | Căutare globală (`Ctrl+K`) | Fila GitLab auto-găzduită | Alerta întâlnirii |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Sarcină cu subsarcini, prioritate și PR | Editor de note | Mai multe tipuri de clipboard | Securitate: blocare și deblocare automată |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Dosar sincronizat | Densitate compactă | Seif încuiat | Conectați GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Setări în grupuri, cu căutare | Căutarea filtrează grupurile | Cip offline în antet | Confirmați înainte de a șterge clipboardul |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Aruncă o schiță de notă nesalvată |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Moduri: Mini, Ascuns, Normal, Maximizat | Mod mini: alerte pe marginea ecranului |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Faceți clic pe o alertă în andocare | Maximizat: toată fereastra pentru fila deschisă |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Clopoțelul deschide alertele peste toată fereastra |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: meniul mod se deschide în interiorul ferestrei de andocare |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Filele care nu se potrivesc așteaptă într-un meniu „mai mult” |
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

| Jocuri și ecran complet: alertele așteaptă până plecați |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Amânare: 1, 5 sau 10 minute |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Memento de sarcină | Schimbați parola principală | Stare API (fila de înscriere) | Limba: engleză, portugheză sau spaniolă |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Copiați un clip rescris | Alertă de întâlnire cu pregătire |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Reproiectare: fila Sarcini, înainte și după |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Reproiectare: fiecare filă, înainte (sus) și după (jos) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI a eșuat, cu locurile de muncă sparte | Cineva m-a pomenit | Comutatoarele lor în Setări |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Menționați alertă cu cine a scris-o |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Menționează alerta cu o previzualizare a textului |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Mai multe alerte despre propria mea muncă |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Alertă sumară a zilei | Setarea rezumatului zilei |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mențiuni subfila (GitHub și GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Parola schimbată, un fișier în așteptare | Rezumatul zilei |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Raport săptămânal | Agenda: următorul timp liber și conflicte |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: gratuit chiar acum | Paleta de comenzi (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Nu deranja | Imagine într-o notă |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Insigna CI pe fiecare PR | Notificări de solicitare de revizuire |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Notă imaginile ca miniaturi | Editor de note WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Editor de note: raw markdown (MD) | Editor de note pe pielea deschisă |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Sarcini: prioritate pe rând, titluri lungi wrap | Lista de note cu markdown redat |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Modele AI clasate de Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: cele mai vândute, numerotate | Steam: ultimele cinci jocuri jucate, cu ambele timpi de joc |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: catalogul după rating, cu „încărcați mai mult” | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| O singură suprapunere de alerte pentru tot ce este în așteptare: întreruperi, întâlniri, sarcini și noi modele AI |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Punctele mele finale: plăci cu cea mai recentă latență | Un punct final deschis: diagramă de latență, setări de limită și alertă | Adăugarea unui DNS + verificare certificat |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda oricărei zile: săgețile precedente și următoare, un selector de dată și un buton de revenire la azi |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Sarcini: sarcina curentă cu temporizator și listă grupată | GitHub: banda rezumat deasupra listelor | GitLab: aceeași bandă, fără țigla CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Temporizator de focalizare fixat sub fiecare filă | Agenda ca o zi, sarcini pe lângă întâlniri |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Vizualizare zilnică: evenimentele care se suprapun împart lățimea una lângă alta |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Radar de revizuire: prima solicitare cea mai veche, întârziată în roșu, amânare |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Întâlniri ca subfilă a agendei, lângă Listă și Zi |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Fila Activitate (dezactivată implicit) | Rezumat cu timp concentrat și închis PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Fila Activitate, ultimele 7 zile | Fila Activitate, dezactivată | Fila Activitate pe o fereastră largă |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Fila **Activitate** începe ascunsă (activați-o în Setări → file vizibile). Înregistrează doar numele
aplicație focalizată în timp ce utilizați computerul, într-un fișier local sigilat care nu ajunge niciodată la backup-uri sau sincronizare (Wayland
nu pot raporta fereastra focalizată, așa că rămâne indisponibilă acolo). Dezactivați până când vă înscrieți și primul ecran spune ce
se păstrează și ceea ce nu este niciodată.

- **Ziua**: o gogoașă pe categorie cu totalul în interior, a cărei legendă ascunde o categorie, schimbarea față de zi
înainte și timpul de inactivitate (fără tastatură sau mouse timp de 2 minute). Dedesubt, un obiectiv zilnic de concentrare a codului cu seria sa și
un punct pe zi, trei momente evidențiate (cea mai lungă întindere într-o aplicație, comutatoare de aplicație, oră de vârf), o cronologie în care întregul
Ziua inactivă se întinde și cele mai aglomerate aplicații au o singură axă de timp cu un marcator „acum” și o listă de aplicații
(atingeți unul pentru a-i schimba categoria) sau a sarcinilor pe care a rulat cronometrul de focalizare.
- **Săptămâna**: coloane stivuite pe zi, cu linia medie și un punct sub fiecare zi care a îndeplinit obiectivul, o hartă termică de oră
cu vârful tău și aceleași liste pentru întreaga săptămână.
- **Layout și skinuri**: o coloană în fereastra implicită, două odată ce este lată (maximizată); fiecare piele are a ei
culori de categorie, verificate pentru contrast. Meniul de lângă zi îl copiază ca text.

<sub>Toate capturile de ecran folosesc date fictive.</sub>

## ⚖️ În comparație cu ce este acolo

Niciunul dintre instrumentele cercetate nu acoperă mai mult de două dintre aceste fronturi simultan. Surse și detalii în
[docs/benchmark.md](docs/benchmark.md).

| | Sarcini + memento | Note | Clipboard | Întâlniri | GitHub | Criptare locală în mod implicit |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ numai sincronizare |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Idem | — | — | ✅ | — | — | ➖ opțional |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ nativ · ➖ parțial, prin extensie sau opțional · — niciunul · ? nepublicat · n/a nu stochează datele utilizatorului</sub>

Ce a adus reperul aici: **time chiar în titlul sarcinii** (Todoist/TickTick), **amâna alerta**
(TickTick) și **clipboard care respectă managerii de parole** (CopyQ/Ditto).

## ⬇️ Instalează

Descărcați programul de instalare pentru platforma dvs. de pe **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistem | Fișier |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recomandat) sau `.msi` |
| 🍎 macOS | `.dmg` pentru Apple Silicon sau Intel |
| 🐧 Linux | `.AppImage`, `.deb` sau `.rpm` |

1. La prima rulare, creați **parola principală**. Nu există recuperare: pierdeți parola, pierdeți datele.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` pe macOS) afișează și ascunde widgetul.
3. Gata. Când se livrează o nouă versiune, Canto vă anunță, iar **Setări → Actualizări** se actualizează cu un singur clic.

> [!NOTĂ]
> Programele de instalare nu sunt încă semnate prin cod: SmartScreen (Windows) și Gatekeeper (macOS) avertizează la prima lansare.
> Actualizările automate sunt verificate după semnătura proprie a proiectului înainte de rulare.

Manifeste gata făcute pentru winget și Homebrew (plus un schelet pentru Flatpak, blocat în prezent) live în
[`packaging/`](packaging/README.md) — pregătit și verificat la nivel local, dar încă nepublicat acestora
depozite: publicarea este o decizie și o acțiune manuală a întreținătorului.

## 🔒 Securitate dintr-o privire

| Strat | Protecție |
|---|---|
| Seif | Argon2id (19 MiB, t=2) → AES-256-GCM, un nonce proaspăt la fiecare scriere, scriere atomică cu `fsync` |
| Cheie | Numai RAM, zero la blocare; blocare automată configurabilă (5 până la 60 de minute inactiv, 15 minute în mod implicit) |
| Rețea | numai procesul Rust vorbește cu rețeaua; vizualizarea web nu are origine la distanță (CSP) și nu vede niciodată simboluri |
| Google | opțional, numai `calendar.events.readonly`, `directory.readonly` (fotografiile colegilor din spațiul de lucru în lista de invitați) plus profil, OAuth cu PKCE și loopback |
| GitHub | jeton opțional, criptat; articolele se deschid numai dacă linkul este `https://github.com/` |
| GitLab | adresa opțională și token criptată; Numai `https://`, fără redirecționări, linkuri numai din instanța configurată |
| Actualizări | instalează doar un pachet semnat de cheia proiectului; o descărcare manipulată este eliminată înainte de a rula |

Model complet, backup, îmbinare între mașini și unde se află fiecare fișier: [docs/seguranca.md](docs/seguranca.md).
Ați găsit un defect? [SECURITY.md](SECURITY.md).

## 📚 Documentație

| Document | Ce este în el |
|---|---|
| 📖 [User guide](docs/uso.md) | file, sarcini recurente, comenzi rapide, skinuri, accesibilitate, fereastră, actualizări și începe cu sistemul |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda și GitHub (jeton personal sau flux de dispozitiv) |
| 🛡️ [Security and data](docs/seguranca.md) | model de amenințare, `.canto` backup, îmbinare, schimbarea parolei, fișiere de pe disc |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify și teste de volum |
| 📝 [CHANGELOG](CHANGELOG.md) | ce s-a schimbat în fiecare versiune |
| 🤝 [How to contribute](CONTRIBUTING.md) | mediu, teste, PRs și cum se publică o versiune |
| 🤖 [Agent guide](AGENTS.md) | contracte și capcane pentru oricine editează codul cu AI |

## 🛠️ Dezvoltare

Cerințe preliminare: [Bun](https://bun.sh) ≥ 1,2, stabil Rust ≥ 1,85 și
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) pentru sistemul dvs.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Vizualizările web sunt create după starea Rust și tava sunt inițializate, astfel încât apelurile IPC de pornire nu pot fi configurate curse.

Fiecare PR rulează CI pe Windows, macOS și Linux. Comiterile convenționale `fix`, `feat` și breaking commit au fuzionat în `main`
obțineți o etichetă SemVer, note de lansare generate și programe de instalare semnate construite în paralel; ediția este publicată după verificare (detalii în
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licență

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Făcut cu 🦀 Rust, ⚛️ React și ☕ pentru cei care locuiesc între întâlniri.</sub></div>
