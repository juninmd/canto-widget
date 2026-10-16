<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · **Polski** · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Zadania z przypomnieniami, notatkami, historią schowka, planem zajęć z alertami o spotkaniach, transkrypcjami i Twoim GitHub PRs
> w małym okienku przypiętym do rogu ekranu.** Wyskakuje z `Ctrl+Alt+Space`, chowa się, gdy nie potrzebujesz
> go i przechowuje wszystko zaszyfrowane na Twoim komputerze, bez konta i bez serwera.

## 🌐 Języki

Canto oferuje **42 języki interfejsu**, każdy z własnym plikiem README. Wybierz swój w **Ustawienia → Język**;
selektor z możliwością przeszukiwania używa nazw języków rodzimych, a tryb automatyczny podąża za głównym językiem systemu.
W języku arabskim, hebrajskim i perskim tekst jest pisany od prawej do lewej. Dodatkowe katalogi językowe ładują się na żądanie.

40 nowych katalogów interfejsów i 31 nowych tłumaczeń README są tłumaczeniami maszynowymi i tak nie było
recenzowane przez native speakerów. Portugalski i angielski pozostają oryginalnymi katalogami interfejsów. Etykiety na tace i
nagłówki powiadomień są zgodne z wybranym językiem; niektóre szczegóły alertów dotyczących integracji odnoszą się do języka angielskiego,
i błędy backendu pozostają w języku portugalskim. Składnia tytułu zadania zachowuje istniejące portugalskie i angielskie słowa kluczowe.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Dlaczego Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Jeśli żyjesz pomiędzy spotkaniami, PRs i małymi oczekującymi sprawami, ostatecznie masz otwartych pięć aplikacji. Canto przedstawia wszystko
jedno miejsce.

🔒 **Domyślnie szyfrowane.** Argon2id + AES-256-GCM z hasłem głównym; klucz zawsze istnieje tylko w pamięci RAM.
Windows Hello opcjonalne.

🏠 **Twoje dane pozostają przy Tobie.** Zero telemetrii, zero serwera, konto nie jest wymagane. Kopia zapasowa jest pojedyncza, zaszyfrowana
`.canto` plik.

⏰ **Nie przegapisz tego.** 1 minutę przed spotkaniem oraz w momencie przypomnienia widget wyskakuje, odtwarza dźwięk i
wysyła powiadomienie z opcją **drzemka 10 min**.

🪶 **Light.** Tauri v2 (Rust + przeglądanie systemu) zamiast Electron: instalator 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Zawsze aktualne.** Aktualizuje się z poziomu aplikacji i instaluje tylko to, co jest podpisane własnym kluczem projektu.

</td>
</tr>
</table>

## 🧰 Funkcje

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Zadania, które Ci przypominają

Codzienna lista kontrolna z czasem i częstotliwością (codziennie, w dni powszednie lub co tydzień). Wpisz **`Daily at 9:30am`** i
przypomnienie jest już ustawione; dodaj **`!high`** (lub `!alta`, `!média`, `!baixa`) jako priorytet lub kliknij kropkę w wierszu, aby go zmienić. Długie tytuły zawijają się, zamiast być obcinane. **Skoncentruj licznik czasu** na dowolnym zadaniu: oszacuj jego wartość, naciśnij ▶, a pasek przypięty pod każdą zakładką zlicza czas (czerwony po przejściu); czas jest zapisywany w skarbcu co minutę. **Podsumowanie dnia** gotowe do wklejenia (zadania, skupiony czas, spotkania z całkowitym czasem, PRs/MRs otwarte, połączone, sprawdzone i zamknięte bez łączenia), **raport tygodniowy i miesięczny** w przecenach oraz **przeciągnij oczekujące elementy** z wczoraj. **Szybkie przechwytywanie** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` na macOS) zapisuje zadanie lub notatkę z dowolnej aplikacji bez otwierania widżetu.

</td>
</tr>
<tr>
<td>

### 📅 Rozpoczynamy spotkanie? To ci mówi.

Dołącz do następnego spotkania z `Ctrl+Alt+M` (`Ctrl+Cmd+M` na macOS). Jeśli rejestracja się nie powiedzie, spróbuje Canto
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` na macOS); menu zasobnika pozostaje dostępne, jeśli oba są niedostępne.

