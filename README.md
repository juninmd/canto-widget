<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: seu dia inteiro no canto da tela. Tarefas, GitHub e aviso de reunião em janelas do widget." width="100%">

<br><br>

[![Baixar](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Baixar-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-n%C3%BAcleo%20cifrado-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[Recursos](#-recursos)** · **[Skins](#-cinco-skins)** · **[Instalar](#%EF%B8%8F-instalar)** · **[Segurança](#-segurança-em-uma-tela)** · **[Documentação](#-documentação)**

</div>

<br>

> **Tarefas com lembrete, notas, histórico do clipboard, agenda com aviso de reunião, transcrições e seus PRs do
> GitHub numa janela pequena presa ao canto da tela.** Aparece com `Ctrl+Alt+Espaço`, some quando você não precisa
> dela e guarda tudo cifrado na sua máquina, sem conta e sem servidor.

## ✨ Por que o Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour pelas abas Tarefas, Notas, Clipboard, Agenda e GitHub, pelo aviso de reunião e pelas skins" width="300"></td>
<td>

Quem vive entre reuniões, PRs e pequenas pendências acaba com cinco apps abertos. O Canto junta tudo num lugar só.

🔒 **Cifrado por padrão.** Argon2id + AES-256-GCM com senha mestra; a chave só existe em RAM. Windows Hello opcional.

🏠 **Seus dados ficam com você.** Zero telemetria, zero servidor, nenhuma conta obrigatória. O backup é um arquivo `.canto` cifrado.

⏰ **Você não perde a hora.** 1 min antes da reunião e na hora do lembrete, o widget aparece, toca um som e manda notificação, com **adiar 10 min**.

🪶 **Leve.** Tauri v2 (Rust + webview do sistema) em vez de Electron: instalador de 3,5 MB. [Números medidos](docs/benchmark.md#footprint-medido).

🔄 **Sempre em dia.** Atualiza pelo próprio app e só instala o que foi assinado pela chave do projeto.

</td>
</tr>
</table>

## 🧰 Recursos

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Tarefas do dia com horário e recorrência"></td>
<td>

### ✅ Tarefas que lembram de você

Checklist do dia com horário e recorrência (todo dia, dias úteis ou semanal). Digite **`Daily às 9h30`** e o
lembrete já sai marcado. **Resumo do dia** pronto para colar e **puxar pendências** de ontem.

</td>
</tr>
<tr>
<td>

### 📅 Reunião começando? Ele avisa.

Os eventos do dia vêm do Google Calendar (somente leitura). Um minuto antes, o widget salta na tela com **entrar
no Meet**, toca um som e manda notificação do sistema, esteja você em qualquer aba ou com ele escondido.
Clique no evento para ver quem organizou, a pauta, os convidados e os anexos, como as anotações do Gemini.

</td>
<td width="36%"><img src="docs/prints/app/07-aviso-reuniao.png" alt="Aviso de reunião com entrar no Meet e adiar"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Cards de notas com tags e nota fixada"></td>
<td>

### 🗒️ Notas em cards

Cards pesquisáveis com `#tags`, fixar no topo e filtro por tag com um clique. Aguenta milhares de notas: a lista
chega em páginas e a busca procura em todas.

</td>
</tr>
<tr>
<td>

### 📋 Clipboard que não esquece (nem vaza)

Histórico cifrado com busca e fixar; reconhece link, cor e código. Uma cópia gigante (um log de 100 MB) não trava
nada: ele guarda o começo e avisa. No Windows, ignora o que gerenciadores de senha marcam como sensível.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Histórico do clipboard com link, log grande e código"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="Aba GitHub com revisão pedida, atribuídos e PRs abertos"></td>
<td>

### 🐙 Seu GitHub numa olhada

**Revisão pedida a mim**, atribuídos a mim, PRs e issues que eu abri, com ícone de PR ou issue e quem abriu.
Filtre por texto, `repo:` ou `label:`, só PRs ou só issues, ordene por atualização, criação ou comentários e role
com **mostrar mais**. Também tem **GitLab.com e GitLab self-hosted**, e um cache de 5 min que respeita o limite de
requisições. Entra com token pessoal só leitura ou pelo navegador (device flow).

</td>
</tr>
<tr>
<td>

### ⚙️ Ajustes e atualização automática

Troca de senha mestra, Windows Hello, backup `.canto`, início com o sistema e a seção **Atualizações**, com a
**versão instalada** e a **última publicada** lado a lado e um botão para atualizar e reiniciar.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Ajustes com a versão instalada, a última publicada e o botão de atualizar"></td>
</tr>
</table>

Também tem 🎙️ **Reuniões**: as anotações e transcrições do Gemini das últimas duas semanas, mais transcrições
`.vtt`, `.srt`, `.txt` e `.md` de uma pasta local, limpas e pesquisáveis.

⌨️ **Tudo por teclado:** `Alt+1`…`Alt+7` trocam de aba, `N` cria, `/` busca, `F11` tela cheia, `Alt+L` tranca e `?` lista os atalhos.

## 🎨 Cinco skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Skin Padrão" width="200"><br><b>Padrão</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Skin Hueco Mundo" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Skin Drácula" width="200"><br><b>Drácula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Skin Clara" width="200"><br><b>Clara</b></td>
</tr>
</table>

E **Seguir o sistema**, que troca entre clara e escura junto com o sistema operacional. Todas passam contraste AA.

<details>
<summary>🖥️ Mais telas: tela cheia, cofre trancado, lembrete de tarefa, conectar o GitHub e trocar senha</summary>

<br>

![Aba GitHub em tela cheia](docs/prints/app/12-tela-cheia.png)

| Cofre trancado | Lembrete de tarefa | Conectar o GitHub | Trocar senha mestra |
|---|---|---|---|
| ![Tela de senha com Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Lembrete com concluir e adiar](docs/prints/app/08-lembrete-tarefa.png) | ![Conectar com token ou pelo navegador](docs/prints/app/10-github-conectar.png) | ![Formulário de troca de senha](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>Todos os prints usam dados fictícios.</sub>

## ⚖️ Comparado com o que já existe

Nenhuma das ferramentas pesquisadas cobre mais de duas destas frentes ao mesmo tempo. Fontes e detalhes em
[docs/benchmark.md](docs/benchmark.md).

| | Tarefas + lembrete | Notas | Clipboard | Reunião | GitHub | Cifra local por padrão |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ só no sync |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ opcional |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ nativo · ➖ parcial, via extensão ou opcional · — não tem · ? não publicado · n/a não guarda dados do usuário</sub>

O que o benchmark trouxe para cá: **horário direto no título da tarefa** (Todoist/TickTick), **adiar aviso**
(TickTick) e **clipboard que respeita gerenciadores de senha** (CopyQ/Ditto).

## ⬇️ Instalar

Baixe o instalador da sua plataforma em **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Sistema | Arquivo |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recomendado) ou `.msi` |
| 🍎 macOS | `.dmg` para Apple Silicon ou Intel |
| 🐧 Linux | `.AppImage`, `.deb` ou `.rpm` |

1. Na primeira execução você cria a **senha mestra**. Não há recuperação: perder a senha é perder os dados.
2. `Ctrl+Alt+Espaço` (`Cmd+Alt+Espaço` no macOS) mostra e esconde o widget.
3. Pronto. Quando sair versão nova, o Canto avisa, e **Ajustes → Atualizações** atualiza com um clique.

> [!NOTE]
> Os instaladores ainda não têm assinatura de código: o SmartScreen (Windows) e o Gatekeeper (macOS) avisam na
> primeira abertura. As atualizações automáticas são conferidas pela assinatura própria do projeto antes de rodar.

## 🔒 Segurança em uma tela

| Camada | Proteção |
|---|---|
| Cofre | Argon2id (19 MiB, t=2) → AES-256-GCM, nonce novo a cada gravação, gravação atômica com `fsync` |
| Chave | só em RAM, zerada ao trancar; auto-lock após 15 min sem uso |
| Rede | só o processo Rust fala com a rede; a webview não tem origem remota (CSP) e nunca vê tokens |
| Google | opcional, só `calendar.events.readonly` + perfil, OAuth com PKCE e loopback |
| GitHub | opcional, token cifrado; itens só abrem se o link for `https://github.com/` |
| GitLab | opcional, endereço e token cifrados; só `https://`, sem redirecionamento, links só da instância configurada |
| Atualização | só instala pacote assinado pela chave do projeto; download adulterado é descartado antes de rodar |

Modelo completo, backup, merge entre máquinas e onde cada arquivo fica: [docs/seguranca.md](docs/seguranca.md).
Achou uma falha? [SECURITY.md](SECURITY.md).

## 📚 Documentação

| Documento | O que tem |
|---|---|
| 📖 [Guia de uso](docs/uso.md) | abas, tarefas recorrentes, atalhos, skins, acessibilidade, janela, atualizações e início com o sistema |
| 🔌 [Integrações](docs/integracoes.md) | agenda do Google e GitHub (token pessoal ou device flow) |
| 🛡️ [Segurança e dados](docs/seguranca.md) | modelo de ameaça, backup `.canto`, merge, troca de senha, arquivos em disco |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify e testes de volume |
| 📝 [CHANGELOG](CHANGELOG.md) | o que mudou em cada versão |
| 🤝 [Como contribuir](CONTRIBUTING.md) | ambiente, testes, PR e como publicar um release |
| 🤖 [Guia para agentes](AGENTS.md) | contratos e armadilhas para quem edita o código com IA |

## 🛠️ Desenvolvimento

Pré-requisitos: [Bun](https://bun.sh) ≥ 1.2, Rust estável ≥ 1.85 e as
[dependências do Tauri v2](https://v2.tauri.app/start/prerequisites/) do seu sistema.

```bash
bun install
bun run tauri dev                                        # app com hot reload
bun run lint && bun test                                 # tipos e testes da interface
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # instalador da plataforma atual
```

Todo PR roda a CI em Windows, macOS e Linux. Uma tag `v*` gera os instaladores assinados para atualização num
release em rascunho (passo a passo em [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Licença

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Feito com 🦀 Rust, ⚛️ React e ☕ para quem vive entre reuniões.</sub></div>
