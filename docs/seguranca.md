# Segurança e dados

[← voltar ao README](../README.md)

## Modelo de segurança

| Item | Decisão |
|---|---|
| Derivação de chave | Argon2id (19 MiB, t=2, p=1), salt aleatório de 16 bytes por cofre |
| Senha mestra | mínimo de 4 caracteres (`MIN_SENHA`). O envelope fica em disco e sai da máquina em todo backup exportado, então a senha é atacável **offline**: nenhum limite de tentativas protege, e o Argon2id encarece cada palpite, não o total deles. Senha curta é uma escolha consciente de conveniência sobre resistência |
| Cifra | AES-256-GCM, nonce novo a cada gravação, AAD fixando o domínio (`canto.vault.v1`) |
| Chave | só existe em RAM enquanto o cofre está destrancado; zeroizada ao trancar/sair |
| Backup | o `.canto` exportado é o próprio envelope cifrado; a fusão do import acontece local, em claro, na RAM. O caminho vem do diálogo nativo aberto pelo Rust, nunca da webview |
| Escopo OAuth | opcional, só para a agenda: `calendar.events.readonly` e `openid email profile` (nome, e-mail e foto da conta; a foto só é baixada de `*.googleusercontent.com` e fica no cofre). Nenhum escopo de Drive |
| Clipboard | histórico fica **só na máquina** (`clipboard.json`, cifrado), fora do `vault.json` — nunca entra no backup. No Windows, o que um gerenciador de senhas marca como sensível (`ExcludeClipboardContentFromMonitorProcessing` ou `Clipboard Viewer Ignore`, convenção do Windows seguida por gerenciadores como o KeePass) nem chega a ser lido |
| Transcrições | leitura restrita à pasta configurada, extensões `txt/md/vtt/srt`, nome de arquivo validado contra travessia de caminho |
| OAuth | Authorization Code + **PKCE (S256)** com loopback em `127.0.0.1:porta-efêmera` e checagem de `state` |
| Tokens | `refresh_token` guardado cifrado com a mesma chave do cofre (`drive.json`, nome mantido por compatibilidade) |
| GitHub | token em `github.json`, cifrado com a chave do cofre e nunca enviado à webview. Token pessoal validado por formato antes de sair da máquina; token de GitHub App que expira é renovado 1 min antes do vencimento, uma renovação por vez. Links só abrem se forem `https://github.com/` |
| Troca de senha | exige a senha atual. Tudo é lido com a chave antiga e selado com a nova **antes** de gravar: senha errada ou arquivo ilegível não alteram nada. As cópias novas esperam como `<arquivo>.next` e só substituem as antigas depois que o cofre é gravado; se a troca for interrompida, o próximo destrancar termina ou desfaz. As cópias em `backups/` acompanham a senha nova. `.canto` exportados antes continuam com a senha antiga |
| Desfazer | remoções recentes ficam só em RAM (últimas 20) e somem ao trancar; a webview só conhece uma chave opaca, nunca reenvia o conteúdo |
| Windows Hello | opcional. A senha mestra é cifrada (AES-256-GCM) com uma chave derivada da assinatura RSA de um desafio aleatório, feita por um par de chaves do Windows Hello preso ao TPM e liberado só por rosto, digital ou PIN. `biometria.json` não serve sem esse chip e esse gesto, e nunca entra em backup. A ativação assina, grava e reabre na hora (o Windows pede o gesto duas vezes): hardware com assinatura instável é recusado ali, não descoberto na tela de bloqueio. Cofre recriado com outra senha desliga a biometria sozinho. macOS/Linux: indisponível por enquanto |
| Lembretes | o vigia de lembretes de tarefa roda em fundo e não adia o auto-lock nem regrava o cofre à toa |
| Auto-lock | 15 min sem uso deliberado do cofre e o widget se tranca sozinho, avisando na tela. Polling de fundo (clipboard, agenda) não conta como uso |
| Gravação | escrita em arquivo temporário com `fsync` antes do `rename`: queda de energia não deixa envelope pela metade |
| Atualização | o app só instala o que foi assinado pela chave privada do projeto (minisign, chave pública embutida em `tauri.conf.json`); download adulterado ou de outra origem é recusado antes de rodar. O manifesto vem de `releases/latest` no GitHub por HTTPS. A webview não recebe permissão do plugin de atualização, só os comandos `update_check`/`update_install`, e no Windows o cofre é trancado antes de o instalador fechar o app |
| CSP | sem origens remotas; toda a rede sai pelo processo Rust, nunca pela webview |

Perder a senha mestra significa perder os dados: não há recuperação, nem local nem pelos backups.
Para trocá-la: **ajustes → Segurança → trocar senha mestra**. A biometria, se estava ativa, é desligada
(guardava a senha antiga) e precisa ser ativada de novo.

| Cofre trancado | Senha errada |
|---|---|
| ![Cofre trancado](prints/13-cofre-trancado.png) | ![Senha incorreta](prints/14-senha-errada.png) |

## Backup e outra máquina

Aba **ajustes → Backup**:

- **exportar** abre o diálogo de salvar e grava `canto-AAAA-MM-DD.canto` — o envelope já cifrado
  com a senha mestra. Pode ir para pendrive, e-mail ou qualquer nuvem: sem a senha é ilegível.
- **importar** abre o diálogo, decifra com a senha da sessão e **mescla** no cofre atual
  (last-write-wins por item, com lápides). Reimportar o mesmo arquivo não muda nada. Antes de
  mesclar, o estado anterior é guardado em `backups/`.
- Backup criado com outra senha mestra é recusado sem tocar no cofre local.

Levar para outra máquina: crie o cofre lá **com a mesma senha mestra** e importe o `.canto`.

Além disso, o widget grava sozinho **uma cópia por dia** (data UTC) em `backups/`, mantendo as
últimas 10 somando as de antes de importar. Não precisa do cofre destrancado.

Merge (coberto por `tests/merge.rs` e `tests/backup.rs`):

- item editado nos dois lados → vence a edição mais recente;
- item apagado em A e editado em B → vence quem tem o carimbo mais novo;
- merge é idempotente e comutativo nos casos acima.

## Onde ficam os arquivos

`app_data_dir` da plataforma (ex.: `%APPDATA%\com.junin.canto` no Windows):

- `vault.json` — envelope cifrado com tarefas e notas;
- `backups/*.canto` — cópias diárias e de antes de importar, cifradas (últimas 10);
- `drive.json` — credenciais OAuth da agenda, cifradas com a mesma chave;
- `github.json` — token do GitHub, cifrado com a mesma chave (fora do backup);
- `clipboard.json` — histórico da área de transferência, cifrado e nunca sincronizado;
- `settings.json` — preferências não sensíveis (pasta de transcrições, skin);
- `janela.json` — posição, tamanho e "sempre no topo";
- `biometria.json` — senha mestra cifrada pela chave do Windows Hello (só se ativado);
- `autostart.json` — marca que a escolha de iniciar com o sistema já foi feita.
