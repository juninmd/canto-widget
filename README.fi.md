<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · **Suomi** · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Tehtävät, joissa on muistutuksia, muistiinpanoja, leikepöydän historiaa, esityslista kokoushälytyksillä, transkriptioilla ja GitHub PRs
> pienessä ikkunassa, joka on kiinnitetty näytön kulmaan.** Ponnahtaa esiin `Ctrl+Alt+Space`:lla, piiloutuu, kun et tarvitse
> se ja pitää kaiken salattuna koneellasi ilman tiliä tai palvelinta.

## 🌐 Kielet

Canto tarjoaa **42 käyttöliittymäkieltä**, joista jokaisella on oma README. Valitse omasi kohdasta **Asetukset → Kieli**;
haettava valitsin käyttää äidinkielten nimiä ja automaattinen tila noudattaa ensisijaista järjestelmäkieltäsi.
Arabia, heprea ja persia käyttävät tekstiä oikealta vasemmalle. Lisää kieliluetteloita ladataan pyynnöstä.

40 uutta käyttöliittymäluetteloa ja 31 uutta README-käännöstä ovat konekäännöksiä, eivätkä ole olleet niitä
äidinkielenään puhuvien arvioima. Portugali ja englanti pysyvät alkuperäisinä käyttöliittymäluetteloina. Lokeron etiketit ja
ilmoitusotsikot seuraavat valittua kieltä; jotkin integraatiovaroitustiedot ovat englanninkielisiä,
ja taustavirheet pysyvät portugaliksi. Tehtävän otsikon syntaksi säilyttää olemassa olevat portugali- ja englanninkieliset avainsanat.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Miksi Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Jos asut kokousten, PRs ja pienten odottavien kohteiden välillä, sinulla on lopulta viisi sovellusta auki. Canto laittaa kaiken sisään
yksi paikka.

🔒 **Oletusarvoisesti salattu.** Argon2id + AES-256-GCM pääsalasanalla; avain on aina olemassa vain RAM-muistissa.
Windows Hello valinnainen.

🏠 **Tietosi pysyvät mukanasi.** Nolla telemetriaa, nolla palvelinta, tiliä ei vaadita. Varmuuskopio on yksi salattu
`.canto` tiedosto.

⏰ **Et jää paitsi.** 1 minuutti ennen kokousta ja muistutuksen aikaan widget ponnahtaa esiin, toistaa äänen ja
lähettää ilmoituksen, jossa on **torkku 10 min**.

🪶 **Kevyt.** Tauri v2 (Rust + järjestelmän verkkonäkymä) Electron:n sijaan: 3,5 Mt:n asennusohjelma.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Aina ajan tasalla.** Päivittyy sovelluksesta ja asentaa vain sen, mikä on allekirjoitettu projektin omalla avaimella.

</td>
</tr>
</table>

## 🧰 Ominaisuudet

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Tehtävät, jotka muistuttavat sinua

Päivittäinen tarkistuslista ajan ja toistumisen kanssa (joka päivä, arkisin tai viikoittain). Kirjoita **`Daily at 9:30am`** ja
muistutus on jo asetettu; lisää **`!high`** (tai `!alta`, `!média`, `!baixa`) tärkeysjärjestykseen tai napsauta rivin pistettä vaihtaaksesi sitä. Pitkät otsikot kietoutuvat sen sijaan, että niitä leikattaisiin pois. **Keskity ajastin** mihin tahansa tehtävään: anna sille arvio, paina ▶ ja jokaisen välilehden alle kiinnitetty palkki laskee ajan siihen nähden (punainen, kun ylität); aika tallennetaan holviin minuutin välein. **Päivän yhteenveto** valmiina liitettäväksi (tehtävät, keskittynyt aika, kokoukset kokonaisajalla, PRs/MRs avattu, yhdistetty, tarkistettu ja suljettu yhdistämättä), **viikko- ja kuukausiraportti** alennettuna ja **poistaa odottavat kohteet** eiliseltä. **Pikakaappaus** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` macOS:ssä) tallentaa tehtävän tai muistiinpanon mistä tahansa sovelluksesta avaamatta widgetiä.

</td>
</tr>
<tr>
<td>

### 📅 Kokous alkaa? Se kertoo sinulle.

Liity seuraavaan kokoukseen sovelluksella `Ctrl+Alt+M` (`Ctrl+Cmd+M` macOS:ssä). Jos rekisteröinti epäonnistuu, Canto yrittää
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` macOS:ssä); lokerovalikko pysyy käytettävissä, jos molemmat eivät ole käytettävissä.