Dzisiejsze wydarzenia pochodzą z kalendarza Google (tylko do odczytu). Minutę wcześniej widżet pojawia się na ekranie za pomocą
**dołącz do Meet**, odtwarza dźwięk i wysyła powiadomienie systemowe, niezależnie od tego, na której karcie się znajdujesz, a nawet jeśli jest ona ukryta.
Na każdej karcie znajduje się plakietka z Twoją odpowiedzią (być może zaakceptowana, odrzucona, oczekująca). Kliknij wydarzenie, aby zobaczyć, kto był jego organizatorem
to, porządek obrad, każdy gość z awatarem z inicjałami i odpowiedzią oraz załączniki, takie jak notatki Bliźniąt.
Górna linia wskazuje **następny wolny termin** trwający co najmniej 15 minut (odrzucone zaproszenia i wydarzenia całodniowe nie
count), a zdarzenia, które się pokrywają, otrzymują plakietkę **konfliktu** nazywającą drugie wydarzenie. Widok **Dzisiaj** prowadzi do spotkania w toku (pozostały czas, przycisk dołączenia, ostrzeżenie o kolizji) lub następnego, następnie **dzień w jednej linii** (spotkania, zadania i czas wolny w godzinach pracy, z policzonymi godzinami spotkań, czasem wolnym i konfliktami) i jedną osią czasu, na której spotkania, zadania z czasem i wolnymi przerwami są osobnymi rzędami: luka oferuje dopasowanie do zadania bez limitu czasu, a to, co już się skończyło, składa się.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Notatki jak karty

