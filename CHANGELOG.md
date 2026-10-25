# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Desempenho

- **Início mais leve das três janelas.** Cada janela carrega só o próprio código: o pop-up de alerta e a captura
  rápida não analisam mais o widget inteiro (de 1085 kB para 405 kB e 331 kB de JS), e só o catálogo do idioma
  escolhido é carregado, não os três (a janela principal cai de 1085 kB para 921 kB). Somando as três webviews
  criadas ao abrir o app, o JS lido na partida cai de 3255 kB para 1656 kB.

### Adicionado

- **Contador de palavras no editor de notas.** Abaixo do texto aparece quantas palavras o card tem e, a partir de
  um minuto, o tempo estimado de leitura. Marcação Markdown, números de lista, caixas de tarefa, imagens e
  endereços de links ficam de fora da conta.
- **Trocar a senha mestra ficou mais à prova de erro.** O formulário em **Segurança** avisa quando o **Caps Lock**
  está ativado, recusa na hora uma senha nova curta demais ou igual à atual, marca e foca o campo com problema (a
  senha atual errada volta selecionada para redigitar), fecha com **Esc** devolvendo o foco ao botão e informa ao
  gerenciador de senhas qual campo é a senha atual e qual é a nova.
- **Busca sem acento e sem caixa.** "acao" acha "Ação" e "reuniao" acha "Reunião" (e o contrário) nas notas, no histórico do clipboard, nas transcrições, na busca global de tarefas, nos docs do Gemini e nas notas ligadas a uma reunião; o destaque `<mark>` marca a palavra acentuada inteira.
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
  interditadas**; dá para arrastar, aproximar e ligar ou desligar as camadas. Abaixo dele: **um termômetro** de quanto a
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
  como lido ou **não lido**, e "virar tarefa"; tocar no avatar **seleciona** e uma barra sobe com os
  **ações em lote** (ler, arquivar, lixeira, todos). No topo, **escrever** abre a janela de novo e-mail do Gmail. **Drive**:
  o **armazenamento usado** com uma barra que cresce, atalhos para criar **Doc, Planilha ou Apresentação** em
  branco, o filtro **Meus arquivos**, filtro por **tipo** (Docs, Planilhas, Apresentações, PDFs), arquivos
  agrupados por **Hoje / Ontem / Nesta semana / Antes**, tamanho dos arquivos que ocupam espaço, **copiar link** e
  **abrir a pasta**. **Contatos**: **próximos aniversários** (30 dias, "amanhã", "em 5 dias"), filtro **Com
  aniversário**, **índice A–Z** que pula para a letra e a destaca, botão **escrever** no Gmail para cada e-mail,
  **copiar ficha** inteira, **novo contato** e o bolo 🎂 que balança. Tudo com os mesmos escopos de antes
  (`gmail.modify`, `drive.metadata.readonly`, `contacts.readonly`) e parado quando o sistema pede menos movimento.
- **Contatos renovada**: os **aniversariantes do dia** aparecem no topo, com a idade quando o Google sabe o ano e
  um botão de **parabéns pelo WhatsApp** com a mensagem já escrita (o bolo 🎂 também marca a pessoa na lista). Abrir um contato agora mostra **tudo** o que o Google guarda: apelido, setor, aniversário, endereços, sites, relações e notas. Cada telefone ganha um botão **WhatsApp** que abre a conversa direto (`wa.me`), com o número normalizado: `+` ou `00` contam como internacional e um número com DDD sem código de país é lido como do Brasil. A busca também acha pelo apelido e pelo setor.
- **Animações nas outras abas**, no espírito do Clima: movimento que diz o que mudou, curto e parado quando o
  sistema pede menos movimento. O sublinhado da aba (e a barra da lateral) **desliza** até a aba escolhida; o
  carregamento ganha um **brilho correndo** no lugar do pulso. **Tarefas**: o risco atravessa o texto ao marcar e
  zerar o dia solta **confete** no anel. **Notas**: "salva" aparece depois de salvar, a nota fixada **desliza** para o topo e trocar lista/grade assenta suave. **Clipboard**: o item copiado em outro app **cai do topo**, "copiado" estoura e o alfinete inclina ao fixar. **Agenda**: a linha do agora anda e pulsa, a próxima reunião ganha um **halo** quando faltam 15 min, Hoje/Reuniões e a troca de dia deslizam. **Gmail**: marcar como lido **varre** o e-mail para o lado e o contador rola. **Drive** e **Contatos**: os ícones e avatares surgem em cascata. **GitHub/GitLab**: a CI rodando gira e, quando o resultado chega na tela, pulsa (passou) ou treme (falhou). **Status**: serviço no ar com um radar discreto, incidente piscando, barra de resumo crescendo e a latência
  **desenhada**. **Agentes**: ícones surgem, o instalado pulsa e a versão de até 3 dias brilha. **Modelos**: barras crescem, a nota **conta** até o valor e reordenar desliza cada modelo ao novo lugar. **Atividade**: a rosca gira fatia por fatia, a coluna da semana sobem e o mapa de horas acende em onda. **Mercado**: o preço **pisca** verde ou vermelho quando muda e o fim da curva pulsa. **Steam**: a capa inclina ao passar o mouse. **Leituras**: os cartões entram em cascata. **Ajustes**: o ✓ das caixas estala e trocar o tema faz as cores **fundirem**.

