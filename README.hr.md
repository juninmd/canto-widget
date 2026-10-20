<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · **Hrvatski** · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Zadaci s podsjetnicima, bilješkama, poviješću međuspremnika, dnevnim redom s upozorenjima o sastancima, transkriptima i vašim GitHub PRs
> u malom prozoru pričvršćenom za kut zaslona.** Iskače s `Ctrl+Alt+Space`, skriva se kada vam ne treba
> i čuva sve šifrirano na vašem računalu, bez računa i poslužitelja.

## 🌐 jezici

Canto nudi **42 jezika sučelja**, svaki sa svojim README-om. Odaberite svoj u **Postavke → Jezik**;
birač koji se može pretraživati ​​koristi imena na materinjem jeziku, a automatski način rada prati vaš primarni jezik sustava.
Arapski, hebrejski i perzijski koriste tekst zdesna nalijevo. Dodatni jezični katalozi učitavaju se na zahtjev.

40 novih kataloga sučelja i 31 novi prijevod README strojni su prijevodi i nisu bili
recenzirali izvorni govornici. Portugalski i engleski ostaju izvorni katalozi sučelja. Naljepnice za ladice i
naslovi obavijesti slijede odabrani jezik; neki detalji upozorenja o integraciji vraćaju se na engleski,
a pozadinske pogreške ostaju na portugalskom. Sintaksa naslova zadatka zadržava postojeće portugalske i engleske ključne riječi.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Zašto Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Ako živite između sastanaka, PRs i malih stavki na čekanju, završit ćete s pet otvorenih aplikacija. Canto stavlja sve
jedno mjesto.

🔒 **Kriptirano prema zadanim postavkama.** Argon2id + AES-256-GCM s glavnom lozinkom; ključ postoji samo u RAM-u.
Windows Hello izborno.

🏠 **Vaši podaci ostaju s vama.** Bez telemetrije, bez poslužitelja, nije potreban račun. Sigurnosna kopija je jednostruko šifrirana
`.canto` datoteka.

⏰ **Nećete ga propustiti.** 1 minutu prije sastanka i u vrijeme podsjetnika, widget se pojavljuje, reproducira zvuk i
šalje obavijest s **odgodi 10 min**.

🪶 **Lagano.** Tauri v2 (Rust + web-prikaz sustava) umjesto Electron: program za instalaciju od 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Uvijek ažuran.** Ažurira se unutar aplikacije i instalira samo ono što je potpisano vlastitim ključem projekta.

</td>
</tr>
</table>

## 🧰 Značajke

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Zadaci koji vas podsjećaju

Dnevni kontrolni popis s vremenom i ponavljanjem (svaki dan, radnim danima ili tjedno). Upišite **`Daily at 9:30am`** i
podsjetnik je već postavljen; dodajte **`!high`** (ili `!alta`, `!média`, `!baixa`) za prioritet ili kliknite točku na retku da biste ga kružili. Dugi naslovi omotani su umjesto da budu odrezani. **Fokusirajte mjerač vremena** na bilo koji zadatak: dajte mu procjenu, pritisnite ▶ i traka prikvačena ispod svake kartice računa vrijeme u odnosu na njega (crvena kada prijeđete preko); vrijeme se sprema u trezor svake minute. **Dnevni sažetak** spreman za lijepljenje (zadaci, fokusirano vrijeme, sastanci s ukupnim vremenom, PRs/MRs otvorenih, spojenih, pregledanih i zatvorenih bez spajanja), **tjedno i mjesečno izvješće** u markdownu i **povlačenje stavki na čekanju** od jučer. **Brzo snimanje** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` na macOS-u) zapisuje zadatak ili bilješku iz bilo koje aplikacije, bez otvaranja widgeta.

</td>
</tr>
<tr>
<td>

### 📅 Sastanak počinje? To vam govori.

Pridružite se sljedećem sastanku s `Ctrl+Alt+M` (`Ctrl+Cmd+M` na macOS-u). Ako registracija ne uspije, pokušava Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` na macOS-u); izbornik trake ostaje dostupan ako oba nisu dostupna.

