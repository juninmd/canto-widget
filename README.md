# Canto

Widget de desktop (Windows, macOS e Linux) que vive no **canto inferior direito** da tela:
checklist do dia, cards de notas pesquisáveis, histórico de área de transferência,
transcrições das últimas reuniões e a agenda do dia — tudo cifrado em disco, com backup
em arquivo `.canto` cifrado e início junto com o sistema.

Abas: **tarefas · notas · clipboard · reuniões · agenda · ajustes**.

| Tarefas do dia | Cards pesquisáveis |
|---|---|
| ![Checklist do dia](docs/prints/04-tarefas-do-dia.png) | ![Notas em cards](docs/prints/produtividade/3-notas-fixada.png) |
| ![Todas as abas](docs/prints/20-abas-completas.png) | ![Filtro por tag nos cards](docs/prints/produtividade/4-notas-filtro-tag.png) |

Stack: **Tauri v2 + React 19 + TypeScript + Tailwind v4**, núcleo de cofre em Rust.

## Modelo de segurança

| Item | Decisão |
|---|---|
| Derivação de chave | Argon2id (19 MiB, t=2, p=1), salt aleatório de 16 bytes por cofre |
| Senha mestra | mínimo de 4 caracteres (`MIN_SENHA`). O envelope fica em disco e sai da máquina em todo backup exportado, então a senha é atacável **offline**: nenhum limite de tentativas protege, e o Argon2id encarece cada palpite, não o total deles. Senha curta é uma escolha consciente de conveniência sobre resistência |
| Cifra | AES-256-GCM, nonce novo a cada gravação, AAD fixando o domínio (`canto.vault.v1`) |
| Chave | só existe em RAM enquanto o cofre está destrancado; zeroizada ao trancar/sair |
| Backup | o `.canto` exportado é o próprio envelope cifrado; a fusão do import acontece local, em claro, na RAM. O caminho vem do diálogo nativo aberto pelo Rust, nunca da webview |
| Escopo OAuth | opcional, só para a agenda: `calendar.events.readonly` e `openid email profile` (nome, e-mail e foto da conta; a foto só é baixada de `*.googleusercontent.com` e fica no cofre). Nenhum escopo de Drive |
| Clipboard | histórico fica **só na máquina** (`clipboard.json`, cifrado), fora do `vault.json` — nunca entra no backup |
| Transcrições | leitura restrita à pasta configurada, extensões `txt/md/vtt/srt`, nome de arquivo validado contra travessia de caminho |
| OAuth | Authorization Code + **PKCE (S256)** com loopback em `127.0.0.1:porta-efêmera` e checagem de `state` |
| Tokens | `refresh_token` guardado cifrado com a mesma chave do cofre (`drive.json`, nome mantido por compatibilidade) |
| Desfazer | remoções recentes ficam só em RAM (últimas 20) e somem ao trancar; a webview só conhece uma chave opaca, nunca reenvia o conteúdo |
| Windows Hello | opcional. A senha mestra é cifrada (AES-256-GCM) com uma chave derivada da assinatura RSA de um desafio aleatório, feita por um par de chaves do Windows Hello preso ao TPM e liberado só por rosto, digital ou PIN. `biometria.json` não serve sem esse chip e esse gesto, e nunca entra em backup. A ativação assina, grava e reabre na hora (o Windows pede o gesto duas vezes): hardware com assinatura instável é recusado ali, não descoberto na tela de bloqueio. Cofre recriado com outra senha desliga a biometria sozinho. macOS/Linux: indisponível por enquanto |
| Lembretes | o vigia de lembretes de tarefa roda em fundo e não adia o auto-lock nem regrava o cofre à toa |
| Auto-lock | 15 min sem uso deliberado do cofre e o widget se tranca sozinho, avisando na tela. Polling de fundo (clipboard, agenda) não conta como uso |
| Gravação | escrita em arquivo temporário com `fsync` antes do `rename`: queda de energia não deixa envelope pela metade |
| CSP | sem origens remotas; toda a rede sai pelo processo Rust, nunca pela webview |

Perder a senha mestra significa perder os dados: não há recuperação, nem local nem pelos backups.

