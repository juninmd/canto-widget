<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · **Català**</sub>

</div>

<br>

> **Tasques amb recordatoris, notes, historial del porta-retalls, una agenda amb alertes de reunions, transcripcions i el teu GitHub PRs
> en una petita finestra fixada a la cantonada de la pantalla.** Apareix amb `Ctrl+Alt+Space`, s'amaga quan no ho necessites
> i ho manté tot xifrat a la vostra màquina, sense compte ni servidor.

## 🌐 Idiomes

Canto ofereix **42 idiomes d'interfície**, cadascun amb el seu propi README. Trieu el vostre a **Configuració → Idioma**;
el selector de cerca utilitza noms d'idiomes natius i el mode automàtic segueix l'idioma principal del sistema.
L'àrab, l'hebreu i el persa fan servir text de dreta a esquerra. Els catàlegs d'idiomes addicionals es carreguen sota demanda.

Els 40 nous catàlegs d'interfícies i 31 noves traduccions README són traduccions automàtices i no ho han estat
revisat per parlants nadius. El portuguès i l'anglès segueixen sent els catàlegs d'interfície originals. Etiquetes de safata i
els encapçalaments de notificació segueixen l'idioma seleccionat; alguns detalls d'alerta d'integració tornen a l'anglès,
i els errors de fons romanen en portuguès. La sintaxi del títol de la tasca manté les paraules clau existents en portuguès i anglès.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Per què Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Si vius entre reunions, PRs i petits elements pendents, acabaràs amb cinc aplicacions obertes. Canto ho posa tot
un lloc.

🔒 **Encriptat per defecte.** Argon2id + AES-256-GCM amb una contrasenya mestra; la clau només existeix a la memòria RAM.
Windows Hello opcional.

🏠 **Les teves dades es mantenen amb tu.** Telemetria zero, servidor zero, no cal cap compte. La còpia de seguretat és una única xifrada
`.canto` fitxer.

⏰ **No t'ho perdràs.** 1 minut abans d'una reunió i a l'hora del recordatori, el giny apareix, reprodueix un so i
envia una notificació amb **posposa 10 min**.

🪶 **Llum.** Tauri v2 (Rust + la vista web del sistema) en lloc de Electron: un instal·lador de 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Sempre actualitzat.** Actualitzacions des de l'aplicació i només instal·la el que està signat amb la clau del projecte.

</td>
</tr>
</table>

## 🧰 Característiques

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Tasques que et recordin

Una llista de verificació diària amb temps i recurrència (cada dia, entre setmana o setmanal). Escriviu **`Daily at 9:30am`** i el
el recordatori ja està configurat; afegiu **`!high`** (o `!alta`, `!média`, `!baixa`) per a la prioritat o feu clic al punt de la fila per ciclar-lo. Els títols llargs s'emboliquen en lloc de ser tallats. **Centre el temporitzador** en qualsevol tasca: doneu-li una estimació, premeu ▶ i una barra fixada a sota de cada pestanya compta el temps en contra (vermell un cop ho passeu); el temps es guarda a la volta cada minut. **Resum del dia** llest per enganxar (tasques, temps centrat, reunions amb el temps total, PRs/MRs obert, fusionat, revisat i tancat sense fusionar), un **informe setmanal i mensual** en reducció i **extreu d'elements pendents** d'ahir. **Captura ràpida** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` a macOS) anota una tasca o una nota des de qualsevol aplicació, sense obrir el giny.

</td>
</tr>
<tr>
<td>

### 📅 Comença la reunió? T'ho diu.

