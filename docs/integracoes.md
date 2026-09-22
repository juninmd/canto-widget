# Integrações

[← voltar ao README](../README.pt-BR.md)

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

### Anotações e transcrições do Gemini

O Canto não gera transcrições. Quando alguém liga **Take notes for me** (anotações do Gemini) ou a transcrição
no Meet, o Gemini salva um Google Doc no Drive do organizador e o anexa ao evento. A aba **reuniões** lista esses
documentos (anexos cujo título cita Gemini ou transcrição) das reuniões dos últimos 14 dias, e a aba **agenda**
os mostra nos detalhes do evento; clicar abre o documento no navegador. Mostrar o texto dentro do widget exigiria o escopo `drive.readonly`, que o Google classifica como
restrito e que obrigaria uma auditoria de segurança paga para um app público; por isso o Canto fica só com
`calendar.events.readonly`. Para pesquisar o texto no Canto, exporte o documento (`.txt` ou `.md`) para a
pasta da aba **reuniões**.

## GitHub (opcional)

A aba **github** lista o que está aberto e é seu: **revisão pedida a mim**, **atribuídos a mim** (issues e PRs),
**PRs que eu abri** e **issues que eu abri**, cada lista com o total no GitHub e 30 itens por vez, do mais recente
para o mais antigo; **mostrar mais** traz a próxima página daquela lista, até o limite de 1.000 resultados da busca.
Clicar abre no navegador.

**Ordenar por** atualização, criação ou comentários, com a seta alternando entre decrescente e crescente. Com
centenas de issues, a ordem vale para a busca inteira, não só para a página na tela.

**Cache e limite de requisições.** As listas ficam na memória por 5 minutos enquanto o cofre está aberto: voltar à
aba, trocar de filtro e voltar, ou abrir o resumo do dia não gasta busca. O cabeçalho mostra há quanto tempo os dados
vieram. **atualizar** ignora o cache. O Canto lê a cota que o GitHub devolve em cada resposta
(`x-ratelimit-remaining`, `x-ratelimit-reset`, `Retry-After`) e para 2 chamadas antes do fim: aí mostra a última
cópia e a hora em que dados novos voltam, sem bater no limite. O cache nunca vai para o disco (os títulos são
privados) e some ao trancar o cofre ou desconectar a conta.

O campo **filtrar** entra na busca do GitHub quando você aperta `Enter`, e aceita texto livre e qualificadores
como `repo:dono/nome`, `label:bug` ou `org:acme`. Os botões **tudo · PRs · issues** escondem as listas que não
têm aquele tipo e não gastam busca com elas.

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

## GitLab e GitLab self-hosted (opcional)

A aba **gitlab** (ative em **Ajustes → Abas visíveis**) mostra as mesmas quatro listas para merge requests e issues: **revisão pedida a mim**,
**atribuídos a mim**, **MRs que eu abri** e **issues que eu abri**, com filtro por texto (título e descrição),
**tudo · MRs · issues**, ordem por atualização ou criação (a API do GitLab não ordena por comentários) e o mesmo
cache e controle de limite do GitHub (cabeçalhos `RateLimit-Remaining` e `RateLimit-Reset`).

Para conectar, informe o endereço da instância (`https://gitlab.com` ou o da sua empresa; um caminho como
`https://git.acme.io/gitlab` também vale) e um **token de acesso pessoal** com o escopo **read_api**: em
*Preferences → Access tokens*, ou pelo link **criar token**, que abre a página já preenchida. O Canto confere o token
na instância antes de salvar.

- Só `https://`. Endereço com usuário, senha ou parâmetros é recusado.
- O token só vai para o endereço digitado: o Canto não segue redirecionamentos.
- Um item só abre se o link for da mesma instância.
- Instância com certificado de CA própria (interna) ainda não é suportada.

**desconectar** apaga endereço e token deste computador. Para revogar: GitLab → Preferences → Access tokens.
