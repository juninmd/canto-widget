---
title: Atalhos
---
{% include nav.html %}

# Atalhos de teclado

No macOS, `Ctrl+Alt` vira `Ctrl+Cmd` (e o atalho de mostrar/esconder é `Cmd+Shift+Espaço`). Teclas soltas
(`N`, `/`, `?`) não valem dentro de campos de texto. Aperte **`?`** no app para ver a lista.

![Lista de atalhos no app]({{ '/prints/readme/shortcuts.webp' | relative_url }})

## Globais (funcionam com o widget escondido)

| Atalho | O que faz |
|---|---|
| `Ctrl+Alt+Espaço` (`Cmd+Shift+Espaço`) | mostra e esconde o widget |
| `Ctrl+Alt+M` (`Ctrl+Cmd+M`) | entra na próxima reunião com Meet; se o atalho estiver ocupado, o Canto usa `Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M`) |
| `Ctrl+Alt+V` (`Ctrl+Cmd+V`) | tira a formatação do clipboard atual (nunca cola sozinho: depois é só `Ctrl+V`) |
| `Ctrl+Alt+N` (`Ctrl+Cmd+N`) | abre a **captura rápida**, uma janelinha para criar tarefa ou nota |

## Dentro do app

| Atalho | O que faz |
|---|---|
| `Alt+1` … `Alt+9` | troca para a 1ª…9ª aba visível (segue a ordem da barra) |
| `Ctrl+K` | busca global em tarefas, notas, agenda, transcrições e clipboard |
| `Ctrl+Shift+P` (`Cmd+Shift+P`) | paleta de comandos: todas as ações pelo nome (busca aproximada, sem acento) |
| `N` | cria tarefa ou nota na aba atual |
| `/` | busca na aba atual |
| `F11` | tela cheia (modo Maximizado) |
| `Alt+L` | tranca o cofre |
| `Alt+P` | modo privacidade (borra clipboard e notas) |
| `?` | lista de atalhos |
| `Esc` | fecha avisos, editores e diálogos |

## Em abas específicas

| Onde | Atalho | O que faz |
|---|---|---|
| Tarefas | clique duplo no título | renomeia; `Enter` confirma, `Esc` cancela |
| Tarefas | `Alt+↑` / `Alt+↓` | move a tarefa na lista |
| Notas | `Ctrl+Enter` / `Esc` | salva / cancela a edição (`Esc` com alterações pergunta se descarta) |
| Notas | `#`, `-`, `[ ]`, <code>```</code> ao digitar | atalhos de markdown do editor |
| Notas | `Ctrl`+clique num link | abre no navegador (só http/https) |
| Barra de abas | `←` `→` `Home` `End` | navegam entre abas (padrão WAI-ARIA) |

## Digitando uma tarefa

`Diário às 9:30` define o lembrete; `!alta`, `!média` ou `!baixa` (ou `!high`) define a prioridade. Cole uma lista
(uma linha por item, com ou sem `-`, `[ ]` ou `1.`) no campo vazio e cada linha vira uma tarefa.