Uneix-te a la propera reunió amb `Ctrl+Alt+M` (`Ctrl+Cmd+M` a macOS). Si el registre falla, Canto ho prova
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` a macOS); el menú de la safata continua disponible si tots dos no estan disponibles.

Els esdeveniments d'avui provenen del calendari Google (només de lectura). Un minut abans, el giny salta a la pantalla amb
**uneix-te a Meet**, reprodueix un so i envia una notificació del sistema, sigui quina pestanya estiguis o fins i tot si està amagada.
Cada targeta mostra una insígnia amb la teva resposta (acceptat, potser, rebutjat, esperant). Feu clic a l'esdeveniment per veure qui l'ha organitzat
això, l'agenda, cada convidat amb un avatar d'inicials i la seva resposta, i fitxers adjunts, com les notes de Gemini.
La línia superior us indica el **següent espai gratuït** d'almenys 15 minuts (les invitacions rebutjades i els esdeveniments de tot el dia no ho fan
compte), i els esdeveniments que se superposen reben una insígnia de **conflicte** que anomena l'altre esdeveniment. La vista **Avui** mostra la reunió en curs (temps restant, botó d'unió, avís d'enfrontament) o la següent, després **el dia en una línia** (reunions, tasques i temps lliure durant l'horari laboral, amb temps de reunió, temps lliure i conflictes comptats) i una línia de temps on les reunions, les tasques amb un temps i els buits lliures són files pròpies, que s'ofereixen i s'ofereixen una tasca ja desenvolupada: lluny.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Notes com a targetes

Targetes cercables amb `#tags`, fixar a la part superior i filtre d'etiquetes d'un sol clic; cada targeta mostra l'inici de la nota **representada** (títols, llistes de verificació, codi, enllaços), no la reducció en brut. Un **editor WYSIWYG** amb un compacte
barra de format (negreta, cursiva, codi, encapçalament, llistes, llistes de verificació que marqueu directament al text, blocs de codi amb sintaxi
ressaltat, enllaços, imatges) i dreceres de marcatge mentre escriviu (`# `, `- `, `[ ] `, ` ``` `); un **MD** commutador
mostra la reducció en brut, que encara és com s'emmagatzemen, cerquen, sincronitzen i exporten les notes. Els enllaços s'obren amb
`Ctrl`+clic, només http(s). Enganxeu, deixeu anar o adjunteu imatges (PNG, JPEG, GIF, WebP fins a 2 MB), cadascuna segellada pel seu compte
fitxer xifrat, que es mostra dins de la nota i com a miniatures a la targeta; es queden en aquesta màquina, fora de `.canto`
còpies de seguretat. Gestiona milers de notes: la llista està paginada i la cerca cobreix totes elles.

</td>
</tr>
<tr>
<td>

### 📋 Porta-retalls que mai oblida (ni filtra)

Historial xifrat amb cerca i pin; reconeix enllaços, colors i codi. Passeu el cursor per un element per **copiar-lo reescrit**:
Format JSON o compacte, text en una línia, MAJÚSCULA o minúscula (l'entrada de l'historial es manté com estava). Una còpia gegant (un registre de 100 MB) no ho fa
congela qualsevol cosa: manté l'inici i t'avisa. A Windows, omet qualsevol que els gestors de contrasenyes marquen com a
sensible.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 El teu GitHub d'un cop d'ull

**Revisió que m'ha sol·licitat**, assignada a mi, PRs i problemes que he obert, amb una icona PR o problema i qui ha obert
això. Destaquen els esborranys, PRs **esperant la teva revisió** i PRs **estancat** durant una setmana, i cada PR porta un petit
**Insígnia de CI** (aprovada, fallada, en execució o sense CI) de les comprovacions del seu cap commit. Quan algú **demana el teu
revisió**, us indica una notificació del sistema operatiu (activat de manera predeterminada, desactiveu-lo a Configuració). Filtra per text, `repo:` o `label:`, PRs només o només per problemes, ordena per actualització, creació o comentaris i
desplaça't amb **mostra més**. Canvia a la vista **Comentaris** per veure una graella de **Catàleg de comentaris** de tots els que han comentat el teu PRs (avatars, insígnies humanes vs bot, recomptes de comentaris, cerca, filtre de bot, paginació progressiva) i els seus comentaris. També admet **GitLab.com i GitLab** autoallotjat, amb una memòria cau de 5 minuts que
respecta el límit de tarifa. Inicieu la sessió amb un testimoni personal de només lectura o des del navegador (flux del dispositiu).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam sense sortir del giny

Quatre subpestanyes per a Steam: **ofertes de la llista de desitjos** (el descompte més gran primer, cadascuna amb el que estalvia), els **més venuts**
classificat, **juga ara** (cada joc que Steam informa durant les dues últimes setmanes) i el **catàleg ordenat per classificació**, paginat
amb **carregar més** perquè arribi a la resta de la botiga. Cada fila inclou l'**art de la càpsula**, la **puntuació de la revisió**
amb la redacció pròpia de Steam i quantes ressenyes compta, el preu ratllat, el preu en reals i quin és el
estalvis de descompte, i la llista suma l'estalvi total. Les llistes públiques només necessiten el vostre **SteamID64**; una opcional
La clau **Steam Web API** afegeix els jocs recents amb els seus temps de joc. La pestanya comença de manera predeterminada, a una casella de selecció
a Configuració.

</td>
</tr>
<tr>
<td>

### ⚙️ Configuració i actualitzacions automàtiques

Canvi de contrasenya mestra, Windows Hello, `.canto` còpia de seguretat, una carpeta sincronitzada amb fusió automàtica (Dropbox,
OneDrive, Syncthing...), comença amb el sistema i la secció **Actualitzacions**, amb la **versió instal·lada** i
el **últim publicat** un al costat de l'altre i un botó per actualitzar i reiniciar.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

També té 🎙️ **Reunions**, una subpestanya de l'Agenda al costat de Llista i Dia: notes i transcripcions de Gemini de
les dues últimes setmanes, més transcripcions de `.vtt`, `.srt`, `.txt` i `.md` d'una carpeta local, netejades i cercables.

🤖 **Models AI** (a la barra de pestanyes per defecte, **sense clau o compte API**): LLM classificats per
[Artificial Analysis](https://artificialanalysis.ai) **Intelligence Index**, llegit des de la seva pàgina de classificació pública,
amb una barra de puntuació, un creador, un preu per 1M de fitxes i una velocitat, ordenables per intel·ligència, preu o velocitat. Arriba a
la majoria un cop cada 3 hores, i l'opt-in 🔔 t'avisa quan a
el model **entra als 10 primers** o **puja dins d'ell** (comprovat cada 6 hores mentre la volta està desbloquejada), amb
insígnies "nous" i "amunt" durant una setmana.

🌙 **No molestis:** a Configuració o a la safata, silencia les alertes de reunió, recordatoris de tasques, alertes d'estat i cada
notificació del sistema durant 30 min, 1 h, 2 h, fins demà o fins que el desactiveu. Es mostra una lluna a la barra superior
quan s'acaba; un clic el torna a apagar. Sobreviu a un reinici i acaba pel seu compte.

🔔 **Totes les alertes en una pantalla:** la campana de la capçalera (comptar i colorear quan hi ha alguna cosa pendent) obre el
alertes a tota la finestra en qualsevol mode: una targeta per alerta amb les seves accions, **descartar totes** i què va ser
resolt avui sota ells; sense res pendent, és com encara arribeu al registre d'avui. Des del moll, un clic
encara obre aquesta alerta única a la part superior de la finestra normal.

⌨️ **Tot per teclat:** `Alt+1`…`Alt+7` canvi de pestanyes, `N` crea, `/` cerca, `F11` pantalla completa, `Alt+L`
bloqueja i `?` enumera les dreceres. `Ctrl+Shift+P` (`Cmd+Shift+P` a macOS) obre una **paleta d'ordres** amb cada
acció pel nom: vés a una pestanya, una tasca o una nota nova, uneix-te a la propera reunió, copia el resum del dia, canvia de pell, bloqueja.

## 🎨 Sis pells

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Per defecte</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Llum</b></td>
</tr>
</table>

I **Seguir el sistema**, que canvia entre clar i fosc juntament amb el sistema operatiu. Tots passen el contrast AA.

<details>
<summary>🖥️ Més pantalles: incorporació, cerca global, paleta d'ordres, GitLab, subtasques, editor de notes, seguretat, sincronització, densitat i més</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Benvinguda a primera tirada | Cerca global (`Ctrl+K`) | Pestanya GitLab allotjada pròpiament | Alerta de reunió |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Tasca amb subtasques, prioritat i PR | Editor de notes | Més tipus de porta-retalls | Seguretat: bloqueig i desbloqueig automàtics |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Carpeta sincronitzada | Densitat compacta | Volta tancada | Connecta GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Configuració en grups, amb cerca | La cerca filtra els grups | Xip fora de línia a la capçalera | Confirmeu abans d'esborrar el porta-retalls |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Descarta un esborrany de nota no desat |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Modes: Mini, Ocult, Normal, Maximitzat | Mode mini: alertes a la vora de la pantalla |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Feu clic a una alerta al moll | Maximitzat: tota la finestra per a la pestanya oberta |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| El timbre obre les alertes a tota la finestra |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: el menú de mode s'obre dins de la finestra del moll |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Les pestanyes que no encaixen esperen en un menú "més" |
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

| Jocs i pantalla completa: les alertes esperen fins que marxes |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Posposar: 1, 5 o 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Recordatori de tasques | Canvia la contrasenya mestra | Estat API (pestanya d'activació) | Idioma: anglès, portuguès o espanyol |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Copia un clip reescrit | Alerta de reunió amb preparació |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Redisseny: la pestanya Tasques, abans i després |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Redisseny: cada pestanya, abans (a dalt) i després (a baix) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI ha fallat, amb els treballs trencats | Algú m'ha esmentat | Els seus interruptors a Configuració |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Esmenta alerta amb qui l'ha escrit |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Esmenta l'alerta amb una vista prèvia del text |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Més alertes sobre el meu propi treball |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Alerta resum del dia | Configuració del resum del dia |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mencions subpestanya (GitHub i GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| La contrasenya ha canviat, un fitxer pendent | Resum del dia |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Informe setmanal | Agenda: proper temps lliure i conflictes |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: ara mateix gratuït | Paleta d'ordres (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| No molestis | Imatge en una nota |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Insígnia CI a cada PR | Notificacions de sol·licitud de revisió |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Anoteu les imatges com a miniatures | Editor de notes WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Editor de notes: rebaixa en brut (MD) | Editor de notes a la pell clara |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Tasques: prioritat a la fila, embolcall de títols llargs | Llista de notes amb reducció representada |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Models d'IA classificats per l'Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: els més venuts, numerats | Steam: els últims cinc partits jugats, amb els dos temps de joc |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: el catàleg per valoració, amb "carregar més" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Una sola superposició d'alerta per a tot el que està pendent: interrupcions, reunions, tasques i nous models d'IA |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Els meus punts finals: fitxes amb l'última latència | Un punt final obert: gràfic de latència, paràmetres de límit i alerta | Afegint un DNS + verificació de certificat |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Agenda de qualsevol dia: fletxes anterior i següent, un selector de dates i un botó per tornar a l'actualitat |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Tasques: la tasca actual amb temporitzador i llista agrupada | GitHub: tira de resum a sobre de les llistes | GitLab: mateixa tira, sense la fitxa CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Temporitzador de focus fixat sota cada pestanya | Agenda com a dia, tasques al costat de reunions |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Visualització diària: els esdeveniments superposats comparteixen l'amplada un al costat de l'altre |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Radar de revisió: primer la sol·licitud més antiga, vençuda en vermell, posposa |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Reunions com a subpestanya de l'ordre del dia, al costat de Llista i Dia |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Pestanya Activitat (desactivada per defecte) | Resum amb temps centrat i tancat PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Pestanya Activitat, últims 7 dies | Pestanya Activitat, desactivada | Pestanya Activitat en una finestra àmplia |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

La pestanya **Activitat** comença a amagar-se (activa-la a Configuració → pestanyes visibles). Només registra el nom del
aplicació enfocada mentre utilitzeu l'ordinador, en un fitxer local segellat que mai no arriba a còpies de seguretat ni sincronització (Wayland
no es pot informar de la finestra enfocada, de manera que no està disponible allà). Desactivat fins que t'activis i la primera pantalla digui què
es guarda i el que mai ho és.

- **Dia**: un bunyol per categoria amb el total a l'interior, la llegenda del qual amaga una categoria, el canvi contra el dia
abans i el temps d'inactivitat (sense teclat ni ratolí durant 2 minuts). A sota, un objectiu diari d'enfocament de codi amb la seva ratxa i
un punt al dia, tres moments destacats (el tram més llarg en una aplicació, canvis d'aplicació, hora punta), una línia de temps on tot
dia, els trams inactius i les aplicacions més ocupades comparteixen un eix temporal amb un marcador "ara" i una llista d'aplicacions
(toqueu-ne una per canviar-ne la categoria) o de les tasques en què s'executava el temporitzador de focus.
- **Setmana**: columnes apilades per dia amb la línia mitjana i un punt a sota de cada dia que compleix l'objectiu, un mapa de calor d'una hora
amb el teu pic, i les mateixes llistes per a tota la setmana.
- **Disposició i aspectes**: una columna a la finestra per defecte, dues un cop és ampla (maximitzada); cada pell té la seva
colors de categoria, comprovats per contrast. El menú al costat del dia el copia com a text.

<sub>Totes les captures de pantalla utilitzen dades fictícias.</sub>

## ⚖️ En comparació amb el que hi ha fora

Cap de les eines investigades cobreix més de dos d'aquests fronts alhora. Fonts i detalls a
[docs/benchmark.md](docs/benchmark.md).

| | Tasques + recordatori | Notes | Porta-retalls | Reunions | GitHub | Xifratge local per defecte |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidiana / Joplin | ➖ | ✅ | — | — | — | ➖ només sincronització |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ opcional |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ nadiu · ➖ parcial, per extensió o opcional · — cap · ? no publicat · n/a no emmagatzema dades d'usuari</sub>

Què va portar aquí el punt de referència: **hora just al títol de la tasca** (Todoist/TickTick), **posposa l'alerta**
(TickTick) i **portapapers que respecta els gestors de contrasenyes** (CopyQ/Idem).

## ⬇️ Instal·la

Descarrega l'instal·lador de la teva plataforma des de **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistema | Fitxer |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recomanat) o `.msi` |
| 🍎 macOS | `.dmg` per a Apple Silicon o Intel |
| 🐧 Linux | `.AppImage`, `.deb` o `.rpm` |

1. A la primera execució, creeu la **contrasenya mestra**. No hi ha recuperació: perd la contrasenya, perd les dades.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` a macOS) mostra i amaga el giny.
3. Fet. Quan s'envia una versió nova, Canto t'avisa i **Configuració → Actualitzacions** s'actualitza amb un sol clic.

