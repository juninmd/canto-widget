# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Alterado

- **Tarefas com a tarefa da vez**: no topo, um cartão mostra a tarefa em foco (ou a próxima em aberto) com horário,
  prioridade, cronômetro, barra da estimativa e um botão para iniciar ou pausar o foco. A lista ganha os grupos
  **pendentes** e **concluídas**.
- **GitHub e GitLab com resumo no topo**: quatro números antes das listas (revisões pedidas, meus PRs/MRs, CI que falhou
  e minhas issues). No GitLab não há o número de CI, porque os MRs só consultam o CI sob demanda.

- **Agenda redesenhada**: as visões Lista e Dia viram uma só, **Hoje** (a escolha anterior cai nela). No topo, um
  cartão com a reunião em andamento (tempo que falta, andamento, aviso de conflito e **entrar no Meet**) ou a
  próxima; abaixo, **o dia em uma linha** (reuniões, tarefas e tempo livre ao longo do expediente, com o tempo em
  reuniões, o tempo livre e os conflitos contados) e uma linha do tempo única em que reuniões, tarefas com horário e
  janelas livres são linhas próprias. Uma janela livre oferece encaixar uma tarefa sem horário, o que já passou fica
  recolhido e a linha vermelha marca o agora. Reuniões e os detalhes de cada evento seguem como antes.

### Adicionado

- **Agenda de qualquer dia**: setas de dia anterior e próximo, um seletor de data e o botão **hoje** na aba Agenda,
  como na Atividade. Ontem, amanhã ou outra data mostram as reuniões, o dia em uma linha e as tarefas com horário
  daquele dia; sem a linha do agora nem o aviso de próximo horário livre. Os avisos de reunião seguem só no dia de hoje.

- **Atividade mostra o tempo por tarefa**: o dia ganha o bloco **Tempo por tarefa**, com quanto o cronômetro de foco
  correu em cada tarefa naquele dia (tarefas apagadas aparecem como "Tarefa removida" e **Copiar resumo** leva a
  lista). O tempo só é registrado com a coleta de atividade ligada, fica no mesmo arquivo cifrado e local (35 dias,
  fora do backup e da sincronização) e guarda só o identificador da tarefa; **Apagar histórico** também o limpa. O
  total que cada tarefa já tinha continua igual.


- **Notificações no modo Maximizado**: a coluna da direita lista os avisos pendentes como cartões, com as mesmas
  ações do pop-up (entrar no Meet, abrir PR, concluir, adiar, silenciar, fechar) e "dispensar todas", e mostra abaixo
  **o que foi resolvido hoje** (entrou no Meet, adiado, fechado, tarefa concluída…) com a hora. O registro vem do
  Rust (ações no pop-up também contam), fica só na memória, sem ir para o disco, e recomeça a cada abertura do app.
  Substitui a agenda e as notas recentes, que já têm abas próprias.
- **Divisória arrastável no Maximizado**: arraste a barra entre a lista de tarefas e as notificações (as setas movem
  16 px, com Shift 64 px; Home e End vão aos limites; duplo clique ou Enter restaura). A lista nunca fica abaixo de
  360 px nem a coluna da direita abaixo de 300 px, e a largura fica lembrada nesta máquina.
- **Quatro modos para o widget**: um ícone novo no topo (ao lado do olho) abre o menu **Mini, Escondido, Normal e
  Maximizado**. O mesmo menu aparece no ícone do trilho do modo mini e na paleta de comandos ("Modo mini"), e o
  modo mini também liga e desliga pelo menu da bandeja. O Escondido é o `–` de sempre (volta pelo atalho global ou
  pela bandeja) e o Maximizado é a tela cheia, agora com uma **coluna de notificações** ao lado da lista de tarefas.
- **Modo mini**: a janela encolhe para um trilho colado na borda direita da tela, centralizado na vertical, com um
  traço colorido por aviso pendente (reunião, lembrete de tarefa, PR, menção, serviço com problema, modelo novo). Ao
  passar o mouse o trilho mostra os ícones; sobre um aviso, o texto. Um aviso novo aparece por um instante e o
  trilho volta a ser só traços. Clicar num aviso abre o Canto normal já com ele no topo, com as mesmas ações do
  pop-up (entrar no Meet, adiar, concluir, fechar). No modo mini o aviso não abre mais o pop-up por cima da tela; a
  notificação do sistema continua. O modo é lembrado entre as aberturas e a posição e o tamanho da janela normal
  ficam intactos.
