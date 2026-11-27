# Troca dos componentes locais pelo Sonido

O Canto mantém seis primitivos em `src/components/` que eram cópias locais de padrões que o
[`@juninmd/sonido`](https://github.com/juninmd/sonido) já publica. Esta pasta guarda a comparação lado a lado usada
na revisão da troca.

| Componente      | Antes (canto-widget)                              | Depois (`@juninmd/sonido`)                                  |
| --------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| `Skeleton`      | cartões com `canto-shimmer` e `aria-label`         | `Skeleton` (linhas com shimmer e anúncio em região viva)     |
| `Spinner`       | SVG girando em `animate-spin`                      | `Spinner` com `size`                                         |
| `CountUp`       | rAF local com `exitDuration()`                     | `CountUp` com `duration` e `format`                          |
| `ConfirmButton` | botão + pergunta inline                            | `ConfirmButton` (mesmo fluxo, foco e Esc vêm do Sonido)      |
| `EmptyState`    | `<li>` com ícone e frase                           | `EmptyState` com título, descrição e ação (`Button`)         |
| `SubTabs`       | tablist próprio com atalhos e badges               | `Tabs` (`variant="pill"`)                                    |

A skin do widget (`data-skin`) também define o `data-theme` do Sonido em `src/lib/sonido.ts`, então padrão,
Hueco Mundo, Drácula, Glass, Aurora e claro pintam as duas camadas com o mesmo token.

## Comparações

As capturas (`antes-depois-padrao.png`, `antes-depois-hueco-mundo.png`, `confirmacao-hueco-mundo.png`, `subtabs-confirm-hueco-mundo.png`, `subtabs-confirm-padrao.png`, `subtabs-confirm-pergunta.png`) foram geradas antes do merge, em Chromium 1180×900 (`deviceScaleFactor: 2`, `fullPage`), com dados fictícios. O harness que montava os dois lados (`preview*` e as cópias em `legacy/`) foi removido depois da revisão; as imagens ficam como registro da troca.

