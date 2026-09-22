# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Corrigido

- Releases agora seguem Conventional Commits (`fix`/patch, `feat`/minor e breaking/major), ignoram commits sem
  impacto de versão e geram os quatro instaladores em paralelo, com cache Rust por alvo, antes de montar o
  manifesto do updater.
- Releases em `main` agora recebem uma tag por commit elegível, notas geradas automaticamente e publicação após a
  verificação dos instaladores assinados e do manifesto de atualização. O rascunho `v0.3.0` é retomado.

## [0.3.0] - 2026-09-22

### Adicionado

- **Aba Status API**: histórico de incidentes (RSS/Atom) de Claude, GitHub, OpenAI/Codex, AWS, Google Cloud,
  Magalu Cloud, Cloudflare, Vercel, npm, crates.io, PyPI, Supabase e DigitalOcean, sem login nem token; cada
  serviço num acordeão (um aberto por vez), cache de 5 min e botão **atualizar**. Oculta por padrão, como o
  GitLab — ative em Ajustes > Abas visíveis.

### Corrigido

- **Rolagem no resumo do dia**: o resumo do dia agora fica delimitado à altura do painel e rola verticalmente com barra de scroll quando o texto é longo, sem sobrepor os botões de copiar e voltar.
- **Reordenação de tarefas**: corrigido o arrastar e soltar de tarefas com `dataTransfer` compatível com webview/Chromium, realce visual no item alvo e atualização otimista instantânea na lista.

## [0.2.0] - 2026-09-20

### Adicionado

- **Colar como texto puro**: atalho global **Ctrl+Alt+V** (`Cmd+Alt+V` no macOS) tira HTML/RTF da área de
  transferência atual, sem simular um Ctrl+V em outro app.
- **Mais tipos no clipboard**: JSON e e-mail/telefone reconhecidos, além de link, cor e código; filtro por
  tipo na aba.
- **Limite de itens fixados** no clipboard, configurável (100 por padrão) — antes não havia limite nenhum.
- **Entrar na próxima reunião pela bandeja**: item de menu que mostra a próxima reunião com Meet e entra nela
  direto, sem abrir o widget; atalho global **Ctrl+Alt+M** (`Cmd+Alt+M` no macOS) faz o mesmo.
- **Indicador no ícone**: soma tarefas de hoje ainda não concluídas com PRs/MRs com revisão pedida a você
  (GitHub + GitLab); número exato no Dock do macOS, ponto vermelho no Windows/Linux.
- **Detalhes do evento na agenda**: clicar num evento mostra quem organizou, quem criou, quantos convidados,
  a descrição e os anexos, como as anotações do Gemini, com **abrir no Calendar**. O aviso de reunião traz o
  mesmo.
- **Filtros e paginação na aba GitHub**: busca por texto ou qualificador (`repo:`, `label:`), botões
  **tudo · PRs · issues** e **mostrar mais** em cada lista.
- **Anotações e transcrições do Gemini na aba Reuniões**: os documentos que o Gemini anexa às reuniões dos
  últimos 14 dias aparecem acima dos arquivos da pasta e abrem no navegador.
- **Carregamento visível**: agenda, GitHub e transcrições mostram cartões de espera em vez de uma área vazia.
- **GitLab e GitLab self-hosted**: nova aba (ative em Ajustes → Abas visíveis) com revisão pedida, atribuídos, MRs e issues que você abriu, com
  endereço da instância e token `read_api` cifrados no cofre.
- **Ordenação** nas abas GitHub e GitLab: por atualização, criação ou comentários (só GitHub), crescente ou
  decrescente.
- **Cache e limite de requisições**: as listas ficam 5 min na memória e o Canto para antes de esgotar a cota da
  API, mostrando a última cópia e quando chegam dados novos.
- **PRs/MRs abertos hoje** no resumo do dia.
- **Abas visíveis** em Ajustes: esconda as abas que você não usa; `Alt+1`… seguem as que ficaram.
- **Antecedência do lembrete de tarefa**, em Ajustes → Lembretes (na hora, 5, 10, 15 ou 30 min antes).
- **Vincular tarefa a um PR/MR**: link no ⏰ da tarefa, com ícone na linha para abrir direto.
- **Subtarefas**: checklist dentro do ⏰ da tarefa, com contagem `feitas/total` na linha.
- **Prioridade da tarefa** (alta/média/baixa) com bolinha na linha e filtro acima da lista.
- **Arrastar para reordenar** as tarefas do dia pela alça (⠿) que aparece ao passar o mouse.
- **Recorrência mensal e por dias específicos da semana** para tarefas, além de todo dia/dias úteis/semanal.
- **Visualizar markdown na nota**: alternar entre escrever e visualizar renderiza negrito, itálico, código,
  listas e links (só `http(s)://` abrem no navegador).
