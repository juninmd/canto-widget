# Integrações

[← voltar ao README](../README.md)

## Agenda do Google (opcional)

**Build com cliente embutido:** baixe o JSON do cliente "App para computador" do Google Cloud e salve como
`src-tauri/google-oauth.json` (fica fora do git). A build embute o Client ID, e em **ajustes** basta
**entrar com o Google**. Sem o arquivo, o app pede as credenciais como abaixo.

1. No Google Cloud Console: **APIs e serviços → Credenciais → Criar credencial → ID do cliente OAuth → App para computador**.
2. Habilite a **Google Calendar API** no mesmo projeto.
3. Na aba **ajustes**, cole o *Client ID* (e o *client secret*, que o Google emite para apps desktop) e salve.
4. **entrar com o Google** abre o navegador; ao autorizar, o widget captura o code na porta loopback
   e mostra um cartão com foto, nome e e-mail da conta. **sair** revoga o token no Google e apaga a
   conta do cofre; as credenciais do cliente continuam salvas.

Quem conectou numa versão anterior (com sync no Drive): a agenda continua funcionando, mas o token
ainda carrega o escopo `drive.appdata`. **sair** e entrar de novo para ficar só com a
agenda. O `vault.enc` antigo (cifrado) segue na pasta oculta do app no Drive até ser apagado em
Drive → Configurações → Gerenciar apps → *Excluir dados ocultos do app*.

## GitHub (opcional)

A aba **github** lista o que está aberto e é seu: **revisão pedida a mim**, **atribuídos a mim** (issues e PRs),
**PRs que eu abri** e **issues que eu abri**, cada lista com o total no GitHub e até 30 itens, do mais recente
para o mais antigo. Clicar abre no navegador. **atualizar** refaz as 5 buscas (a API de busca permite 30 por minuto).

Duas formas de conectar:

- **Token pessoal** (sempre disponível): crie um *fine-grained token* em
  <https://github.com/settings/personal-access-tokens/new> com **Issues** e **Pull requests** em *Read-only*
  nos repositórios que quiser ver, e cole na aba.
- **Entrar com o GitHub** (device flow): aparece quando a build traz o Client ID de um GitHub App.
  Crie um GitHub App com permissões *Issues* e *Pull requests* em *Read-only*, marque **Enable Device Flow**
  e exporte `CANTO_GITHUB_CLIENT_ID=<client id>` antes do `bun run tauri build` (na CI, variável de repositório
  com o mesmo nome). O Client ID é público; não há client secret na build.

**desconectar** apaga o token deste computador. Para revogar de vez: GitHub → Settings → Applications
(GitHub App) ou Personal access tokens.