Današnji događaji dolaze iz kalendara Google (samo za čitanje). Minutu prije, widget skače na zaslon sa
**pridružite se Meet**, reproducira zvuk i šalje obavijest sustava, bez obzira na kartici na kojoj se nalazite ili čak i ako je skrivena.
Svaka kartica prikazuje značku s vašim odgovorom (prihvaćen, možda, odbijen, na čekanju). Kliknite događaj da biste vidjeli tko ga je organizirao
to, dnevni red, svaki gost s inicijalima avatara i njihovim odgovorom i prilozima, poput Geminijevih bilješki.
Gornji redak govori vam o **sljedećem slobodnom terminu** od najmanje 15 minuta (odbijene pozivnice i cjelodnevni događaji ne
broj), a događaji koji se preklapaju dobivaju značku **sukoba** koja imenuje drugi događaj. Pogled **Danas** vodi sa sastankom koji je u tijeku (preostalo vrijeme, gumb za pridruživanje, upozorenje o sukobu) ili sljedećim, zatim **dan u jednom retku** (sastanci, zadaci i slobodno vrijeme tijekom radnog vremena, s uračunatim vremenom sastanka, slobodnim vremenom i sukobima) i jednom vremenskom trakom gdje su sastanci, zadaci s vremenom i slobodnim prazninama vlastiti redovi: praznina nudi uklapanje neodređenog zadatka, a ono što je već prekomotava.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Bilješke kao kartice