| Cofre trancado | Senha errada |
|---|---|
| ![Cofre trancado](docs/prints/13-cofre-trancado.png) | ![Senha incorreta](docs/prints/14-senha-errada.png) |

## Rodando

```bash
bun install
bun run tauri dev      # desenvolvimento
bun run tauri build    # instalador da plataforma atual
```

Testes do núcleo (cripto, merge, backup/import, callback OAuth, auto-lock, gravação atômica):

```bash
cd src-tauri && cargo test
```

Testes da interface (relógio do dia, aviso de reunião, backup):

```bash
bun test
```

## Backup e outra máquina

Aba **ajustes → Backup**:

- **exportar** abre o diálogo de salvar e grava `canto-AAAA-MM-DD.canto` — o envelope já cifrado
  com a senha mestra. Pode ir para pendrive, e-mail ou qualquer nuvem: sem a senha é ilegível.
- **importar** abre o diálogo, decifra com a senha da sessão e **mescla** no cofre atual
  (last-write-wins por item, com lápides). Reimportar o mesmo arquivo não muda nada. Antes de
  mesclar, o estado anterior é guardado em `backups/`.
- Backup criado com outra senha mestra é recusado sem tocar no cofre local.

Levar para outra máquina: crie o cofre lá **com a mesma senha mestra** e importe o `.canto`.

Além disso, o widget grava sozinho **uma cópia por dia** (data UTC) em `backups/`, mantendo as
últimas 10 somando as de antes de importar. Não precisa do cofre destrancado.

Merge (coberto por `tests/merge.rs` e `tests/backup.rs`):

- item editado nos dois lados → vence a edição mais recente;
- item apagado em A e editado em B → vence quem tem o carimbo mais novo;
- merge é idempotente e comutativo nos casos acima.

## Agenda do Google (opcional)

**Build com cliente embutido:** baixe o JSON do cliente "App para computador" do Google Cloud e salve como
`src-tauri/google-oauth.json` (fica fora do git). A build embute o Client ID, e em **ajustes** basta
**entrar com o Google**. Sem o arquivo, o app pede as credenciais como abaixo.

1. No Google Cloud Console: **APIs e serviços → Credenciais → Criar credencial → ID do cliente OAuth → App para computador**.
2. Habilite a **Google Calendar API** no mesmo projeto.
3. Na aba **ajustes**, cole o *Client ID* (e o *client secret*, que o Google emite para apps desktop) e salve.
4. **entrar com o Google** abre o navegador; ao autorizar, o widget captura o code na porta loopback
   e mostra um cartão com foto, nome e e-mail da conta. **sair** revoga o token no Google e apaga a
   conta do cofre; as credenciais do cliente continuam salvas.

Quem conectou numa versão anterior (com sync no Drive): a agenda continua funcionando, mas o token
ainda carrega o escopo `drive.appdata`. **sair** e entrar de novo para ficar só com a
agenda. O `vault.enc` antigo (cifrado) segue na pasta oculta do app no Drive até ser apagado em
Drive → Configurações → Gerenciar apps → *Excluir dados ocultos do app*.

## Abas locais

- **clipboard** — o Rust observa a área de transferência, guarda os últimos itens (com dedupe,
  fixar e limite de tamanho) e permite copiar de volta. Local por definição, nunca sincronizado.
- **reuniões** — lista as transcrições da pasta configurada (padrão `~/Documents/Transcricoes`),
  limpando numeração/timestamps de `vtt`/`srt` para virar texto corrido pesquisável.
- **agenda** — eventos do dia do Google Calendar. Um minuto antes do início, o widget aparece,
  toca um aviso sonoro e abre um overlay com título, horário, local e o botão **entrar no Meet**
  quando o evento tem link. O relógio do aviso vive no App, não na aba: dispara com você em
  qualquer aba ou com o widget escondido. `Esc` fecha o overlay.

| Agenda do dia | Alerta de reunião |
|---|---|
| ![Agenda do dia](docs/prints/24-agenda.png) | ![Alerta de reunião começando](docs/prints/26-popup-alerta.png) |