Karty z możliwością przeszukiwania z `#tags`, przypinaniem do góry i filtrem tagów jednym kliknięciem; każda karta pokazuje początek notatki **wyrenderowanej** (tytuły, listy kontrolne, kod, linki), a nie surową przecenę. **Edytor WYSIWYG** w wersji kompaktowej
pasek formatowania (pogrubienie, kursywa, kod, nagłówek, listy, listy kontrolne zaznaczane bezpośrednio w tekście, bloki kodu ze składnią
wyróżnianie, łącza, obrazy) i skróty zaznaczania podczas pisania (`# `, `- `, `[ ] `, ` ``` `); przełącznik **MD**
pokazuje surową przecenę, czyli sposób przechowywania, wyszukiwania, synchronizowania i eksportowania notatek. Linki otwierają się za pomocą
`Ctrl`+kliknięcie, tylko http(s). Wklejaj, upuszczaj lub dołączaj obrazy (PNG, JPEG, GIF, WebP do 2 MB), każdy zapieczętowany w osobnym miejscu
zaszyfrowany plik, pokazany wewnątrz notatki oraz jako miniatury na karcie; pozostają na tej maszynie, na zewnątrz `.canto`
kopie zapasowe. Obsługuje tysiące notatek: lista jest stronicowana, a wyszukiwanie obejmuje je wszystkie.

</td>
</tr>
<tr>
<td>

### 📋 Schowek, który nigdy nie zapomina (ani nie przecieka)

Zaszyfrowana historia z wyszukiwaniem i kodem PIN; rozpoznaje linki, kolory i kod. Najedź kursorem na element, aby **skopiować go przepisany**:
W formacie JSON lub kompaktowym, tekst w jednym wierszu, WIELKIE lub małe litery (wpis historii pozostaje bez zmian). Gigantyczna kopia (dziennik 100 MB) nie
zamrozić wszystko: utrzymuje start i ostrzega. W systemie Windows pomija wszystkie menedżery haseł oznaczone jako
wrażliwy.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Twoje GitHub w skrócie

**Zwrócono się do mnie o recenzję**, przypisaną do mnie, PRs i numerami, które otworzyłem, z ikoną PR lub wydania oraz kto otworzył
to. Wersje robocze, PRs **czekają na Twoją recenzję** i PRs **zablokowane** na tydzień wyróżniają się, a każdy PR nosi małą
**Odznaka CI** (zaliczony, niezaliczony, działający lub brak CI) z kontroli głównego zatwierdzenia. Kiedy ktoś **poprosi Cię o Twoje
przeglądu**, poinformuje Cię powiadomienie systemu operacyjnego (domyślnie włączone, wyłącz je w Ustawieniach). Filtruj według tekstu, `repo:` lub `label:`, tylko PRs lub tylko problemów, sortuj według aktualizacji, utworzenia lub komentarzy i
przewiń za pomocą **pokaż więcej**. Przejdź do widoku **Komentarze**, aby wyświetlić siatkę **Katalog komentujących** zawierającą wszystkie osoby, które skomentowały Twoje PRs (awatary, plakietki człowieka i bota, liczbę komentarzy, wyszukiwanie, filtr botów, stopniową paginację) i ich komentarze. Obsługuje także **GitLab.com i hostowaną na własnym serwerze GitLab** z 5-minutową pamięcią podręczną
przestrzega limitu stawki. Zaloguj się za pomocą tokena osobistego tylko do odczytu lub z przeglądarki (przepływ urządzenia).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/86-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with discount badges, crossed-out original prices and the new price in reais"></td>
<td>

### 🎮 Steam bez opuszczania widżetu

Cztery podzakładki dla Steam: **oferty z listy życzeń** (najpierw największy rabat), **najlepiej sprzedające się**, **zagraj teraz** i
**katalog uporządkowany według ocen**. Listy publiczne wymagają jedynie Twojego **SteamID64**; opcjonalny klucz **Steam Web API**
dodaje pięć najnowszych gier wraz z czasem ich odtwarzania. Ceny podawane są w realach, każdy wiersz otwiera stronę sklepu i
karta zaczyna się domyślnie, jedno pole wyboru w Ustawieniach.

</td>
</tr>
<tr>
<td>

### ⚙️ Ustawienia i automatyczne aktualizacje

Zmiana hasła głównego, kopia zapasowa Windows Hello, `.canto`, zsynchronizowany folder z automatycznym łączeniem (Dropbox,
OneDrive, Syncthing...), zacznij od systemu i sekcji **Aktualizacje**, z **zainstalowaną wersją** i
**najnowsza publikacja** obok siebie i przycisk aktualizacji i ponownego uruchomienia.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Zawiera także 🎙️ **Spotkania**, podzakładkę Agendy obok Listy i Dnia: notatki i transkrypcje Bliźniąt z
z ostatnich dwóch tygodni oraz transkrypcje `.vtt`, `.srt`, `.txt` i `.md` z folderu lokalnego, wyczyszczone i możliwe do przeszukiwania.

🤖 **Modele AI** (domyślnie na pasku zakładek, **brak klucza lub konta API**): LLM uszeregowane według
[Artificial Analysis](https://artificialanalysis.ai) **Indeks inteligencji**, odczytany z publicznej strony rankingów,
z paskiem wyników, twórcą, ceną za 1 milion tokenów i szybkością, sortowane według inteligencji, ceny lub szybkości. Przychodzi o godz
najczęściej raz na 3 godziny, a opcja opt-in 🔔 powiadamia Cię, gdy a
model **wchodzi do pierwszej 10** lub **wspina się w jej obrębie** (sprawdzane co 6 godzin, gdy skarbiec jest odblokowany), z
odznaki „nowe” i „wyższe” na tydzień.

🌙 **Nie przeszkadzać:** w Ustawieniach lub w zasobniku wycisz powiadomienia o spotkaniach, przypomnienia o zadaniach, powiadomienia o stanie i wszystkie
powiadomienie systemu przez 30 min, 1 h, 2 h, do jutra lub do momentu jego wyłączenia. Na górnym pasku widać księżyc
kiedy to się skończy; jedno kliknięcie wyłącza je ponownie. Przetrwa ponowne uruchomienie i zakończy się samoczynnie.

⌨️ **Wszystko za pomocą klawiatury:** `Alt+1`…`Alt+7` przełączaj karty, `N` tworzy, `/` wyszukuje, `F11` pełny ekran, `Alt+L`
blokuje, a `?` wyświetla listę skrótów. `Ctrl+Shift+P` (`Cmd+Shift+P` na macOS) otwiera **paletę poleceń** przy każdym
akcja według nazwy: przejdź do zakładki, nowego zadania lub notatki, dołącz do kolejnego spotkania, skopiuj podsumowanie dnia, zmień skórkę, zablokuj.

## 🎨 Sześć skórek

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Domyślne</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Szkło</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Światło</b></td>
</tr>
</table>

Oraz **Śledź system**, który przełącza się między jasnymi i ciemnymi elementami wraz z systemem operacyjnym. Wszystko przechodzi kontrast AA.

<details>
<summary>🖥️ Więcej ekranów: wdrażanie, wyszukiwanie globalne, paleta poleceń, GitLab, podzadania, edytor notatek, bezpieczeństwo, synchronizacja, gęstość i więcej </summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Witamy w pierwszym uruchomieniu | Wyszukiwanie globalne (`Ctrl+K`) | Zakładka GitLab na własnym serwerze | Powiadomienie o spotkaniu |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Zadanie z podzadaniami, priorytetem i PR | Edytor notatek | Więcej typów schowków | Bezpieczeństwo: automatyczne blokowanie i odblokowywanie |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Zsynchronizowany folder | Kompaktowa gęstość | Zamknięty skarbiec | Połącz GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Ustawienia w grupach z wyszukiwaniem | Wyszukiwanie filtruje grupy | Układ offline w nagłówku | Potwierdź przed wyczyszczeniem schowka |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Odrzuć niezapisaną wersję roboczą notatki |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Tryby: Mini, Ukryty, Normalny, Maksymalny | Tryb Mini: alerty na krawędzi ekranu |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Kliknij alert w doku | Zmaksymalizowane: zadania i powiadomienia, z przeciąganym separatorem |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| Mini: menu trybu otwiera się w oknie dokowania |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Zakładki, które nie mieszczą się, czekają w menu „więcej” |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Gry i pełny ekran: alerty czekają, aż wyjdziesz |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Drzemka: 1, 5 lub 10 minut |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Przypomnienie o zadaniu | Zmień hasło główne | Status API (zakładka zgody) | Język: angielski, portugalski lub hiszpański |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Skopiuj przepisany klip | Powiadomienie o spotkaniu z przygotowaniem |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Przeprojektowanie: zakładka Zadania, przed i po |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Przeprojektowanie: każdej zakładki, przed (na górze) i po (na dole) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI nie powiodło się, z uszkodzonymi zadaniami | Ktoś o mnie wspomniał | Ich przełączniki w Ustawieniach |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Wspomnij o tym, kto to napisał |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Wspomnienie alertu z podglądem tekstu |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Więcej alertów o mojej twórczości |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| Alert podsumowujący dzień | Ustawienie podsumowania dnia |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Podkarta Wzmianki (GitHub i GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Hasło zmienione, jeden plik oczekuje | Podsumowanie dnia |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Raport tygodniowy | Agenda: kolejny czas wolny i konflikty |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: teraz wolne | Paleta poleceń (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Nie przeszkadzaj | Obraz w notatce |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Odznaka CI na każdym PR | Przejrzyj powiadomienia o prośbach |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Uwaga obrazy jako miniatury | Edytor notatek WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Edytor notatek: surowa przecena (MD) | Edytor notatek na jasnej skórze |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Zadania: priorytet w rzędzie, zawijanie długich tytułów | Lista notatek z renderowaną przeceną |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Modele AI uszeregowane według indeksu inteligencji |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: pięć ostatnich rozegranych meczów, z czasem gry w obu przypadkach |
|---|
| ![Steam tab, play now sub-tab: five fictitious games with the time in the last two weeks and the total time](docs/prints/app/87-steam-recentes.png) |

| Jedna nakładka alertów dla wszystkich oczekujących informacji: awarie, spotkania, zadania i nowe modele AI |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Moje punkty końcowe: kafelki z najnowszym opóźnieniem | Otwarty punkt końcowy: wykres opóźnień, ustawienia limitów i alertów | Dodanie DNS + sprawdzenie certyfikatu |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Plan na dowolny dzień: strzałki poprzedniego i następnego, wybór daty i przycisk powrotu do dnia dzisiejszego |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Zadania: bieżące zadanie z timerem i pogrupowaną listą | GitHub: pasek podsumowujący nad listami | GitLab: ten sam pasek, bez płytki CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Licznik ostrości przypięty pod każdą zakładką | Agenda jako dzień, zadania obok spotkań |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Widok dnia: nakładające się wydarzenia mają wspólną szerokość |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Przejrzyj radar: najpierw najstarsze żądanie, przeterminowane na czerwono, drzemka |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Spotkania jako podzakładka Agendy, obok Lista i Dzień |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Zakładka Aktywność (domyślnie wyłączona) | Podsumowanie z ukierunkowanym czasem i zamknięciem PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Zakładka Aktywność, ostatnie 7 dni | Zakładka Aktywność, wyłączona | Zakładka Aktywność w szerokim oknie |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Zakładka **Aktywność** zaczyna być ukryta (włącz ją w Ustawieniach → widoczne zakładki). Rejestruje tylko nazwę
skoncentrowaną aplikację podczas korzystania z komputera, w zapieczętowanym pliku lokalnym, który nigdy nie dociera do kopii zapasowych ani synchronizacji (Wayland
nie można zgłosić aktywnego okna, więc pozostaje tam niedostępne). Wyłączone, dopóki się nie zgodzisz i co wyświetli się na pierwszym ekranie
jest zachowywane i to, czego nigdy nie ma.

- **Dzień**: pączek według kategorii z sumą w środku, którego legenda kryje kategorię, zmianę w stosunku do dnia
przed i czas bezczynności (bez klawiatury i myszy przez 2 minuty). Poniżej znajduje się codzienny cel skupienia się na kodzie z jego passą i
jedna kropka dziennie, trzy najważniejsze momenty (najdłuższy odcinek w jednej aplikacji, zmiany aplikacji, godziny szczytu), oś czasu, na której cała
dziennie, bezczynne odcinki i najbardziej obciążone aplikacje mają wspólną oś czasu ze znacznikiem „teraz” i listą aplikacji
(dotknij jednego, aby zmienić jego kategorię) lub zadań, na których działał licznik czasu skupienia.
- **Tydzień**: ułożone kolumny dziennie ze średnią linią i kropką pod każdym dniem, w którym osiągnięto cel, godzinną mapę cieplną
ze swoim szczytem i tymi samymi listami przez cały tydzień.
- **Układ i skórki**: jedna kolumna w oknie domyślnym, dwie, gdy jest szerokie (zmaksymalizowane); każda skóra ma swoją własną
kolory kategorii, sprawdzone pod kątem kontrastu. Menu obok dnia kopiuje go jako tekst.

<sub>Wszystkie zrzuty ekranu wykorzystują fikcyjne dane.</sub>

## ⚖️ W porównaniu z tym, co jest na zewnątrz

Żadne z badanych narzędzi nie obejmuje jednocześnie więcej niż dwóch z tych frontów. Źródła i szczegóły w
[docs/benchmark.md](docs/benchmark.md).

| | Zadania + przypomnienie | Notatki | Schowek | Spotkania | GitHub | Domyślne szyfrowanie lokalne |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsydian / Joplin | ➖ | ✅ | — | — | — | ➖ tylko synchronizacja |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| KopiujQ / To samo | — | — | ✅ | — | — | ➖ opcjonalne |
| SpotkanieBar | — | — | — | ✅ | — | nie dotyczy |
| Gitify | — | — | — | — | ✅ | nie dotyczy |

<sub>✅ natywny · ➖ częściowy, poprzez rozszerzenie lub opcjonalny · — brak · ? niepublikowane · n/a nie przechowuje danych użytkownika</sub>

Co przyniósł test porównawczy: **czas w tytule zadania** (Todoist/TickTick), **odłóż alert**
(TickTick) i **schowek obsługujący menedżery haseł** (CopyQ/Ditto).

## ⬇️ Zainstaluj

Pobierz instalator dla swojej platformy z **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Systemu | Plik |
|---|---|
| 🪟Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (zalecane) lub `.msi` |
| 🍎 macOS | `.dmg` dla Apple Silicon lub Intel |
| 🐧 Linux | `.AppImage`, `.deb` lub `.rpm` |

1. Przy pierwszym uruchomieniu tworzysz **hasło główne**. Nie ma możliwości odzyskania: strać hasło, strać dane.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` na macOS) pokazuje i ukrywa widżet.
3. Gotowe. Gdy pojawi się nowa wersja, Canto powiadomi Cię, a **Ustawienia → Aktualizacje** zaktualizują się jednym kliknięciem.

