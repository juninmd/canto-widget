# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Corrigido

- **Popup não rouba mais o foco**: o aviso aparece sem ativar a janela, então não tira o foco de quem está jogando
  em tela cheia ou digitando em outro app. Os botões continuam funcionando com o mouse.
- **Popup de aviso em janela própria**: reunião, lembrete de tarefa, instabilidade de serviço e modelo novo agora
  aparecem numa janela separada no canto da tela. Antes o aviso abria o Canto inteiro por cima, mesmo com ele
  minimizado; agora o widget continua minimizado e, com o cofre trancado, o popup aparece do mesmo jeito (concluir
  tarefa pede o cofre aberto; adiar, fechar e entrar na reunião não).

### Adicionado

- **Radar de revisão**: em "Revisão pedida a mim" o pedido mais antigo vem primeiro, a espera aparece em horas até 48 h e fica vermelha quando passa de 48 h. "adiar 4 h" esconde o item, com um contador para trazê-lo de volta; o adiamento fica nesta máquina, fora do cofre.
- **Aviso de modelo novo no popup**: quando um modelo entra no top 10 da aba Modelos IA (ou sobe nele), o
  Canto abre o mesmo popup da agenda, com o nome, o provedor e a posição, e um botão para abrir a aba Modelos.
  Antes era só uma notificação do sistema. Mais de 3 mudanças de uma vez viram um único aviso-resumo.

