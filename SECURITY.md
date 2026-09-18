# Política de segurança

## Versões suportadas

Só a versão mais recente publicada em [Releases](https://github.com/juninmd/canto-widget/releases) recebe correções.

## Como reportar

**Não abra issue pública para vulnerabilidade.** Use o reporte privado do GitHub:
aba **Security → Report a vulnerability** neste repositório.

Inclua: versão e sistema operacional, passos para reproduzir, impacto esperado e, se tiver, uma prova de conceito
mínima. Não envie dados pessoais reais nem o conteúdo do seu cofre.

Prazos: confirmação de recebimento em até 7 dias; avaliação e plano de correção em até 30 dias. Quem reportar é
creditado no CHANGELOG, se quiser.

## Escopo

Dentro:

- cifra do cofre e dos arquivos locais (`vault.json`, `drive.json`, `github.json`, `clipboard.json`, backups `.canto`);
- troca de senha mestra e desbloqueio por Windows Hello;
- tokens OAuth do Google e do GitHub (armazenamento, renovação, vazamento para a webview ou logs);
- fronteira entre a webview e o processo Rust (comandos Tauri, CSP, abertura de links, leitura de arquivos).

Fora:

- ataques que exigem a senha mestra ou a sessão já destrancada na máquina da vítima;
- força bruta offline de senha curta escolhida pelo usuário (o mínimo de 4 caracteres é escolha consciente,
  documentada no README);
- instaladores sem assinatura de código (limitação conhecida, ainda não há certificado).

## Modelo de ameaça, em resumo

- Os dados ficam cifrados em disco com Argon2id (derivação da chave) e AES-256-GCM. A chave só existe na RAM
  com o cofre destrancado e é zerada ao trancar.
- A senha mestra nunca sai da máquina. Não há servidor do Canto, nem telemetria.
- Toda a rede passa pelo processo Rust; a webview não fala com a internet (CSP sem origens remotas).
- Tokens do Google e do GitHub ficam cifrados com a chave do cofre e nunca chegam à webview.
