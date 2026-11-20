---
title: Ajustes
---
{% include nav.html %}
{% assign p = '/prints/' | relative_url %}

# Ajustes

A aba **Ajustes** nunca some e tem um campo **buscar ajuste** (aceita português e inglês). Os grupos, na ordem em que
aparecem; o que é só do desktop não existe no celular.

![Ajustes em grupos]({{ p }}ux-melhorias/ajustes-grupos.png)

## Aparência

| Seção | O que controla |
|---|---|
| **Skin** | padrão, Hueco Mundo, Drácula, Glass, Aurora, Claro e Sistema (segue o claro/escuro do SO). Todas passam contraste AA. |
| **Tamanho da interface** | compacta, padrão ou confortável: escala texto e espaçamento juntos. |
| **Idioma** | 42 idiomas de interface; segue o idioma do sistema até você escolher. |
| **Abas visíveis** | liga/desliga cada aba e escolhe o layout da barra (horizontal ou vertical). Os dados ficam no cofre. |

## Notificações

| Seção | O que controla |
|---|---|
| **Lembretes** | antecedência do aviso de reunião (na hora, 5, 10, 15 ou 30 min antes). |
| **Resumo do dia** | um aviso pela manhã com reuniões, tarefas abertas, revisões pedidas e menções não lidas. Itens zerados ficam de fora. |
| **Não perturbe** | silencia por 30 min, 1 h, 2 h, até amanhã às 8h ou até desligar. |
| **Modo foco** | liga o Não perturbe sozinho, num horário ou durante reuniões, e mostra um resumo do que foi silenciado. |
| **Jogos e tela cheia** | segura pop-up e notificação enquanto um app está em tela cheia (Windows). |
| **Avisos de revisão** | notificação quando pedem sua revisão no GitHub/GitLab. |
| **Meus PRs** | CI com falha, PR parado, aprovação, conflito, comentário, atribuição e menção nos seus PRs. |

## Privacidade e segurança

| Seção | O que controla |
|---|---|
| **Atividade** | liga o registro de apps em uso (desktop) e limpa o histórico. |
| **Foco** | estimativa e timer de foco das tarefas. |
| **Segurança** | trocar a senha mestra; **trancar sozinho** após 5, 15 (padrão), 30 ou 60 min, ou **nunca**; Windows Hello e Touch ID; lista dos últimos 20 desbloqueios. |

O Touch ID no macOS só aparece quando o app tem o entitlement necessário; a versão atual distribuída é ad-hoc.

## Dados e contas

| Seção | O que controla |
|---|---|
| **Google** | conectar/desconectar a conta (Agenda, Gmail, Drive, Tarefas, Contatos). |
| **Clipboard** | tamanho do histórico, máximo de fixados (100 por padrão, até 1.000). |
| **Backup** | exportar e importar o arquivo `.canto` cifrado; mostra há quanto tempo foi o último export e avisa com 30+ dias. Cópias diárias automáticas ficam na pasta do app. |
| **Sincronização** | pasta sincronizada (Dropbox, OneDrive, Syncthing...) com merge automático; mostra a última sincronização ou o erro atual. |

![Backup]({{ p }}app/130-backup-lembrete.png)

Detalhes de backup e merge: [Segurança e dados](seguranca.html).

## App (desktop)

| Seção | O que controla |
|---|---|
| **Servidor MCP** | endpoint local para agentes de código lerem o Canto (desligado por padrão). Veja [Integrações](integracoes.html#servidor-mcp-opcional). |
| **Janela** | sempre na frente, voltar ao canto e ao tamanho original. |
| **Mini-dashboard** | a pílula na borda da tela: itens, ordem, posição, monitor, tamanho, fundo e opacidade, com prévia ao vivo. |
| **Próxima agenda na barra** | texto do próximo evento na barra de menus (macOS), ao lado do ícone (Linux) ou na barra de tarefas (Windows). |
| **Iniciar com o sistema** | abre só na bandeja, com o cofre trancado. |
| **Atalhos** | lista os atalhos globais do app. Veja [Atalhos](atalhos.html). |
| **Atualizações** | versão instalada e a última publicada, com **atualizar e reiniciar**. |

![Servidor MCP]({{ p }}mcp/mcp-ligado.png)
![Mini-dashboard]({{ p }}app/151-mini-dashboard-ajustes.png)
![Atualizações]({{ p }}app/18-atualizacoes.png)
