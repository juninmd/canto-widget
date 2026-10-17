# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Corrigido

- **Fechamento ao abrir no Windows**: as janelas só carregam depois de inicializar os estados do Rust e a
  bandeja, evitando o encerramento provocado por comandos da interface durante a inicialização.
- **Trancar com falha**: se o Rust não conseguir trancar o cofre, a tela avisa e relê o estado real em vez de fingir
  que trancou. Com o cofre trancado, o cache do GitHub/GitLab e o dia escolhido na Agenda deixam de ficar na memória.
- **Janela deslizando de lado**: escolher uma aba pelo menu **mais** empurrava o cabeçalho 112 px para a esquerda; a
  cópia invisível da barra, usada só para medir as abas, agora fica recortada.

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
- **Avisos em tela própria**: a coluna de notificações do modo Maximizado vira a tela que o **sino** do cabeçalho
  (sempre visível, com o contador quando há pendentes) abre sobre a janela inteira, no Normal e no Maximizado, com um
  card por aviso pendente em grade, **dispensar todas** e o que foi **resolvido hoje** embaixo (`Esc` ou **voltar**
  fecha e devolve o foco ao sino). O modo Maximizado passa a dar a janela inteira à aba aberta: a divisória que
  arrastava a largura da lista saiu.

### Corrigido

- **Falhas TCP no Windows**: conexão recusada e tempo esgotado usam o tipo do erro, mantendo a mensagem pt-BR
  esperada independentemente do idioma do sistema operacional.

### Adicionado

- **Erros no idioma escolhido**: as mensagens de erro que o Rust devolve à interface deixam de ser sempre em
  português: seguem o idioma escolhido em Ajustes, com o inglês como texto de reserva nos idiomas que ainda não
  têm tradução — o mesmo critério já usado pela bandeja e pelos avisos.
- **Tema Glass**: novo tema com estética de vidro translúcido, superfícies semi-transparentes
  com desfoque de fundo (backdrop blur), azul vivo, reflexo especular na borda superior e contraste
  acessível em conformidade com WCAG AA.

- **42 idiomas na interface**: 40 novos catálogos com 926 mensagens cada, seletor com busca por nome nativo ou
  código, detecção de variantes regionais, datas e números no idioma escolhido e texto da direita para a esquerda
  em árabe, hebraico e persa. Os novos catálogos são carregados sob demanda. Bandeja e títulos de notificações
  acompanham o idioma; alguns detalhes de alertas ainda usam inglês e os erros do Rust continuam em português.
  Cada idioma tem seu README, com 31 novas traduções completas e navegação entre os 42 documentos.
  Os novos catálogos e READMEs usam tradução automática, ainda sem revisão por falantes nativos.

- **Catálogo de comentaristas e comentários em PRs**: na aba GitHub, o seletor permite alternar entre **Itens** e **Comentários**. Exibe uma grade de comentaristas com avatar, tags diferenciando pessoas de bots, contadores de comentários e PRs, busca em tempo real, filtro para ocultar bots, paginação para listas extensas e listagem contextual dos comentários por autor.
- **Captura rápida**: `Ctrl+Alt+N` (`Ctrl+Cmd+N` no macOS) abre uma janelinha no meio da tela, de qualquer app, para
  anotar uma tarefa de hoje (Enter) ou uma nota (Ctrl+Enter), sem mostrar o widget. Esc esc sem salvar, e a tarefa
  aceita a mesma sintaxe da lista ("Daily às 9h30 !alta"). Com o cofre trancado, o atalho abre o widget na tela de
  senha.
- **Idioma espanhol**: a interface ganha o espanhol em Ajustes → Idioma, e o modo automático usa o espanhol em sistemas
  configurados para ele. As notificações e o ícone da bandeja seguem em inglês nessa língua por enquanto.
- **Resumo do dia**, nos Ajustes (desligado por padrão): um aviso só por manhã com quantas reuniões você tem (e a hora da
  primeira que ainda vem), as tarefas abertas, as revisões pedidas e as menções não lidas. O que for zero fica de fora e
  um dia sem nada não avisa. Você escolhe a hora (das 6 às 12 h) e se vale só em dias úteis; o aviso vale até 4 h depois
  do horário, então abrir o Canto à tarde não traz o resumo da manhã, e um reinício no mesmo dia não repete. Dispara do
  Rust (webview escondido não acorda) e respeita o "não perturbe".
- **Menções lidas, não lidas e silenciadas**: a subaba **menções** marca com um ponto o que você ainda não leu, abrir uma
  menção a marca como lida (também dá para marcar e desmarcar à mão, ou "marcar todas como lidas"), e dá para
  **silenciar uma conversa** ou **uma pessoa** (some da lista e do aviso; "silenciadas (n)" mostra de novo para
  reativar). O número de não lidas aparece no nome da subaba (`menções · 3`) e entra na contagem do ícone da barra de
  tarefas, junto com as revisões pedidas e as tarefas. O estado fica no cofre (selado com a senha mestra, porque cita
  repositórios e pessoas) e acompanha a troca da senha.