Kartice koje se mogu pretraživati s `#tags`, prikvači na vrh i filtar oznake jednim klikom; svaka kartica prikazuje početak **renderirane** bilješke (naslovi, popisi za provjeru, kod, poveznice), a ne sirovo označavanje. **WYSIWYG uređivač** s kompaktnim
traka za oblikovanje (podebljano, kurziv, kod, naslov, popisi, popisi za provjeru koje označavate u tekstu, blokovi koda sa sintaksom
isticanje, veze, slike) i prečaci za označavanje dok upisujete (`# `, `- `, `[ ] `, ` ``` `); **MD** prekidač
prikazuje neobrađeno označavanje, što je i dalje način na koji se bilješke pohranjuju, pretražuju, sinkroniziraju i izvoze. Linkovi se otvaraju sa
`Ctrl`+klik, samo http(s). Zalijepite, ispustite ili priložite slike (PNG, JPEG, GIF, WebP do 2 MB), svaka zapečaćena u svom
šifrirana datoteka, prikazana unutar bilješke i kao sličice na kartici; ostaju na ovom stroju, izvan `.canto`
sigurnosne kopije. Obrađuje tisuće bilješki: popis je listan i pretraživanje ih pokriva sve.

</td>
</tr>
<tr>
<td>

### 📋 Međuspremnik koji nikad ne zaboravlja (ili ne curi)

Šifrirana povijest s pretraživanjem i pin-om; prepoznaje poveznice, boje i kod. Zadržite pokazivač miša nad stavkom da biste je **prepisali**:
JSON formatiran ili kompaktan, tekst u jednom retku, VELIKA ili mala slova (unos u povijest ostaje kakav je bio). Ogromna kopija (dnevnik od 100 MB) ne
zamrzni bilo što: zadržava početak i upozorava te. U sustavu Windows preskače ono što upravitelji lozinki označe kao
osjetljiva.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Vaš GitHub na prvi pogled

**Od mene je zatražen pregled**, dodijeljen meni, PRs i problemi koje sam otvorio, s PR ili ikonom problema i tko je otvorio
to. Nacrti, PRs **čekaju vašu recenziju** i PRs **odloženo** tjedan dana ističu se, a svaki PR nosi mali
**CI bedž** (prošao, nije prošao, izvodi se ili nema CI) iz provjera glavnog izvršenja. Kada netko **zahtijeva vaš
pregled**, kaže vam obavijest OS-a (uključeno prema zadanim postavkama, isključite ga u postavkama). Filtrirajte po tekstu, `repo:` ili `label:`, samo PRs ili samo problemima, sortirajte po ažuriranju, izradi ili komentarima i
pomičite se pomoću **prikaži više**. Prebacite se na prikaz **Komentari** da biste vidjeli mrežu **Kataloga komentatora** svih koji su komentirali vaš PRs (avatare, značke ljudi u odnosu na botove, broj komentara, pretraživanje, filtar botova, progresivno označavanje stranica) i njihove komentare. Također podržava **GitLab.com i GitLab** s vlastitim hostom, s 5-minutnom predmemorijom koja
poštuje ograničenje stope. Prijavite se s osobnim tokenom samo za čitanje ili iz preglednika (tijek uređaja).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam bez napuštanja widgeta

Četiri podkartice za Steam: **ponude s popisa želja** (najprije najveći popust, svaki s uštedom), **najprodavaniji**
rangiran, **igraj sada** (svaka igra Steam izvješća za posljednja dva tjedna) i **katalog poredan po ocjeni**, stranicama
s **učitajte više** tako da stigne do ostatka trgovine. Svaki red nosi **capsule art**, **ocjenu recenzije**
s vlastitim tekstom Steam i koliko pregleda broji, prekriženom cijenom, cijenom u realima i što
popust štedi — a popis zbraja ukupnu uštedu. Javni popisi trebaju samo vaše **SteamID64**; izborno
**Steam Tipka Web API** dodaje nedavne igre s njihovim vremenom igranja. Kartica prema zadanim postavkama počinje, jedan potvrdni okvir dalje
u Postavkama.

</td>
</tr>
<tr>
<td>

### ⚙️ Postavke i automatska ažuriranja

Promjena glavne lozinke, sigurnosna kopija Windows Hello, `.canto`, sinkronizirana mapa s automatskim spajanjem (Dropbox,
OneDrive, Syncthing...), počnite sa sustavom i odjeljkom **Ažuriranja**, s **instaliranom verzijom** i
**posljednje objavljeno** jedno uz drugo i gumb za ažuriranje i ponovno pokretanje.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Također ima 🎙️ **Sastanci**, podkarticu dnevnog reda uz popis i dan: Geminijeve bilješke i transkripte s
posljednja dva tjedna, plus prijepisi `.vtt`, `.srt`, `.txt` i `.md` iz lokalne mape, očišćeni i pretraživi.

🤖 **AI modeli** (na traci kartica prema zadanim postavkama, **bez ključa API ili računa**): LLM rangirani prema
[Artificial Analysis](https://artificialanalysis.ai) **Indeks inteligencije**, pročitajte s njegove javne stranice s ljestvicama,
s bodovnom trakom, kreatorom, cijenom za 1M tokena i brzinom, razvrstavanje po inteligenciji, cijeni ili brzini. Dohvaća na
najviše jednom svaka 3 sata, a opcija za uključivanje 🔔 obavještava vas kada a
model **ulazi u prvih 10** ili se **penje unutar njega** (provjerava se svakih 6 sati dok je trezor otključan), s
"novi" i "up" značke za tjedan dana.

🌙 **Ne uznemiravaj:** u Postavkama ili traci, utišajte upozorenja o sastancima, podsjetnike na zadatke, upozorenja o statusu i svaki
obavijest sustava na 30 min, 1 h, 2 h, do sutra ili dok ga ne isključite. Prikazuje se mjesec u gornjoj traci
kada završi; jedan klik ga ponovno isključuje. Preživi ponovno pokretanje i završi sam od sebe.

🔔 **Svako upozorenje na jednom zaslonu:** zvono u zaglavlju (broji i oboji kada je nešto na čekanju) otvara
upozorenja preko cijelog prozora u bilo kojem načinu rada: jedna kartica po upozorenju sa svojim radnjama, **odbaci sve** i što je
riješeno danas pod njima — bez ičega na čekanju, tako još uvijek dolazite do današnjeg dnevnika. S doka, klik
i dalje otvara to jedno upozorenje na vrhu uobičajenog prozora.

⌨️ **Sve pomoću tipkovnice:** `Alt+1`…`Alt+7` mijenjanje kartica, `N` kreira, `/` pretraživanja, `F11` cijeli zaslon, `Alt+L`
zaključava i `?` navodi prečace. `Ctrl+Shift+P` (`Cmd+Shift+P` na macOS-u) otvara **paletu naredbi** sa svakim
akcija prema nazivu: idite na karticu, novi zadatak ili bilješku, pridružite se sljedećem sastanku, kopirajte dnevni sažetak, promijenite masku, zaključajte.

## 🎨 Šest skinova

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Zadano</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Staklo</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Light</b></td>
</tr>
</table>

I **Follow system**, koji se prebacuje između svjetla i tame zajedno s OS-om. Svi prolaze AA kontrast.

<details>
<summary>🖥️ Više zaslona: uvođenje, globalno pretraživanje, paleta naredbi, GitLab, podzadaci, uređivač bilješki, sigurnost, sinkronizacija, gustoća i više</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Dobrodošlica u prvoj vožnji | Globalno pretraživanje (`Ctrl+K`) | Kartica GitLab s vlastitim hostom | Upozorenje o sastanku |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Zadatak s podzadacima, prioritetom i PR | Uređivač bilješki | Više vrsta međuspremnika | Sigurnost: automatsko zaključavanje i otključavanje |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Sinkronizirana mapa | Kompaktna gustoća | Zaključani trezor | Poveži GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Postavke u grupama, s pretraživanjem | Pretraživanje filtrira grupe | Offline čip u zaglavlju | Potvrdite prije brisanja međuspremnika |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Odbaci nespremljenu skicu bilješke |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Načini rada: Mini, Skriveni, Normalni, Maksimizirani | Mini način rada: upozorenja na rubu zaslona |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Kliknite upozorenje na docku | Maksimizirano: cijeli prozor za otvorenu karticu |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Zvono otvara upozorenja preko cijelog prozora |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: izbornik načina otvara se unutar prozora dock |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Kartice koje ne stanu čekaju u izborniku "više" |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Igre i cijeli zaslon: upozorenja čekaju dok ne odete |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Odgoda: 1, 5 ili 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Podsjetnik na zadatak | Promjena glavne lozinke | Status API (kartica za uključivanje) | Jezik: engleski, portugalski ili španjolski |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopiraj isječak ponovno napisan | Upozorenje o sastanku s pripremom |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Redizajn: kartica Zadaci, prije i poslije |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redizajn: svaka kartica, prije (vrh) i poslije (dno) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI nije uspio, s prekinutim poslovima | Netko me spomenuo | Njihovi prekidači u postavkama |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Navedite upozorenje s tim tko ga je napisao |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Upozorenje o spominjanju s pregledom teksta |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Više upozorenja o mom radu |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| Upozorenje o dnevnom sažetku | Postavka dnevnog sažetka |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Podkartica Spominjanja (GitHub i GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Lozinka promijenjena, jedna datoteka na čekanju | Dnevni sažetak |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Tjedno izvješće | Dnevni red: sljedeće slobodno vrijeme i sukobi |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Dnevni red: besplatno odmah | Paleta naredbi (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Ne ometaj | Slika u bilješci |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI značka na svakom PR | Obavijesti o zahtjevima pregleda |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Zabilježite slike kao minijature | WYSIWYG uređivač bilješki |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Uređivač bilješki: sirovo smanjenje (MD) | Uređivač bilješki na svijetloj koži |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Zadaci: prioritet u redu, dugi naslovi omot | Popis bilješki s prikazanim oznakama |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Modeli umjetne inteligencije rangirani prema Indeksu inteligencije |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: najprodavaniji, numerirani | Steam: zadnjih pet igranja, s oba vremena igranja |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: katalog po ocjenama, uz "učitaj još" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Jedno preklapanje upozorenja za sve što je na čekanju: prekide rada, sastanke, zadatke i nove AI modele |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Moje krajnje točke: pločice s najnovijom latencijom | Otvorena krajnja točka: dijagram kašnjenja, postavke ograničenja i upozorenja | Dodavanje DNS + provjera certifikata |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Dnevni red za bilo koji dan: strelice za prethodni i sljedeći, birač datuma i gumb za povratak na današnji dan |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Zadaci: trenutni zadatak s mjeračem vremena i grupiranim popisom | GitHub: traka sa sažetkom iznad popisa | GitLab: ista traka, bez CI pločice |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Odbrojavanje fokusa prikvačeno ispod svake kartice | Dnevni red kao dan, zadaci pored sastanaka |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Dnevni prikaz: događaji koji se preklapaju dijele širinu jedan pored drugog |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Pregledajte radar: prvo najstariji zahtjev, kasni crveno, odgoda |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Sastanci kao podkartica dnevnog reda, pored popisa i dana |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Kartica Aktivnost (isključeno prema zadanim postavkama) | Sažetak s fokusiranim vremenom i zatvorenim PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Kartica aktivnosti, zadnjih 7 dana | Kartica aktivnosti, isključena | Kartica aktivnosti na širokom prozoru |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Kartica **Aktivnost** počinje skrivena (uključite je pod Postavke → vidljive kartice). Bilježi samo ime
fokusirana aplikacija dok koristite računalo, u zapečaćenoj lokalnoj datoteci koja nikada ne doseže sigurnosne kopije ili sinkronizaciju (Wayland
ne može prijaviti fokusirani prozor, pa tamo ostaje nedostupan). Isključeno dok se ne uključite i prvi zaslon ne kaže što
čuva se i ono što nikad nije.

- **Dan**: krafna po kategoriji s ukupnim iznutra, čija legenda skriva kategoriju, promjena prema danu
prije i vrijeme mirovanja (bez tipkovnice ili miša 2 minute). Ispod njega, dnevni cilj s fokusom na kod sa svojim nizom i
jedna točka po danu, tri isticanja (najduži dio u jednoj aplikaciji, promjene aplikacija, vršni sat), vremenska traka na kojoj se cijeli
dan, neaktivnost se proteže, a najprometnije aplikacije dijele jednu vremensku os s oznakom "sada" i popisom aplikacija
(dodirnite jedan da biste promijenili njegovu kategoriju) ili od zadataka na kojima se pokrenuo mjerač vremena fokusa.
- **Tjedan**: naslagani stupci po danu s prosječnom linijom i točkom ispod svakog dana koji je ispunio cilj, satna toplinska karta
sa svojim vrhom, i iste liste za cijeli tjedan.
- **Izgled i maske**: jedan stupac u zadanom prozoru, dva kada je širok (maksimiziran); svaka koža ima svoju
kategorije boja, provjeren kontrast. Izbornik pored dana kopira ga kao tekst.

<sub>Sve snimke zaslona koriste fiktivne podatke.</sub>

## ⚖️ U usporedbi s onim što je vani

Nijedan od istraženih alata ne pokriva više od dva od ovih frontova odjednom. Izvori i detalji u
[docs/benchmark.md](docs/benchmark.md).

| | Zadaci + podsjetnik | Bilješke | Međuspremnik | Sastanci | GitHub | Lokalna enkripcija prema zadanim postavkama |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Opsidijan / Joplin | ➖ | ✅ | — | — | — | ➖ samo sinkronizacija |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Isto | — | — | ✅ | — | — | ➖ izborno |
| Traka za sastanke | — | — | — | ✅ | — | nije dostupno |
| Gitify | — | — | — | — | ✅ | nije dostupno |

<sub>✅ izvorni · ➖ djelomično, putem proširenja ili izborno · — ništa · ? neobjavljeno · n/a ne pohranjuje korisničke podatke</sub>

Što je mjerilo donijelo ovdje: **vrijeme točno u naslovu zadatka** (Todoist/TickTick), **odgoda upozorenja**
(TickTick) i **međuspremnik koji poštuje upravitelje lozinki** (CopyQ/Ditto).

## ⬇️ Instaliraj

Preuzmite instalacijski program za svoju platformu s **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sustav | Datoteka |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (preporučeno) ili `.msi` |
| 🍎 macOS | `.dmg` za Apple Silicon ili Intel |
| 🐧 Linux | `.AppImage`, `.deb` ili `.rpm` |

1. Prilikom prvog pokretanja kreirate **glavnu lozinku**. Nema oporavka: izgubite lozinku, izgubite podatke.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` na macOS-u) prikazuje i skriva widget.
3. Gotovo. Kada se isporuči nova verzija, Canto vas obavještava, a **Postavke → Ažuriranja** ažurira se jednim klikom.

