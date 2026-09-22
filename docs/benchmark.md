# Benchmark: Canto e ferramentas parecidas

[← voltar ao README](../README.pt-BR.md)

Pesquisa feita em 2026-09-18 em fontes primárias (sites, repositórios e documentação oficiais, com link em cada
linha). Onde a fonte não publica um número, a tabela diz "não publicado": nada foi estimado.

Escolhidos por cobrirem, juntos, tudo o que o Canto faz: **Todoist**, **TickTick**, **Obsidian**, **Joplin**,
**Raycast**, **Microsoft PowerToys**, **CopyQ**, **Ditto**, **MeetingBar** e **Gitify**.

## Capacidades

| Produto | Tarefas+lembrete | Notas | Clipboard | Reunião (join/alerta) | GitHub issues/PRs | Hotkey global | Widget canto/always-on-top |
|---|---|---|---|---|---|---|---|
| **Canto** | ✅ | ✅ | ✅ (cifrado) | ✅ (pop-up+som+Meet) | ✅ | ✅ | ✅ |
| Todoist | ✅ | ➖ (comentários) | ❌ | ❌ | ❌ | ➖ (quick add global) | ❌ |
| TickTick | ✅ | ➖ | ❌ | ❌ | ❌ | ➖ | ❌ |
| Obsidian | ➖ (plugins) | ✅ | ❌ | ❌ | ❌ | ➖ | ❌ |
| Joplin | ✅ (to-do) | ✅ | ❌ | ❌ | ❌ | ➖ | ❌ |
| Raycast | ➖ (extensões) | ✅ (notas Pro) | ✅ | ➖ (extensão Meet) | ➖ (extensão GitHub) | ✅ | ❌ |
| PowerToys | ❌ | ❌ | ✅ (Advanced Paste) | ❌ | ❌ | ✅ | ➖ (Command Palette) |
| CopyQ | ❌ | ➖ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Ditto | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| MeetingBar | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ➖ (menu bar) |
| Gitify | ❌ | ❌ | ❌ | ❌ | ✅ (notificações) | ❌ | ➖ (menu bar) |

## Footprint declarado