> [!UWAGA]
> Instalatory nie są jeszcze podpisane kodem: SmartScreen (Windows) i Gatekeeper (macOS) ostrzegają przy pierwszym uruchomieniu.
> Przed uruchomieniem automatyczne aktualizacje są weryfikowane na podstawie własnego podpisu projektu.

Gotowe manifesty dla wingeta i Homebrew (plus szkielet dla Flatpaka, aktualnie zablokowany) są już gotowe
[`packaging/`](packaging/README.md) — przygotowane i zweryfikowane lokalnie, ale jeszcze tam nie opublikowane
repozytoria: publikacja to ręczna decyzja i działanie opiekuna.

## 🔒 Bezpieczeństwo w skrócie

| Warstwa | Ochrona |
|---|---|
| Skarbiec | Argon2id (19 MiB, t=2) → AES-256-GCM, nowy jednorazowy zapis przy każdym zapisie, zapis atomowy z `fsync` |
| Klucz | Tylko pamięć RAM, wyzerowana przy blokadzie; konfigurowalna automatyczna blokada (od 5 do 60 minut bezczynności, domyślnie 15 minut) |
| Sieć | tylko proces Rusta komunikuje się z siecią; przeglądarka internetowa nie ma zdalnego źródła (CSP) i nigdy nie widzi tokenów |
| Google | opcjonalnie, tylko `calendar.events.readonly`, `directory.readonly` (zdjęcia współpracowników Workspace na liście gości) plus profil, OAuth z PKCE i pętlą zwrotną |
| GitHub | opcjonalny, szyfrowany token; elementy otwierają się tylko wtedy, gdy łącze to `https://github.com/` |
| GitLab | opcjonalnie, szyfrowany adres i token; Tylko `https://`, brak przekierowań, linki tylko ze skonfigurowanej instancji |
| Aktualizacje | instaluje tylko pakiet podpisany kluczem projektu; zmodyfikowane pobieranie jest odrzucane przed uruchomieniem |

