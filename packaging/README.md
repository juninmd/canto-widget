# Empacotamento externo (DIST2)

Manifestos para os três gerenciadores de pacote pedidos no backlog. Nenhum foi publicado: publicar exige uma
conta própria em cada ecossistema (winget-pkgs e homebrew-cask pedem um fork + PR no GitHub de outra
organização; Flathub pede uma conta própria e um app novo), então isso é uma decisão e uma ação do
mantenedor, não algo que o agente faz sozinho. O que está aqui é o que dá pra preparar e verificar sem essas
contas.

## winget (`winget/`)

Manifesto de 3 arquivos (`Juninmd.Canto*.yaml`) apontando para o instalador NSIS real da release `v0.1.0`
(`Canto_0.1.0_x64-setup.exe`), com o SHA-256 lido direto da API de releases do GitHub (campo `digest` do
asset), não recalculado à mão.

**Verificado:** `winget validate --manifest packaging/winget` → `Manifest validation succeeded.` (Windows já
tem o `winget` instalado).

**Para publicar:** fork de [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs), copiar os 3
arquivos para `manifests/j/Juninmd/Canto/0.1.0/`, abrir PR. A cada release nova, repetir com a versão e o
`InstallerSha256` novos (o `digest` do asset já vem pronto no `gh release view vX.Y.Z --json assets`).

## Homebrew Cask (`homebrew/canto.rb`)

Cask apontando para os `.dmg` reais da `v0.1.0` (Apple Silicon e Intel), SHA-256 também do `digest` da API,
não recalculado. Sintaxe (`arch`, `sha256 arm:/intel:`, `zap trash:`, `auto_updates`) conferida contra o
[Cask Cookbook](https://docs.brew.sh/Cask-Cookbook) do próprio Homebrew — não há `brew`/`ruby` nesta máquina
Windows para rodar `brew audit --cask`, então a sintaxe não foi executada, só revisada linha a linha contra a
doc.

**Para publicar:** fork de [homebrew/homebrew-cask](https://github.com/Homebrew/homebrew-cask), copiar para
`Casks/c/canto.rb`, `brew audit --cask --online canto` numa máquina com macOS, abrir PR.

## Flatpak (`flatpak/com.junin.canto.yml`) — bloqueado

Flathub builda a partir do código-fonte dentro de um sandbox sem rede; as dependências JS precisam vir
vendoradas via `flatpak-node-generator`, que só lê `package-lock.json`, `yarn.lock` ou `pnpm-lock.yaml`
([confirmado na doc do `flatpak-builder-tools`](https://github.com/flatpak/flatpak-builder-tools/tree/master/node)).
Este projeto usa `bun.lock` (ver `AGENTS.md`: "bun; never npm/yarn/pnpm"), que esse gerador não entende — não
existe hoje um `flatpak-bun-generator` equivalente para verificar.

O manifesto em `flatpak/` é só o esqueleto (runtime, permissões, `.desktop`, ícone, `cargo build --release`);
o passo do frontend (`bun install && bun run build`, que gera o `dist/` que o Rust embute via
`generate_context!`) está comentado como TODO. `flatpak-builder` não roda neste manifesto do jeito que está.

**Para desbloquear**, alguma destas, decisão do mantenedor:
- Gerar um `package-lock.json` só para o build do Flatpak (bun consegue instalar a partir de um lockfile do
  npm em alguns casos; não verificado se o resultado bate com o `bun.lock` real) e vendorar via
  `flatpak-node-generator npm package-lock.json`.
- Ou vendorar as dependências manualmente com `type: file`/`type: archive` por pacote (trabalhoso, mas sem
  depender de um gerador que não existe para bun).

## Se a versão mudar

`PackageVersion`/`version` e os `Sha256`/`sha256` desses manifestos (winget e Homebrew) são da `v0.1.0`; uma
nova release exige atualizar os três junto, senão o pacote instala uma versão errada — o mesmo problema que
`latest.json` do updater evita para quem já tem o Canto instalado, mas esses manifestos ficam fora do alcance
do updater.
