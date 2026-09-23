<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: todo tu día en la esquina de la pantalla. Tareas, GitHub y avisos de reuniones en ventanas widget." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Descargar-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/licencia-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-n%C3%BAcleo%20cifrado-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Funciones](#-funciones)** · **[Skins](#-cinco-skins)** · **[Instalación](#%EF%B8%8F-instalaci%C3%B3n)** · **[Seguridad](#-seguridad-de-un-vistazo)** · **[Documentación](#-documentaci%C3%B3n)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · **Español** · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **Tareas con recordatorios, notas, historial de portapapeles, una agenda con avisos de reuniones,
> transcripciones y tus PR de GitHub en una ventana pequeña anclada a la esquina de la pantalla.** Aparece con
> `Ctrl+Alt+Space`, se oculta cuando no la necesitas y mantiene todo cifrado en tu máquina, sin cuenta y sin
> servidor.

## ✨ Por qué Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Recorrido por las pestañas de Tareas, Notas, Portapapeles, Agenda y GitHub, el aviso de reunión y las skins" width="300"></td>
<td>

Si vives entre reuniones, PR y pequeños pendientes, terminas con cinco apps abiertas. Canto lo pone todo en un
solo lugar.

🔒 **Cifrado por defecto.** Argon2id + AES-256-GCM con contraseña maestra; la clave solo existe en RAM. Windows
Hello opcional.

🏠 **Tus datos se quedan contigo.** Cero telemetría, cero servidor, sin cuenta requerida. El backup es un único
archivo cifrado `.canto`.

⏰ **No se te pasará.** 1 minuto antes de una reunión y a la hora del recordatorio, el widget aparece, reproduce
un sonido y envía una notificación, con **posponer 10 min**.