## Tarefas, notas e resumo

- **Horário e lembrete** — o ⏰ da tarefa define um horário: na hora, o widget aparece com
  **lembrete de tarefa** e o botão **concluir tarefa**. Funciona em qualquer aba ou com o widget escondido.
- **Recorrência** — todo dia, dias úteis ou toda semana no mesmo dia. A tarefa do dia é criada
  quando o dia chega, com id determinístico (`<série>-<dia>`): duas máquinas geram a mesma e o merge
  não duplica. Excluir o dia de hoje não apaga a série; "não repete" encerra. "Puxar pendências"
  ignora tarefas recorrentes, que já ganham a sua própria.
- **Notas fixadas** — o alfinete leva o card para o topo; clicar numa `#tag` filtra só por ela.
- **Resumo do dia** — texto com o que foi concluído, o que ficou pendente e as reuniões, pronto
  para copiar.

| Horário e repetição | Resumo do dia | Lembrete |
|---|---|---|
| ![Detalhes da tarefa](docs/prints/produtividade/1-tarefa-horario-repeticao.png) | ![Resumo do dia](docs/prints/produtividade/2-resumo-do-dia.png) | ![Lembrete de tarefa](docs/prints/produtividade/8-lembrete-tarefa.png) |
| ![Nota fixada](docs/prints/produtividade/3-notas-fixada.png) | ![Filtro por tag](docs/prints/produtividade/4-notas-filtro-tag.png) | ![Windows Hello](docs/prints/produtividade/5-trancado-windows-hello.png) |

## Aparência e atalho

- Skins: **padrão**, **Hueco Mundo** (Bleach), **Drácula**, **Claro** e **Sistema**, que segue o tema
  claro/escuro do sistema operacional e troca sozinha quando ele muda. A clara passa AA em todo texto.
- **Atalhos** — `Alt+1`…`Alt+6` trocam de aba, `N` cria tarefa ou card, `/` busca, `Alt+L` tranca e
  `?` mostra a lista. Teclas soltas não valem dentro de campos de texto.
- Atalho global **Ctrl+Alt+Espaço** (`Cmd+Alt+Espaço` no macOS) mostra/esconde o widget.
- **tarefas** — clique duplo no título renomeia a tarefa; `Enter` confirma, `Esc` cancela.
- **notas** — no editor, `Ctrl+Enter` salva e `Esc` cancela.
- A lista de tarefas vira sozinha à meia-noite, sem precisar reabrir o widget.
- **Teclado** — as abas seguem o padrão do WAI-ARIA: `Tab` entra na barra, `←`/`→` trocam de aba,
  `Home`/`End` vão às pontas. Todo controle mostra anel de foco, e o excluir aparece também no foco.
- **Senha** — "mostrar senha" na tela do cofre; ao criar, o mínimo de 4 caracteres fica visível.
- **Agenda** — cada evento diz em texto se é **agora**, **em 1h35** ou **encerrado**, sem depender só da cor.
- **Desfazer** — excluir tarefa, card ou item do clipboard (e limpar o histórico) não pede confirmação:
  um aviso no rodapé oferece **desfazer** por 6 s, com o prazo pausado enquanto o mouse ou o foco
  estão nele. Erros ficam até serem fechados; erro de pasta de transcrições aparece na própria aba.

### Acessibilidade das skins

Critérios aplicados, com o antes/depois em [`docs/prints/ux`](docs/prints/ux):

| Regra | Fonte | Como ficou |
|---|---|---|
| Texto ≥ 4.5:1 | WCAG 2.2 — 1.4.3 | token `faint` clareado nas 3 skins; `on-accent` branco no Hueco Mundo |
| Borda de campo ≥ 3:1 | WCAG 2.2 — 1.4.11 | token `line` só para bordas de input |
| Alvo ≥ 24×24 px | WCAG 2.2 — 2.5.8 | skins, esconder, trancar, links e excluir com área de 24 px |
| Foco visível | WCAG 2.2 — 2.4.7 | `:focus-visible` global na cor de destaque |
| Abas por teclado | WAI-ARIA APG — Tabs | `TabBar` com `tablist`/`tab`/`tabpanel` e setas |
| Divulgação progressiva | NN/g | credenciais OAuth recolhidas quando a conta já está conectada |