Tämän päivän tapahtumat tulevat Google Kalenterista (vain luku). Minuuttia ennen widget hyppää näytölle
**liity Meet**, toistaa äänen ja lähettää järjestelmäilmoituksen riippumatta siitä, millä välilehdellä olet tai vaikka se olisi piilotettu.
Jokaisessa kortissa on merkki, jossa on vastauksesi (hyväksytty, ehkä, hylätty, odottaa). Klikkaa tapahtumaa nähdäksesi kuka sen järjesti
se, esityslista, jokainen vieras, jolla on nimikirjaimet avatar ja heidän vastauksensa, ja liitteet, kuten Kaksosten muistiinpanot.
Ylärivi kertoo vähintään 15 minuutin **seuraavan ilmaisen ajan** (hylätyt kutsut ja koko päivän kestävät tapahtumat eivät
count), ja päällekkäiset tapahtumat saavat **konfliktin**-merkin, joka nimeää toisen tapahtuman. **Tänään**-näkymä johtaa kokoukseen meneillään olevaan kokoukseen (aikaa jäljellä, liittymispainike, yhteentörmäysvaroitus) tai seuraavaan, sitten **päivä yhdellä rivillä** (kokoukset, tehtävät ja vapaa-aika eri työaikojen välillä, jolloin kokousaika, vapaa-aika ja konfliktit on laskettu) ja yksi aikajana, jossa kokoukset, tehtävät ajan kanssa ja vapaat aukot ovat jo omia rivejä, jotka sopivat yhteen.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Muistiinpanot korteiksi

