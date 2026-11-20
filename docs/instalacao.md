---
title: Instalação
---
{% include nav.html %}

# Instalação

Baixe o instalador da sua plataforma em **[Releases](https://github.com/juninmd/canto-widget/releases/latest)**.

| Sistema | Arquivo |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (recomendado) ou `.msi` |
| 🍎 macOS | `.dmg` para Apple Silicon ou Intel |
| 🐧 Linux | `.AppImage`, `.deb` ou `.rpm` |

## Primeira execução

1. Crie a **senha mestra**. **Não existe recuperação**: perdeu a senha, perdeu os dados (o backup `.canto` também
   só abre com ela).
2. Uma tela de boas-vindas mostra os atalhos essenciais, uma única vez.
3. `Ctrl+Alt+Espaço` (`Cmd+Shift+Espaço` no macOS) mostra e esconde o widget.
4. Em **Ajustes → Abas visíveis** escolha as abas que quer na barra (muitas começam escondidas).

![Criação do cofre e senha mestra]({{ '/prints/readme/create-vault.webp' | relative_url }})

## Windows

Execute o `-setup.exe` (ou `.msi`). Como os instaladores ainda não têm assinatura de código, o **SmartScreen** avisa
na primeira abertura: **Mais informações → Executar assim mesmo**. No Windows 11 com Windows Hello você pode
destrancar o cofre por biometria (Ajustes → Segurança). O Canto abre junto com o sistema, só na bandeja, e o cofre
continua trancado até a senha.

## macOS

Abra o `.dmg` e arraste o Canto para **Aplicativos**. O app tem assinatura ad-hoc (sem Apple Developer ID, sem
notarização). Se o macOS disser que o Canto "está danificado e não pode ser aberto", é a marca de quarentena do
download, não um arquivo corrompido. Rode uma vez:

```bash
xattr -cr /Applications/Canto.app
```

Alternativas: botão direito → **Abrir**, ou **Ajustes do Sistema → Privacidade e Segurança → Abrir Mesmo Assim**.

Instalação em uma linha, sem quarentena (downloads via `curl` não recebem a marca; o script ainda roda `xattr -cr`):

```bash
curl -fsSL https://raw.githubusercontent.com/juninmd/canto-widget/main/scripts/install-macos.sh | bash
```

O texto da próxima agenda na barra de menus e a opção de Touch ID dependem do sistema; veja [Ajustes](ajustes.html).

## Linux

- **AppImage**: `chmod +x Canto_*.AppImage` e execute.
- **`.deb`** (Debian/Ubuntu): `sudo apt install ./Canto_*.deb`.
- **`.rpm`** (Fedora/openSUSE): `sudo dnf install ./Canto_*.rpm`.

A janela sem moldura com fundo transparente depende de um compositor ativo. No GNOME e no KDE, o texto da próxima
agenda ao lado do ícone da bandeja usa AppIndicator.

## Android e iOS

Não há instalador de celular nas Releases: é preciso compilar. O mesmo código compila para celular (Tauri v2 Mobile), com as abas numa barra inferior. Peças só de desktop (janela
flutuante, bandeja, atalhos globais, Atividade, Sistema, Dev, pasta sincronizada, atualização dentro do app) ficam de
fora. Detalhes e passos de compilação: [Canto no celular](mobile.html).

## Atualizações

O Canto avisa quando sai versão nova, e **Ajustes → Atualizações** instala com um clique, conferindo a assinatura
do pacote contra a chave do projeto antes de rodar. Detalhes no [Guia de uso](uso.html#atualizações).

## Gerenciadores de pacote

Há manifestos prontos para winget e Homebrew em [`packaging/`](https://github.com/juninmd/canto-widget/tree/main/packaging),
preparados e verificados localmente, mas ainda **não publicados** nesses repositórios.

## Compilar do código

Requisitos e comandos (Bun, Rust, Tauri v2) estão em
[CONTRIBUTING.md](https://github.com/juninmd/canto-widget/blob/main/CONTRIBUTING.md).

## Desinstalar

Remova o app pelo sistema. Os dados ficam na pasta de dados do app (lista em
[Segurança e dados](seguranca.html#onde-ficam-os-arquivos)); apague-a se quiser eliminar o cofre. Antes, exporte um
backup `.canto` se for precisar dele.