🪶 **Ligero.** Tauri v2 (Rust + el webview del sistema) en vez de Electron: un instalador de 3.5 MB.
[Números medidos](docs/benchmark.md#footprint-medido).

🔄 **Siempre actualizado.** Se actualiza desde dentro de la app y solo instala lo que está firmado con la clave
propia del proyecto.

</td>
</tr>
</table>

## 🧰 Funciones

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Tareas de hoy con hora y recurrencia"></td>
<td>

### ✅ Tareas que te recuerdan

Una lista diaria con hora y recurrencia (todos los días, días laborables o semanal). Escribe **`Diario a las
9:30am`** y el recordatorio ya queda configurado. **Resumen del día** listo para pegar y **traer pendientes** de
ayer.

</td>
</tr>
<tr>
<td>

### 📅 ¿Empieza una reunión? Te avisa.

Los eventos de hoy vienen de Google Calendar (solo lectura). Un minuto antes, el widget salta a la pantalla con
**unirse a Meet**, reproduce un sonido y envía una notificación del sistema, estés en la pestaña que estés o
incluso si está oculto. Haz clic en el evento para ver quién lo organizó, la agenda, los invitados y los
adjuntos, como las notas de Gemini.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Detalles del evento con organizador, invitados y notas de Gemini"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Tarjetas de notas con etiquetas y una nota fijada"></td>
<td>

### 🗒️ Notas como tarjetas

Tarjetas buscables con `#etiquetas`, fijar arriba y filtro de etiqueta con un clic. Maneja miles de notas: la
lista está paginada y la búsqueda las cubre todas.

</td>
</tr>
<tr>
<td>

### 📋 Portapapeles que nunca olvida (ni filtra)

Historial cifrado con búsqueda y fijado; reconoce enlaces, colores y código. Una copia gigante (un log de 100
MB) no congela nada: guarda el inicio y te avisa. En Windows, omite todo lo que los gestores de contraseñas
marcan como sensible.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Historial de portapapeles con un enlace, un log grande y código"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="Pestaña de GitHub con revisión solicitada, asignados y PR abiertos"></td>
<td>

### 🐙 Tu GitHub de un vistazo

**Revisión solicitada a mí**, asignados a mí, PR e issues que abrí, con un icono de PR o issue y quién lo abrió.
Filtra por texto, `repo:` o `label:`, solo PR o solo issues, ordena por actualización, creación o comentarios, y
desplázate con **ver más**. También admite **GitLab.com y GitLab autoalojado**, con una caché de 5 minutos que
respeta el límite de tasa. Inicia sesión con un token personal de solo lectura o desde el navegador (device
flow).

</td>
</tr>
<tr>
<td>

### ⚙️ Ajustes y actualizaciones automáticas

Cambio de contraseña maestra, Windows Hello, backup `.canto`, una carpeta sincronizada con fusión automática
(Dropbox, OneDrive, Syncthing...), inicio con el sistema y la sección **Actualizaciones**, con la **versión
instalada** y la **última publicada** una al lado de la otra y un botón para actualizar y reiniciar.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Ajustes mostrando la versión instalada, la última versión publicada y el botón de actualizar"></td>
</tr>
</table>

También tiene 🎙️ **Reuniones**: notas y transcripciones de Gemini de las últimas dos semanas, además de
transcripciones `.vtt`, `.srt`, `.txt` y `.md` de una carpeta local, depuradas y buscables.

⌨️ **Todo con el teclado:** `Alt+1`…`Alt+7` cambian de pestaña, `N` crea, `/` busca, `F11` pantalla completa,
`Alt+L` bloquea y `?` lista los atajos.

## 🎨 Cinco skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Skin por defecto" width="200"><br><b>Por defecto</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Skin Hueco Mundo" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Skin Dracula" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Skin claro" width="200"><br><b>Claro</b></td>
</tr>
</table>

Y **Seguir al sistema**, que cambia entre claro y oscuro junto con el SO. Todas pasan el contraste AA.

<details>
<summary>🖥️ Más pantallas: onboarding, búsqueda global, GitLab, subtareas, markdown, seguridad, sincronización, densidad y más</summary>

<br>

![Pestaña de GitHub en pantalla completa](docs/prints/app/12-tela-cheia.png)

| Bienvenida inicial | Búsqueda global (`Ctrl+K`) | Pestaña de GitLab autoalojado | Aviso de reunión |
|---|---|---|---|
| ![Onboarding con los atajos esenciales](docs/prints/app/19-onboarding.png) | ![Búsqueda en tareas, notas y portapapeles a la vez](docs/prints/app/20-busca-global.png) | ![Revisión solicitada, asignados e issues en GitLab autoalojado](docs/prints/app/21-gitlab.png) | ![Aviso de reunión con unirse a Meet y posponer](docs/prints/app/07-aviso-reuniao.png) |

| Tarea con subtareas, prioridad y PR | Nota en markdown | Más tipos de portapapeles | Seguridad: bloqueo automático y desbloqueos |
|---|---|---|---|
| ![Checklist, prioridad y enlace a PR en una tarea](docs/prints/app/23-tarefas-detalhes.png) | ![Nota renderizada en markdown enlazada a una tarea](docs/prints/app/24-notas-markdown.png) | ![Portapapeles reconociendo enlace, color, json, correo y teléfono](docs/prints/app/25-clipboard-tipos.png) | ![Bloqueo automático configurable y un registro de los últimos desbloqueos](docs/prints/app/26-ajustes-seguranca.png) |

| Carpeta sincronizada | Densidad compacta | Bóveda bloqueada | Conectar GitHub |
|---|---|---|---|
| ![Ajustes apuntando a una carpeta de Dropbox](docs/prints/app/27-ajustes-sync.png) | ![Interfaz compacta en la pestaña de Tareas](docs/prints/app/28-densidade-compacta.png) | ![Pantalla de contraseña con Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Conectar con un token o desde el navegador](docs/prints/app/10-github-conectar.png) |

| Recordatorio de tarea | Cambiar contraseña maestra |
|---|---|
| ![Recordatorio con completar y posponer](docs/prints/app/08-lembrete-tarefa.png) | ![Formulario de cambio de contraseña](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>Todas las capturas usan datos ficticios.</sub>

## ⚖️ Comparado con lo que existe

Ninguna de las herramientas investigadas cubre más de dos de estos frentes a la vez. Fuentes y detalles en
[docs/benchmark.md](docs/benchmark.md).

| | Tareas + recordatorio | Notas | Portapapeles | Reuniones | GitHub | Cifrado local por defecto |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ solo sync |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ opcional |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ nativo · ➖ parcial, vía extensión u opcional · — ninguno · ? no publicado · n/a no guarda datos del usuario</sub>

Lo que el benchmark trajo aquí: **la hora directo en el título de la tarea** (Todoist/TickTick), **posponer el
aviso** (TickTick) y **portapapeles que respeta los gestores de contraseñas** (CopyQ/Ditto).

## ⬇️ Instalación

Descarga el instalador para tu plataforma desde **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistema | Archivo |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recomendado) o `.msi` |
| 🍎 macOS | `.dmg` para Apple Silicon o Intel |
| 🐧 Linux | `.AppImage`, `.deb` o `.rpm` |

1. En el primer inicio creas la **contraseña maestra**. No hay recuperación: si pierdes la contraseña, pierdes
   los datos.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` en macOS) muestra y oculta el widget.
3. Listo. Cuando se publique una nueva versión, Canto te avisa, y **Ajustes → Actualizaciones** actualiza con un
   clic.

> [!NOTE]
> Los instaladores todavía no están firmados con código: SmartScreen (Windows) y Gatekeeper (macOS) avisan en el
> primer inicio. Las actualizaciones automáticas se verifican contra la firma propia del proyecto antes de
> ejecutarse.

Manifiestos listos para winget y Homebrew (además de un esqueleto para Flatpak, actualmente bloqueado) están en
[`packaging/`](packaging/README.md) — preparados y verificados localmente, pero aún no publicados en esos
repositorios: publicarlos es una decisión y acción manual del mantenedor.

## 🔒 Seguridad de un vistazo

| Capa | Protección |
|---|---|
| Bóveda | Argon2id (19 MiB, t=2) → AES-256-GCM, un nonce nuevo en cada escritura, escritura atómica con `fsync` |
| Clave | Solo en RAM, se pone a cero al bloquear; bloqueo automático configurable (5 a 60 min de inactividad, 15 min por defecto) |
| Red | solo el proceso de Rust habla con la red; el webview no tiene origen remoto (CSP) y nunca ve los tokens |
| Google | opcional, solo `calendar.events.readonly` más perfil, OAuth con PKCE y loopback |
| GitHub | opcional, token cifrado; los ítems solo se abren si el enlace es `https://github.com/` |
| GitLab | opcional, dirección y token cifrados; solo `https://`, sin redirecciones, enlaces solo de la instancia configurada |
| Actualizaciones | solo instala un paquete firmado con la clave del proyecto; una descarga alterada se descarta antes de ejecutarse |

Modelo completo, backup, fusión entre máquinas y dónde vive cada archivo: [docs/seguranca.md](docs/seguranca.md).
¿Encontraste una falla? [SECURITY.md](SECURITY.md).

## 📚 Documentación

| Documento | Qué contiene |
|---|---|
| 📖 [Guía de usuario](docs/uso.md) | pestañas, tareas recurrentes, atajos, skins, accesibilidad, ventana, actualizaciones e inicio con el sistema |
| 🔌 [Integraciones](docs/integracoes.md) | agenda de Google y GitHub (token personal o device flow) |
| 🛡️ [Seguridad y datos](docs/seguranca.md) | modelo de amenazas, backup `.canto`, fusión, cambio de contraseña, archivos en disco |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify y pruebas de volumen |
| 📝 [CHANGELOG](CHANGELOG.md) | qué cambió en cada versión |
| 🤝 [Cómo contribuir](CONTRIBUTING.md) | entorno, pruebas, PR y cómo publicar una versión |
| 🤖 [Guía para agentes](AGENTS.md) | contratos y trampas para quien edite el código con IA |

## 🛠️ Desarrollo

Requisitos: [Bun](https://bun.sh) ≥ 1.2, Rust estable ≥ 1.85 y las
[dependencias de Tauri v2](https://v2.tauri.app/start/prerequisites/) para tu sistema.

```bash
bun install
bun run tauri dev                                        # app con hot reload
bun run lint && bun test                                 # tipos y pruebas de UI
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # instalador para la plataforma actual
```

Cada PR ejecuta CI en Windows, macOS y Linux. Una etiqueta `v*` construye los instaladores firmados para
actualizaciones en un release en borrador (paso a paso en
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licencia

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Hecho con 🦀 Rust, ⚛️ React y ☕ para quienes viven entre reuniones.</sub></div>
