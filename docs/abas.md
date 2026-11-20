---
title: Abas e recursos
---
{% include nav.html %}
{% assign p = '/prints/app/' | relative_url %}

# Abas e recursos

O Canto tem 21 abas. Nem todas aparecem de início: **Ajustes → Abas visíveis** liga e desliga cada uma (os dados
continuam no cofre) e o layout da barra pode ser horizontal ou vertical. `Alt+1`…`Alt+9` seguem a ordem das abas
visíveis. Todas as telas abaixo usam dados fictícios.

| Aba | Começa | Precisa de | Só desktop |
|---|:-:|---|:-:|
| [Tarefas](#tarefas) | visível | nada (Google Tarefas opcional) | |
| [Notas](#notas) | visível | nada | |
| [Clipboard](#clipboard) | visível | nada | |
| [Agenda](#agenda) | visível | conta Google | |
| [Gmail](#gmail) | oculta | conta Google | |
| [Drive](#drive) | oculta | conta Google | |
| [Contatos](#contatos) | oculta | conta Google (API People) | |
| [GitHub](#github-e-gitlab) | visível | token ou login pelo navegador | |
| [GitLab](#github-e-gitlab) | oculta | token `read_api` | |
| [Status API](#status-api) | oculta | nada | |
| [Agentes](#agentes) | oculta | nada | |
| [Modelos IA](#modelos-ia) | visível | nada | |
| [Atividade](#atividade) | oculta | nada | ✔ |
| [Clima](#clima) | oculta | nada | |
| [Mapa](#mapa) | oculta | chave TomTom grátis (opcional) | |
| [Mercado](#mercado) | oculta | nada | |
| [Sistema](#sistema) | oculta | nada | ✔ |
| [Dev](#dev) | oculta | nada | ✔ |
| [Steam](#steam) | oculta | SteamID64 (chave opcional) | |
| [Leituras](#leituras) | oculta | endereços de feeds | |
| [Ajustes](ajustes.html) | sempre | nada | |

## Tarefas

Checklist do dia com horário e repetição (todo dia, dias úteis ou semanal). Escreva **`Diário às 9:30`** e o lembrete
já fica pronto; **`!alta`** (ou `!média`, `!baixa`) define a prioridade, e o ponto na linha alterna. Cole uma lista
no campo vazio e cada linha vira uma tarefa. Subtarefas, link de PR, lembrete por contexto (esperar um app ou uma
rede Wi-Fi), **timer de foco** com estimativa (uma barra fixa sob todas as abas), busca e reordenação com
`Alt+↑/↓`. Excluir não pede confirmação: o aviso do rodapé oferece **desfazer** por 6 s. A lista vira sozinha à
meia-noite. Logado no Google, a seção **Google Tarefas** aparece abaixo do dia.

![Tarefas]({{ p }}01-tarefas.png) ![Google Tarefas]({{ p }}104-google-tarefas.png)

## Notas

Cards pesquisáveis com `#tags`, fixar no topo e filtro por tag; cada card mostra o começo da nota já renderizado.
Editor **WYSIWYG** com barra compacta (negrito, itálico, código, títulos, listas, checklists, blocos de código com
realce, links, imagens) e atalhos de markdown; o botão **MD** mostra o markdown cru, que é como a nota é guardada.
Imagens (PNG, JPEG, GIF, WebP até 2 MB) ficam cifradas, só neste computador. Aguenta milhares de notas. Importa o
Google Keep de um export do Takeout (`#keep`).

![Notas]({{ p }}02-notas.png) ![Editor de notas]({{ p }}24-notas-markdown.png)

## Clipboard

Histórico cifrado, com busca, fixar e filtro por tipo (link, cor, JSON, e-mail, telefone, código, texto). Passe o
mouse num item para **copiá-lo reescrito**: JSON formatado ou compacto, texto numa linha, MAIÚSCULAS ou minúsculas.
Cópias gigantes guardam só o começo e avisam. No Windows, ignora o que gerenciadores de senha marcam como sensível.
Nunca é sincronizado. `Ctrl+Alt+V` tira a formatação do clipboard atual.

![Clipboard]({{ p }}03-clipboard.png)

## Agenda

Eventos do dia do Google Calendar em três visões: **Hoje** (reunião em andamento ou a próxima, o dia em uma linha
e a linha do tempo com reuniões, tarefas e janelas livres), **Lista** e **Reuniões**. Um minuto antes, o widget salta
na tela com **entrar no Meet**, som e notificação, em qualquer aba. Cada evento mostra sua resposta; convite sem
resposta traz **Aceitar**, **Talvez** e **Recusar** direto no card, e convite novo também avisa por pop-up. Mostra o
**próximo horário livre** de 15 min ou mais e marca **conflitos** entre eventos. Detalhes do evento: organizador,
convidados com avatar e resposta, anexos e as notas do Gemini. A sub-aba **Reuniões** lista notas e transcrições
(Gemini dos últimos 14 dias e arquivos `.vtt`, `.srt`, `.txt`, `.md` de uma pasta local).

![Agenda]({{ p }}04-agenda.png) ![Detalhes do evento]({{ p }}22-agenda-detalhes-evento.png)

Configuração: [Integrações → Agenda do Google](integracoes.html#agenda-do-google-opcional).

## Gmail

Contagem de não lidas e quatro visões (**Importante**, **Não lidas**, **Com estrela**, **Entrada**), busca com a
sintaxe do Gmail. Por e-mail: estrela, arquivar, lixeira, lido/não lido, abrir no Gmail ou virar tarefa (Google
Tarefas); selecione vários pelos avatares para agir em lote. Opcional: notificação só de e-mail importante.

![Gmail]({{ p }}102-gmail.png)

## Drive

Uso do armazenamento, criação de Doc, Planilha e Apresentação em branco, e todo o Meu Drive com pastas, ou
**recentes**, **com estrela**, **compartilhados** e **meus**, agrupados por período, filtráveis por tipo e com busca.
Por arquivo: abrir, copiar link, abrir pasta. O Canto lê só **metadados** (`drive.metadata.readonly`), nunca o conteúdo.

![Drive]({{ p }}103-drive.png)

## Contatos

Sua agenda do Google (somente leitura): busca sem acento, filtros com contagem, índice A–Z, **aniversários de hoje**
com saudação em um clique pelo WhatsApp e os próximos do mês. A ficha mostra tudo que o Google guarda e permite copiar,
escrever no Gmail e abrir o telefone no WhatsApp. Exige a API People habilitada no seu projeto Google Cloud.

![Contatos]({{ p }}115-contatos.png)

## GitHub e GitLab

**Revisão pedida a mim**, atribuídos a mim e PRs/issues que abri, com selo de **CI**, destaque para rascunhos, PRs
**esperando sua revisão** e PRs **parados** há uma semana. Notificação do sistema quando alguém pede sua revisão.
Filtros por texto, `repo:` e `label:`, ordenação e **mostrar mais**. A visão **Comentários** mostra quem comentou nos
seus PRs (humanos e bots). A aba **GitLab** faz o mesmo para GitLab.com e instâncias próprias, com cache de 5 min que
respeita o limite de requisições.

![GitHub]({{ p }}05-github.png) ![GitLab]({{ p }}21-gitlab.png)

Configuração: [Integrações → GitHub](integracoes.html#github-opcional) e [GitLab](integracoes.html#gitlab-e-gitlab-self-hosted-opcional).

## Status API

Status de serviços públicos ordenados por gravidade (caídos, degradados, em manutenção, operacionais) e **seus endpoints**: latência, limite, dias de validade do certificado e verificação de DNS, com sino para avisar quando algo piora.

![Status API]({{ p }}111-status-servicos.png) ![Endpoints]({{ p }}112-status-endpoints.png)

## Agentes

Os agentes de código numa lista: Claude Code, Codex CLI, Gemini CLI, OpenCode, GitHub Copilot CLI, Aider,
Antigravity CLI, VS Code e Grok Build. Cada card diz se está instalado nesta máquina, a **última versão** do GitHub
com resumo do que mudou e, se não estiver instalado, o **comando de instalação pronto para copiar**. O Canto só
copia: nada é instalado nem executado. Dados públicos, sem chave, cache de 30 min.

![Agentes]({{ p }}90-agentes.png)

## Modelos IA

LLMs ranqueados pelo **Intelligence Index** da [Artificial Analysis](https://artificialanalysis.ai), sem chave nem
conta: barra de nota, criador, preço por 1M de tokens, velocidade e contexto. Ordene por inteligência, preço,
velocidade, contexto ou data; filtre por pesos abertos ou raciocínio. Abra a ficha completa de um modelo e marque
até quatro para **comparar** lado a lado. Busca no máximo a cada 3 h; o sino opcional avisa quando um modelo entra
no top 10 ou sobe dentro dele.

![Modelos]({{ p }}106-modelos-chips.png) ![Comparar]({{ p }}117-modelos-comparar.png)

## Atividade

Quanto tempo você passou em cada app (só desktop, lido localmente): visões **Dia** e **Semana**, meta diária,
linha do tempo, mapa de calor por hora, categorias com cores por skin e o tempo por tarefa do timer de foco. Nada
sai da máquina; o histórico pode ser limpo em **Ajustes → Atividade**.

![Atividade]({{ p }}107-atividade-meta.png)

## Clima

Céu animado que acompanha o tempo, as **próximas 2 horas** em passos de 15 min, oito leituras (sensação, umidade,
vento, pressão, visibilidade, orvalho, UV, qualidade do ar), gráfico por hora, sete dias, arco do sol e fase da lua.
Busca de cidade enquanto você digita. Usa Open-Meteo, sem chave, com cache de 30 min; o app guarda só as coordenadas
da cidade escolhida.

![Clima]({{ p }}92-clima.png) ![Previsão]({{ p }}93-clima-previsao.png)

## Mapa

Mapa das ruas ao seu redor colorido pela velocidade ao vivo, com a rota escolhida e pinos de **acidentes,
congestionamentos, obras e bloqueios**; medidor de quanto a região está mais lenta que o fluxo livre, suas
**viagens** (trabalho, academia) com tempo e atraso, **melhor hora de sair** e ocorrências em 5 km. Os dados vêm da
**TomTom com a sua chave grátis** (2.500 requisições/dia, sem cartão), guardada no cofre; sem chave, a aba mostra as
ruas do OpenStreetMap.

![Mapa]({{ p }}100-mapa.png)

## Mercado

24 cotações ao vivo: 10 moedas contra o real (mais euro/dólar), 7 índices (Ibovespa, S&P 500, Nasdaq, Dow Jones,
DAX, FTSE 100, Nikkei 225) e 7 criptomoedas. Destaque com gráfico (1D, 5D, 1M, 6M, 1Y), abertura, fechamento
anterior e faixa de 52 semanas, mais lista filtrável por tipo. Dados do Yahoo Finance, sem chave, em memória por 15 min.

![Mercado]({{ p }}94-mercado.png)

## Sistema

CPU, GPU, memória, disco, rede e energia em sub-abas, lidos a cada 2 s só enquanto a aba está na tela. Mostra
temperatura, pressão de memória, os apps que mais consomem e a saúde da bateria. **Alertas do sistema** (desligados
por padrão, um interruptor por tipo): memória acima de 90%, disco quase cheio, CPU no máximo por 5 min, CPU acima de
85 °C, bateria abaixo de 20% fora da tomada e bateria gasta.

![Sistema]({{ p }}123-sistema-geral.png)

## Dev

Para quem desenvolve, só no desktop: **Portas** (quem segura cada porta, com opção de encerrar o processo),
**Docker** (contêineres por projeto Compose, logs, imagens, volumes e limpeza), **Git** (branch, mudanças e
ahead/behind dos repositórios que você adicionar, mais worktrees já sincronizadas para remover), **Ferramentas**
(JSON, JWT, Base64, URL, UUID e segredos, hashes com HMAC, timestamps, regex e diff, tudo local) e **Agenda**
(lista e edita o crontab no Linux/macOS e lista o Agendador de Tarefas no Windows).

![Dev]({{ p }}132-dev-portas.png)

## Steam

Sub-abas animadas: **Jogue agora** (todos os seus jogos, com botão Jogar, filtros e três visões), **Atualizações**
(changelogs dos patches), **Lista de desejos** (com destaque para promoções de 75% ou mais), **Mais jogados**,
**Ofertas**, **Em alta** e **Catálogo**; seletor de região com 12 lojas e moedas. O sino avisa promoção da lista e
atualização dos seus jogos. As listas públicas só precisam do seu **SteamID64**; uma chave da Steam Web API é opcional.

![Steam]({{ p }}119-steam-jogue-agora.png)

## Leituras

Leitor de RSS/Atom: cole os endereços e leia tudo num lugar, com contagem de não lidas, favicon, resumo e
miniatura, tudo baixado pelo Rust. Marque como lido/não lido; um feed quebrado fica em vermelho. Cache de 15 min.

![Leituras]({{ p }}96-leituras.png)

## Ajustes

Aparência, notificações, privacidade, dados e app, com busca. Veja [Ajustes](ajustes.html).

## Além das abas

- **Mini-dashboard**: pílula opcional na borda da tela com até 15 itens (relógio, CPU, memória, bateria, tarefas,
  clima, próximo evento, revisões, avisos, mercado...). Ajustes → Mini-dashboard.
- **Avisos**: o sino do cabeçalho abre todos os alertas pendentes (descartar todos, resolvidos hoje).
- **Não perturbe**: silencia alertas por 30 min, 1 h, 2 h, até amanhã ou até você desligar; a lua no topo mostra
  quando termina.
- **Modos de janela**: Mini (trilho na borda), Escondido, Normal e Maximizado.
- **Skins**: padrão, Hueco Mundo, Drácula, Glass, Aurora, Claro e Sistema.

![Mini-dashboard]({{ p }}150-mini-dashboard.png) ![Modos]({{ p }}62-modos-menu.png)