> [!NAPOMENA]
> Programi za instalaciju još nisu potpisani kodom: SmartScreen (Windows) i Gatekeeper (macOS) upozoravaju pri prvom pokretanju.
> Automatska ažuriranja provjeravaju se prema vlastitom potpisu projekta prije pokretanja.

Gotovi manifesti za winget i Homebrew (plus kostur za Flatpak, trenutno blokiran) žive u
[`packaging/`](packaging/README.md) — pripremljeno i verificirano lokalno, ali još nije objavljeno onima
repozitoriji: objavljivanje je ručna odluka i radnja održavatelja.

## 🔒 Sigurnost na prvi pogled

| Sloj | Zaštita |
|---|---|
| Trezor | Argon2id (19 MiB, t=2) → AES-256-GCM, novi nonce pri svakom pisanju, atomsko pisanje s `fsync` |
| Ključ | Samo RAM, postavljen na nulu pri zaključavanju; podesivo automatsko zaključavanje (5 do 60 min mirovanja, 15 min prema zadanim postavkama) |
| Mreža | samo proces Rust razgovara s mrežom; webview nema udaljeno podrijetlo (CSP) i nikada ne vidi tokene |
| Google | izborno, samo `calendar.events.readonly`, `directory.readonly` (fotografije kolega iz Workspacea na popisu gostiju) plus profil, OAuth s PKCE i povratna petlja |
| GitHub | izborni, šifrirani token; stavke se otvaraju samo ako je veza `https://github.com/` |
| GitLab | izborna, šifrirana adresa i token; Samo `https://`, bez preusmjeravanja, veze samo s konfigurirane instance |
| Ažuriranja | instalira samo paket potpisan ključem projekta; neovlašteno preuzimanje odbacuje se prije pokretanja |