- **Filtro, prévia expandida e concluídas nas menções**: um campo filtra por texto, repositório ou autor (sem
  diferenciar maiúsculas nem acentos), "só não lidas" estreita a lista, a prévia abre inteira em "ver mais" (até 1000
  caracteres; o aviso continua com o trecho curto), e no GitLab "incluir concluídas" traz também os to-dos já feitos.
  Se o limite de requisições do GitHub segura a lista, a subaba diz até quando mostra a última cópia.
- **Mais avisos do seu trabalho no GitHub e no GitLab**, cada um com a sua chave nos Ajustes: PR/MR **aprovado** ou com
  **mudanças pedidas** (no GitHub com a foto, o nome e o texto de quem revisou; no GitLab só o pedido de mudanças, que é
  o que a lista informa), PR/MR **pronto para merge** ou com **conflito**, **comentário novo** no seu PR/MR (com a
  prévia no GitHub), algo **atribuído a você** (issue, PR ou MR de outra pessoa), **revisão pedida no GitLab** (como
  no GitHub, uma notificação do sistema) e **pipeline que falhou** em MR seu no GitLab (o aviso de CI). Uma aprovação que
  também deixou o PR pronto vira um aviso só, e mais de três novidades de uma vez viram um resumo. A primeira
  leitura de cada tipo só registra, e a checagem segue a cada 5 min com o cofre aberto.
- **Respostas e menções a times, opcionais**: avisa quando respondem numa conversa em que você comentou (GitHub; fica
  desligado, é o aviso mais barulhento; se a resposta já cita você, vale só o aviso de menção) e, com a opção ligada,
  inclui no aviso e na subaba de menções os threads que citam um time seu (GitHub, precisa do escopo `read:org` no
  token; no GitLab a menção a um grupo já chega como menção).
- **Subaba de menções no GitHub e no GitLab**: ao lado de "PRs e issues" (ou "MRs e issues"), a subaba **menções** lista
  onde você foi marcado: a foto, o nome e o @usuário de quem escreveu, uma prévia do texto (uma linha, recortada em
  volta do seu @usuário) e o link que abre a conversa no navegador. No GitHub entram as menções diretas ao seu usuário
  em issues e PRs abertos (menção a time não entra); no GitLab, os to-dos de menção ainda pendentes. A lista só é
  buscada na primeira vez que a subaba abre, e "atualizar" no topo recarrega a subaba que está aberta. Se o Canto não
  achar o comentário no GitHub, a linha mostra a conversa sem autor nem prévia.
- **Estados de carregamento, erro e conexão em todas as abas**: Tarefas, Notas, Clipboard e Ajustes mostram o esqueleto
  antes da primeira carga, em vez de piscar o vazio. Agenda, GitHub/GitLab e Atividade mantêm os dados antigos sob um
  aviso com **tentar de novo** quando a atualização falha, mostram **atualizado às HH:MM** e param de consultar com a
  janela escondida. A tela sem status ganha esqueleto e aviso com nova tentativa, e um selo **sem conexão** aparece no
  cabeçalho.
- **Menu "mais" e avisos pelo teclado**: o menu abre com o foco no primeiro item, anda com as setas e devolve o foco
  com Esc; Alt mostra o número de cada aba; a doca do modo mini expande com o foco. **Dispensar todas** faz uma só
  atualização, mostra **ver mais** além de 8 avisos e não esconde um aviso cujo fechamento falhou. Um sino no cabeçalho
  conta os avisos pendentes e abre o pior primeiro. A paleta ganha **Atualizar aba atual** e `Ctrl+,` abre os Ajustes.
- **Ajustes em grupos com busca**: cinco grupos recolhíveis (Aparência, Notificações, Privacidade e segurança, Dados e
  contas, Aplicativo), um campo **buscar ajuste**, a zona sensível separada, erros de gravação na própria seção e um
  aviso quando o GitHub não está conectado nos alertas que dependem dele.
- **Tarefas**: **limpar concluídas** com desfazer, aviso com a contagem ao puxar pendências, Delete/Backspace apaga a
  linha em foco e o foco segue para a vizinha, e um título que falha ao agendar não se duplica ao tentar de novo.
- **Notas, Clipboard e Transcrições**: Esc com rascunho pergunta antes de descartar, o filtro por tag vira um chip com
  ×, o modo privacidade borra também tags, a amostra de cor e as transcrições, **limpar** o clipboard pede confirmação
  com a contagem, "copiar como" deixa de depender do mouse, e a transcrição aberta destaca a busca, tem **copiar** e
  volta ao item com Esc.