### Movimento

Animações só onde mostram causa e efeito: item criado, item excluído, aviso chegando, troca de aba e cofre abrindo. Quadros de 0 a 200 ms, antes e depois, em [`docs/prints/ux-animacoes`](docs/prints/ux-animacoes).

| Regra | Fonte | Como ficou |
|---|---|---|
| Entrar em 150–250 ms, sair mais rápido | NN/g — Animation Duration; Card, Moran & Newell (ciclo perceptivo ~100 ms) | tokens `--animate-*` em `styles.css`: aba 150, item 200, cofre 250, saída 150 |
| Desacelerar ao entrar, acelerar ao sair | Dragicevic et al., CHI 2011; Heer & Robertson, 2007 | `--ease-entrar` / `--ease-sair` |
| Só `transform` e `opacity` | web.dev — High-performance animations | nenhuma animação de layout; auditado com `document.getAnimations()` |
| Animar só o que muda | Tversky, Morrison & Bétrancourt, 2002 | lista não reanima a cada recarga, só itens que surgiram depois dela (`useNovos`) |
| Respeitar "reduzir movimento" | WCAG 2.2 — 2.3.3; `prefers-reduced-motion` | sem deslocamento: fade de 100 ms, e exclusões somem na hora |

| padrão | Hueco Mundo | Drácula |
|---|---|---|
| ![Skin padrão](docs/prints/30-skin-padrao.png) | ![Skin Hueco Mundo](docs/prints/31-skin-hueco-mundo.png) | ![Skin Drácula](docs/prints/32-skin-dracula.png) |

Atalho global escondendo e trazendo o widget de volta:

| Ctrl+Alt+Espaço | Ctrl+Alt+Espaço de novo |
|---|---|
| ![Widget escondido](docs/prints/33-atalho-escondeu.png) | ![Widget de volta](docs/prints/34-atalho-voltou.png) |

## Janela

- Ancorada na **work area** do monitor atual (fora da barra de tarefas/dock), margem de 16 px.
- Sem decoração e fora da barra de tarefas; arraste pelo cabeçalho e redimensione pelas bordas.
- Posição e tamanho ficam em `janela.json`. Se o monitor sumir ou a janela não couber mais, ela volta ao canto.
  Em **ajustes**: "sempre na frente das outras janelas" e "voltar ao canto e ao tamanho original".
- Fechar apenas esconde. Ícone na bandeja: mostrar/esconder, trancar cofre, sair.

## Iniciar junto com o computador

Ligado por padrão na primeira execução do app instalado e controlável na aba **ajustes** ("abrir o Canto ao ligar o
computador"). A partir daí a escolha do usuário manda: o padrão não volta a ligar o que ele
desligou. Quando o sistema abre a app no boot, ela sobe com `--autostart` e fica **apenas na
bandeja**, sem pular na tela; o cofre continua trancado até a senha ser digitada.
Builds de debug (`tauri dev`) não registram nada no boot.

Só roda **uma instância**: abrir o Canto de novo com ele na bandeja apenas traz o widget para a
frente.

No Windows a entrada vive em `HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run` (valor
`Canto`); no macOS/Linux, no launcher de sessão do usuário.

## Onde ficam os arquivos

`app_data_dir` da plataforma (ex.: `%APPDATA%\com.junin.canto` no Windows):

- `vault.json` — envelope cifrado com tarefas e notas;
- `backups/*.canto` — cópias diárias e de antes de importar, cifradas (últimas 10);
- `drive.json` — credenciais OAuth da agenda, cifradas com a mesma chave;
- `clipboard.json` — histórico da área de transferência, cifrado e nunca sincronizado;
- `settings.json` — preferências não sensíveis (pasta de transcrições, skin);
- `janela.json` — posição, tamanho e "sempre no topo";
- `biometria.json` — senha mestra cifrada pela chave do Windows Hello (só se ativado);
- `autostart.json` — marca que a escolha de iniciar com o sistema já foi feita.