| Produto | Stack | Instalador | RAM típica | Fonte |
|---|---|---|---|---|
| Canto | Tauri v2 (Rust+React) | 3,5 MB (NSIS) | ~185 MB privada | [medido abaixo](#footprint-medido) |
| Joplin | Electron | não publicado | ~250–800 MB (multi-processo) | [Fórum Joplin](https://discourse.joplinapp.org/t/joplin-ram-usage-and-too-resource-consuming/15213) |
| Obsidian | Electron | não publicado | não publicado | [obsidian.md/pricing](https://obsidian.md/pricing) |
| Raycast | nativo (Swift, macOS) + Windows beta | não publicado | não publicado | [raycast.com/pricing](https://www.raycast.com/pricing) |
| PowerToys | nativo (.NET/C++) | não publicado | não publicado | [github.com/microsoft/PowerToys](https://github.com/microsoft/PowerToys) |
| CopyQ | Qt (C++) | não publicado | não publicado | [copyq.net](https://copyq.net/) |
| Ditto | nativo (C/C++, Win32) | não publicado | não publicado | [github.com/sabrogden/Ditto](https://github.com/sabrogden/Ditto) |
| Gitify | Electron+React+Tailwind | não publicado | não publicado | [gitify.io](https://gitify.io/) |
| MeetingBar | nativo (Swift, macOS) | não publicado | não publicado | [github.com/leits/MeetingBar](https://github.com/leits/MeetingBar) |

Números "não publicado" não foram encontrados em fonte primária; nenhum foi inventado. Padrão geral confirmado: apps Electron (Joplin, Obsidian, Gitify) têm overhead de RAM relatado por usuários (Joplin 250–800MB); apps nativos/Qt/Tauri não publicam número oficial.

## Footprint medido

Medido em 2026-09-18 num Windows 11 x64, versão 0.1.0 (build desta branch).

| Item | Valor |
|---|---|
| Instalador NSIS (`Canto_0.1.0_x64-setup.exe`) | **3,5 MB** |
| Instalador MSI | 5,4 MB |
| Executável (`canto-widget.exe`) | 13,5 MB (15,3 MB antes do perfil de release com LTO + strip: −11,6%) |
| RAM, widget aberto e ocioso | ~185 MB de memória privada (6,6 MB no processo Rust; o resto é o WebView2 do sistema) |

A RAM foi medida no build de desenvolvimento (`tauri dev`), somando a árvore de processos 20 s após abrir.
O release não foi medido, mas deve ficar abaixo disso: não carrega o React de desenvolvimento nem o cliente do Vite. Para
comparar: o fórum do Joplin, em Electron, relata de 250 a 800 MB.

## Volume grande

`src-tauri/tests/scale.rs` monta um cofre com 30 mil tarefas, 5 mil notas de ~2 KB e 20 mil exclusões
sincronizadas (22 MB no disco), mais 1.000 transcrições de ~75 KB. Roda sob demanda:
`cargo test --release --test scale -- --ignored --nocapture`. Cada etapa tem um teto e o teste falha se passar dele.
Medido em 2026-09-18 no mesmo Windows 11:

| Etapa | Antes | Depois | Teto |
|---|---|---|---|
| Destrancar (Argon2id + decifrar + ler) | 80 ms | 77 ms | 3 s |
| Marcar uma tarefa (grava o cofre inteiro) | 135 ms, **na thread da janela** | 116 ms, fora dela | 500 ms |
| Tarefas de um dia | 1,8 ms | 1,7 ms | 50 ms |
| Abrir a aba de notas (sem busca) | 7,4 ms e **11 MB** enviados à janela, 5 mil cards | 0,2 ms e 110 KB, 50 cards | 150 ms |
| Busca em texto livre nas notas | 42 ms | 33 ms | 150 ms |
| Merge com outro cofre do mesmo tamanho | 71 ms | 52 ms | 1 s |
| Listar / buscar 1.000 transcrições | 203 / 290 ms | 142 / 157 ms | 1,5 / 3 s |

O que mudou: os comandos que leem ou gravam o cofre saíram da thread da janela, então gravar 22 MB não trava mais
a interface; as notas chegam em páginas de 50 com **mostrar mais**; um card aceita até 100 mil caracteres
(título, 300). Diferenças pequenas entre as colunas, fora as em negrito, são ruído de medição.

## Licença, preço e criptografia

- **Todoist**: não é open source; planos Free/Pro $5–7/mês/Business $8–10/user; Quick Add com linguagem natural. [Todoist Pricing](https://ellieplanner.com/productivity-copilot/todoist-pricing), [GetApp](https://www.getapp.com/collaboration-software/a/todoist-for-business/)
- **TickTick**: não é open source (nenhuma evidência de código aberto encontrada); Free + Premium $2,99/mês; parsing de linguagem natural para datas. [ticktick.com](https://ticktick.com/?language=en_US)
- **Obsidian**: freeware fechado, grátis para uso pessoal e comercial; Sync opcional pago com AES-256 E2E; vault é Markdown local, offline-first. [obsidian.md/pricing](https://obsidian.md/pricing)
- **Joplin**: open source (repo `laurent22/joplin`), Electron+React Native; sync opcional com E2E encryption (Nextcloud/Dropbox/Joplin Cloud). [github.com/laurent22/joplin](https://github.com/laurent22/joplin)
- **Raycast**: fechado, Free + Pro $8–10/mês; clipboard history nativo (limitado no Free); Windows em beta pública. [raycast.com/pricing](https://www.raycast.com/pricing)
- **PowerToys**: MIT, Microsoft, grátis; Advanced Paste converte/cola em formatos (inclui IA opcional local/cloud); Command Palette é launcher. [github.com/microsoft/PowerToys](https://github.com/microsoft/PowerToys), [learn.microsoft.com/.../advanced-paste](https://learn.microsoft.com/en-us/windows/powertoys/advanced-paste)
- **CopyQ**: GPLv3, grátis, Qt, Win/macOS/Linux; criptografia opcional por aba (dados não cifrados por padrão). [github.com/hluk/CopyQ](https://github.com/hluk/CopyQ), [copyq.readthedocs.io/security](https://copyq.readthedocs.io/en/latest/security.html)
- **Ditto**: GPL-3.0, grátis, Windows only; sem telemetria; sync opcional local via AES entre máquinas próprias. [github.com/sabrogden/Ditto](https://github.com/sabrogden/Ditto)
- **MeetingBar**: open source, grátis, macOS only; sem coleta de dados pessoais; +50 serviços de reunião, atalho global para entrar na próxima reunião, notificação antes do início. [github.com/leits/MeetingBar](https://github.com/leits/MeetingBar)
- **Gitify**: MIT, grátis, Electron, Win/macOS/Linux; notificações do GitHub/GitLab/Gitea/Bitbucket na menu bar. [gitify.io](https://gitify.io/)

## Lacunas encontradas (valor × custo)

| # | Feature | Quem faz | Descrição | Esforço |
|---|---|---|---|---|
| 1 | Quick add em linguagem natural ("amanhã 14h reunião") | Todoist, TickTick | Parser de data/hora embutido no campo de nova tarefa. [Todoist](https://ellieplanner.com/productivity-copilot/todoist-pricing), [TickTick](https://ticktick.com/) | P |
| 2 | Snooze de lembretes | TickTick/Todoist (adiar tarefa) | Botão "adiar 10min/1h" no pop-up de lembrete, em vez de só marcar feito/dispensar. | P |
| 3 | Entrar na reunião pelo menu da bandeja (tray), sem abrir o widget | MeetingBar | Item de menu com a próxima reunião e botão "Join" direto no ícone de bandeja. [MeetingBar](https://github.com/leits/MeetingBar) | P |
| 4 | Badge de contagem (issues/PRs, tarefas do dia) no ícone da bandeja/dock | Gitify | Contador de notificações não lidas sobre o ícone. [Gitify](https://gitify.io/) | P |
| 5 | Colar como texto puro / converter formato ao colar | PowerToys Advanced Paste | Atalho para colar sem formatação ou transformar (ex.: markdown→texto). [Microsoft Learn](https://learn.microsoft.com/en-us/windows/powertoys/advanced-paste) | P |
| 6 | Exclusão de apps sensíveis do histórico de clipboard (ex.: gerenciadores de senha) | CopyQ (ignora certas janelas), Ditto | Lista de apps/janelas ignoradas ao capturar clipboard — reduz risco de vazar senha copiada. [CopyQ security](https://copyq.readthedocs.io/en/latest/security.html) | P |
| 7 | Markdown renderizado nas notas (preview) | Obsidian, Joplin | Editor com preview de markdown (negrito, listas, links) em vez de texto plano. [Joplin](https://github.com/laurent22/joplin) | M |
| 8 | Suporte a múltiplos provedores Git (GitLab, Bitbucket, Gitea) além do GitHub | Gitify | Amplia a aba de "issues/PRs" para outros hosts. [Gitify](https://gitify.io/) | M |
| 9 | Criação de reunião ad-hoc / atalho global "entrar na próxima reunião" de qualquer app | MeetingBar | Hotkey dedicado (não só abrir o widget) que já abre o link do Meet mais próximo. [MeetingBar](https://github.com/leits/MeetingBar) | P |

### O que já entrou

| Lacuna | Como ficou no Canto |
|---|---|
| Quick add em linguagem natural | Horário no título: `Daily às 9h30`, `às 14h ligar para o banco`, `Deploy 18:00`. "2h" sozinho continua no título (é duração). |
| Adiar lembrete | **adiar 10 min** no aviso de reunião e no lembrete de tarefa; tarefa concluída ou apagada no intervalo não toca de novo. |
| Excluir apps sensíveis do clipboard | No Windows, conteúdo marcado com `ExcludeClipboardContentFromMonitorProcessing` ou `Clipboard Viewer Ignore` não é lido. |

As demais seguem abertas como ideias para próximas versões.

## Onde o Canto já sai na frente

- Único candidato que junta tarefas, notas, clipboard cifrado, agenda do Meet com alerta sonoro e GitHub PR/issues num só widget de canto — os concorrentes cobrem no máximo 1–2 dessas frentes cada.
- Cifra em repouso por padrão (Argon2id + AES-256-GCM) com senha mestra e Windows Hello opcional; CopyQ só cifra se o usuário configurar, e Ditto delega a cifra ao sync opcional.
- Zero telemetria e zero servidor — nem Todoist, TickTick nem Raycast fazem essa promessa (todos dependem de nuvem própria para sync/premium).
- Tauri (Rust+React) tende a instalador e RAM bem menores que os concorrentes Electron (Joplin, Obsidian, Gitify), embora Canto ainda não publique número medido.
- Backup .canto cifrado com merge é um recurso de portabilidade que nenhum concorrente pesquisado oferece de forma nativa e criptografada.