> [!NOTA]
> Els instal·ladors encara no estan signats amb codi: SmartScreen (Windows) i Gatekeeper (macOS) adverteixen al primer llançament.
> Les actualitzacions automàtiques es verifiquen amb la pròpia signatura del projecte abans d'executar-se.

Els manifestos preparats per a winget i Homebrew (a més d'un esquelet per a Flatpak, actualment bloquejat) viuen a
[`packaging/`](packaging/README.md) — preparat i verificat localment, però encara no publicat a aquests
repositoris: la publicació és una decisió i acció manual del responsable.

## 🔒 Seguretat d'un cop d'ull

| Capa | Protecció |
|---|---|
| Volta | Argon2id (19 MiB, t=2) → AES-256-GCM, un nou noce a cada escriptura, escriptura atòmica amb `fsync` |
| Clau | Només RAM, posat a zero al bloqueig; bloqueig automàtic configurable (de 5 a 60 minuts inactiu, 15 minuts per defecte) |
| Xarxa | només el procés Rust parla amb la xarxa; la vista web no té cap origen remot (CSP) i mai no veu testimonis |
| Google | opcional, només `calendar.events.readonly`, `directory.readonly` (fotos dels companys de l'espai de treball a la llista de convidats) més el perfil, OAuth amb PKCE i loopback |
| GitHub | testimoni xifrat opcional; els elements només s'obren si l'enllaç és `https://github.com/` |
| GitLab | adreça i testimoni opcionals encriptats; Només `https://`, sense redireccions, només enllaços des de la instància configurada |
| Actualitzacions | només instal·la un paquet signat per la clau del projecte; una baixada manipulada es descarta abans d'executar-se |

Model complet, còpia de seguretat, fusió entre màquines i on es troba cada fitxer: [docs/seguranca.md](docs/seguranca.md).
Trobeu un defecte? [SECURITY.md](SECURITY.md).

## 📚 Documentació

| Document | Què hi ha dins |
|---|---|
| 📖 [User guide](docs/uso.md) | pestanyes, tasques recurrents, dreceres, aspectes, accessibilitat, finestra, actualitzacions i començar amb el sistema |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda i GitHub (token personal o flux de dispositiu) |
| 🛡️ [Security and data](docs/seguranca.md) | model d'amenaça, `.canto` còpia de seguretat, fusió, canvi de contrasenya, fitxers al disc |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify i proves de volum |
| 📝 [CHANGELOG](CHANGELOG.md) | què ha canviat en cada versió |
| 🤝 [How to contribute](CONTRIBUTING.md) | entorn, proves, PRs i com publicar una versió |
| 🤖 [Agent guide](AGENTS.md) | contractes i trampes per a qualsevol persona que editi el codi amb AI |

## 🛠️ Desenvolupament

Prerequisits: [Bun](https://bun.sh) ≥ 1,2, estable Rust ≥ 1,85 i el
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) per al vostre sistema.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Les vistes web es creen després de l'estat Rust i la safata s'inicialitza, de manera que les trucades IPC d'inici no poden configurar-se com a cursa.

Cada PR executa CI a Windows, macOS i Linux. `fix`, `feat` i compromisos de ruptura fusionats a `main` convencionals
obtenir una etiqueta SemVer, notes de llançament generades i instal·ladors signats construïts en paral·lel; el llançament es publica després de la verificació (detalls a
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Llicència

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Elaborat amb 🦀 Rust, ⚛️ React i ☕ per als que viuen entre reunions.</sub></div>
