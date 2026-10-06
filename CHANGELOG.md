`). Checklists marcam direto no texto, blocos de código mantêm o realce e as
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