Potpuni model, sigurnosna kopija, spajanje između strojeva i gdje svaka datoteka živi: [docs/seguranca.md](docs/seguranca.md).
Pronašli ste grešku? [SECURITY.md](SECURITY.md).

## 📚 Dokumentacija

| Dokument | Što je u njemu |
|---|---|
| 📖 [User guide](docs/uso.md) | kartice, ponavljajući zadaci, prečaci, maske, pristupačnost, prozor, ažuriranja i početak rada sa sustavom |
| 🔌 [Integrations](docs/integracoes.md) | Google dnevni red i GitHub (osobni token ili tijek uređaja) |
| 🛡️ [Security and data](docs/seguranca.md) | model prijetnje, `.canto` sigurnosna kopija, spajanje, promjena lozinke, datoteke na disku |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify i testovi volumena |
| 📝 [CHANGELOG](CHANGELOG.md) | što se promijenilo u svakoj verziji |
| 🤝 [How to contribute](CONTRIBUTING.md) | okruženje, testovi, PRs i kako objaviti izdanje |
| 🤖 [Agent guide](AGENTS.md) | ugovori i zamke za svakoga tko uređuje kod pomoću AI |

## 🛠️ Razvoj

Preduvjeti: [Bun](https://bun.sh) ≥ 1.2, stabilan Rust ≥ 1.85 i
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) za vaš sustav.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Web-prikazi se stvaraju nakon stanja Rust i tray se inicijaliziraju, tako da se početni IPC pozivi ne mogu utrkivati ​​u postavljanju.

Svaki PR pokreće CI na Windows, macOS i Linux. Konvencionalni `fix`, `feat` i kršenje obaveza spojeni su u `main`
dobiti SemVer oznaku, generirane napomene o izdanju i potpisane instalatere izgrađene paralelno; objava se objavljuje nakon provjere (detalji u
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licenca

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Made with 🦀 Rust, ⚛️ React i ☕ za one koji žive između sastanaka.</sub></div>