- **Aba Modelos IA** (visível por padrão, **sem chave de API**): ranking de LLMs pelo **Intelligence Index**
  da [Artificial Analysis](https://artificialanalysis.ai), lido da página pública de leaderboard, com barra proporcional à nota, criador, preço
  (`$x,xx / 1M tokens`, média 3:1 entrada/saída) e velocidade (`tok/s`). O botão de ordem alterna inteligência →
  preço (mais barato primeiro) → velocidade (mais rápido primeiro); mostra os 50 primeiros. Não pede conta nem chave. Para
  não sobrecarregar a página, o Canto busca no máximo uma vez a cada 3 h, mesmo no
  "atualizar", e diz quando a próxima busca é permitida. O sino 🔔 (desligado por padrão) avisa quando um modelo
  **entra no top 10** ou **sobe dentro dele**, conferindo a cada 6 h com o cofre aberto, mesmo com a janela
  escondida; a primeira leitura só registra, sem avisar. Muitas mudanças de uma vez viram um aviso só. Selos "novo" e "subiu" ficam por 7 dias.
- **Timer de foco por tarefa**: cada tarefa ganha **estimativa** (15, 25, 45, 60 ou 90 min, no painel ⏰) e um
  botão ▶ que aparece ao passar o mouse. Uma barra fixa sob qualquer aba mostra o relógio contra a estimativa, com
  **Pausar** e **Concluir**; a linha da tarefa mostra "gasto/estimado" e fica vermelha ao estourar, e um aviso
  (desligável em Ajustes → Foco) sugere uma pausa. O tempo é contado pelo relógio e gravado no cofre a cada minuto
  e ao pausar, em segundo plano: um timer esquecido ligado não impede o bloqueio automático. Tarefas recorrentes
  herdam a estimativa e começam o dia com o tempo zerado. Campos novos `estimate_min` e `tracked_secs` na tarefa,
  ambos com valor padrão para cofres antigos.
- **Agenda em blocos do dia**: um seletor **Lista | Dia** na Agenda mostra o dia por hora, com as reuniões e as
  tarefas com horário (do tamanho da estimativa, 30 min sem ela); tarefa que atropela reunião ou outra tarefa
  ganha o selo "conflita". As tarefas sem horário ficam acima da grade e um clique agenda a tarefa no primeiro
  horário livre (o horário vira o lembrete dela). A lista continua sendo o padrão.
- **Aba Atividade** (oculta por padrão, desligada até você ativar): registra só o nome do aplicativo em foco, com
  detecção de ausência (2 min sem teclado ou mouse), e mostra linha do tempo por aplicativo, tempo por categoria
  (código, reuniões, documentos, comunicação, navegador), os mais usados e os últimos 7 dias. Os dados ficam num
  arquivo selado local (`atividade.json`, 35 dias), fora do backup e da sincronização, e acompanham a troca da senha
  mestra; Ajustes → Atividade liga, desliga e apaga o histórico. Windows usa a API do sistema; macOS, `lsappinfo` e
  `ioreg`; Linux, `xprop` (X11, com `xprintidle` opcional). No Wayland a coleta fica indisponível.
- **Resumos com PRs/MRs encerrados**: o resumo do dia e o relatório da semana e do mês listam também os PRs/MRs
  seus **encerrados sem merge** (GitHub e GitLab), ao lado dos abertos, mergeados e revisados/aprovados, e ganham o
  **tempo focado** (por tarefa no resumo do dia, total no relatório).

- **Alertas da Magalu Cloud**: o status page da Magalu (Site24x7) não tem indicador ao vivo, então o estado atual
  sai do feed, pelo último item de cada componente ("Block Storage - Degraded Performance"). O card mostra
  "instável"/"fora do ar" com os componentes afetados e ganha o sino 🔔 para avisar quando algo piora.
- **Prioridade direto na tarefa**: `!alta`, `!média` ou `!baixa` (ou `!1`, `!2`, `!3`) no texto da nova tarefa
  definem a prioridade; a bolinha na linha agora é um botão que alterna alta → média → baixa → sem. Antes a
  prioridade só existia escondida no ⏰ da tarefa.
- **Notas renderizadas na lista**: o card mostra o começo da nota formatado (títulos, checklists, código, links,
  listas numeradas) em vez do markdown cru; nada de HTML cru, e o texto longo esmaece no fim do card.
- **Editor de notas visual (WYSIWYG)**: as abas "escrever"/"visualizar" deram lugar a um editor que já mostra a
  nota formatada, com uma barra compacta (negrito, itálico, código, título, lista, lista numerada, checklist, bloco
  de código, link e anexar imagem), atalhos `Ctrl+B`/`I`/`E`, `Ctrl+K` para link e os atalhos de markdown ao
  digitar (`# `, `- `, `[ ] `, ` ``` `). Checklists marcam direto no texto, blocos de código mantêm o realce e as
  imagens aparecem no lugar. O botão **MD** mostra o markdown cru para editar à mão. A nota continua salva em
  markdown (busca, card, sync, backup e exportação `.md` não mudam), e abrir e salvar sem editar não altera nem
  um caractere; o que o editor não conhece (tabelas, HTML) fica como texto. Links só abrem com `Ctrl`+clique e
  só http(s); HTML colado passa pelo filtro do editor (sem estilos, scripts ou imagens remotas).
- **Relatório da semana e do mês**: o resumo ganhou um seletor **hoje / semana / mês**. A semana vai de segunda
  até hoje e o mês do dia 1º até hoje; o relatório sai em markdown, com panorama, uma linha por dia útil (na
  semana), tarefas concluídas, notas criadas ou editadas, reuniões agrupadas por título com o tempo total e os
  PRs/MRs abertos, mergeados e revisados no período, com link. A agenda do período é paginada (até 1.000
  eventos) e listas longas dizem quantos itens ficaram de fora. Como o Canto não guarda a hora da conclusão, uma
  tarefa concluída conta no dia a que pertence.
- **Resumo do dia mais completo**: além dos PRs/MRs abertos, lista os **mergeados** e os **revisados/aprovados
  por mim** no dia (GitHub e GitLab), e o título das reuniões traz o **tempo total** (sobreposições contam uma
  vez; eventos de dia inteiro ficam fora).
- **Próximo tempo livre na agenda**: no topo da aba, "próximo tempo livre: 14:30–16:00 (1 h 30 min)",
  "livre agora até 15:00" ou "livre pelo resto do dia". Conta só janelas de 15 min ou mais até as 19:00 (depois
  disso, até a meia-noite) e ignora eventos de dia inteiro e convites que você recusou.
- **Conflito na agenda**: eventos com horário que se sobrepõem ganham o selo "conflito", com o título do outro
  evento na dica e no nome acessível. Eventos que só encostam (um termina quando o outro começa) não contam.
- **Paleta de comandos** (`Ctrl+Shift+P`, `Cmd+Shift+P` no macOS): todas as ações do app pelo nome, com busca
  aproximada que ignora acentos — ir para cada aba visível, nova tarefa, nova nota, busca global, entrar na
  próxima reunião, copiar o resumo do dia, abrir ajustes, trocar de tema, modo privacidade, tela cheia, esconder e
  trancar o cofre. Setas escolhem, `Enter` executa, `Esc` fecha e devolve o foco. `Ctrl+K` segue sendo a busca
  global de conteúdo. Aparece na ajuda de atalhos (`?`).
- **Modo não perturbe**: em Ajustes (30 min, 1 h, 2 h, até amanhã às 8h ou até desligar), pelo tray (1 h) ou pela paleta de comandos,
  silencia avisos de reunião, lembretes de tarefa, alertas de status e toda notificação do sistema. Uma lua na
  barra do topo mostra até quando vai; um clique desliga. O estado fica em `nao_perturbe.json`, fora do cofre,
  sobrevive a reinício e expira sozinho.
- **Imagens nas notas**: cole (Ctrl+V), arraste ou use "anexar imagem" no editor; ela aparece no meio do
  texto. PNG, JPEG, GIF ou WebP de até 2 MB, cada uma cifrada num arquivo próprio em
  `note-images/` (o cofre não fica mais pesado de gravar). Acompanham a troca de senha; **não entram no backup
  `.canto` nem na pasta sincronizada**, então a nota restaurada em outra máquina mostra "imagem indisponível".
  Imagens que nenhuma nota usa mais são apagadas depois de um dia.
- **CI no card do PR**: na aba GitHub, cada PR mostra um selo com o CI do último commit (passou, falhou,
  rodando ou sem CI), juntando GitHub Actions/check runs e commit statuses. São até 20 PRs por vez, com cache
  por commit na memória (1 min enquanto roda, 15 min quando termina) para não gastar o limite da API; o link
  "ver CI" segue para os PRs que ficaram de fora. O selo de CI pede as permissões *Checks* e *Commit statuses*
  (leitura) no token. Só GitHub por enquanto.
- **Aviso de revisão pedida**: com o cofre aberto e o GitHub conectado, uma notificação do sistema avisa
  quando alguém pede sua revisão ("Revisão pedida: dono/repo#12 título"), conferido a cada 5 min. A primeira
  leitura só memoriza o que já estava lá. Vem ligado; desliga em Ajustes → Revisões no GitHub.
- **Foto dos convidados**: nos detalhes do evento, colegas do Google Workspace aparecem com a foto do
  diretório (People API, escopo `directory.readonly`); quem não tem foto, contas pessoais e convidados de fora
  seguem com as iniciais. As fotos ficam só na memória e somem ao trancar o cofre. Quem já tinha conectado o
  Google vê um aviso para sair e entrar de novo (o escopo é novo).
- **Convidados em mini cards**: nos detalhes do evento, cada convidado vira um card numa grade de dois, com
  avatar, resposta (ícone e palavra: aceitou, talvez, recusou, aguardando), etiquetas de organizador, opcional e
  você; quem recusou aparece esmaecido. "Aceitou" usa a cor de sucesso da skin, não o destaque (que é vermelho na
  Hueco Mundo).
- **Status API em mini cards**: grade de dois por linha, cada card com a cor e a palavra do estado (operacional,
  instável, fora do ar, manutenção, incidente recente, sem resposta), o último incidente e a descrição ao vivo;
  o cabeçalho resume quantos estão com problema. Clicar abre o histórico do serviço na largura toda.
- **Aviso quando um serviço cai**: o sino de cada card (serviços com status ao vivo do Statuspage) liga uma
  notificação do sistema quando o serviço fica instável ou fora do ar, inclusive com o cofre trancado. A escolha
  fica em `status_alertas.json`, fora do cofre (é só a lista de páginas públicas a consultar, a cada 3 min).
- **Checklist nas notas**: linhas `- [ ]` e `- [x]` viram caixas de seleção na visualização; marcar uma
  atualiza o texto da nota.
- **Blocos de código nas notas**: trechos entre ```` ``` ```` aparecem como código, sem interpretar o
  markdown de dentro, e com cores para js/ts, rust, python, shell, sql, json, go e java/c#/c++.
- **PR parado** nas abas GitHub e GitLab: PR/MR sem atividade há 7 dias ou mais ganha o selo
  **parado há N d** (a revisão pedida continua mostrando **aguardando**).
- **Agenda: quem vai e quem não vai.** Cada evento mostra um selo com a sua resposta (aceitou, talvez, recusou,
  sem resposta). Os detalhes trazem a lista de convidados com avatar de iniciais, a resposta de cada um
  (organizador e opcionais marcados) e o placar sim/não/talvez/aguardando. Listas enormes param em 50 nomes.
- **Status API: Datadog, Azion e Akamai** entram na lista, com histórico e estado ao vivo (Statuspage).
- **Idioma: português ou inglês**, em Ajustes > Idioma. "Automático (sistema)" é o padrão: português para
  sistemas em `pt-*`, inglês para os demais. A troca recarrega a interface na hora; notificações do sistema e o
  menu da bandeja acompanham o idioma. Mensagens de erro vindas do núcleo seguem em português.

### Alterado

- **Modelo da lista abre a página dele**: clicar num modelo da aba Modelos IA abre a página do modelo na
  Artificial Analysis, no navegador.
- **Dia: eventos que se sobrepõem ficam lado a lado**, dividindo a largura em colunas, em vez de um por cima do
  outro. Um bloco sem sobreposição continua com a largura inteira.
- **Popup de aviso volta ao tamanho cheio** (cobre o widget, como antes), mantendo o desenho novo: mini cards
  no topo, detalhe do aviso escolhido e os botões embaixo.
- **Reuniões virou uma sub-aba da Agenda**, ao lado de Lista e Dia. A aba própria saiu da barra, que ganha
  espaço; as notas e transcrições são as mesmas. A escolha da sub-aba fica salva, como a de Lista/Dia. Quem
  tinha a aba Reuniões escondida não precisa fazer nada: a preferência antiga é ignorada. Os atalhos
  `Alt+N` das abas depois de Clipboard andam uma posição (Agenda passa de `Alt+5` a `Alt+4`, e assim por diante).
- **Popup de avisos com tudo que está pendente**: reuniões, tarefas, serviços fora do ar e modelos novos
  aparecem juntos, como mini cards no topo (o mais grave primeiro), e o card escolhido abre em detalhe:
  estado e desde quando para um serviço, local, convidados e anexos para uma reunião. O popup deixou de
  cobrir o widget inteiro: é um cartão no topo, mais baixo. Fechar, adiar ou silenciar afeta só o aviso
  escolhido (serviços ganharam "silenciar", que para de vigiar aquele serviço).
- **Dependências atualizadas**: Tauri 2.12 (runtime, wry 0.57, plugins), `feed-rs` 3, `windows` 0.62 (a mesma
  versão do Tauri; `hello.rs` passa a usar `join()` no lugar do `get()` removido), `marked` 18, Vite 8.3.1 e
  Playwright 1.63; o resto do lockfile foi para as últimas versões compatíveis.
- **Base para tradução**: todos os textos da interface saíram dos componentes para um catálogo
  (`src/i18n/pt-BR/`), com datas e números formatados por uma única configuração de idioma. Nada muda para quem
  usa; o próximo idioma é um arquivo novo por área.
- **Segurança**: a CSP de produção não aceita mais estilos inline (`style-src 'self'`); as cores dinâmicas já
  usam CSSOM, que a política permite.
- **Status API com estado ao vivo**: serviços hospedados no Statuspage (Claude, GitHub, Cloudflare, Vercel, npm,
  PyPI, Supabase, DigitalOcean...) mostram o estado atual ("agora: Partial System Outage") e só ficam em destaque
  enquanto o problema está aberto; os demais seguem a regra de incidente nas últimas 24 h.
- **Reordenar tarefas com filtro de prioridade**: o puxador continua disponível com o filtro ativo; só as tarefas
  visíveis trocam de lugar e as ocultas mantêm a posição.
- **Testes**: smoke tests de ponta a ponta (`bun run e2e`) rodam a interface real no Chromium com o IPC do Tauri
  simulado — abas, nova tarefa, cofre trancado e Status API — e ganharam um job próprio na CI.
- **Status API**: os serviços aparecem ordenados pela hora do último incidente (mais recente primeiro; sem
  incidentes no fim) e os que tiveram incidente nas últimas 24 h ganham destaque em vermelho, com ponto pulsante.

### Corrigido

- **Popup de reunião sem texto cortado**: a descrição aparece inteira (rola dentro da caixa se passar do espaço) e
  os convidados são listados com a resposta de cada um, em vez de só o resumo e o corte em 4 linhas.

- **Popup de reunião com detalhes e convidados**: o aviso disparado pelo Canto em segundo plano chegava sem
  descrição, organizador e convidados (o cache era reduzido mesmo com o cofre aberto). Agora o evento completo
  é mantido enquanto o cofre está aberto e só é reduzido ao bloquear.

- **Revisão de bugs**:
  - `transcript_read` só lê arquivos de transcrição; antes lia qualquer arquivo da pasta escolhida.
  - Uma gravação do cofre que falha não deixa mais a mudança só na memória (ex.: excluir com disco cheio).
  - "Bloquear cofre" na bandeja agora mostra a tela de bloqueio na hora.
  - Histórico da área de transferência: limpar, fixar ou excluir não é mais desfeito pelo monitor de cópias.
  - Desconectar Google ou GitHub não é mais desfeito por uma renovação de token em andamento; trocar de conta no
    GitHub não mostra itens da conta anterior.
  - Dois alertas ao mesmo tempo entram em fila em vez de o segundo apagar o primeiro.
  - Um lembrete de tarefa não toca de novo depois de bloquear e desbloquear o cofre.
  - O login do Google não trava nem falha com conexões extras do navegador ao endereço local.
  - Falhas temporárias de rede não deixam mais os convidados sem foto até o bloqueio.
  - O resumo do GitLab só conta como mesclados os MRs mesclados no período.
  - Esc no seletor de vínculo fecha só o seletor, sem descartar a nota.
  - A busca global aplica a consulta mesmo quando a aba já está aberta.
  - Apagar o campo "máx. fixados" não salva mais 1.
  - O resumo do dia ignora reuniões recusadas.
  - Ligar dois alertas de status rapidamente não perde o primeiro.
  - Alerta de Status API agora abre o aviso na janela (com link para a página de status), além da notificação do
    sistema: antes só havia a notificação, que o modo foco do sistema engolia sem deixar rastro.
- **Tarefa em janela estreita**: com horário, ↻, subtarefas e PR na mesma linha, o título ficava com ~60 px na
  janela mínima (360 px), uma palavra por linha. Esses selos agora ficam numa linha menor abaixo do título.
- **Título longo de tarefa** não some mais cortado com reticências: quebra em quantas linhas precisar.
- **Imagens nas notas** só apareciam no modo "pré-visualizar" do editor: o card mostrava "[imagem]" e o modo
  "escrever" só o código `![](canto-img:…)`. Agora o card e o editor mostram as imagens como miniaturas.
- **Resumo do dia longo** não empurra mais os botões "copiar resumo" e "voltar" para fora da janela: o texto
  rola dentro do painel.
- **Atalho de reunião ocupado**: quando outro aplicativo já registrou `Ctrl+Alt+M`, o Canto passa a usar
  `Ctrl+Alt+Shift+M` automaticamente, sem deixar a ação de entrar na próxima reunião indisponível.
- **Aviso de reunião com o cofre trancado**: o Canto parava de avisar ao trancar, porque o token do Google só
  existe com o cofre aberto. Agora guarda em memória as reuniões das próximas 12 h (só título, horário, local e
  link; sem descrição nem convidados) e continua avisando a partir delas.
- Releases agora seguem Conventional Commits (`fix`/patch, `feat`/minor e breaking/major), ignoram commits sem
  impacto de versão e geram os quatro instaladores em paralelo, com cache Rust por alvo, antes de montar o
  manifesto do updater.
- **Lembretes perto da meia-noite e na mudança de horário de verão**: um lembrete com antecedência que cai no dia
  seguinte (tarefa às 00:10, aviso às 23:40) e uma tarefa às 23:59 não se perdem mais na virada do dia, e o
  salto do relógio não pula os lembretes da hora que "some".
- **Notas: o rascunho não some ao trocar de aba** (Alt+número funciona mesmo digitando). Trancar o cofre ainda
  descarta o rascunho, de propósito.
- **Busca de notas e lista de tarefas**: uma resposta atrasada (busca anterior, ou o dia de ontem logo depois da
  meia-noite) não substitui mais o resultado atual.
- **Adição rápida entende "at 9:30", "9:30am", "2 pm" e "11:15 p.m."**; "5 amigos" continua sem virar horário.
- **Agenda: reuniões recusadas somem** da lista e não disparam mais o aviso de reunião.
- **Desfazer da lixeira**: se a restauração falhar, o item continua disponível para tentar de novo.
- **Troca de senha mestra**: se um arquivo ficar pendente depois que o cofre já foi selado com a senha nova, o
  Canto confirma a troca (em vez de dizer que falhou) e pede para trancar e destrancar para concluir.
- **Sincronização entre máquinas**: numa edição com o mesmo horário as duas máquinas passam a ficar com a mesma
  versão, e uma edição local não perde mais para uma cópia vinda de um computador com o relógio adiantado.
- **GitHub/GitLab**: um erro 503 com `Retry-After` não é mais tratado como limite de requisições esgotado.
- **Histórico da área de transferência**: uma imagem copiada é verificada uma vez, não a cada 1,2 s enquanto
  continua copiada.
- **Status API: Magalu Cloud não aparece mais com problema à toa.** O feed publica cada mudança de estado
  ("Block Storage - Operational"); agora só conta a atualização mais recente de cada componente, e
  "operacional/resolvido" não é incidente.
- **macOS: o Canto não aparece mais no Dock** nem no Cmd+Tab, nem ao abrir. O pacote agora se declara app de
  barra de menus (`LSUIElement`), e o widget vive só no ícone da barra de menus, como no Windows.
- **Lembretes de tarefa com o widget escondido** (sobretudo no macOS): passam a ser disparados pelo núcleo em Rust,
  como o aviso de reunião, em vez do relógio do webview, que é congelado com a janela oculta.
- **macOS: aviso de reunião não aparecia** com o widget escondido na bandeja. O relógio do aviso rodava no
  webview, que o macOS congela com a janela oculta (e o App Nap atrasa). Agora o núcleo em Rust confere a agenda a
  cada 20 s e dispara a notificação do sistema e o aviso, sem duplicar com a interface.
- **Reordenar tarefas** voltou a funcionar no Windows e no macOS: o arraste agora usa eventos de ponteiro (o
  arrastar-e-soltar HTML5 era engolido pelo webview), com realce do destino, **Esc** para cancelar e **↑/↓** no
  puxador para mover pelo teclado.
- **macOS**: atalhos globais trocados para não colidir com o sistema — **Cmd+Shift+Espaço** (mostrar/esconder),
  **Ctrl+Cmd+M** (entrar na reunião) e **Ctrl+Cmd+V** (colar como texto puro); busca global com **Cmd+K** e
  rótulos com ⌘; o widget não aparece mais no Dock/Cmd+Tab e abre por cima de apps em tela cheia.
- **Segurança**: o webview perdeu as permissões diretas de leitura/escrita do clipboard e de abrir URLs (tudo
  passa pelos comandos em Rust); CSP de produção sem `unsafe-inline` em scripts nem o websocket do Vite; o
  repositório/projeto enviado para checar CI de um PR/MR é validado antes de montar a URL autenticada.
- **Textos em pt-BR**: mensagens de erro vindas do núcleo em Rust (cofre, GitHub, GitLab, biometria, lembretes,
  transcrições) e o atalho no menu da bandeja agora têm acentuação correta ("cofre já existe", "horário
  inválido", "Ctrl+Alt+Espaço"); os READMEs traduzidos citam o novo atalho do macOS.
- Releases em `main` agora recebem uma tag por commit elegível, notas geradas automaticamente e publicação após a
  verificação dos instaladores assinados e do manifesto de atualização. O rascunho `v0.3.0` é retomado.

## [0.3.0] - 2026-09-22

### Adicionado

- **Aba Status API**: histórico de incidentes (RSS/Atom) de Claude, GitHub, OpenAI/Codex, AWS, Google Cloud,
  Magalu Cloud, Cloudflare, Vercel, npm, crates.io, PyPI, Supabase e DigitalOcean, sem login nem token; cada
  serviço num acordeão (um aberto por vez), cache de 5 min e botão **atualizar**. Oculta por padrão, como o
  GitLab — ative em Ajustes > Abas visíveis.

### Corrigido

- **Rolagem no resumo do dia**: o resumo do dia agora fica delimitado à altura do painel e rola verticalmente com barra de scroll quando o texto é longo, sem sobrepor os botões de copiar e voltar.
- **Reordenação de tarefas**: corrigido o arrastar e soltar de tarefas com `dataTransfer` compatível com webview/Chromium, realce visual no item alvo e atualização otimista instantânea na lista.

## [0.2.0] - 2026-09-20

### Adicionado

- **Colar como texto puro**: atalho global **Ctrl+Alt+V** (`Cmd+Alt+V` no macOS) tira HTML/RTF da área de
  transferência atual, sem simular um Ctrl+V em outro app.
- **Mais tipos no clipboard**: JSON e e-mail/telefone reconhecidos, além de link, cor e código; filtro por
  tipo na aba.
- **Limite de itens fixados** no clipboard, configurável (100 por padrão) — antes não havia limite nenhum.
- **Entrar na próxima reunião pela bandeja**: item de menu que mostra a próxima reunião com Meet e entra nela
  direto, sem abrir o widget; atalho global **Ctrl+Alt+M** (`Cmd+Alt+M` no macOS) faz o mesmo.
- **Indicador no ícone**: soma tarefas de hoje ainda não concluídas com PRs/MRs com revisão pedida a você
  (GitHub + GitLab); número exato no Dock do macOS, ponto vermelho no Windows/Linux.
- **Detalhes do evento na agenda**: clicar num evento mostra quem organizou, quem criou, quantos convidados,
  a descrição e os anexos, como as anotações do Gemini, com **abrir no Calendar**. O aviso de reunião traz o
  mesmo.
- **Filtros e paginação na aba GitHub**: busca por texto ou qualificador (`repo:`, `label:`), botões
  **tudo · PRs · issues** e **mostrar mais** em cada lista.
- **Anotações e transcrições do Gemini na aba Reuniões**: os documentos que o Gemini anexa às reuniões dos
  últimos 14 dias aparecem acima dos arquivos da pasta e abrem no navegador.
- **Carregamento visível**: agenda, GitHub e transcrições mostram cartões de espera em vez de uma área vazia.
- **GitLab e GitLab self-hosted**: nova aba (ative em Ajustes → Abas visíveis) com revisão pedida, atribuídos, MRs e issues que você abriu, com
  endereço da instância e token `read_api` cifrados no cofre.
- **Ordenação** nas abas GitHub e GitLab: por atualização, criação ou comentários (só GitHub), crescente ou
  decrescente.
- **Cache e limite de requisições**: as listas ficam 5 min na memória e o Canto para antes de esgotar a cota da
  API, mostrando a última cópia e quando chegam dados novos.
- **PRs/MRs abertos hoje** no resumo do dia.
- **Abas visíveis** em Ajustes: esconda as abas que você não usa; `Alt+1`… seguem as que ficaram.
- **Antecedência do lembrete de tarefa**, em Ajustes → Lembretes (na hora, 5, 10, 15 ou 30 min antes).
- **Vincular tarefa a um PR/MR**: link no ⏰ da tarefa, com ícone na linha para abrir direto.
- **Subtarefas**: checklist dentro do ⏰ da tarefa, com contagem `feitas/total` na linha.
- **Prioridade da tarefa** (alta/média/baixa) com bolinha na linha e filtro acima da lista.
- **Arrastar para reordenar** as tarefas do dia pela alça (⠿) que aparece ao passar o mouse.
- **Recorrência mensal e por dias específicos da semana** para tarefas, além de todo dia/dias úteis/semanal.
- **Visualizar markdown na nota**: alternar entre escrever e visualizar renderiza negrito, itálico, código,
  listas e links (só `http(s)://` abrem no navegador).
- **Destaque do termo buscado** dentro do título e do corpo dos cards de notas encontrados.
- **Vincular nota a uma tarefa ou evento** da agenda: a nota ganha um selo que leva direto para a aba
  correspondente.
- **Exportar nota como .md**: ícone de download no card, com diálogo nativo de salvar.
- **Status do CI/pipeline no card do PR/MR**: botão "ver CI" busca sob demanda (GitHub: checks combinados do
  commit; GitLab: pipeline da MR) e mostra passou/falhou/rodando/sem CI.
- **Tempo aguardando revisão**: na lista "revisão pedida a mim", cada PR/MR mostra há quantos dias foi aberto,
  em vermelho a partir de 3 dias.
- **Auto-trava configurável**: em Ajustes → Segurança, escolha 5, 15 (padrão), 30 ou 60 minutos sem uso antes
  do cofre trancar sozinho.
- **Registro local dos últimos desbloqueios** (até 20), com data/hora e se foi por senha ou Windows Hello, em
  Ajustes → Segurança.
- **Modo privacidade**: `Alt+P` ou o ícone de olho no topo borra o texto do clipboard e das notas na tela sem
  apagar nada, para compartilhar a tela sem se preocupar.
- **Destravar com Touch ID no macOS**: mesmo fluxo do Windows Hello, senha mestra guardada no Chaveiro do
  sistema protegida por biometria. Melhor esforço — implementado e revisado contra a documentação do
  `security-framework`, mas não compilado nem testado nesta máquina (sem Mac disponível); precisa da CI de
  macOS para confirmar.
- **Busca global entre abas** (`Ctrl+K`): busca ao mesmo tempo em tarefas de hoje, notas e clipboard; escolher
  um resultado troca de aba com o texto já buscado. Tarefas de outros dias ficam fora da busca — o app ainda
  não navega entre dias.
- **Tamanho da interface** (Ajustes → Aparência): compacta, padrão ou confortável, escalando texto e espaçamento
  juntos.
- **Boas-vindas na primeira execução**: ao criar o cofre pela primeira vez, uma tela resume os atalhos
  essenciais. Aparece uma única vez — destrancar depois nunca mostra de novo.
- **Pasta sincronizada com merge automático** (Ajustes → Pasta sincronizada): aponte para uma pasta do
  Dropbox/OneDrive/Syncthing e o Canto cuida do resto — exporta a cada alteração e mescla o que chegar de
  outra máquina ao destrancar e a cada ~5 min, sem precisar de exportar/importar manual.
- **Anotações do Gemini no resumo do dia**: quando uma reunião tem anotações do Gemini anexadas, o resumo
  leva o link delas na mesma linha da reunião.
- **Manifestos para winget e Homebrew** em `packaging/`, prontos para publicar (não publicados: exige PR nos
  repositórios de cada gerenciador). O de Flatpak fica bloqueado — o gerador de dependências JS do Flathub não
  lê `bun.lock`; detalhes em `packaging/README.md`.

### Alterado

- Dependências nas versões mais recentes: React 19.3, Vite 8 (Rolldown), TypeScript 7 (compilador nativo),
  `aes-gcm` 0.11, `argon2` 0.6, `sha2` 0.11, `rand` 0.10 e `reqwest` 0.13. Cofres gravados pela 0.1.0 continuam
  abrindo (há um teste com um cofre real dessa versão), e o app deixou de carregar duas cópias do cliente HTTP.
  Compilar exige Rust 1.85.
- `AppState::mutate`/`mutate_if`/`in_background` (`src-tauri/src/vault.rs`) passam a compartilhar um único
  helper para a sequência trava → muda → grava → destrava → sincroniza, em vez de repeti-la cada um por conta
  própria — essa repetição foi a causa de 2 dos últimos 3 bugs de concorrência do cofre. Testes de regressão
  novos cobrem os dois cenários.
- Novo hook `useLatestRequest` (`src/lib/`) descarta a resposta de uma busca desatualizada; unifica o padrão
  que a busca global já tinha e o GitHub/GitLab reimplementava, e passa a proteger também clipboard e
  transcrições, que não tinham essa proteção e podiam mostrar um resultado antigo por cima de um mais novo.
- Trait `Forge` (`src-tauri/src/forge.rs`) unifica a orquestração de cache que as abas GitHub e GitLab
  reimplementavam quase idêntica; cada uma vira um adaptador fino (token vs. conta), sem mudar nenhum
  comando ou nome de IPC.
- `AppState::sealed`/`save_sealed` (`src-tauri/src/vault.rs`) substituem a leitura/gravação de config
  cifrada hand-copiada três vezes (Drive, GitHub, GitLab); `DriveConfig` migrou de `vault.rs` para
  `cmd_drive.rs`, ao lado de `GithubConfig`/`GitlabConfig` nos seus próprios módulos.
- Os quatro watchers de fundo (`watch_idle`, `watch_window_state`, `watch_backup`, `watch_sync`), antes soltos
  em `lib.rs`, agora moram juntos em `src-tauri/src/background.rs`, com os intervalos de polling nomeados;
  `lib.rs` passa a só chamar `background::start`.

## [0.1.0] - 2026-09-18

Primeiro release público.

### Adicionado

- **Atualização automática**: Ajustes → Atualizações mostra a versão instalada e a última publicada, com notas e
  data; o app avisa quando sai versão nova e atualiza com um clique, conferindo a assinatura antes de instalar.
- **Pronto para cofres grandes**: gravar o cofre não trava mais a janela, a aba de notas carrega 50 cards por vez
  com **mostrar mais** e um card aceita até 100 mil caracteres. Um teste de carga (30 mil tarefas, 5 mil notas,
  1.000 transcrições) mede cada etapa contra um teto; números em `docs/benchmark.md`.
- Cards mais informativos: o clipboard mostra o tipo (link, cor com amostra, código), há quanto tempo foi
  copiado e o tamanho; as notas mantêm as quebras de linha e mostram quando foram editadas; o GitHub mostra
  ícone de PR ou issue, quem abriu e títulos em até duas linhas.
- **Horário direto no título da tarefa**: "Daily às 9h30" ou "Deploy 18:00" já cria o lembrete.
- **Adiar 10 min** no aviso de reunião e no lembrete de tarefa; tarefa concluída ou apagada no meio-tempo não toca de novo.
- O clipboard ignora o que gerenciadores de senha marcam como sensível no Windows
  (`ExcludeClipboardContentFromMonitorProcessing`, `Clipboard Viewer Ignore`).
- `AGENTS.md`, README reorganizado com galeria e comparação, documentação detalhada em `docs/` e benchmark
  com ferramentas parecidas.
- **Troca da senha mestra** em Ajustes → Segurança. Cofre, conta Google, conta do GitHub, histórico do
  clipboard e as cópias automáticas em `backups/` passam para a senha nova; a biometria é desligada
  porque guardava a senha antiga. Se a troca for interrompida no meio, o próximo destrancar termina ou desfaz o que ficou pela metade.
- **Aba GitHub** com issues e PRs abertos: atribuídos a mim, PRs que abri, revisão pedida a mim e
  issues que abri. Login por token pessoal (fine-grained, só leitura) ou pelo device flow de um GitHub App.
- **Tela cheia** pelo botão do topo ou `F11`.
- **Notificação do sistema** junto do aviso na janela, nos lembretes de tarefa e nas reuniões.
- Pipeline de CI nos PRs (tipos, testes do front e do Rust em Windows, macOS e Linux) e release por tag `v*`
  com instaladores das três plataformas.
- `SECURITY.md`, `CONTRIBUTING.md`, templates de issue e PR, Dependabot.
- Tarefas com horário, lembrete e repetição; resumo do dia; notas fixadas e filtro por tag.
- Destrancar com Windows Hello; janela que lembra posição e tamanho; sempre no topo.
- Atalhos de teclado com ajuda (`?`); skins Claro e Seguir o sistema.
- Login Google com cliente embutido na build e cartão da conta.
- Desfazer exclusões por aviso no rodapé; animações de entrada e saída que respeitam "reduzir movimento".
- Backup `.canto` cifrado (exportar/importar com mescla), cópia diária automática e início com o sistema.
- Widget de canto com cofre cifrado (Argon2id + AES-256-GCM): tarefas, notas, clipboard local,
  transcrições de reuniões e agenda do Google com aviso antes da reunião.

### Alterado

- Binário de release menor: LTO, uma unidade de codegen e símbolos removidos.
- A CI passou a rodar `cargo clippy -D warnings`.
- Código-fonte em inglês (identificadores, arquivos e comentários); a interface continua em português. Os
  arquivos gravados em disco seguem compatíveis com as versões anteriores.
- A escolha de skin saiu do cabeçalho e foi para Ajustes → Aparência, com o nome de cada skin.
- `Alt+6` agora abre a aba GitHub; Ajustes passou para `Alt+7`.
- Senha mestra mínima de 4 caracteres (antes 8).

### Corrigido

- Cópia muito grande no clipboard: era cortada em 8 mil caracteres sem aviso e relida a cada 1,2 s.
  Agora guarda até 32 mil caracteres com aviso do tamanho real, o histórico tem teto total, a lista manda só
  um resumo para a tela e, no Windows, o clipboard só é lido quando muda.
- Copiar de novo um texto fixado no clipboard tirava o fixado.
- Transparência da borda no macOS: a janela usava fundo opaco porque a API privada de transparência
  não estava ligada.
- Aviso de reunião fora da aba da agenda, virada do dia com o widget aberto e auto-lock do cofre.

### Segurança

- Removidas do histórico do git imagens de documentação que continham dados reais.