- **Destaque do termo buscado** dentro do título e do corpo dos cards de notas encontrados.
- **Vincular nota a uma tarefa ou evento** da agenda: a nota ganha um selo que leva direto para a aba
  correspondente.
- **Exportar nota como .md**: ícone de download no card, com diálogo nativo de salvar.
- **Status do CI/pipeline no card do PR/MR**: botão "ver CI" busca sob demanda (GitHub: checks combinados do
  commit; GitLab: pipeline da MR) e mostra passou/falhou/rodando/sem CI.
- **Tempo aguardando revisão**: na lista "revisão pedida a mim", cada PR/MR mostra há quantos dias foi aberto,
  em vermelho a partir de 3 dias.
- **Auto-trava configurável**: em Ajustes → Segurança, escolha 5, 15 (padrão), 30 ou 60 minutos sem uso antes
  do cofre trancar sozinho.
- **Registro local dos últimos desbloqueios** (até 20), com data/hora e se foi por senha ou Windows Hello, em
  Ajustes → Segurança.
- **Modo privacidade**: `Alt+P` ou o ícone de olho no topo borra o texto do clipboard e das notas na tela sem
  apagar nada, para compartilhar a tela sem se preocupar.
- **Destravar com Touch ID no macOS**: mesmo fluxo do Windows Hello, senha mestra guardada no Chaveiro do
  sistema protegida por biometria. Melhor esforço — implementado e revisado contra a documentação do
  `security-framework`, mas não compilado nem testado nesta máquina (sem Mac disponível); precisa da CI de
  macOS para confirmar.
- **Busca global entre abas** (`Ctrl+K`): busca ao mesmo tempo em tarefas de hoje, notas e clipboard; escolher
  um resultado troca de aba com o texto já buscado. Tarefas de outros dias ficam fora da busca — o app ainda
  não navega entre dias.
- **Tamanho da interface** (Ajustes → Aparência): compacta, padrão ou confortável, escalando texto e espaçamento
  juntos.
- **Boas-vindas na primeira execução**: ao criar o cofre pela primeira vez, uma tela resume os atalhos
  essenciais. Aparece uma única vez — destrancar depois nunca mostra de novo.
- **Pasta sincronizada com merge automático** (Ajustes → Pasta sincronizada): aponte para uma pasta do
  Dropbox/OneDrive/Syncthing e o Canto cuida do resto — exporta a cada alteração e mescla o que chegar de
  outra máquina ao destrancar e a cada ~5 min, sem precisar de exportar/importar manual.
- **Anotações do Gemini no resumo do dia**: quando uma reunião tem anotações do Gemini anexadas, o resumo
  leva o link delas na mesma linha da reunião.
- **Manifestos para winget e Homebrew** em `packaging/`, prontos para publicar (não publicados: exige PR nos
  repositórios de cada gerenciador). O de Flatpak fica bloqueado — o gerador de dependências JS do Flathub não
  lê `bun.lock`; detalhes em `packaging/README.md`.

### Alterado

- Dependências nas versões mais recentes: React 19.3, Vite 8 (Rolldown), TypeScript 7 (compilador nativo),
  `aes-gcm` 0.11, `argon2` 0.6, `sha2` 0.11, `rand` 0.10 e `reqwest` 0.13. Cofres gravados pela 0.1.0 continuam
  abrindo (há um teste com um cofre real dessa versão), e o app deixou de carregar duas cópias do cliente HTTP.
  Compilar exige Rust 1.85.
- `AppState::mutate`/`mutate_if`/`in_background` (`src-tauri/src/vault.rs`) passam a compartilhar um único
  helper para a sequência trava → muda → grava → destrava → sincroniza, em vez de repeti-la cada um por conta
  própria — essa repetição foi a causa de 2 dos últimos 3 bugs de concorrência do cofre. Testes de regressão
  novos cobrem os dois cenários.
- Novo hook `useLatestRequest` (`src/lib/`) descarta a resposta de uma busca desatualizada; unifica o padrão
  que a busca global já tinha e o GitHub/GitLab reimplementava, e passa a proteger também clipboard e
  transcrições, que não tinham essa proteção e podiam mostrar um resultado antigo por cima de um mais novo.
- Trait `Forge` (`src-tauri/src/forge.rs`) unifica a orquestração de cache que as abas GitHub e GitLab
  reimplementavam quase idêntica; cada uma vira um adaptador fino (token vs. conta), sem mudar nenhum
  comando ou nome de IPC.
- `AppState::sealed`/`save_sealed` (`src-tauri/src/vault.rs`) substituem a leitura/gravação de config
  cifrada hand-copiada três vezes (Drive, GitHub, GitLab); `DriveConfig` migrou de `vault.rs` para
  `cmd_drive.rs`, ao lado de `GithubConfig`/`GitlabConfig` nos seus próprios módulos.
