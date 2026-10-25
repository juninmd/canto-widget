## Corrigido

- **Horas e durações no idioma escolhido.** Eixos e dicas de Atividade, Agenda e Mapa, o pico do dia, o anel da
  próxima reunião, o tempo de sol, o foco, os intervalos de Saúde e as horas jogadas na Steam deixam de escrever
  “14h” e “1h30” fixos: em inglês aparecem “14:00” e “1h 30m”, em espanhol “14 h”. O uptime usa a vírgula ou o
  ponto do idioma e o símbolo da moeda em Mercado vem do idioma (“US$” em português, “$” em inglês).
- **Leituras: remover um feed pede confirmação.** O ✕ de um feed agora vira **remover o feed** e só remove no segundo
  clique (Esc ou sair do botão desiste); um erro ao remover aparece em vez de sumir em silêncio. O **+** ganhou nome
  para leitores de tela e foca o endereço ao abrir, um clique duplo em **marcar como lido** não desfaz a marcação, e os
  botões dos cartões voltaram ao tamanho do resto do texto.
- **Steam e Mercado mais firmes.** Na Steam, uma resposta lenta de uma busca, página ou filtro anterior não
  sobrescreve mais a lista que você pediu por último (nem um **ver mais** antigo entra na busca nova); **marcar como
  lidas** e a confirmação de **desconectar** mandam um pedido só, mesmo com clique duplo, e o **tentar de novo** de
  uma marcação que falhou marca de novo. No Mercado, o período que não carregou ganha **tentar de novo** ali mesmo.
- **Gmail abre na Entrada e diz quando a API está desligada.** A aba começava em **Importantes**, que só lista os
  não lidos marcados como importantes e por isso costumava parecer vazia; agora abre em **Entrada**. Quando a Gmail
  API (ou outra API do Google) está desativada no projeto do Google Cloud, o aviso traz o botão **ativar a API**, que
  abre a página certa do console.
- **Carrossel de notificações navegável**: com muitos avisos, a tira do topo do pop-up cortava os últimos sem
  jeito de chegar a eles. Agora tem setas ‹ ›, contador (“2 de 5”), ← → no teclado, rolagem com a roda do mouse
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
