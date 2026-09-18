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
cd src-tauri && cargo test   # testes do núcleo em Rust
bun run tauri build      # instalador da plataforma atual
```

## Fluxo

1. Crie uma branch a partir de `main` (`feat/...`, `fix/...`, `docs/...`).
2. Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `docs:`,
   `test:`, `chore:`. O corpo explica o porquê.
3. Toda mudança de comportamento vem com teste que falha antes e passa depois.
4. Mudança visível para o usuário entra no `CHANGELOG.md`, em **Não publicado**, e no `README.md` se for preciso.
5. Abra o PR; a CI roda tipos, testes do front e `cargo test` em Windows, macOS e Linux.

## Nunca versione

- `src-tauri/google-oauth.json`, arquivos `client_secret_*.json`, tokens, `.env` ou qualquer credencial;
- a chave privada do updater (`*.key`, gerada por `tauri signer generate`);
- seu cofre ou arquivos da pasta de dados do app.

## Prints

Imagens em `docs/prints/` usam **só dados fictícios**: nada de IP, host, usuário SSH, caminho com seu nome de
usuário, e-mail real, conteúdo de clipboard ou de reunião de verdade. O repositório é público.

## Publicar uma versão

1. Suba a versão em `package.json`, `src-tauri/Cargo.toml` e `src-tauri/tauri.conf.json` e mova as entradas de
   **Não publicado** no `CHANGELOG.md` para a nova versão.
2. `git tag v0.2.0 && git push origin v0.2.0`. O workflow **Release** gera os instaladores de Windows, macOS
   (Apple Silicon e Intel) e Linux num release em **rascunho**; publicar é manual, na aba Releases.
3. Obrigatórios para a atualização automática: secrets `TAURI_SIGNING_PRIVATE_KEY` (conteúdo da chave privada do
   updater) e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. A chave pública correspondente está em `tauri.conf.json`
   (`plugins.updater.pubkey`). **Guarde a chave privada fora da máquina**: sem ela, nenhuma instalação existente
   aceita versão nova. Se precisar trocar de chave, publique antes uma versão assinada com a antiga que já traga a
   pubkey nova. O `latest.json` só fica visível para os apps depois que o rascunho é publicado.
4. Opcionais no repositório: secret `GOOGLE_OAUTH_JSON` (conteúdo do `google-oauth.json`, para embutir o login
   do Google) e variável `CANTO_GITHUB_CLIENT_ID` (device flow do GitHub). Sem eles a build sai igual, pedindo as
   credenciais em Ajustes.

Todo PR roda a CI: tipos, testes da interface e `cargo test` em Windows, macOS e Linux.