- **Aba Clima com o céu de verdade**: o cartão de cima agora é um céu que acompanha o tempo — azul limpo, noite estrelada, chuva, neve, neblina e a noite, com a **bilha**. Os dados vêm da Open-Meteo, sem chave: a qualidade do ar vem da API de ar do mesmo serviço e, se ela falhar, só o quadro fica vazio.

- **Canto para Android e iOS**, a partir do mesmo código (Tauri v2 Mobile). O cofre, as abas e os avisos são os mesmos; a janela vira tela cheia, as abas ficam numa barra embaixo (com uma folha "mais" para as demais), o cabeçalho ganha a busca global e o que só existe no computador (janela, bandeja, atalhos globais, Atividade, pasta sincronizada, início com o sistema, atualização pelo app) some de Ajustes. No celular o Clipboard captura o que foi copiado quando a aba aparece, o backup e a exportação de nota usam o seletor de arquivos do sistema e o Canto pede a permissão de notificações na primeira abertura. O CI passa a compilar o crate para Android e iOS. Ainda não há desbloqueio biométrico no celular. Veja [docs/mobile.md](docs/mobile.md).

### Corrigido

- **Teclado no menu de adiar e na folha "mais" do celular.** O menu ▾ de adiar um aviso abre já no tempo atual,
  as setas percorrem as opções e Esc devolve o foco ao botão; a folha de abas do celular abre na aba atual, mantém
  o Tab dentro dela e, ao fechar, devolve o foco ao botão **mais** em vez de perdê-lo.
- **Horas e durações no idioma escolhido.** Eixos e dicas de Atividade, Agenda e Mapa, o pico do dia, o anel da
  próxima reunião, o tempo de sol, o foco, os intervalos de Saúde e as horas jogadas na Steam deixam de escrever
  "14h" e "1h30" fixos: em inglês aparecem "14:00" e "1h 30m", em espanhol "14 h". O uptime usa a vírgula ou o
  ponto do idioma e o símbolo da moeda em Mercado vem do idioma ("US$" em português, "$" em inglês).

- **Leituras: remover um feed pede confirmação.** O ✕ de um feed agora vira **remover o feed** e só remove no segundo
  clique (Esc ou sair do botão desiste); um erro ao remover aparece em vez de sumir em silêncio. O **+** ganhou nome
  para leitores de tela e foca o endereço ao abrir, um clique duplo em **marcar como lido** não desfaz a marcação, e os
  botões dos cartões voltaram ao tamanho do resto do texto.
- **Steam e Mercado mais firmes.** Na Steam, uma resposta lenta de uma busca, página ou filtro anterior não
  sobrescreve mais a lista que você pediu por último (nem um **ver mais** antigo entra na busca nova); **marcar como
  lidas** e a confirmação de **desconectar** mandam um pedido só, mesmo com clique duplo, e o **tentar de novo** de
  uma marcação que falhou marca de novo. No Mercado, o período que não carregou ganha **tentar de novo** ali mesmo.

- **Gmail abre na Entrada e diz quando a API está desligada.** A aba começava em **Importantes**, que só lista os

- **Gmail abre na Entrada e diz quando a API está desligada.** A aba começava en **Importantes**, que só lista os
  não lidos marcados como importantes e por isso costumava parecer vazia; agora abre em **Entrada**. Quando a Gmail
  API (ou outra API do Google) está desativada no projeto do Google Cloud, o aviso traz o botão **ativar a API**, que
  abre a página certa do console.

- **Carrossel de notificações navegável**: com muitos avisos, a tira do topo do pop-up cortava os últimos sem
  jeito de chegar a eles. Agora tem setas ‹ ›, contador ("2 de 5"), ← → no teclado, rolagem com a roda do mouse
  e arrastando, e o aviso escolhido sempre rola para a vista.
- **Atualizar o Canto não apaga mais as suas escolhas.** Antes só as abas visíveis e o layout tinham cópia no
  arquivo `preferencias.json`; agora **todas** as preferências da interface vão para lá (tema, densidade, idioma,
  modo mini, vista da agenda e das notas, lembretes, grupos de Ajustes...). E quando o webview volta da
  atualização com uma cópia **antiga** (não vazia), vale a mais recente, em vez de a antiga apagar a do arquivo.

- **Pop-up de notificação sem a borda de cima**: a janela media o cartão no meio da animação de entrada (ainda
  em 98%) e ficava alguns pixels mais baixa; agora usa a altura real do cartão.

- **A atualização não apaga mais as abas que você deixou visíveis.** A escolha das abas (e o layout) só ficava no
  armazenamento da webview, que pode voltar vazio depois de uma atualização, e então voltava o padrão. Agora ela
  também é gravada em `preferencias.json`, ao lado do cofre, e restaurada na abertura quando a webview perdeu a
  cópia; quando as duas existem, vale a da webview. Quem já usa a versão com a correção fica protegido da próxima
  atualização em diante.

- **O filtro "buscar ajuste" não cobre mais o menu das abas**: a barra lateral expandida passou a ficar acima do
  campo fixo de busca de Ajustes.

- **Falhas TCP no Windows**: conexão recusada e tempo esgotado usam o tipo do erro, mantendo a mensagem pt-BR
  esperada independentemente do idioma do sistema operacional.
