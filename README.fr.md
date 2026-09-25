<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto : toute votre journée dans le coin de l'écran. Tâches, GitHub et alertes de réunion dans des fenêtres widget." width="100%">

<br><br>

[![Télécharger](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20T%C3%A9l%C3%A9charger-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-noyau%20chiffr%C3%A9-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Fonctionnalités](#-fonctionnalités)** · **[Thèmes](#-cinq-thèmes)** · **[Installation](#%EF%B8%8F-installation)** · **[Sécurité](#-sécurité-en-un-coup-dœil)** · **[Documentation](#-documentation)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · **Français** · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **Tâches avec rappels, notes, historique du presse-papiers, agenda avec alertes de réunion, transcriptions et
> vos PR GitHub dans une petite fenêtre épinglée au coin de l'écran.** S'affiche avec `Ctrl+Alt+Space`, se cache
> quand vous n'en avez pas besoin et garde tout chiffré sur votre machine, sans compte et sans serveur.

## ✨ Pourquoi Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Visite des onglets Tâches, Notes, Presse-papiers, Agenda et GitHub, de l'alerte de réunion et des thèmes" width="300"></td>
<td>

Si vous vivez entre réunions, PR et petites tâches en attente, vous finissez avec cinq applications ouvertes.
Canto rassemble tout au même endroit.

🔒 **Chiffré par défaut.** Argon2id + AES-256-GCM avec un mot de passe principal ; la clé n'existe qu'en RAM.
Windows Hello en option.

🏠 **Vos données restent chez vous.** Zéro télémétrie, zéro serveur, aucun compte requis. La sauvegarde est un
seul fichier `.canto` chiffré.

⏰ **Vous ne le raterez pas.** 1 minute avant une réunion et à l'heure du rappel, le widget s'affiche, joue un
son et envoie une notification, avec **répétition (snooze) de 10 min**.

🪶 **Léger.** Tauri v2 (Rust + la webview du système) au lieu d'Electron : un installateur de 3,5 Mo.
[Chiffres mesurés](docs/benchmark.md#footprint-medido).

🔄 **Toujours à jour.** Mises à jour depuis l'application, qui n'installe que ce qui est signé par la propre
clé du projet.

</td>
</tr>
</table>

## 🧰 Fonctionnalités

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Tâches du jour avec heure et récurrence"></td>
<td>

### ✅ Des tâches qui vous rappellent

Une liste quotidienne avec heure et récurrence (tous les jours, jours ouvrés ou hebdomadaire). Tapez
**`Tous les jours à 9h30`** et le rappel est déjà programmé. **Résumé du jour** prêt à copier-coller et
**récupération des tâches en attente** de la veille.

</td>
</tr>
<tr>
<td>

### 📅 Une réunion commence ? On vous prévient.

Les événements du jour proviennent de Google Agenda (lecture seule). Une minute avant, le widget apparaît à
l'écran avec **rejoindre Meet**, joue un son et envoie une notification système, quel que soit l'onglet ouvert
ou même s'il est masqué. Cliquez sur l'événement pour voir l'organisateur, l'ordre du jour, les invités et les
pièces jointes, comme les notes de Gemini.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Détails de l'événement avec organisateur, invités et notes Gemini"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Cartes de notes avec étiquettes et une note épinglée"></td>
<td>

### 🗒️ Des notes sous forme de cartes

Des cartes consultables avec des `#étiquettes`, épinglage en haut et filtre par étiquette en un clic. Gère des
milliers de notes : la liste est paginée et la recherche les couvre toutes.

</td>
</tr>
<tr>
<td>

### 📋 Un presse-papiers qui n'oublie rien (et ne fuit rien)

Historique chiffré avec recherche et épinglage ; reconnaît les liens, les couleurs et le code. Une copie géante
(un journal de 100 Mo) ne bloque rien : il garde le début et vous prévient. Sur Windows, il ignore tout ce que
les gestionnaires de mots de passe marquent comme sensible.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Historique du presse-papiers avec un lien, un long journal et du code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="Onglet GitHub avec revue demandée, assignée et PR ouvertes"></td>
<td>

### 🐙 Votre GitHub en un coup d'œil

**Revue demandée de moi**, assignées à moi, PR et issues que j'ai ouvertes, avec une icône PR ou issue et qui
l'a ouverte. Filtrez par texte, `repo:` ou `label:`, PR seulement ou issues seulement, triez par mise à jour,
création ou commentaires, et défilez avec **afficher plus**. Prend aussi en charge **GitLab.com et GitLab
auto-hébergé**, avec un cache de 5 minutes qui respecte la limite de débit. Connexion avec un jeton personnel
en lecture seule ou depuis le navigateur (device flow).

</td>
</tr>
<tr>
<td>

### ⚙️ Paramètres et mises à jour automatiques

Changement du mot de passe principal, Windows Hello, sauvegarde `.canto`, un dossier synchronisé avec fusion
automatique (Dropbox, OneDrive, Syncthing...), démarrage avec le système et la section **Mises à jour**, avec
la **version installée** et la **dernière publiée** côte à côte et un bouton pour mettre à jour et redémarrer.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Paramètres affichant la version installée, la dernière version publiée et le bouton de mise à jour"></td>
</tr>
</table>

Il y a aussi 🎙️ **Réunions** : notes et transcriptions Gemini des deux dernières semaines, plus les
transcriptions `.vtt`, `.srt`, `.txt` et `.md` d'un dossier local, nettoyées et consultables.

⌨️ **Tout au clavier :** `Alt+1`…`Alt+7` changent d'onglet, `N` crée, `/` recherche, `F11` plein écran, `Alt+L`
verrouille et `?` affiche les raccourcis.

## 🎨 Cinq thèmes

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Thème par défaut" width="200"><br><b>Par défaut</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Thème Hueco Mundo" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Thème Dracula" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Thème clair" width="200"><br><b>Clair</b></td>
</tr>
</table>

Et **Suivre le système**, qui alterne entre clair et sombre avec l'OS. Tous respectent le contraste AA.

<details>
<summary>🖥️ Plus d'écrans : onboarding, recherche globale, GitLab, sous-tâches, markdown, sécurité, synchronisation, densité et plus</summary>

<br>

![Onglet GitHub en plein écran](docs/prints/app/12-tela-cheia.png)

| Bienvenue au premier lancement | Recherche globale (`Ctrl+K`) | Onglet GitLab auto-hébergé | Alerte de réunion |
|---|---|---|---|
| ![Onboarding avec les raccourcis essentiels](docs/prints/app/19-onboarding.png) | ![Recherche dans les tâches, notes et presse-papiers en même temps](docs/prints/app/20-busca-global.png) | ![Revue demandée, assignée et issues sur GitLab auto-hébergé](docs/prints/app/21-gitlab.png) | ![Alerte de réunion avec rejoindre Meet et répétition](docs/prints/app/07-aviso-reuniao.png) |

| Tâche avec sous-tâches, priorité et PR | Note en markdown | Autres types de presse-papiers | Sécurité : verrouillage auto et déverrouillages |
|---|---|---|---|
| ![Liste de contrôle, priorité et lien PR sur une tâche](docs/prints/app/23-tarefas-detalhes.png) | ![Note affichée en markdown liée à une tâche](docs/prints/app/24-notas-markdown.png) | ![Presse-papiers reconnaissant lien, couleur, json, e-mail et téléphone](docs/prints/app/25-clipboard-tipos.png) | ![Verrouillage automatique configurable et journal des derniers déverrouillages](docs/prints/app/26-ajustes-seguranca.png) |

| Dossier synchronisé | Densité compacte | Coffre verrouillé | Connecter GitHub |
|---|---|---|---|
| ![Paramètres pointant vers un dossier Dropbox](docs/prints/app/27-ajustes-sync.png) | ![Interface compacte sur l'onglet Tâches](docs/prints/app/28-densidade-compacta.png) | ![Écran de mot de passe avec Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connexion avec un jeton ou depuis le navigateur](docs/prints/app/10-github-conectar.png) |

| Rappel de tâche | Changer le mot de passe principal |
|---|---|
| ![Rappel avec terminer et répétition](docs/prints/app/08-lembrete-tarefa.png) | ![Formulaire de changement de mot de passe](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>Toutes les captures d'écran utilisent des données fictives.</sub>

## ⚖️ Comparaison avec l'existant

Aucun des outils étudiés ne couvre plus de deux de ces domaines à la fois. Sources et détails dans
[docs/benchmark.md](docs/benchmark.md).

| | Tâches + rappel | Notes | Presse-papiers | Réunions | GitHub | Chiffrement local par défaut |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ synchronisation seulement |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ en option |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ natif · ➖ partiel, via extension ou en option · — aucun · ? non publié · n/a ne stocke pas de données utilisateur</sub>

Ce que le benchmark a apporté ici : **l'heure directement dans le titre de la tâche** (Todoist/TickTick),
**répéter l'alerte (snooze)** (TickTick) et **un presse-papiers qui respecte les gestionnaires de mots de
passe** (CopyQ/Ditto).

## ⬇️ Installation

Téléchargez l'installateur pour votre plateforme depuis **[Releases](https://github.com/juninmd/canto-widget/releases)** :

| Système | Fichier |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recommandé) ou `.msi` |
| 🍎 macOS | `.dmg` pour Apple Silicon ou Intel |
| 🐧 Linux | `.AppImage`, `.deb` ou `.rpm` |

1. Au premier lancement, vous créez le **mot de passe principal**. Il n'y a pas de récupération : si vous
   perdez le mot de passe, vous perdez les données.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` sur macOS) affiche et masque le widget.
3. C'est fait. Quand une nouvelle version sort, Canto vous prévient, et **Paramètres → Mises à jour** met à
   jour en un clic.

> [!NOTE]
> Les installateurs ne sont pas encore signés (code-signing) : SmartScreen (Windows) et Gatekeeper (macOS)
> avertissent au premier lancement. Les mises à jour automatiques sont vérifiées par rapport à la propre
> signature du projet avant d'être exécutées.

Des manifestes prêts à l'emploi pour winget et Homebrew (plus un squelette pour Flatpak, actuellement bloqué)
se trouvent dans [`packaging/`](packaging/README.md) — préparés et vérifiés localement, mais pas encore
publiés sur ces dépôts : la publication est une décision et une action manuelle du mainteneur.

## 🔒 Sécurité en un coup d'œil

| Couche | Protection |
|---|---|
| Coffre | Argon2id (19 Mio, t=2) → AES-256-GCM, un nonce inédit à chaque écriture, écriture atomique avec `fsync` |
| Clé | RAM uniquement, remise à zéro au verrouillage ; verrouillage automatique configurable (5 à 60 min d'inactivité, 15 min par défaut) |
| Réseau | seul le processus Rust parle au réseau ; la webview n'a aucune origine distante (CSP) et ne voit jamais les jetons |
| Google | optionnel, uniquement `calendar.events.readonly` plus le profil, OAuth avec PKCE et loopback |
| GitHub | optionnel, jeton chiffré ; les éléments ne s'ouvrent que si le lien commence par `https://github.com/` |
| GitLab | optionnel, adresse et jeton chiffrés ; `https://` uniquement, pas de redirections, liens uniquement depuis l'instance configurée |
| Mises à jour | installe uniquement un paquet signé par la clé du projet ; un téléchargement altéré est rejeté avant exécution |

Modèle complet, sauvegarde, fusion entre machines et emplacement de chaque fichier :
[docs/seguranca.md](docs/seguranca.md).
Vous avez trouvé une faille ? [SECURITY.md](SECURITY.md).

## 📚 Documentation

| Document | Contenu |
|---|---|
| 📖 [Guide utilisateur](docs/uso.md) | onglets, tâches récurrentes, raccourcis, thèmes, accessibilité, fenêtre, mises à jour et démarrage avec le système |
| 🔌 [Intégrations](docs/integracoes.md) | agenda Google et GitHub (jeton personnel ou device flow) |
| 🛡️ [Sécurité et données](docs/seguranca.md) | modèle de menace, sauvegarde `.canto`, fusion, changement de mot de passe, fichiers sur disque |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify et tests de volume |
| 📝 [CHANGELOG](CHANGELOG.md) | ce qui a changé dans chaque version |
| 🤝 [Comment contribuer](CONTRIBUTING.md) | environnement, tests, PR et comment publier une version |
| 🤖 [Guide pour agents](AGENTS.md) | contrats et pièges pour quiconque modifie le code avec l'IA |

## 🛠️ Développement

Prérequis : [Bun](https://bun.sh) ≥ 1.2, Rust stable ≥ 1.85 et les
[dépendances Tauri v2](https://v2.tauri.app/start/prerequisites/) pour votre système.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Chaque PR exécute la CI sur Windows, macOS et Linux. Un tag `v*` construit les installateurs signés pour les
mises à jour dans une release brouillon (étape par étape dans
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licence

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Fait avec 🦀 Rust, ⚛️ React et ☕ pour ceux qui vivent entre les réunions.</sub></div>
