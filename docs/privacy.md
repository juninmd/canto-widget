---
title: Canto privacy policy
permalink: /privacy/
---

# Canto privacy policy

_Last updated: 2026-11-12_ · [Português (Brasil)](#política-de-privacidade-do-canto)

Canto is an open-source desktop widget (Windows, macOS, Linux). Source: https://github.com/juninmd/canto-widget

## Summary

Canto has **no server and no analytics**. Everything it reads from your Google account is fetched by the app on your
own computer and stays there. The developer never receives, stores or can see your data.

## What the app accesses

When you choose **Sign in with Google**, Canto asks for the permissions below. Each is used only for the feature named.

| Data | Used for |
|---|---|
| Name, email, profile photo (`openid`, `email`, `profile`) | Showing which account is connected |
| Calendar events (read-only) | The agenda and meeting alerts |
| Workspace directory (read-only) | Photos of meeting guests |
| Gmail (`gmail.modify`) | Inbox count, important messages (sender, subject, snippet), and the actions you click: mark as read, archive, move to trash |
| Google Tasks | Listing, creating and completing the tasks you choose to sync |
| Drive file metadata (read-only) | Listing file names, types and modification dates; file contents are never requested |
| Contacts (read-only) | The Contacts tab |

## How data is handled

- All requests go **directly from your computer to Google's APIs**. Canto has no backend, and the app window cannot
  contact any other host.
- The sign-in token is stored **encrypted on your disk** (AES-256-GCM, key derived from your master password with
  Argon2id). It never leaves your machine.
- Mail, events, files and contacts are shown on screen and kept only in memory, except what you explicitly save
  (for example, a task you create).
- No data is sold, shared, used for advertising, or used to train AI models. No human reads it.
- Canto's use of information received from Google APIs adheres to the
  [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy),
  including the Limited Use requirements.
- Gmail actions are performed only when you click them. Canto never sends email and never permanently deletes messages.

## Your control

- **Sign out** in Settings revokes the token at Google and deletes it from your disk.
- You can also revoke access at any time at https://myaccount.google.com/permissions.
- Deleting the app's data folder removes everything it stored.

## Changes and contact

Changes to this policy are published in this file's history on GitHub. Questions: open an issue at
https://github.com/juninmd/canto-widget/issues

---

# Política de privacidade do Canto

_Última atualização: 2026-11-12_

O Canto é um widget de desktop de código aberto. **Não há servidor nem analytics**: o que o app lê da sua conta Google
é buscado no seu próprio computador e fica nele. O desenvolvedor nunca recebe, guarda nem vê os seus dados.

- **O que acessa:** agenda (leitura), diretório do Workspace (fotos de convidados), Gmail (contagem, importantes e as
  ações que você clicar: marcar como lido, arquivar, mover para a lixeira), Google Tarefas, metadados de arquivos do
  Drive (nunca o conteúdo) e contatos (leitura), além de nome, e-mail e foto para mostrar a conta conectada.
- **Como trata:** as chamadas vão direto do seu computador para as APIs do Google. O token de login fica **criptografado
  no seu disco** (AES-256-GCM, chave derivada da sua senha mestra com Argon2id) e nunca sai da máquina.
- **O que não faz:** não vende, não compartilha, não usa para publicidade nem para treinar IA, e ninguém lê os dados.
  O uso segue a [Política de Dados de Usuário dos Serviços de API do Google](https://developers.google.com/terms/api-services-user-data-policy),
  incluindo os requisitos de Uso Limitado. O Canto nunca envia e-mail nem apaga mensagens de forma permanente.
- **Seu controle:** **sair** nos ajustes revoga o token no Google e o apaga do disco; você também pode revogar em
  https://myaccount.google.com/permissions.
- **Contato:** abra uma issue em https://github.com/juninmd/canto-widget/issues