Haettavat kortit, joissa on `#tags`, kiinnitys ylös ja yhden napsautuksen tunnistesuodatin; jokainen kortti näyttää huomautuksen alun **renderöitynä** (otsikot, tarkistuslistat, koodi, linkit), ei raaka-arvoa. **WYSIWYG-editori**, jossa on kompakti
muotoilupalkki (lihavoitu, kursivoitu, koodi, otsikko, luettelot, tarkistuslistat, jotka valitset suoraan tekstissä, koodilohkot syntaksilla
korostus, linkit, kuvat) ja merkintöjen pikakuvakkeet kirjoittaessasi (`# `, `- `, `[ ] `, ` ``` `); **MD**-kytkin
näyttää raaka-arvon, joka on edelleen tapa, jolla muistiinpanot tallennetaan, haetaan, synkronoidaan ja viedään. Linkit avautuvat
`Ctrl`+napsautus, vain http(t). Liitä, pudota tai liitä kuvia (PNG, JPEG, GIF, WebP enintään 2 Mt), kukin sinetöitynä
salattu tiedosto, joka näkyy muistiinpanon sisällä ja pikkukuvina kortilla; he pysyvät tällä koneella kohteen `.canto` ulkopuolella
varmuuskopiot. Käsittelee tuhansia muistiinpanoja: luettelo on sivuttu ja haku kattaa ne kaikki.

</td>
</tr>
<tr>
<td>

### 📋 Leikepöytä, joka ei koskaan unohda (tai vuotaa)

Salattu historia haulla ja PIN-koodilla; tunnistaa linkit, värit ja koodin. Vie hiiri kohteen päälle **kopioiksesi sen uudelleenkirjoitettuna**:
JSON-muotoiltu tai kompakti, teksti yhdellä rivillä, isoilla kirjaimilla tai pienillä kirjaimilla (historiamerkintä pysyy ennallaan). Jättimäinen kopio (100 Mt:n loki) ei
jäädyttää mitä tahansa: se pitää käynnistyksen ja varoittaa. Windowsissa se ohittaa sen, mitä salasananhallintaohjelmat merkitsevät
herkkä.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub yhdellä silmäyksellä

**Minulta pyydettiin tarkistusta**, määrätty minulle, PRs ja avaamani ongelmat, PR tai ongelmakuvake ja kuka avasi
se. Luonnokset, PRs **odottavat arvosteluasi** ja PRs **pysähdyksissä** viikon ajan erottuvat joukosta, ja jokaisessa PR on pieni
**CI-merkki** (hyväksytty, epäonnistunut, käynnissä tai ei CI:tä) sen pääsitoumustarkistuksista. Kun joku ** pyytää sinua
tarkistaa**, käyttöjärjestelmän ilmoitus kertoo (oletusarvoisesti käytössä, poista se käytöstä asetuksista). Suodata tekstin mukaan, `repo:` tai `label:`, PRs tai vain ongelmat, lajittele päivityksen, luomisen tai kommenttien mukaan ja
vieritä **näytä lisää**. Siirry **Kommentit**-näkymään nähdäksesi **Kommentoijaluettelo**-ruudukon kaikista PRs-kuvaasi kommentoineista (avatarit, ihminen vs. botti -merkit, kommenttien määrä, haku, bottisuodatin, progressiivinen sivutus) ja heidän kommenttejaan. Tukee myös **GitLab.comia ja itseisännöityä GitLab**, 5 minuutin välimuistilla
noudattaa hintarajaa. Kirjaudu sisään vain luku -tilassa olevalla henkilökohtaisella tunnuksella tai selaimesta (laitevirta).

</td>
</tr>
<tr>
<td><img src="docs/prints/app/87-steam.png" alt="Steam tab, wishlist deals sub-tab: fictitious games with capsule art, the review score and its wording, discount badges, crossed-out original prices, the new price in reais and what each deal saves"></td>
<td>

### 🎮 Steam poistumatta widgetistä

Neljä alavälilehteä kohteelle Steam: **toivelistatarjoukset** (suurin alennus ensin, jokainen säästöineen), **myydyimmät**
paremmuusjärjestykseen, **pelaa nyt** (jokainen peli Steam raportoi viimeisen kahden viikon ajalta) ja **katalogi luokituksen mukaan**, sivuttu
**lataa lisää**, jotta se saavuttaa muun myymälän. Jokaisella rivillä on **kapselitaide**, **arvostelupiste**
Steam:n omalla sanamuodolla ja kuinka monta arvostelua se laskee, yliviivattu hinta, hinta realeina ja mitä
alennussäästöt — ja luettelo laskee yhteen kokonaissäästön. Julkiset luettelot tarvitsevat vain **SteamID64**; valinnainen
**Steam Web API -näppäin** lisää viimeisimmät pelit niiden peliajoineen. Välilehti alkaa oletusarvoisesti yhden valintaruudun päässä
Asetuksissa.

</td>
</tr>
<tr>
<td>

### ⚙️ Asetukset ja automaattiset päivitykset

Pääsalasanan vaihto, Windows Hello, `.canto` varmuuskopio, synkronoitu kansio automaattisella yhdistämisellä (Dropbox,
OneDrive, synkronointi...), aloita järjestelmästä ja **Päivitykset**-osiosta, **asennetulla versiolla** ja
**viimeisin julkaistu** vierekkäin ja painike päivittämistä ja uudelleenkäynnistystä varten.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Siinä on myös 🎙️ **Kokoukset**, Agendan alavälilehti List and Day:n vieressä: Kaksosten muistiinpanot ja transkriptit kohteesta
viimeiset kaksi viikkoa sekä `.vtt`, `.srt`, `.txt` ja `.md` transkriptioita paikallisesta kansiosta, siivottu ja haettavissa.

🤖 **AI-mallit** (oletusarvoisesti välilehtipalkissa, **ei API-avainta tai tiliä**): LLM:t, jotka on luokiteltu
[Artificial Analysis](https://artificialanalysis.ai) **Tietoindeksi**, luettavissa sen julkiselta tulostaulukkosivulta,
pistepalkin, luojan, 1 miljoonan tokenin hinta ja nopeus, lajiteltavissa älykkyyden, hinnan tai nopeuden mukaan. Se hakee klo
useimmiten 3 tunnin välein, ja opt-in 🔔 ilmoittaa sinulle, kun a
malli **pääsee 10 parhaan joukkoon** tai **kiipeää sen sisällä** (tarkistetaan 6 tunnin välein, kun holvi on auki), ja
"uusi" ja "ylös" -merkit viikon ajan.

🌙 **Älä häiritse:** Asetuksissa tai lokerossa, hiljennä kokoushälytykset, tehtävämuistutukset, tilahälytykset ja kaikki
järjestelmäilmoitus 30 min, 1 h, 2 h, huomiseen asti tai kunnes sammutat sen. Kuu yläpalkissa näyttää
kun se loppuu; yksi klikkaus sammuttaa sen takaisin. Se selviää uudelleenkäynnistyksestä ja päättyy itsestään.

🔔 **Jokainen hälytys yhdellä näytöllä:** otsikossa oleva kello (laske ja väri, kun jotain odottaa) avaa
hälytykset koko ikkunassa missä tahansa tilassa: yksi kortti per hälytys toimintoineen, **hylkää kaikki** ja mikä oli
ratkaistu tänään heidän alaisuudessaan – ilman mitään vireillä, näin pääset edelleen tämän päivän lokiin. Telakasta, napsautus
avaa silti kyseisen yksittäisen hälytyksen normaalin ikkunan päälle.

⌨️ **Kaikki näppäimistöllä:** `Alt+1`…`Alt+7` vaihtaa välilehtiä, `N` luo, `/` hakee, `F11` koko näyttö, `Alt+L`
lukitsee ja `?` luettelee pikakuvakkeet. `Ctrl+Shift+P` (`Cmd+Shift+P` macOS:ssä) avaa **komentopaletin** jokaisella
toiminto nimen mukaan: siirry välilehdelle, uuteen tehtävään tai muistiinpanoon, liity seuraavaan kokoukseen, kopioi päivän yhteenveto, vaihda ulkoasua, lukitse.

## 🎨 Kuusi skiniä

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Oletus</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Lasi</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Kevyt</b></td>
</tr>
</table>

Ja **Seuraa järjestelmää**, joka vaihtaa vaalean ja pimeän välillä käyttöjärjestelmän mukana. Kaikki läpäisevät AA-kontrastin.

<details>
<summary>🖥️ Lisää näyttöjä: käyttöönotto, yleinen haku, komentopaletti, GitLab, alitehtävät, muistiinpanoeditori, suojaus, synkronointi, tiheys ja paljon muuta</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Ensimmäisen kerran tervetuloa | Maailmanlaajuinen haku (`Ctrl+K`) | Itseisännöity GitLab-välilehti | Kokoushälytys |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Tehtävä alitehtävillä, prioriteetilla ja PR | Muistiinpanoeditori | Lisää leikepöytätyyppejä | Turvallisuus: automaattinen lukitus ja lukituksen avaaminen |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Synkronoitu kansio | Kompakti tiheys | Lukittu holvi | Yhdistä GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Asetukset ryhmissä, haulla | Haku suodattaa ryhmät | Offline-siru otsikossa | Vahvista ennen leikepöydän tyhjentämistä |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Hylkää tallentamaton muistiinpanon luonnos |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Tilat: Mini, Piilotettu, Normaali, Suurin | Minitila: hälytykset näytön reunassa |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Napsauta hälytystä Dockissa | Maksimoitu: koko ikkuna avoimelle välilehdelle |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list across the whole window and a bell in the header counting the pending alerts](docs/prints/app/65-modo-maximizado.png) |

| Kello avaa hälytykset koko ikkunaan |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: tilavalikko avautuu telakointiikkunaan |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Välilehdet, jotka eivät sovi, odottavat "Lisää"-valikossa |
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

| Pelit ja koko näyttö: hälytykset odota, kunnes lähdet |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Torkku: 1, 5 tai 10 min |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| A window that fails shows itself instead of blocking clicks invisibly |
|---|
| ![The alert window after a rendering error: a solid panel with the error, "try again" and "close"](docs/prints/app/100-janela-com-erro.png) |

| Tehtävämuistutus | Vaihda pääsalasana | Tila API (opt-in-välilehti) | Kieli: englanti, portugali tai espanja |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Kopioi uudelleen kirjoitettu leike | Kokoushälytys valmistelulla |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Suunnittele uudelleen: Tehtävät-välilehti, ennen ja jälkeen |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Uudelleensuunnittelu: jokainen välilehti, ennen (ylhäältä) ja jälkeen (alhaalla) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI epäonnistui, ja työt katkesivat | Joku mainitsi minut | Niiden kytkimet Asetuksissa |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Mainitse hälytys sen kirjoittajan kanssa |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Mainitse hälytys tekstin esikatselulla |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| Lisää hälytyksiä omasta työstäni |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| PR assigned to me |
|---|
| ![PR assigned to me](docs/prints/app/95-aviso-pr-atribuido.png) |

| Päivän yhteenvetohälytys | Päivän yhteenvetoasetus |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mainitsee alavälilehden (GitHub ja GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Salasana vaihdettu, yksi tiedosto vireillä | Päivän yhteenveto |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Viikkoraportti | Agenda: seuraava vapaa-aika ja konfliktit |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Agenda: ilmainen juuri nyt | Komentopaletti (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Älä häiritse | Kuva muistiinpanossa |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| CI-merkki jokaisessa PR | Tarkista pyyntöilmoitukset |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Huomaa kuvat pikkukuvina | WYSIWYG muistiinpanoeditori |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Huomautuseditori: raw markdown (MD) | Huomautuseditori vaalealla iholla |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Tehtävät: prioriteetti rivillä, pitkien otsikoiden rivitys | Muistiinpanoluettelo renderoidulla merkinnällä |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| AI-mallit älykkyysindeksin mukaan |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Steam: eniten myytyjä, numeroitu | Steam: viisi viimeistä pelattua peliä, molemmat peliajat |
|---|---|
| ![Steam tab, trending sub-tab: fictitious games ranked #1 to #5 with capsule art, review score, review count and price](docs/prints/app/88-steam-em-alta.png) | ![Steam tab, play now sub-tab: five fictitious games with capsule art, the time in the last two weeks and the total time](docs/prints/app/89-steam-recentes.png) |

| Steam: luettelo luokituksen mukaan, "lataa lisää" | | Steam: the library, most played first, with a search box |
|---|---|
| ![Steam tab, catalog sub-tab: fictitious games ordered by review score, each with capsule, score, review count and price, and a load more button under the list](docs/prints/app/90-steam-catalogo.png) | ![Steam tab, library sub-tab: fictitious owned games most played first, with capsule art, the total hours of each and a summary line above, plus a search box and a load more button](docs/prints/app/98-steam-biblioteca.png) |

| Yksi varoituspeitto kaikelle odottavalle: katkokset, kokoukset, tehtävät ja uudet tekoälymallit |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Päätepisteeni: ruudut, joissa on uusin latenssi | Avoin päätepiste: latenssikaavio, raja- ja hälytysasetukset | DNS + -varmenteen tarkistuksen lisääminen |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Minkä tahansa päivän esityslista: edellinen ja seuraava nuolet, päivämäärän valitsin ja takaisin tähän päivään -painike |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Tehtävät: nykyinen tehtävä ajastimella ja ryhmitellyllä luettelolla | GitHub: yhteenvetolista luetteloiden yläpuolella | GitLab: sama nauha, ilman CI-ruutua |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Tarkennusajastin kiinnitetty jokaisen välilehden alle | Esityslista kuin päivä, tehtäviä kokousten ohella |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Päivänäkymä: päällekkäiset tapahtumat jakavat leveyden vierekkäin |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Tarkista tutka: vanhin pyyntö ensin, myöhässä punaisella, torkku |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Kokoukset esityslistan alivälilehdellä Lista ja Päivä |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Toiminto-välilehti (oletuksena pois päältä) | Yhteenveto keskittyneestä ajasta ja suljettuna PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Toiminta-välilehti, viimeiset 7 päivää | Toiminto-välilehti, poistettu käytöstä | Toiminta-välilehti leveässä ikkunassa |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

**Toiminta**-välilehti on piilotettu (ota se käyttöön kohdassa Asetukset → näkyvät välilehdet). Se tallentaa vain kohteen nimen
kohdennettu sovellus, kun käytät tietokonetta, suljetussa paikallisessa tiedostossa, joka ei koskaan saavuta varmuuskopioita tai synkronointia (Wayland
ei voi ilmoittaa kohdistetusta ikkunasta, joten se ei ole käytettävissä siellä). Pois päältä, kunnes otat käyttöön, ja ensimmäinen näyttö kertoo mitä
säilytetään ja mitä ei koskaan säilytetä.

- **Päivä**: donitsi luokittain, jonka sisällä on kokonaismäärä, jonka selite kätkee luokan, muutos päivästä
ennen ja tyhjäkäyntiaika (ei näppäimistöä tai hiirtä 2 minuuttiin). Sen alapuolella päivittäinen koodin keskittymistavoite sen sarjan ja
yksi piste päivässä, kolme kohokohtaa (yhden sovelluksen pisin jakso, sovelluskytkimet, huipputunti), aikajana, jossa koko
päivä, tyhjäkäynti venyy ja vilkkaimmat sovellukset jakavat yhden aika-akselin "nyt"-merkin ja luettelon kanssa
(napauta yhtä vaihtaaksesi sen luokkaa) tai tarkennusajastimen suorittamista tehtävistä.
- **Viikko**: pinotut sarakkeet päivässä, joissa on keskiarvoviiva ja piste jokaisen tavoitteen saavuttaneen päivän alla, tunnin lämpökartta
huippusi kanssa ja samat listat koko viikolle.
- **Layout and skins**: yksi sarake oletusikkunassa, kaksi kun se on leveä (suurin); jokaisella iholla on omansa
luokan värit, tarkastettu kontrastin suhteen. Päivän vieressä oleva valikko kopioi sen tekstinä.

<sub>Kaikissa kuvakaappauksissa käytetään kuvitteellista dataa.</sub>

## ⚖️ Verrattuna siihen, mitä siellä on

Mikään tutkituista työkaluista ei kata useampaa kuin kahta näistä rintamista kerralla. Lähteet ja lisätiedot sisään
[docs/benchmark.md](docs/benchmark.md).

| | Tehtävät + muistutus | Huomautuksia | Leikepöytä | Kokoukset | GitHub | Paikallinen salaus oletuksena |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ vain synkronointi |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Sama | — | — | ✅ | — | — | ➖ valinnainen |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ natiivi · ➖ osittainen, laajennuksen kautta tai valinnainen · — ei mitään · ? julkaisematon · n/a ei tallenna käyttäjätietoja</sub>

Mitä vertailuarvo toi tänne: **aika juuri tehtävän otsikossa** (Todoist/TickTick), **torkkuhälytys**
(TickTick) ja **leikepöytä, joka kunnioittaa salasananhallintaohjelmia** (CopyQ/Ditto).

## ⬇️ Asenna

Lataa asennusohjelma alustallesi osoitteesta **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Järjestelmä | Tiedosto |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (suositus) tai `.msi` |
| 🍎 macOS | `.dmg` Apple Siliconille tai Intelille |
| 🐧 Linux | `.AppImage`, `.deb` tai `.rpm` |

1. Ensimmäisellä käyttökerralla luot **pääsalasanan**. Ei palautusta: menetä salasana, menetä tiedot.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` macOS:ssä) näyttää ja piilottaa widgetin.
3. Valmis. Kun uusi versio toimitetaan, Canto ilmoittaa sinulle ja **Asetukset → Päivitykset** päivittyy yhdellä napsautuksella.

