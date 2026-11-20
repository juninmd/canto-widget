---
title: FAQ
---
{% include nav.html %}

# Perguntas frequentes

## Dados e segurança

**Esqueci a senha mestra. Dá para recuperar?** Não. A chave só existe na memória e não há conta nem servidor para
redefinir. Sem a senha, nem o cofre nem os backups `.canto` abrem. Anote a senha num gerenciador.

**O Canto envia meus dados para algum servidor?** Não há servidor, conta nem telemetria. Só o processo Rust acessa a
rede, e só para o que você ligou (Google, GitHub/GitLab, clima, mercado, Steam...). A janela não tem origem remota
(CSP) e nunca vê tokens. Veja [Segurança e dados](seguranca.html) e a [política de privacidade](privacy/).

**Como o cofre é protegido?** Argon2id (19 MiB, t=2) → AES-256-GCM, nonce novo a cada gravação e escrita atômica.
Depois de três senhas erradas o app impõe uma pausa crescente.

**O cofre trancou sozinho.** É a auto-trava (padrão 15 min parado). Mude ou desligue em **Ajustes → Segurança**.

**Como faço backup e uso em outra máquina?** **Ajustes → Backup** exporta um `.canto` cifrado; importe-o na outra
máquina com a mesma senha. Para manter as duas em dia, use a **Pasta sincronizada**. O histórico do clipboard, as
imagens das notas e os tokens de GitHub/GitLab **não** entram no backup.

## Instalação

**O Windows (SmartScreen) ou o macOS bloqueia o instalador.** Os instaladores ainda não têm assinatura de código.
No Windows: **Mais informações → Executar assim mesmo**. No macOS, se aparecer "está danificado", rode
`xattr -cr /Applications/Canto.app`. Veja [Instalação](instalacao.html).

**As atualizações são seguras?** O app só instala um pacote assinado pela chave do projeto; um download adulterado é
descartado antes de rodar.

**Existe versão para celular?** O código compila para Android e iOS, mas não há instalador publicado. Veja
[Canto no celular](mobile.html).

## Uso

**Onde estão as abas Gmail, Drive, Clima, Steam...?** Começam escondidas. Ligue em **Ajustes → Abas visíveis**.

**O widget sumiu.** Fechar só esconde. Use `Ctrl+Alt+Espaço` (`Cmd+Shift+Espaço` no macOS) ou o ícone da bandeja.
O modo **Escondido** também deixa o app só na bandeja.

**O atalho global não funciona.** Outro programa pode estar usando a combinação. **Ajustes → Atalhos** lista os
atalhos; para a reunião o Canto tenta `Ctrl+Alt+Shift+M` como alternativa.

**Não recebi o aviso da reunião.** Confira se o Google está conectado, se o **Não perturbe** ou o modo foco está
ligado e, no Windows, se há um app em tela cheia (o Canto segura os avisos, configurável em **Jogos e tela cheia**).
Convites que chegam com o app fechado não tocam.

**Como silencio tudo por um tempo?** **Não perturbe** em Ajustes ou na bandeja: 30 min, 1 h, 2 h, até amanhã ou até
desligar. Uma lua no topo mostra quando termina.

**Como adio um lembrete?** O pop-up tem **adiar 10 min**; o botão de fechar com seta fecha a fila inteira.

**Como crio uma tarefa rápido, sem abrir o widget?** `Ctrl+Alt+N` abre a captura rápida.

## Integrações

**"Reconecte o Google em Ajustes".** O login passou a pedir o escopo `calendar.events` (para responder convites).
Contas conectadas antes precisam reconectar uma vez. Veja [Integrações](integracoes.html).

**Gmail, Drive ou Contatos dão erro de API desativada.** Habilite a API correspondente (Gmail, Tasks, Drive, People)
no seu projeto Google Cloud; o aviso traz um botão **ativar a API**.

**O Canto lê o conteúdo dos meus arquivos do Drive?** Não. Só nomes, tipos, tamanhos e a cota (`drive.metadata.readonly`).

**GitHub pede token.** Use um token pessoal só de leitura ou entre pelo navegador (device flow). O GitLab pede
um token com escopo `read_api` e só aceita `https://`.

**O mapa só mostra ruas, sem trânsito.** O trânsito vem da TomTom com a sua chave grátis. Sem chave, a aba mostra
o OpenStreetMap.

**Como conecto Claude Code, Codex ou Cursor ao Canto?** Ligue o **Servidor MCP** em Ajustes; a tela mostra o comando
ou o trecho de configuração de cada agente. Escuta só em `127.0.0.1`, exige token, e escritas e dados sensíveis
(notas, clipboard, Gmail, contatos) vêm desligados. Veja [Integrações → Servidor MCP](integracoes.html#servidor-mcp-opcional).

## Outros

**Funciona no Linux?** O Canto roda no Linux (AppImage, `.deb`, `.rpm`), mas a janela transparente
precisa de um compositor ativo. O texto da próxima agenda na bandeja depende de AppIndicator.

**Onde ficam os arquivos?** Na pasta de dados do app; a lista completa está em
[Segurança e dados](seguranca.html#onde-ficam-os-arquivos).

**Como reporto um bug ou uma falha de segurança?** Bugs: [issues](https://github.com/juninmd/canto-widget/issues).
Falhas de segurança: [SECURITY.md](https://github.com/juninmd/canto-widget/blob/main/SECURITY.md).

**Posso contribuir?** Sim: [CONTRIBUTING.md](https://github.com/juninmd/canto-widget/blob/main/CONTRIBUTING.md).
