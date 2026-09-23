# Como contribuir

## Pré-requisitos

- [Bun](https://bun.sh) 1.2 ou mais novo
- Rust estável (`rustup`), versão mínima 1.85
- Dependências do Tauri v2 para o seu sistema: <https://v2.tauri.app/start/prerequisites/>
  (no Linux: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`)

## Rodando

```bash
bun install
bun run tauri dev        # app em desenvolvimento
bun run lint             # tipos (tsc)
bun test                 # testes da interface
bun run e2e              # smoke tests no Chromium com o IPC do Tauri simulado (Playwright)
cd src-tauri && cargo test   # testes do núcleo em Rust
bun run tauri build      # instalador da plataforma atual
```

## Fluxo

1. Crie uma branch a partir de `main` (`feat/...`, `fix/...`, `docs/...`).
2. Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `docs:`,
   `test:`, `chore:`. O corpo explica o porquê.
3. Toda mudança de comportamento vem com teste que falha antes e passa depois.
4. Mudança visível para o usuário entra no `CHANGELOG.md`, em **Não publicado**, e no `README.md` (inglês,
   canônico) se for preciso; as traduções (`README.pt-BR.md`, `README.es.md`, ...) não precisam acompanhar no
   mesmo PR — ficam desatualizadas até alguém atualizar.
5. Abra o PR; a CI roda tipos, testes do front, smoke tests e2e e `cargo test` em Windows, macOS e Linux.

## Nunca versione

- `src-tauri/google-oauth.json`, arquivos `client_secret_*.json`, tokens, `.env` ou qualquer credencial;
- a chave privada do updater (`*.key`, gerada por `tauri signer generate`);
- seu cofre ou arquivos da pasta de dados do app.

## Prints

Imagens em `docs/prints/` usam **só dados fictícios**: nada de IP, host, usuário SSH, caminho com seu nome de
usuário, e-mail real, conteúdo de clipboard ou de reunião de verdade. O repositório é público.

## Publicar uma versão

1. Faça merge do PR em `main` com título Conventional Commit. O workflow **Release** incrementa patch para `fix`,
   minor para `feat` e major para `!` ou `BREAKING CHANGE`; `docs`, `chore`, `test`, `ci` e `refactor` sem quebra
   não geram versão. Ele gera as notas, executa as verificações e compila em paralelo os instaladores de Windows,
   macOS (Apple Silicon e Intel) e Linux. Depois reúne e confere o `latest.json` e publica a release. Se falhar,
   corrija a causa e execute novamente o workflow; uma verificação a cada seis horas também tenta retomar.
2. Não crie uma tag de versão nem edite a versão manualmente: a versão do instalador é definida no build da release.
3. Obrigatórios para a atualização automática: secrets `TAURI_SIGNING_PRIVATE_KEY` (conteúdo da chave privada do
   updater) e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. A chave pública correspondente está em `tauri.conf.json`
   (`plugins.updater.pubkey`). **Guarde a chave privada fora da máquina**: sem ela, nenhuma instalação existente
   aceita versão nova. Se precisar trocar de chave, publique antes uma versão assinada com a antiga que já traga a
   pubkey nova. O `latest.json` só fica visível para os apps depois da publicação.
4. Opcionais no repositório: secret `GOOGLE_OAUTH_JSON` (conteúdo do `google-oauth.json`, para embutir o login
   do Google) e variável `CANTO_GITHUB_CLIENT_ID` (device flow do GitHub). Sem eles a build sai igual, pedindo as
   credenciais em Ajustes.

Todo PR roda a CI: tipos, testes da interface e `cargo test` em Windows, macOS e Linux.