- **Agenda**: o dia escolhido sobrevive à troca de aba, `[` e `]` andam entre os dias e `H` volta a hoje, o vazio
  distingue "sem conta" de "sem eventos" e leva aos Ajustes, e agendar uma tarefa pela lateral confirma com um aviso.
- **Atividade**: aviso com nova tentativa quando a primeira carga falha, botão de atualizar visível, menu `···` pelo
  teclado, a grade de horas lida por leitores de tela e um chip **meta** para editar o objetivo.
- **Prévia do texto da menção no GitHub**: o aviso de menção agora mostra o trecho do comentário (ou da descrição) que
  cita você, em uma linha e com até 280 caracteres, como o GitLab já fazia. Quando o texto é longo, o recorte fica em
  volta do @usuário, com "…" no que foi cortado. Se o Canto não achar o comentário, o aviso segue com a frase de antes.
- **Quem mencionou você, com nome e foto**: o aviso de menção no GitHub e no GitLab mostra a foto, o nome e o @usuário
  de quem escreveu (iniciais quando não há foto), e a faixa de avisos traz o nome em cada cartão. No GitHub o Canto
  procura o comentário que cita você; se não achar, o aviso aparece como antes, sem rosto. Nos resumos (mais de 3
  menções) cada linha começa com o nome. A foto só vem do próprio GitHub, da instância do GitLab ou do Gravatar.
>>>>>>> origin/main
- **Meus endpoints na aba Status API**: uma subaba ao lado de **serviços** para acompanhar o que é seu. Cada endpoint é
  um **endereço** (http ou https), um **DNS + certificado** (mede a resolução do nome e lê a validade do certificado que o
  servidor apresenta na porta) ou um **TCP + porta**. Os blocos da grade mostram a latência atual e as últimas leituras;
  ao clicar, o bloco ocupa a linha inteira com o **gráfico de latência** (limite tracejado, quedas sombreadas), mediana,
  p95, pico, disponibilidade e os ajustes (intervalo de 30 s, 1 min ou 5 min, limite de latência e os avisos).
  Chegam avisos quando o endpoint **cai** (2 falhas seguidas), quando a **latência passa do limite** (2 leituras seguidas)
  e quando o **certificado vence em 14 dias** ou já venceu; cada um avisa uma vez e volta a avisar só depois de
  recuperar. A lista fica cifrada no cofre (também na troca da senha mestra) e as verificações só rodam com o cofre
  aberto; as leituras ficam na memória e recomeçam a cada abertura.
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
  Antes era só uma notificação do sistema. Mais de 3 mudanças de uma vez viram um aviso-resumo só. Selos "novo" e "subiu" ficam por 7 dias.
- **Aba Modelos IA** (visível por padrão, **sem chave de API**): ranking de LLMs pelo **Intelligence Index**
  da [Artificial Analysis](https://artificialanalysis.ai), lido da página pública de leaderboard, com barra proporcional à nota, criador, preço
  (`$x,xx / 1M tokens`, média 3:1 entrada/saída) e velocidade (`tok/s`). O botão de ordem alterna inteligência →
  preço (mais barato primeiro) → velocidade (mais rápido primeiro); mostra os 50 primeiros. Não pede conta nem chave. Para
  não sobrecarregar a página, o Canto busca no máximo uma vez a cada 3 h, mesmo no
  "atualizar", e diz quando a próxima busca é permitida. O sino 🔔 (desligado por padrão) avisa quando um modelo
  **entra no top 10** ou **sobe dentro dele**, conferindo a cada 6 h com o cofre aberto, mesmo com a janela
  escondida; a primeira leitura só registra, sem avisar. Muitas mudanças de uma vez viram um aviso só.
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
- **Aba Steam**: quatro subabas num só lugar. **Ofertas** varre a lista de desejos e mostra o que está em promoção,
  do maior desconto para o menor; **em alta** traz os mais vendidos da loja, numerados; **jogue agora** lista os
  jogos recentes das últimas duas semanas (até 30) com o tempo de cada um e o total; e o **catálogo** ordena a loja
  pela nota das análises, com busca pelo nome e **ver mais jogos** para seguir página a página. Cada linha mostra a
  **capa** do jogo, a **nota** nas palavras da própria Steam (com quantas análises ela conta), o preço antigo riscado,
  o preço em reais e **quanto o desconto economiza** — e a lista soma a economia total. O que é público precisa só do
  **SteamID64**; a chave da Steam Web API é opcional e libera apenas os jogos recentes. A aba começa desligada, a um
  clique nos Ajustes, e a conexão fica selada no cofre, acompanhando a troca da senha. As capas não vêm de origem
  remota: o Rust baixa cada uma e entrega como `data:` URL, então a CSP segue fechada.
