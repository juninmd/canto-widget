import type { ForgeItem, ForgeLists, ForgeList } from "../../src/lib/api";
import { NOW } from "./stage";

const H = 3_600_000;
const ago = (hours: number) => new Date(NOW.getTime() - hours * H).toISOString();

const item = (repo: string, number: number, title: string, hours: number, o: Partial<ForgeItem> = {}): ForgeItem => ({
  repo,
  number,
  reference: `${repo}#${number}`,
  title,
  url: `https://github.com/${repo}/pull/${number}`,
  created_at: ago(hours + 30),
  updated_at: ago(hours),
  comments: 0,
  is_pr: true,
  draft: false,
  author: "ana-exemplo",
  ...o,
});

const list = (items: ForgeItem[], total = items.length): ForgeList => ({ total, items, fetched_at: NOW.getTime() - 120_000 });

/** Fictitious repositories under "acme"; the oldest request is the one the review radar paints red. */
export const GITHUB: ForgeLists = {
  review_requested: list(
    [
      item("acme/atlas", 482, "feat: exportar relatórios em CSV", 3, { author: "bruno-teste", comments: 2 }),
      item("acme/portal", 148, "fix: fuso horário no resumo diário", 20, { author: "carla-modelo", comments: 5 }),
      item("acme/atlas", 471, "chore: atualizar dependências do cliente HTTP", 55, { author: "diego-amostra" }),
    ],
    9,
  ),
  assigned: list([item("acme/atlas", 470, "Filtro de data ignora o fuso do usuário", 8, { is_pr: false, url: "https://github.com/acme/atlas/issues/470", comments: 3 })]),
  my_prs: list([
    item("acme/atlas", 479, "fix: backoff exponencial no webhook de cobrança", 2, { author: "eu-demo", comments: 1 }),
    item("acme/portal", 151, "feat: página de preços em inglês", 26, { author: "eu-demo", draft: true }),
    item("acme/docs", 33, "docs: guia de contribuição", 70, { author: "eu-demo" }),
  ]),
  my_issues: list([item("acme/atlas", 462, "Erro 500 ao exportar planilha grande", 30, { is_pr: false, author: "eu-demo", url: "https://github.com/acme/atlas/issues/462", comments: 4 })]),
};

const mr = (number: number, title: string, hours: number, o: Partial<ForgeItem> = {}): ForgeItem => ({
  ...item("platform/portal", number, title, hours, o),
  reference: `platform/portal!${number}`,
  url: `https://gitlab.example.com/platform/portal/-/merge_requests/${number}`,
});

/** GitLab speaks in merge requests: `!12` references and a self-hosted address. */
export const GITLAB: ForgeLists = {
  review_requested: list([
    mr(58, "Adicionar filtro por status na fila", 4, { author: "carla.modelo", comments: 2 }),
    mr(42, "Corrigir paginação da lista de pedidos", 29, { author: "bruno.teste" }),
  ]),
  assigned: list([
    { ...item("platform/infra", 51, "Atualizar dependências de segurança", 12, { is_pr: false }), reference: "platform/infra#51", url: "https://gitlab.example.com/platform/infra/-/issues/51" },
  ]),
  my_prs: list([mr(61, "Cache das consultas de estoque", 6, { author: "eu.demo" })]),
  my_issues: list([]),
};

/** What each PR's CI badge answers: a pass, a run in progress, a failure and no CI at all. */
export const CHECKS = [
  { repo: "acme/atlas", number: 482, status: "success" },
  { repo: "acme/portal", number: 148, status: "running" },
  { repo: "acme/atlas", number: 471, status: "success" },
  { repo: "acme/atlas", number: 479, status: "failure" },
  { repo: "acme/portal", number: 151, status: "none" },
  { repo: "acme/docs", number: 33, status: "success" },
];

export const GITHUB_FIXED = {
  github_status: { connected: true, login: "eu-demo", source: "token", device_flow: true },
  github_lists: GITHUB,
  github_prs_checks: CHECKS,
  forges_opened_since: { items: [], errors: [] },
};

export const GITLAB_FIXED = {
  gitlab_status: { connected: true, username: "eu.demo", base_url: "https://gitlab.example.com" },
  gitlab_lists: GITLAB,
  gitlab_mr_checks: "success",
};