Pełny model, kopie zapasowe, łączenie między komputerami i miejsce przechowywania każdego pliku: [docs/seguranca.md](docs/seguranca.md).
Znalazłeś wadę? [SECURITY.md](SECURITY.md).

## 📚 Dokumentacja

| Dokument | Co w tym jest |
|---|---|
| 📖 [User guide](docs/uso.md) | zakładki, zadania cykliczne, skróty, skórki, dostępność, okno, aktualizacje i start z systemem |
| 🔌 [Integrations](docs/integracoes.md) | Google program i GitHub (przepływ tokena osobistego lub urządzenia) |
| 🛡️ [Security and data](docs/seguranca.md) | model zagrożenia, kopia zapasowa `.canto`, scalanie, zmiana hasła, pliki na dysku |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify i testy wolumenowe |
| 📝 [CHANGELOG](CHANGELOG.md) | co zmieniło się w każdej wersji |
| 🤝 [How to contribute](CONTRIBUTING.md) | środowisko, testy, PRs i jak opublikować wydanie |
| 🤖 [Agent guide](AGENTS.md) | kontrakty i pułapki dla każdego, kto edytuje kod za pomocą AI |

## 🛠️Rozwój

Wymagania wstępne: [Bun](https://bun.sh) ≥ 1,2, stabilne Rust ≥ 1,85 oraz
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) dla Twojego systemu.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Widoki internetowe są tworzone po zainicjowaniu stanu Rust i zasobnika, więc uruchamiane wywołania IPC nie mogą być konfigurowane w trybie wyścigowym.

Każdy PR obsługuje CI w systemach Windows, macOS i Linux. Konwencjonalne `fix`, `feat` i łamanie zatwierdzeń połączone w `main`
uzyskaj tag SemVer, wygenerowane informacje o wersji i podpisane instalatory wbudowane równolegle; publikacja publikowana jest po weryfikacji (szczegóły w pkt
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licencja

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Wykonane z 🦀 Rust, ⚛️ React i ☕ dla tych, którzy żyją pomiędzy spotkaniami.</sub></div>
