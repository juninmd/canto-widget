# Changelog

Mudanças visíveis para quem usa o Canto. Formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
versões em [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

- **Detalhes do evento na agenda**: clicar num evento mostra quem organizou, quem criou, quantos convidados,
  a descrição e os anexos, como as anotações do Gemini, com **abrir no Calendar**. O aviso de reunião traz o
  mesmo.
- **Filtros e paginação na aba GitHub**: busca por texto ou qualificador (`repo:`, `label:`), botões
  **tudo · PRs · issues** e **mostrar mais** em cada lista.
- **Anotações e transcrições do Gemini na aba Reuniões**: os documentos que o Gemini anexa às reuniões dos
  últimos 14 dias aparecem acima dos arquivos da pasta e abrem no navegador.
- **Carregamento visível**: agenda, GitHub e transcrições mostram cartões de espera em vez de uma área vazia.

### Alterado

- Dependências nas versões mais recentes: React 19.3, Vite 8 (Rolldown), TypeScript 7 (compilador nativo),
  `aes-gcm` 0.11, `argon2` 0.6, `sha2` 0.11, `rand` 0.10 e `reqwest` 0.13. Cofres gravados pela 0.1.0 continuam
  abrindo (há um teste com um cofre real dessa versão), e o app deixou de carregar duas cópias do cliente HTTP.
  Compilar exige Rust 1.85.

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
