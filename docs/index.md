---
title: Canto
permalink: /
---
{% include nav.html %}
{% assign p = '/prints/' | relative_url %}

# Canto

Widget de mesa **de código aberto** (Windows, macOS e Linux, com versão para Android e iOS) que junta tarefas,
notas, histórico do clipboard, agenda do Google, GitHub/GitLab, Gmail, Drive e mais num **cofre local
criptografado**. Sem servidor, sem conta, sem telemetria.

[Baixar a última versão](https://github.com/juninmd/canto-widget/releases/latest){: .btn } ·
[Código-fonte](https://github.com/juninmd/canto-widget) · [Política de privacidade](privacy/)

![Tour pelo Canto: Tarefas, Notas, Clipboard, Agenda, GitHub, o aviso de reunião e as skins]({{ p }}readme/tour.gif)

## Por que o Canto

- 🔒 **Criptografado por padrão**: Argon2id + AES-256-GCM com senha mestra; a chave só existe na memória.
- 🏠 **Seus dados ficam com você**: sem servidor, sem conta. O backup é um único arquivo `.canto` cifrado.
- ⏰ **Você não perde o horário**: 1 minuto antes da reunião e na hora do lembrete o widget aparece, toca e
  notifica, com **adiar 10 min**.
- 🪶 **Leve**: Tauri v2 (Rust + webview do sistema), instalador de cerca de 3,5 MB.
- 🔄 **Sempre atualizado**: atualiza de dentro do app e só instala pacote assinado pela chave do projeto.

## Comece por aqui

| Quero... | Vá para |
|---|---|
| Instalar no meu sistema | [Instalação](instalacao.html) |
| Saber o que cada aba faz | [Abas e recursos](abas.html) |
| Aprender o dia a dia (tarefas, notas, alertas) | [Guia de uso](uso.html) |
| Configurar o app | [Ajustes](ajustes.html) |
| Decorar os atalhos | [Atalhos](atalhos.html) |
| Conectar Google, GitHub, GitLab ou agentes (MCP) | [Integrações](integracoes.html) |
| Entender segurança, backup e sincronização | [Segurança e dados](seguranca.html) |
| Usar no celular | [Canto no celular](mobile.html) |
| Tirar uma dúvida | [FAQ](faq.html) |

## Um olhar rápido

| Tarefas | Agenda | GitHub |
|---|---|---|
| ![Tarefas]({{ p }}app/01-tarefas.png) | ![Agenda]({{ p }}app/04-agenda.png) | ![GitHub]({{ p }}app/05-github.png) |

| Notas | Clipboard | Ajustes |
|---|---|---|
| ![Notas]({{ p }}app/02-notas.png) | ![Clipboard]({{ p }}app/03-clipboard.png) | ![Ajustes]({{ p }}app/06-ajustes.png) |

Todas as telas usam dados fictícios.

## Mais

- [Comparativo com outras ferramentas](benchmark.html) · [Changelog](https://github.com/juninmd/canto-widget/blob/main/CHANGELOG.md) ·
  [Como contribuir](https://github.com/juninmd/canto-widget/blob/main/CONTRIBUTING.md) ·
  [Relatar falha de segurança](https://github.com/juninmd/canto-widget/blob/main/SECURITY.md)
- Licença: veja [LICENSE](https://github.com/juninmd/canto-widget/blob/main/LICENSE).
- README em outros idiomas: [português](https://github.com/juninmd/canto-widget/blob/main/docs/readmes/README.pt-BR.md) e
  [mais de 30 idiomas](https://github.com/juninmd/canto-widget#-languages).