- Os quatro watchers de fundo (`watch_idle`, `watch_window_state`, `watch_backup`, `watch_sync`), antes soltos
  em `lib.rs`, agora moram juntos em `src-tauri/src/background.rs`, com os intervalos de polling nomeados;
  `lib.rs` passa a só chamar `background::start`.

## [0.1.0] - 2026-09-18

Primeiro release público.

### Adicionado

- **Atualização automática**: Ajustes → Atualizações mostra a versão instalada e a última publicada, com notas e
  data; o app avisa quando sai versão nova e atualiza com um clique, conferindo a assinatura antes de instalar.
- **Pronto para cofres grandes**: gravar o cofre não trava mais a janela, a aba de notas carrega 50 cards por vez
  com **mostrar mais** e um card aceita até 100 mil caracteres. Um teste de carga (30 mil tarefas, 5 mil notas,
  1.000 transcrições) mede cada etapa contra um teto; números em `docs/benchmark.md`.
- Cards mais informativos: o clipboard mostra o tipo (link, cor com amostra, código), há quanto tempo foi
  copiado e o tamanho; as notas mantêm as quebras de linha e mostram quando foram editadas; o GitHub mostra
  ícone de PR ou issue, quem abriu e títulos em até duas linhas.
- **Horário direto no título da tarefa**: "Daily às 9h30" ou "Deploy 18:00" já cria o lembrete.
- **Adiar 10 min** no aviso de reunião e no lembrete de tarefa; tarefa concluída ou apagada no meio-tempo não toca de novo.
- O clipboard ignora o que gerenciadores de senha marcam como sensível no Windows
  (`ExcludeClipboardContentFromMonitorProcessing`, `Clipboard Viewer Ignore`).
- `AGENTS.md`, README reorganizado com galeria e comparação, documentação detalhada em `docs/` e benchmark
  com ferramentas parecidas.
- **Troca da senha mestra** em Ajustes → Segurança. Cofre, conta Google, conta do GitHub, histórico do
  clipboard e as cópias automáticas em `backups/` passam para a senha nova; a biometria é desligada
  porque guardava a senha antiga. Se a troca for interrompida no meio, o próximo destrancar termina ou desfaz o que ficou pela metade.
- **Aba GitHub** com issues e PRs abertos: atribuídos a mim, PRs que abri, revisão pedida a mim e
  issues que abri. Login por token pessoal (fine-grained, só leitura) ou pelo device flow de um GitHub App.
- **Tela cheia** pelo botão do topo ou `F11`.
- **Notificação do sistema** junto do aviso na janela, nos lembretes de tarefa e nas reuniões.
- Pipeline de CI nos PRs (tipos, testes do front e do Rust em Windows, macOS e Linux) e release por tag `v*`
  com instaladores das três plataformas.
- `SECURITY.md`, `CONTRIBUTING.md`, templates de issue e PR, Dependabot.
- Tarefas com horário, lembrete e repetição; resumo do dia; notas fixadas e filtro por tag.
- Destrancar com Windows Hello; janela que lembra posição e tamanho; sempre no topo.
- Atalhos de teclado com ajuda (`?`); skins Claro e Seguir o sistema.
- Login Google com cliente embutido na build e cartão da conta.
- Desfazer exclusões por aviso no rodapé; animações de entrada e saída que respeitam "reduzir movimento".
- Backup `.canto` cifrado (exportar/importar com mescla), cópia diária automática e início com o sistema.
- Widget de canto com cofre cifrado (Argon2id + AES-256-GCM): tarefas, notas, clipboard local,
  transcrições de reuniões e agenda do Google com aviso antes da reunião.

### Alterado

- Binário de release menor: LTO, uma unidade de codegen e símbolos removidos.
- A CI passou a rodar `cargo clippy -D warnings`.
- Código-fonte em inglês (identificadores, arquivos e comentários); a interface continua em português. Os
  arquivos gravados em disco seguem compatíveis com as versões anteriores.
- A escolha de skin saiu do cabeçalho e foi para Ajustes → Aparência, com o nome de cada skin.
- `Alt+6` agora abre a aba GitHub; Ajustes passou para `Alt+7`.
- Senha mestra mínima de 4 caracteres (antes 8).

### Corrigido

- Cópia muito grande no clipboard: era cortada em 8 mil caracteres sem aviso e relida a cada 1,2 s.
  Agora guarda até 32 mil caracteres com aviso do tamanho real, o histórico tem teto total, a lista manda só
  um resumo para a tela e, no Windows, o clipboard só é lido quando muda.
- Copiar de novo um texto fixado no clipboard tirava o fixado.
- Transparência da borda no macOS: a janela usava fundo opaco porque a API privada de transparência
  não estava ligada.
- Aviso de reunião fora da aba da agenda, virada do dia com o widget aberto e auto-lock do cofre.

### Segurança

- Removidas do histórico do git imagens de documentação que continham dados reais.