> [!HUOM]
> Asentajat eivät ole vielä allekirjoittaneet koodia: SmartScreen (Windows) ja Gatekeeper (macOS) varoittavat ensimmäisen käynnistyksen yhteydessä.
> Automaattiset päivitykset tarkistetaan projektin omalla allekirjoituksella ennen käynnistämistä.

Valmiit manifestit wingetille ja Homebrew'lle (sekä luuranko Flatpakille, tällä hetkellä estetty)
[`packaging/`](packaging/README.md) — valmisteltu ja vahvistettu paikallisesti, mutta ei vielä julkaistu niille
arkistot: julkaiseminen on ylläpitäjän manuaalinen päätös ja toimenpide.

## 🔒 Turvallisuus yhdellä silmäyksellä

| Kerros | Suojaus |
|---|---|
| Holvi | Argon2id (19 MiB, t=2) → AES-256-GCM, tuore nonce jokaisessa kirjoituksessa, atomikirjoitus `fsync` |
| Avain | Vain RAM, nollattu lukituksesta; konfiguroitavissa oleva automaattinen lukitus (5–60 minuuttia tyhjäkäynnillä, oletuksena 15 minuuttia) |
| Verkko | vain Rust-prosessi keskustelee verkon kanssa; verkkonäkymällä ei ole etälähdettä (CSP) eikä se koskaan näe tunnuksia |
| Google | valinnainen, vain `calendar.events.readonly`, `directory.readonly` (Työtilan kollegoiden valokuvat vierasluettelossa) plus profiili, OAuth PKCE:lla ja silmukalla |
| GitHub | valinnainen, salattu tunnus; kohteet avautuvat vain, jos linkki on `https://github.com/` |
| GitLab | valinnainen, salattu osoite ja tunnus; `https://` vain, ei uudelleenohjauksia, linkit vain määritetystä ilmentymästä |
| Päivitykset | asentaa vain projektin avaimella allekirjoitetun paketin; peukaloitu lataus hylätään ennen |

