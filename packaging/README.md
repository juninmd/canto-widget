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

## Flatpak (`flatpak/com.junin.canto.yml`) — preparado, não verificado

O bloqueio era o lockfile: o Flathub builda a partir do código-fonte num sandbox sem rede, e o
`flatpak-node-generator` só lê `package-lock.json`, `yarn.lock` ou `pnpm-lock.yaml` — nenhum deles existia,
porque o projeto usa `bun.lock`.

**Resolvido:** `bun install --yarn` escreve um `yarn.lock` a partir do `bun.lock`. Medido contra `bun.lock`:
**196 pacotes resolvidos, 196 na mesma versão**, incluindo os binários por plataforma. A rota do
`package-lock.json` (`npm install --package-lock-only`) foi descartada: divergia em **39 versões** (entre elas
os `@rolldown/binding-*` e o `lightningcss`, que são justamente os binários nativos do bundler), ou seja, o
sandbox geraria um `dist/` diferente do que o CI testa. O arquivo está em `flatpak/yarn.lock`; para regerar
depois de mexer nas dependências, sem sujar a raiz do projeto:

```bash
mkdir -p /tmp/canto-flatpak && cp package.json bun.lock /tmp/canto-flatpak/
(cd /tmp/canto-flatpak && bun install --yarn --ignore-scripts)
cp /tmp/canto-flatpak/yarn.lock packaging/flatpak/yarn.lock
```

O manifesto usa `org.freedesktop.Sdk.Extension.node20` (branch 23.08, Node 20.20.1; o Vite 8 pede
`^20.19` ou `>=22.12`) e o `yarn` que essa extensão já traz. O `tsc --noEmit` do `bun run build` fica de fora
do sandbox: a checagem de tipos é gate do CI, o pacote só precisa do `dist/`, que o `vite build` produz antes
do `cargo build` (o Rust embute o `dist/` via `generate_context!`).

**O que ainda falta** — e por isso o manifesto não roda hoje:

- `generated-sources.json` e `cargo-sources.json`, os dois arquivos que o `flatpak-builder-tools` gera e que
  baixam e fixam o hash de cada dependência JS e de cada crate. Ambos são regenerados a cada mudança de
  lockfile, então nascem commitados ao lado do manifesto.
- **Nada disso foi executado**: não há `flatpak-builder` nem `flatpak-node-generator` na máquina onde isto foi
  escrito (Windows). A verificação real depende de uma máquina Linux.

**Para publicar:** Flathub pede conta própria e um app novo; a submissão é um PR em `flathub/flathub`.

## Se a versão mudar

`PackageVersion`/`version` e os `Sha256`/`sha256` desses manifestos (winget e Homebrew) são da `v0.1.0`; uma
nova release exige atualizar os três junto, senão o pacote instala uma versão errada — o mesmo problema que
`latest.json` do updater evita para quem já tem o Canto instalado, mas esses manifestos ficam fora do alcance
do updater.
