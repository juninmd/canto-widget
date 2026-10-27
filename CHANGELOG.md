# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Desempenho

- **Início mais leve das três janelas.** Cada janela carrega só o próprio código: o pop‑up de alerta e a captura
  rápida não analisam mais o widget inteiro (de 1085 kB para 405 kB e 331 kB de JS), e só o catálogo do idioma
  escolhido é carregado, não os três (a janela principal cai de 1085 kB para 921 kB). Somando as três webviews
  criadas ao abrir o app, o JS lido na partida cai de 3255 kB para 1656 kB.

### Adicionado

- **Android não envia o cofre para a nuvem.** O Backup Automático do Google e a transferência entre aparelhos deixam de copiar o diretório de dados (cofre cifrado e tokens selados); a cópia de segurança continua sendo o `.canto` exportado.
- **Colar uma lista cria uma tarefa por linha.** Cole várias linhas no campo de nova tarefa vazio e cada uma vira
  uma tarefa, na ordem; marcadores de lista (`-`, `*`, `[ ]`, `[x]`, `1.`, `•`) somem e hora e `!alta` de cada
  linha continuam valendo. Até 50 linhas por vez (um aviso diz quantas ficaram de fora); se uma linha falhar, ela
  volta ao campo com as seguintes na fila e **Enter** tenta de novo. Uma linha só continua colando como antes.
- **Alt+↑/↓ move a tarefa de qualquer ponto da linha.** Antes só a alça de arrastar aceitava as setas; agora, com o
  foco na caixa de marcar (ou em qualquer botão da linha), Alt+↑/↓ sobe ou desce a tarefa, e a ajuda de atalhos (?) mostra o atalho.
- **Busca sem acento e sem caixa.** "acao" acha "Ação" e "reuniao" acha "Reunião" (e o contrário) nas notas, no histórico do clipboard, nas transcrições, na busca global de tarefas, nos docs do Gemini e nas notas ligadas a uma reunião; o destaque `<mark>` marca a palavra acentuada inteira.
- **Início mais leve das três janelas.** Cada janela carrega só o próprio código: o pop‑up de alerta e a captura
  rápida não analisam mais o widget inteiro (de 1085 kB para 405 kB e 331 kB de JS), e só o catálogo do idioma
  escolhido é carregado, não os três (a janela principal cai de 1085 kB para 921 kB). Somando as três webviews
  criadas ao abrir o app, o JS lido na partida cai de 3255 kB para 1656 kB.
- **Teclado no menu de adiar e na folha "mais" do celular.** O menu ▾ de adiar um aviso abre já no tempo atual,
  as setas percorrem as opções e Esc devolve o foco ao botão; a folha de abas do celular abre na aba atual, mantém
  o Tab dentro dela e, ao fechar, devolve o foco ao botão **mais** em vez de perdê-lo.
- **Horas e durações no idioma escolhido.** Eixos e dicas de Atividade, Agenda e Mapa, o pico do dia, o anel da
  próxima reunião, o tempo de sol, o foco, os intervalos de Saúde e as horas jogadas na Steam deixam de escrever
  "14h" e "1h30" fixos: em inglês aparecem "14:00" e "1h 30m", em espanhol "14 h". O uptime usa a vírgula ou o
  ponto do idioma e o símbolo da moeda em Mercado vem do idioma ("US$" em português, "$" em inglês).
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
  a variação em valor e em %", a fechamento anterior como linha tracejada, um cursor que diz preço e hora em qualquer ponto da curva, os períodos 1D, 5D, 1M, 6M e 1A (buscados sob demanda, com cache de 15 min), a abertura e réguas da faixa do dia e 52 semanas. Os cartões viram uma lista de acompanhamento com mini‑curva, filtro **Moedas / Índices / Cripto** e ordem por maiores altas ou baixas.
- **Aba Mapa, com o trânsito da sua região.** Um mapa com as ruas **coloridas pela velocidade ao vivo** (de livre a parado), a rota do trajeto escolhido desenhada por cima e pinos para **acidentes, lentidão, obras e vias interditadas**; dá para arrastar, aproximar e ligar ou desligar as camadas. Abaixo dele **termômetro** de quanto a região está mais lenta que no trânsito livre, o radar de leitura do dia; **seus trajetos** (trabalho, academia…) com o tempo agora, os minutos a mais e a distância; a **melhor hora para sair** nas próximas 2 horas, de 15 em 15 min; e o que pode ser feito em 5 km, etc.

- **Modelos de IA com ficha completa e comparação lado a lado.** Tocar num modelo abre a **ficha** ali mesmo:
  lançamento, contexto, pesos abertos ou fechados, raciocínio, tempo de leitura, velocidades, pontuações de inteligência, de programação, etc.

- **Gmail, Drive e Contatos renovados, com mais ações e animações novas.** **Gmail**: quatro visões (Importantes, Não lidos, Com estrela, Entrada) com busca no próprio Gmail; cada e‑mail ganha **estrela** (que gira ao marcar), **arquivar**, **lixeira**, **marcar como lido ou não lido**, e "virar tarefa"; tocar no avatar seleciona e a barra sobe com as ações em lote; a barra de bandeja soluciona atuando em convenções de cores.

- **Contatos renovada**: Aniversariantes e próximos aniversários aparecem no topo, fotos de contatos, repositórios de informação de Google.

- **Aba Cinema** – (...).
