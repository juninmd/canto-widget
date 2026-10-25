# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

- **Contador de palavras no editor de notas.** Abaixo do texto aparece quantas palavras o card tem e, a partir de
  um minuto, o tempo estimado de leitura. Marcação Markdown, números de lista, caixas de tarefa, imagens e
  endereços de links ficam de fora da conta.
- **Trocar a senha mestra ficou mais à prova de erro.** O formulário em **Segurança** avisa quando o **Caps Lock**
  está ativado, recusa na hora uma senha nova curta demais ou igual à atual, marca e foca o campo com problema (a
  senha atual errada volta selecionada para redigitar), fecha com **Esc** devolvendo o foco ao botão e informa ao
  gerenciador de senhas qual campo é a senha atual e qual é a nova.
- **Drive com todos os arquivos e pastas, página a página.** O novo filtro **Todos** (o padrão) mostra o Meu Drive
  inteiro, pastas primeiro; uma pasta abre ali mesmo, com o caminho de volta no topo. Todas as listas carregam a
  **próxima página** ao rolar (ou em **carregar mais**), em vez de parar nos 30 primeiros, e pastas já vistas voltam
  na hora do cache.
- **Fotos dos contatos na aba Contatos.** A lista, os aniversariantes do dia e os próximos aniversários mostram a
  foto que o contato tem no Google, no lugar das iniciais; quem não tem foto (ou só tem o avatar genérico do Google)
  continua com as iniciais. As fotos ficam guardadas em memória enquanto o Canto está desbloqueado e chegam já
  embutidas, sem abrir a política de segurança para imagens externas. Usa o mesmo escopo de Contatos de antes.