- **Animações do trilho**: os traços entram em cascata com uma mola leve, o menu de modos surge com o mesmo
  movimento da janela de aviso, e só tamanho e posição passam do alvo; com movimento reduzido sobra apenas o fade.

- **Avisos dos seus PRs no GitHub**: um pop-up quando o **CI de um PR seu falha** e outro quando um **PR seu fica
  sem nenhuma revisão** por 24, 48 ou 72 h (48 por padrão, contados desde a abertura; rascunhos não contam). O aviso
  de CI avisa uma vez por falha (e de novo se ele voltar a falhar depois de passar) e **lista os jobs que quebraram**,
  com o passo que falhou quando o GitHub Actions informa, e cada job abre a própria página. Mais de 3 PRs sem revisão
  de uma vez viram um aviso só. Conferido a cada 5 min com o cofre aberto, mesmo com a janela escondida; a primeira
  leitura só registra o CI, sem avisar de falhas antigas.
- **Aviso de menção no GitHub e no GitLab**: um pop-up quando alguém te marca (@usuário), com o texto da menção no
  GitLab e o link da conversa. No GitHub vale a menção direta ao seu usuário em issues e PRs abertos de outras
  pessoas (menção a time não entra); no GitLab, o to-do de menção pendente. A primeira leitura só registra, e mais de
  3 de uma vez viram um aviso só. Cada aviso liga e desliga em Ajustes → Avisos do GitHub e do GitLab.
- **Adiar por 1, 5 ou 10 minutos**: o aviso de reunião e o lembrete de tarefa trocam o "adiar 10 min" por um botão
  dividido: o principal adia pelo último valor escolhido (10 min no começo) e a seta à direita abre a lista de 1, 5
  e 10 min; escolher um valor já adia e vira o valor do botão principal nesta máquina. Esc fecha a lista antes de
  fechar o aviso. O aviso volta a tocar quando o prazo passa.
- **Copiar o clipe reescrito**: ao passar o mouse num item do clipboard aparecem as reescritas que cabem no tipo:
  JSON formatado ou compacto (as chaves mantêm a ordem), texto em uma linha, MAIÚSCULAS e minúsculas. A reescrita
  vai para a área de transferência e o histórico continua como estava; cópias cortadas pelo limite não são
  reescritas. Link, cor, e-mail e telefone seguem copiados como estão.
- **Preparo no aviso de reunião**: o aviso lista até 3 notas anteriores com o mesmo título da reunião e traz
  "criar nota da reunião", que cria uma nota com horário, convidados e a pauta do convite e leva à aba Notas. Com o
  cofre trancado essa parte não aparece.
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
  semana), tarefas concluídas, notas criadas ou editadas, reuniões agrupadas por título com o tempo total e
  os PRs/MRs abertos, mergeados e revisados no período, com link. A agenda do período é paginada (até 1.000
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
  você; quem recusou aparece esmaecido. "Aceitou" usa a cor de sucesso da skin, não o destaque (que é vermelho na Hueco Mundo).

- **Status API em mini cards**: grade de dois por linha, cada card com a cor e a palavra do estado (operacional,
  instável, fora do ar, manutenção, incidente recente, sem resposta), o último incidente e a descrição ao vivo;
  o cabeçalho resume quantos estão com problema. Clicar abre o histórico do serviço na largura toda.

- **Aviso quando um serviço cai**: o sino de cada card (serviços com status ao vivo do Statuspage) liga uma
  notificação do sistema quando o serviço fica instável ou fora do ar, inclusive com o cofre trancado. A escolha
  fica em `status_alertas.json`, fora do cofre (é só a lista de páginas públicas a consultar, a cada 3 min).

- **Checklist nas notas**: linhas `- [ ]` e `- [x]` viram caixas de seleção na visualização; marcar uma
  atualiza o texto da nota.

- **Blocos de código nas notas**: trechos entre