Täysi malli, varmuuskopiointi, yhdistäminen eri koneiden välillä ja kunkin tiedoston sijainti: [docs/seguranca.md](docs/seguranca.md).
Löysitkö vian? [SECURITY.md](SECURITY.md).

## 📚 Dokumentaatio

| Asiakirja | Mitä siinä on |
|---|---|
| 📖 [User guide](docs/uso.md) | välilehdet, toistuvat tehtävät, pikakuvakkeet, ulkoasut, saavutettavuus, ikkuna, päivitykset ja aloita järjestelmästä |
| 📱 [Mobile](docs/mobile.md) | Android / iOS |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda ja GitHub (henkilökohtainen tunnus tai laitevirta) |
| 🛡️ [Security and data](docs/seguranca.md) | uhkamalli, `.canto` varmuuskopiointi, yhdistäminen, salasanan vaihto, tiedostot levyllä |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify ja äänenvoimakkuustestit |
| 📝 [CHANGELOG](CHANGELOG.md) | mikä muuttui kussakin versiossa |
| 🤝 [How to contribute](CONTRIBUTING.md) | ympäristö, testit, PRs ja julkaisun julkaiseminen |
| 🤖 [Agent guide](AGENTS.md) | sopimuksia ja ansoja kaikille, jotka muokkaavat koodia AI:lla |

## 🛠️ Kehitys

Edellytykset: [Bun](https://bun.sh) ≥ 1.2, vakaa Rust ≥ 1.85 ja
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) järjestelmällesi.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Verkkonäkymät luodaan Rust-tilan jälkeen ja alusta on alustettu, joten käynnistyksen IPC-kutsut eivät voi kilpailla.

Jokainen PR käyttää CI:tä Windowsissa, macOS:ssä ja Linuxissa. Perinteiset `fix`, `feat` ja rikkovat sitoumukset yhdistettiin `main`
hanki SemVer-tunniste, luodut julkaisutiedot ja allekirjoitetut asennusohjelmat, jotka on rakennettu rinnakkain; julkaisu julkaistaan varmentamisen jälkeen (lisätietoja kohdassa
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Lisenssi

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Valmistettu: 🦀 Rust, ⚛️ React ja ☕ niille, jotka elävät kokousten välillä.</sub></div>