- **Google Keep na aba Notas.** O botão de importar ao lado do **+** traz as notas do Keep a partir de um
  export do [Google Takeout](https://takeout.google.com): escolha os `.json` da pasta Keep e cada nota chega com
  a lista de verificação, os marcadores (como tags), o fixado e as datas, marcada com `#keep`; importar de novo
  não duplica e a lixeira fica de fora. A API do Keep só atende contas Google Workspace por conta de serviço,
  então contas pessoais não têm sincronização direta.
- **Aba Steam refeita, animada e com sete sub-abas.** **Jogue agora** pagina **todos os seus jogos**, do último
  jogado ao mais antigo, com um destaque do último jogo e o botão **Jogar**, filtros **recentes** e **instalados**
  (lidos das bibliotecas locais da Steam) e três visualizações: **lista**, **cards** e **grade** com a arte do jogo.
  **Atualizações** traz o **changelog** de cada patch dos jogos recentes ou instalados, com contador de não lidas.
  **Desejos** pagina a lista inteira com preços, ordenada por desconto, preço ou ordem da lista, e destaca
  promoções de **75% ou mais**. **Mais jogados** mostra os jogos com mais jogadores agora, o pico do dia, quem subiu
  ou caiu e quais são seus. O seletor de região ganha bandeiras, busca e **12 moedas** (BRL, USD, EUR, GBP, JPY,
  CNY, AUD, CAD, CHF, KRW, INR e MXN). Com o sino ligado, uma promoção de 75% ou mais na lista de desejos e uma
  atualização nova dos seus jogos avisam uma vez cada. As animações param com "reduzir movimento".

- **Mercado redesenhado e mais completo**, a partir de um benchmark de Google Finance, Yahoo Finance,
  TradingView, Investing e Status Invest. Agora são **24 ativos**: dez moedas (dólar, euro, libra, iene, franco suíço, dólares
  canadense e australiano, yuan e peso argentino em reais, mais euro/dólar), sete índices (Ibovespa, S&P 500, Nasdaq, Dow Jones, DAX, FTSE 100,
  Nikkei 225) e sete criptos (Bitcoin, Ethereum, Solana, XRP, BNB, Dogecoin, Cardano). No topo, se o pregão está
  **aberto ou fechado** e quando muda, e uma **barra de altas e baixas**. O destaque mostra o preço com a unidade,
  a **variação em valor e em %**, o **fechamento anterior como linha tracejada**, um **cursor** que diz preço e
  hora em qualquer ponto da curva, os períodos **1D, 5D, 1M, 6M e 1A** (buscados sob demanda, com cache de 15
  min), a abertura e réguas da **faixa do dia** e de **52 semanas**. Os cartões viram uma **lista de
  acompanhamento** com mini-curva, filtro **Moedas / Índices / Cripto** e ordem por **maiores altas ou baixas**.
- **Aba Mapa, com o trânsito da sua região.** Um mapa com as ruas **coloridas pela velocidade ao vivo** (de
  livre a parado), a rota do trajeto escolhido desenhada por cima e pinos para **acidentes, lentidão, obras e vias
  interditadas**; dá para arrastar, aproximar e ligar ou desligar as camadas. Abaixo, um **termômetro** de quanto a
  região está mais lenta que no trânsito livre, com a linha das leituras do dia; **seus trajetos** (trabalho,
  academia...) com o tempo agora, os **minutos a mais** e a distância; a **melhor hora para sair** nas próximas 2
  horas, de 15 em 15 min; e as **ocorrências num raio de 5 km**, das mais próximas, com filtro por tipo. Os dados
  vêm da **TomTom com a sua chave grátis** (2.500 pedidos por dia, sem cartão), selada no cofre junto com o ponto de
  partida e os trajetos; sem chave, a aba mostra só o mapa do OpenStreetMap. O ponto de partida pode ser a cidade da
  aba Clima. Tudo passa pelo Rust e os blocos do mapa chegam como imagem embutida, então a CSP continua sem origem
  remota. Atualiza a cada 5 min com a janela visível. A aba começa escondida, a um clique em Ajustes.
- **Modelos de IA com ficha completa e comparação lado a lado.** Tocar num modelo abre a **ficha** ali mesmo:
  lançamento, contexto, pesos abertos ou fechados, raciocínio, preço de **entrada**, **saída** e combinado,
  velocidade, **tempo até o 1º token**, índices de **inteligência**, **programação** e **matemática** com a
  posição de cada um, e o que o modelo entende (texto, imagem, áudio, vídeo); o site continua a um toque, em "Ver
  no site". O ranking ganha as ordens **Contexto** e **Lançamento** e os filtros **pesos abertos** e **com
  raciocínio**. O **⊕** marca até 4 modelos e a nova sub-aba **Comparar** mostra um **resumo em frases** (quem
  lidera, quantas vezes mais barato, quantas vezes mais rápido), um **radar**, uma **barra por métrica** com o
  melhor marcado ★ e a **tabela completa**, com a opção "só diferenças"; atalhos Top 3, Mais baratos, Mais
  rápidos e Abertos, e a seleção fica salva. Tudo vem da mesma página pública da Artificial Analysis, sem conta
  nem chave; o que a página não trouxer aparece como "—".
- **Gmail, Drive e Contatos renovados, com mais ações e animações novas.** **Gmail**: quatro visões
  (**Importantes**, **Não lidos**, **Com estrela**, **Entrada**) com busca no próprio Gmail; cada e-mail ganha
  **estrela** (que gira ao marcar), **arquivar** (desliza para a esquerda), **lixeira** (afunda e some), marcar
  como lido ou **não lido**, e "virar tarefa"; tocar no avatar **seleciona** e uma barra sobe com as **ações em
  lote** (ler, arquivar, lixeira, todos). No topo, **escrever** abre a janela de novo e-mail do Gmail. **Drive**:
  o **armazenamento usado** com uma barra que cresce, atalhos para criar **Doc, Planilha ou Apresentação** em
  branco, o filtro **Meus arquivos**, filtro por **tipo** (Docs, Planilhas, Apresentações, PDFs), arquivos
  agrupados por **Hoje / Ontem / Nesta semana / Antes**, tamanho dos arquivos que ocupam espaço, **copiar link** e
  **abrir a pasta**. **Contatos**: **próximos aniversários** (30 dias, "amanhã", "em 5 dias"), filtro **Com
  aniversário**, **índice A–Z** que pula para a letra e a destaca, botão **escrever** no Gmail para cada e-mail,
  **copiar ficha** inteira, **novo contato** e o bolo 🎂 que balança. Tudo com os mesmos escopos de antes
  (`gmail.modify`, `drive.metadata.readonly`, `contacts.readonly`) e parado quando o sistema pede menos movimento.
- **Contatos renovada**: os **aniversariantes do dia** aparecem no topo, com a idade quando o Google sabe o ano e
  um botão de **parabéns pelo WhatsApp** com a mensagem já escrita (o bolo 🎂 também marca a pessoa na lista).
  Abrir um contato agora mostra **tudo** o que o Google guarda: apelido, setor, aniversário, endereços, sites,
  relações e notas. Cada telefone ganha um botão **WhatsApp** que abre a conversa direto (`wa.me`), com o número
  normalizado: `+` ou `00` contam como internacional e um número com DDD sem código de país é lido como do Brasil.
  A busca também acha pelo apelido e pelo setor.
- **Animações nas outras abas**, no espírito do Clima: movimento que diz o que mudou, curto e parado quando o
  sistema pede menos movimento. O sublinhado da aba (e a barra da lateral) **desliza** até a aba escolhida; o
  carregamento ganha um **brilho correndo** no lugar do pulso. **Tarefas**: o risco atravessa o texto ao marcar e
  zerar o dia solta **confete** no anel. **Notas**: "salva" aparece depois de salvar, a nota fixada **desliza** para
  o topo e trocar lista/grade assenta suave. **Clipboard**: o item copiado em outro app **cai do topo**, "copiado"
  estoura e o alfinete inclina ao fixar. **Agenda**: a linha do agora anda e pulsa, a próxima reunião ganha um
  **halo** quando faltam 15 min, Hoje/Reuniões e a troca de dia deslizam. **Gmail**: marcar como lido **varre** o
  e-mail para o lado e o contador rola. **Drive** e **Contatos**: os ícones e avatares surgem em cascata.
  **GitHub/GitLab**: a CI rodando gira e, quando o resultado chega na tela, pulsa (passou) ou treme (falhou).
  **Status**: serviço no ar com um radar discreto, incidente piscando, barra de resumo crescendo e a latência
  **desenhada**. **Agentes**: ícones surgem, o instalado pulsa e a versão de até 3 dias brilha. **Modelos**: barras
  crescem, a nota **conta** até o valor e reordenar desliza cada modelo ao novo lugar. **Atividade**: a rosca gira
  fatia por fatia, as colunas da semana sobem e o mapa de horas acende em onda. **Mercado**: o preço **pisca**
  verde ou vermelho quando muda e o fim da curva pulsa. **Steam**: a capa inclina ao passar o mouse. **Leituras**:
  os cartões entram em cascata. **Ajustes**: o ✓ das caixas estala e trocar o tema faz as cores **fundirem**.

- **Aba Clima com o céu de verdade**: o cartão de cima agora é desenhado num canvas, com chuva que cai com o vento
  e respinga no chão, raio ramificado com clarão na tempestade, raios de sol girando, nuvens em camadas, neve,
  neblina e, à noite, estrelas e estrelas cadentes (tudo parado quando o sistema pede menos movimento ou a janela
  some). Abaixo dele: **próximas 2 horas** em blocos de 15 min dizendo quando a chuva começa ou para; **oito
  leituras** (sensação, umidade, vento com rajada, pressão, visibilidade, ponto de orvalho, UV e qualidade do ar);
  o **gráfico por hora** com a faixa de chuva animada, a chance de chuva em cada hora, a linha de sensação térmica
  e os modos chuva (mm) e vento; **dias clicáveis**, que trocam o gráfico para as horas daquele dia; um aviso em
  destaque para tempestade, rajadas fortes ou UV muito alto; e o **arco do sol** com a **fase da lua** desenhada
  como se vê do hemisfério da cidade. Tudo do Open-Meteo, sem chave: a qualidade do ar vem da API de ar do mesmo
  serviço e, se ela falhar, só esse quadro fica vazio.

- **Canto para Android e iOS**, a partir do mesmo código (Tauri v2 Mobile). O cofre, as abas e os avisos são os
  mesmos; a janela vira tela cheia, as abas ficam numa barra embaixo (com uma folha "mais" para as demais), o
  cabeçalho ganha a busca global e o que só existe no computador (janela, bandeja, atalhos globais, Atividade,
  pasta sincronizada, início com o sistema, atualização pelo app) some de Ajustes. No celular o Clipboard captura
  o que foi copiado quando a aba aparece, o backup e a exportação de nota usam o seletor de arquivos do sistema e
  o Canto pede a permissão de notificações na primeira abertura. O CI passa a compilar o crate para Android e iOS.
  Ainda não há desbloqueio biométrico no celular. Veja [docs/mobile.md](docs/mobile.md).

- **Aba Contatos, com a sua agenda do Google**: a People API, somente leitura (`contacts.readonly`), com o mesmo
  login da Agenda. Mostra o total de contatos, busca ao digitar (nome, empresa, cargo, e-mail ou telefone, sem
  ligar para acentos), filtros com contagem (Todos, Favoritos, Com e-mail, Com telefone), seções de A a Z com
  avatar em iniciais e, ao abrir um contato, copiar e-mail ou telefone com um clique e abrir no Google Contatos.
  Começa oculta, a um clique em Ajustes. Quem já estava conectado precisa **reconectar o Google** para liberar o
  escopo novo, e a **People API** precisa estar ativa no projeto do Google Cloud.

- **Gmail, Google Tarefas e Drive no Canto**, com o mesmo login Google da Agenda (o token continua no cofre e
  nunca chega à webview). A aba **Gmail** mostra quantos e-mails estão sem ler na caixa de entrada e os não lidos
  que o próprio Gmail marcou como importantes, com abrir no Gmail, marcar como lido e virar tarefa; o aviso
  opcional **só dos importantes** toca uma notificação do sistema para cada e-mail importante novo (checado a cada
  2 min). A aba **Drive** lista arquivos recentes, com estrela ou compartilhados comigo, com busca por nome e
  abertura no navegador, lendo só os metadados. A aba **Tarefas** ganha a seção **Google Tarefas**, com as tarefas
  abertas da lista padrão, a data (vencidas em vermelho), captura direta no Google e concluir com um clique; sem
  login Google ela não aparece. O Keep ficou de fora: não há API para contas pessoais. Gmail e Drive começam
  ocultas, a um clique em Ajustes. Quem já estava conectado precisa **reconectar o Google** para liberar os escopos
  novos (`gmail.modify`, `tasks`, `drive.metadata.readonly`).

### Corrigido

- **Steam e Mercado mais firmes.** Na Steam, uma resposta lenta de uma busca, página ou filtro anterior não
  sobrescreve mais a lista que você pediu por último (nem um **ver mais** antigo entra na busca nova); **marcar como
  lidas** e a confirmação de **desconectar** mandam um pedido só, mesmo com clique duplo, e o **tentar de novo** de
  uma marcação que falhou marca de novo. No Mercado, o período que não carregou ganha **tentar de novo** ali mesmo.
- **Gmail abre na Entrada e diz quando a API está desligada.** A aba começava em **Importantes**, que só lista os
  não lidos marcados como importantes e por isso costumava parecer vazia; agora abre em **Entrada**. Quando a Gmail
  API (ou outra API do Google) está desativada no projeto do Google Cloud, o aviso traz o botão **ativar a API**, que
  abre a página certa do console.
- **Carrossel de notificações navegável**: com muitos avisos, a tira do topo do pop-up cortava os últimos sem
  jeito de chegar a eles. Agora tem setas ‹ ›, contador ("2 de 5"), ← → no teclado, rolagem com a roda do mouse
  e arrastando, e o aviso escolhido sempre rola para a vista.
- **Atualizar o Canto não apaga mais as suas escolhas.** Antes só as abas visíveis e o layout tinham cópia no
  arquivo `preferencias.json`; agora **todas** as preferências da interface vão para lá (tema, densidade, idioma,
  modo mini, vista da agenda e das notas, lembretes, grupos de Ajustes...). E quando o webview volta da atualização
  com uma cópia **antiga** (não vazia), vale a mais recente, em vez de a antiga apagar a do arquivo.
- **Pop-up de notificação sem a borda de cima**: a janela media o cartão no meio da animação de entrada (ainda
  em 98%) e ficava alguns pixels mais baixa; agora usa a altura real do cartão.
- **A atualização não apaga mais as abas que você deixou visíveis.** A escolha das abas (e o layout) só ficava no
  armazenamento da webview, que pode voltar vazio depois de uma atualização, e então voltava o padrão. Agora ela
  também é gravada em `preferencias.json`, ao lado do cofre, e restaurada na abertura quando a webview perdeu a
  cópia; quando as duas existem, vale a da webview. Quem já usa a versão com a correção fica protegido da próxima
  atualização em diante.
- **O filtro "buscar ajuste" não cobre mais o menu das abas**: a barra lateral expandida passou a ficar acima do
  campo fixo de busca de Ajustes.

### Alterado

- **Pop-up de notificações compacto.** A janela do aviso agora tem a altura do cartão (antes ficava fixa em
  420 × 380, com espaço vazio entre o título e os botões), então o resto do canto da tela continua clicável. Foto
  de quem mandou (ou ícone do tipo) à esquerda, uma linha de contexto (repo#número · há quanto tempo), título,
  motivo e autor numa linha só, e as ações logo abaixo. **Fechar** vira um ✕ no canto (Esc continua valendo) e
  **fechar todos** fica sempre visível com a contagem da fila. Reuniões e descrições longas deixam a janela maior
  para mostrar tudo, com a lista de **convidados** em duas colunas.
- **Releases e CI mais rápidos**: o binário de release usa LTO thin (otimiza em paralelo, em vez de num só
  passo), o `cargo-audit` vem pronto em vez de compilado a cada execução e os testes e2e no CI
  rodam sobre o bundle pronto (`vite preview`) em vez do servidor de desenvolvimento, na metade do tempo.
- **Abas na vertical ou na horizontal, à sua escolha**: em Ajustes > Aparência, "Layout das abas" troca a barra de
  cima por uma barra lateral com todas as abas, em grupos (Meu dia, Código, Explorar) e Ajustes no fim. Ela mostra só
  os ícones, abre por cima do conteúdo ao passar o mouse ou navegar pelo teclado, e pode ficar aberta. As setas
  seguem a direção da barra (cima e baixo na vertical) e o padrão continua horizontal. As abas passaram a seguir a
  ordem dos grupos; Alt+1 a Alt+4 não mudam.
- **Tarefas mais limpas e rápidas de filtrar**: o progresso virou um anel com "2 de 6", a prioridade é um seletor em
  chips (Todas, Alta, Média, Baixa), "resumo do dia", "puxar pendências" e "limpar concluídas" foram para um menu
  "⋯", e as concluídas ficam recolhidas atrás de um cabeçalho com a contagem. A prioridade aparece como etiqueta
  colorida na linha, e os chips "hora", "!alta", "!média" e "!baixa" sob o campo inserem o trecho que o parser já
  entende, então ninguém precisa decorar a sintaxe.
- **Notas filtráveis por tag e em lista ou grade**: uma fileira de chips com a contagem faz a mesma busca de digitar
  `#tag`, os cards ficam em "Fixadas" e "Recentes", e um alternador mostra os cards em duas colunas, lembrado entre
  as sessões. A busca sem resultado diz o que fazer.
- **Clipboard filtra por tipo com chips e contagem**: Todos, Link, Cor, JSON... no lugar do seletor. O limite de
  fixados foi para Ajustes > Dados e contas, "limpar" ficou no menu "···" (ainda com a confirmação) e o aviso de
  privacidade virou um selo de cadeado. Cada cartão ganhou o ícone colorido do tipo, os fixados vêm primeiro e clicar
  no cartão copia.
- **Agenda com os controles numa linha só**: Hoje/Reuniões, dia anterior/data/próximo, atualizar e o menu "···"
  (testar aviso, antecedência, última atualização) dividem uma linha, e a reunião em andamento ganhou um anel de
  contagem regressiva com os minutos que faltam.
- **GitHub e GitLab: os quatro números do topo filtram a lista**: toque em revisões, meus PRs, CI falhou ou minhas
  issues para ver só aquele grupo, e de novo para voltar. A ordenação virou um menu compacto, "atualizar" um ícone e
  "desconectar" foi para o menu "⋯", ainda com a confirmação. O CI aparece como selo colorido, "aguardando há N d"
  fica vermelho a partir de 2 dias, os títulos das seções ficam fixos e "adiar 4 h" e "ver CI" aparecem ao passar o
  mouse ou focar.
- **Status API: serviços por gravidade e endpoints com o que importa primeiro**: quem caiu vem primeiro, com resumo
  ("N com problema · M operacionais"), barra proporcional, filtros com contagem e o estado escrito num selo. Em "meus
  endpoints", "+ endereço" fica ao lado das abas, selos resumem fora/lentos/a vencer e os piores sobem. Tocar num
  serviço continua abrindo os incidentes, e adicionar endereço, gráfico de latência, verificar agora e remover seguem
  como antes.
- **Modelos IA com chips de ordenação e posição em destaque**: Inteligência, Preço e Velocidade ficam sempre à vista,
  a métrica escolhida acende em cada linha e o líder ganha o bloco em destaque.
- **Atividade com a meta de foco em pílula**: o tempo de código aparece grande com "faltam N min" (ou "Meta
  cumprida"), as pausas aparecem hachuradas na faixa do dia e a semana marca a coluna de hoje.
- **Busca fixa em Ajustes**: o campo de busca acompanha a rolagem.

- **Mercado deixou de ser protótipo e mostra cotações reais**: dólar e euro contra o real, bitcoin, Ibovespa,
  S&P 500 e Nasdaq, com a variação do dia sobre o fechamento anterior, vindos do Yahoo Finance (sem chave, buscados
  pelo Rust e guardados na memória por 15 min; ↻ força uma nova leitura). A cotação em destaque ganhou um cartão
  grande com o valor, a variação numa pílula com seta e a curva do pregão com área em degradê que se desenha ao
  abrir; as demais viram cartões em grade com mini gráfico, e **clicar num cartão leva a curva dele para o
  destaque**. Uma falha mostra o motivo com "tentar de novo" e mantém as últimas cotações na tela. Alta e baixa
  usam as cores de sucesso e perigo do tema. Saíram o selo de protótipo, a lista de acompanhamento fictícia e o
  mecanismo de abas de protótipo.

### Corrigido

- **Cliques bloqueados por uma janela invisível no canto da tela**: o pop-up de avisos ficava aberto e transparente
  quando o último aviso saía só da tela (ou era fechado pelo widget), o dock do modo mini continuava largo quando o
  menu de modos ou o mouse saíam para outro app, a captura rápida ficava por cima depois de perder o foco, e um erro
  de desenho deixava qualquer janela vazia e transparente. Agora a janela vazia se esconde, o dock encolhe, a captura
  fecha ao perder o foco e um erro mostra um painel com "tentar de novo" e "fechar".
- **Desativar abas em Ajustes** não faz mais a janela inteira sumir: a barra de abas lia a lista antiga por um
  instante e derrubava a tela.

### Removido

- **Abas de protótipo Hábitos e Snippets**: saíram as duas telas de maquete, os rótulos nos 42 idiomas, os prints e
  os testes delas. **Mercado** continua como protótipo; o mecanismo de protótipo fica para a próxima ideia.

### Adicionado

- **Aviso de PR mais direto**: o pop-up de pull request e de menção diz o tipo, o repositório e há quanto tempo numa
  linha só, traz o motivo (atribuído, CI falhou, aprovado...) num selo colorido e mostra quem abriu o PR com avatar.
  O bloco "detalhes" só aparece quando tem algo a dizer, e "fechar" ficou mais discreto para não competir com
  "abrir PR".
- **PR/MR com conflito de merge em destaque** nas abas GitHub e GitLab: o cartão ganha borda vermelha e o selo
  **⚠ conflito** enquanto houver conflito com a branch base a resolver. No GitLab vem da própria lista; no GitHub,
  da mesma consulta que já traz o selo de CI, sem chamada extra.

- **Clima com céu animado e mais detalhes**: o cartão de cima agora é um céu que acompanha o tempo — azul limpo,
  noite estrelada, chuva, neve, neblina, trovoada com relâmpago —, com gotas e flocos caindo, nuvens passando e um
  ícone desenhado e animado para cada condição (tudo parado quando o sistema pede menos movimento). Abaixo: **umidade,
  vento com a direção, índice UV, nascer e pôr do sol** e a chance de chuva de hoje; as **próximas 24 horas** numa
  curva suave que rola de lado, com ícone e chance de chuva (as horas depois do pôr do sol ganham a lua); e **sete
  dias**, cada um com uma barra de mínima a máxima dentro da faixa da semana. O horário da última leitura aparece
  no rodapé.
- **Escolher a cidade ficou mais fácil**: os resultados aparecem **enquanto você digita** (setas e Enter funcionam,
  com `combobox` e lista acessíveis), as **últimas cidades** e uma fileira de **cidades populares** entram com um
  clique — sem buscar —, e **trocar de cidade** abre o seletor sem esquecer a atual, com **voltar** (o "esquecer a
  cidade" mudou para dentro dele). Uma busca de uma letra não sai, e uma resposta lenta nunca sobrescreve a mais nova.
- **"Fechar todos" na janela de avisos**: quando a fila de avisos passa de um, a janela do alerta ganha **fechar
  todos** no canto, ao lado da régua. Antes era um clique em "fechar" por aviso, com a janela ficando aberta até o
  último; agora a fila inteira sai numa chamada só (o Rust derruba a fila de uma vez, e cada aviso continua deixando
  o seu registro na lista de resolvidos do dia).
- **Catálogo da Steam com filtros**: além da busca, a seção ganhou **só em promoção** e a escolha da ordem —
  melhor avaliados, menor preço ou mais recentes. São os três critérios que a própria loja aceita; "maior
  desconto" não é um deles, então essa ordem continua sendo a da lista de desejos.
- **Biblioteca da Steam**: uma quinta sub-aba lista **todos os jogos que a conta tem**, do mais jogado para o menos,
  com capa, o **tempo total** de cada um e uma linha de resumo que diz quantos jogos e quantas horas a lista soma.
  Tem **busca por nome** e pagina de 100 em 100, como o catálogo, então uma conta de mil jogos continua navegável.
  Precisa da chave da Steam Web API, como o "jogue agora".
- **Alertas de queda de preço na Steam**: um sino no cabeçalho da aba liga os avisos da lista de desejos. Quando um
  jogo fica mais barato do que a última vez que o Canto olhou, chega uma notificação do sistema com o nome, o novo
  preço e o desconto — mesmo com a janela escondida, porque quem varre é o Rust. A primeira varredura só anota:
  nada toca para um preço que o jogo já tinha antes de você ligar os avisos. Desligado por padrão; o estado (a
  escolha e o último preço de cada jogo) viaja selado, é lido a cada 30 min com o cofre aberto e some da memória ao
  trancar. Um jogo que fica gratuito toca como a maior queda de todas: a loja não informa preço nenhum para ele,
  então o aviso diz "Grátis".
- **Loja Steam da sua região**: um seletor no cabeçalho da aba escolhe a loja — Brasil, Estados Unidos, Euro ou
  Reino Unido. Preços, moeda e o texto das análises passam a vir dela, e a economia de cada oferta é escrita na
  moeda escolhida. O padrão segue o idioma da interface (português abre no Brasil), a escolha fica guardada com a
  conta e sobrevive a desconectar e reconectar.
- **Aba Clima**: escreva o nome da cidade uma vez e o Canto guarda só as coordenadas. A aba mostra **agora**, as
  **próximas horas numa curva** com a chance de chuva, os **próximos dias** e o aviso de **chuva a partir das
  HH:MM**. Os dados vêm da Open-Meteo, que é aberta e **não pede chave** — nenhuma conta e nenhum endereço seu sai
  da máquina —, com cache de 30 min. A aba começa desligada, a um clique nos Ajustes.
- **Aba Leituras (RSS e Atom)**: cole os endereços dos feeds e leia tudo num só lugar, com **contagem de não
  lidos**, o mais novo primeiro, o **favicon** da origem, a idade e um resumo em cada cartão — e a **miniatura**
  quando a entrada tem uma. Tudo é baixado pelo Rust e entregue à interface como `data:`, então a janela nunca
  fala com uma origem remota; só **https** e hosts públicos são aceitos numa imagem. Os cartões abrem no navegador
  e podem ser marcados como lidos/não lidos; um feed que falha fica visível em vermelho, sem esconder os outros.
  Sem chave, cache de 15 min, e a lista fica ao lado do cofre (são só endereços públicos).

### Alterado

- **O texto dos avisos em markdown**: a caixa de detalhes da janela de avisos passa a renderizar markdown — negrito,
  listas, código e **links que abrem no navegador** — em vez de mostrar tudo como texto corrido. O que vem de uma
  menção do GitHub/GitLab é markdown de verdade, então é ali que a mudança aparece. Uma quebra de linha sozinha
  continua sendo uma quebra, para o resumo do dia seguir linha a linha.
- **Varredura da lista de desejos com limites**: a varredura de preços passou a ter um teto de jogos por vez e a
  esperar antes de repetir um pedido que a Steam recusou por excesso de requisições, em vez de desistir na primeira
  resposta 429. O alerta de preço também passou a guardar **de qual conta** são os preços: trocar de conta não
  compara a lista nova com os preços da anterior, como já acontecia ao trocar de loja.
- **Desconectar a Steam pergunta antes**: o botão no cabeçalho abre uma confirmação (a chave da Web API sai do cofre
  no processo), com cancelar do lado.
- **Sub-abas da Steam roláveis**: com cinco seções, a régua estourava a largura da janela e cortava a última; agora
  ela rola na horizontal. O tempo de jogo também passa a usar o separador de milhar do idioma ("2.140 h"), que só
  aparecia em contas grandes.
- **Ofertas da Steam paginadas**: a lista terminava num aviso ("há mais ofertas na sua lista de desejos") que não
  levava a lugar nenhum. Agora ela pagina como o catálogo, com **ver mais jogos** e sem reler a lista de desejos a
  cada página.
- **Aba Agentes com os logos dos providers**: cada CLI ganhou o ícone da sua marca (Claude, Codex, Gemini, OpenCode,
  Copilot e Aider) num cartão com a cor do provider, o indicador de instalado com brilho e a versão como etiqueta,
  seguida de há quanto tempo foi publicada. O topo ganhou uma faixa com os logos (apagados quando o CLI não está
  instalado) e uma barra de progresso; um agente novo, que a interface ainda não conhece, cai para a inicial.
- **Aba Agentes mais legível**: cada CLI virou um cartão com a inicial, o repositório de onde vem, a última release
  e as notas de versão num bloco próprio; o comando de instalação ganhou destaque e o botão de copiar.

- **Aba Agentes**: os CLIs de agente mais usados (Claude Code, Codex CLI, Gemini CLI, OpenCode, GitHub Copilot CLI e
  Aider) num só lugar. Cada linha diz se o CLI está instalado nesta máquina — e onde —, mostra a **última release** do
  GitHub com a data e um resumo do que mudou, e, quando o CLI não está instalado, traz o comando de instalação
  **pronto para copiar**. O Canto só copia: nada é instalado nem executado por ele. A lista de releases é pública,
  não precisa de conta nem de chave, e fica 30 min em memória antes de consultar o GitHub de novo. A aba começa
  desligada, a um clique nos Ajustes.
- **Aba Steam**: o nome da conta no cabeçalho virou um atalho para o perfil, e quem não tem a chave da Web API pode
  colá-la ali mesmo, sem desconectar e reconectar a conta.

### Corrigido

- **Escolher a cidade no Clima**: o campo de busca herdava o estilo da caixa de seleção (`canto-box`), que tem
  18 px por 18 px — dava para digitar, mas não para ver o que se digitava. O campo volta a ser um campo de texto
  de verdade, e a busca passa a **mostrar os candidatos com estado e país** para você escolher: antes ela aceitava
  o primeiro resultado e "Londres" ia parar na Argentina, sem como corrigir. O mesmo campo errado saiu da aba
  **Leituras**, que o escondia atrás do "+".
- **Jogo sem título na Steam**: quando a loja não devolvia o nome de um jogo em promoção, a linha mostrava um texto
  fixo em português ("jogo 900999"). Agora ela mostra o appid do jogo, que não depende do idioma e não finge ser um
  título.
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

### Desempenho

- **Tarefas e avisos sem redesenho à toa**: voltar à aba Tarefas (ou outra janela salvar algo) relia o dia e
  redesenhava todas as linhas mesmo sem mudança (~50–85 ms a mais com 1000 tarefas), e cada foco da janela trocava
  a lista de avisos e redesenhava o app inteiro. Agora uma resposta idêntica mantém a lista atual e o React pula
  o redesenho.
- **Edição que não muda nada não reescreve o cofre**: salvar uma tarefa sem alterar nada, ou o cronômetro de
  foco devolver os mesmos segundos, re-selava o cofre inteiro (~120 ms com 22 MB) e congelava a janela. Agora o
  dado é comparado com o que já está em memória e o arquivo só é reescrito quando muda de verdade.

### Adicionado

- **Manifestos de winget e Homebrew gerados da release**: `bun scripts/packaging.ts write vX.Y.Z` reescreve os
  quatro arquivos com a versão e os `sha256` lidos dos próprios assets da release, e `check vX.Y.Z` falha quando
  algum ficou para trás — antes, uma release nova podia deixar o pacote instalando a versão antiga.
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
- **Quem mencionou você, com nome e foto**: o aviso de menção no GitHub e no GitLab mostra a foto, o nome e o @usuário
  de quem escreveu (iniciais quando não há foto), e a faixa de avisos traz o nome em cada cartão. No GitHub o Canto
  procura o comentário que cita você; se não achar, o aviso aparece como antes, sem rosto. Nos resumos (mais de 3
  menções) cada linha começa com o nome. A foto só vem do próprio GitHub, da instância do GitLab ou do Gravatar.
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
