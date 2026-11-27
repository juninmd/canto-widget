import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

/** Fictitious data only (public repository). */
const now = Date.now();
const ago = (h: number) => new Date(now - h * 3_600_000).toISOString();
const pr = (n: number, title: string, extra: Record<string, unknown> = {}) => ({
  repo: "acme/atlas",
  number: n,
  reference: `acme/atlas#${n}`,
  title,
  url: `https://github.com/acme/atlas/pull/${n}`,
  created_at: ago(30),
  updated_at: ago(2),
  comments: 0,
  is_pr: true,
  draft: false,
  author: "ana",
  ...extra,
});
const empty = { total: 0, items: [], fetched_at: now };
const lists = {
  review_requested: { total: 1, items: [pr(41, "Corrige o cálculo de rotas com paradas", { comments: 5 })], fetched_at: now },
  others_prs: empty, assigned: empty,
  my_prs: {
    total: 3,
    items: [pr(52, "Cache de relatórios por período", { author: "voce", comments: 2 }), pr(57, "Rascunho: painel da frota", { author: "voce", draft: true }), pr(60, "Atualiza dependências do mapa", { author: "voce" })],
    fetched_at: now,
  },
  my_issues: empty,
};
const fixed = {
  github_status: { connected: true, login: "voce", source: "pat", device_flow: true },
  github_lists: lists,
  github_prs_checks: [],
  mentions_unread: 0,
};

test("a PR with new comments shows a badge, and ocultar rascunhos hides the drafts for good", async ({ page }) => {
  // The user looked at the review request when it had 2 comments, and at "Cache de relatórios" when it had 2.
  await page.addInitScript((seen) => localStorage.setItem("canto.forge.seen", JSON.stringify(seen)), {
    "https://github.com/acme/atlas/pull/41": 2,
    "https://github.com/acme/atlas/pull/52": 2,
  });
  await mockTauri(page, { fixed });
  await page.goto("/");
  await goTab(page, "GitHub");
  await expect(page.getByText("+3 comentários")).toBeVisible();
  await expect(page.getByText("Rascunho: painel da frota")).toBeVisible();
  await page.getByRole("button", { name: "ocultar rascunhos" }).click();
  await expect(page.getByText("Rascunho: painel da frota")).toHaveCount(0);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  await page.reload();
  await goTab(page, "GitHub");
  await expect(page.getByRole("button", { name: "ocultar rascunhos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Rascunho: painel da frota")).toHaveCount(0);
});

test("pinning a repository keeps it one click away through the pinned filter", async ({ page }) => {
  const repo = (full_name: string, group: string, description: string) => ({
    id: "", name: full_name.split("/").pop(), full_name, group, description, url: `https://github.com/${full_name}`,
    private: false, fork: false, archived: false, stars: 7, forks: 1, open_issues: 0, language: "TypeScript",
    updated_at: ago(3), topics: [], avatar_url: "", group_avatar_url: "", default_branch: "main",
  });
  await mockTauri(page, {
    fixed: {
      ...fixed,
      github_lists: { others_prs: empty, assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty },
      github_repos_page: {
        page: 1, has_next: false, revalidated: false, fetched_at: now, limited_until: null,
        repos: [repo("voce/dotfiles", "", "Configurações de shell"), repo("acme/atlas", "acme", "Mapas e rotas para a frota"), repo("acme/relatorios", "acme", "Relatórios por período")],
      },
      repos_cached: [],
      repo_avatars: {},
    },
  });
  await page.goto("/");
  await goTab(page, "GitHub");
  await page.getByRole("tab", { name: "repositórios" }).click();
  await page.getByRole("treeitem", { name: "voce/dotfiles" }).click();
  await page.getByRole("button", { name: "fixar voce/dotfiles" }).click();
  await page.getByRole("button", { name: "fixados · 1" }).click();
  await expect(page.getByRole("treeitem", { name: "voce/dotfiles" })).toBeVisible();
  await expect(page.getByRole("treeitem", { name: /acme/ })).toHaveCount(0);
  await page.getByLabel("Filtrar repositórios").blur();
  if (process.env.SHOT2) await page.screenshot({ path: process.env.SHOT2 });
});

test("each PR shows its approvals, change requests and diff size, and precisa de mim keeps only what is stuck", async ({ page }) => {
  const checks = [
    { repo: "acme/atlas", number: 41, status: "failure", conflict: false, additions: 182, deletions: 41, approvals: 0, changes_requested: false },
    { repo: "acme/atlas", number: 52, status: "success", conflict: false, additions: 540, deletions: 96, approvals: 2, changes_requested: false },
    { repo: "acme/atlas", number: 60, status: "success", conflict: false, additions: 64, deletions: 12, approvals: 1, changes_requested: true },
  ];
  const stuck = { ...lists, review_requested: { total: 2, items: [pr(41, "Corrige o cálculo de rotas com paradas", { created_at: ago(80) }), pr(43, "Ajusta o texto do onboarding", { created_at: ago(5) })], fetched_at: now } };
  await mockTauri(page, { fixed: { ...fixed, github_lists: stuck, github_prs_checks: checks } });
  await page.goto("/");
  await goTab(page, "GitHub");
  await expect(page.getByText("✓ 2 aprov.")).toBeVisible();
  await expect(page.getByText("mudanças pedidas")).toBeVisible();
  await expect(page.getByText("+540")).toBeVisible();
  await page.getByRole("button", { name: "precisa de mim · 2" }).click();
  await expect(page.getByText("Ajusta o texto do onboarding")).toHaveCount(0);
  await expect(page.getByText("Cache de relatórios por período")).toHaveCount(0);
  await expect(page.getByText("Atualiza dependências do mapa")).toBeVisible();
  if (process.env.SHOT3) {
    await page.setViewportSize({ width: 420, height: 760 });
    await page.getByRole("button", { name: "precisa de mim · 2" }).click();
  }
  if (process.env.SHOT3) await page.screenshot({ path: process.env.SHOT3 });
});

const detail = {
  body: "Recalcula as rotas quando uma parada é removida e evita ciclos.\n\nFecha #37.",
  head_branch: "fix/rotas",
  base_branch: "main",
  changed_files: 3,
  jobs: [
    { name: "lint", state: "success", url: "", stage: "", seconds: 42, label: "" },
    { name: "unit", state: "success", url: "", stage: "", seconds: 190, label: "" },
    { name: "build", state: "running", url: "", stage: "", seconds: 65, label: "" },
  ],
  reviewers: [
    { login: "bia", state: "approved" },
    { login: "caio", state: "pending" },
  ],
};
const talk = [
  { id: 1, author: "bia", bot: false, body: "E se a lista de paradas vier vazia?", created_at: ago(30), url: "https://github.com/acme/atlas/pull/41#discussion_r1", path: "src/rotas/calcular.ts", line: 2, hunk: "-let total = 0;\n+let total = origem.dist(paradas[0]);", reply: false, thread: "1", resolved: false, resolvable: false },
  { id: 2, author: "ana", bot: false, body: "Coberto no último commit.", created_at: ago(28), url: "https://github.com/acme/atlas/pull/41#discussion_r2", path: "src/rotas/calcular.ts", line: 2, hunk: "", reply: true, thread: "1", resolved: false, resolvable: false },
  { id: 3, author: "ci[bot]", bot: true, body: "Cobertura: 87%", created_at: ago(5), url: "https://github.com/acme/atlas/pull/41#issuecomment-3", path: "", line: 0, hunk: "", reply: false, thread: "", resolved: false, resolvable: false },
];
const changed = [
  { name: "src/rotas/calcular.ts", status: "modified", additions: 4, deletions: 1, truncated: false, patch: "@@ -1,3 +1,6 @@\n const trechos = ordenar(paradas);\n-let total = 0;\n+let total = origem.dist(paradas[0]);\n+for (const t of trechos) total += t.km;\n+if (circular) total += ultimo.volta;\n return total;" },
  { name: "test/rotas.spec.ts", status: "added", additions: 3, deletions: 0, truncated: false, patch: "@@ -0,0 +1,3 @@\n+it(\"aceita lista vazia\", () => {\n+  expect(calcular([])).toBe(0);\n+});" },
];
const pic = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="560" height="260"><rect width="560" height="260" fill="#14214a"/><rect x="20" y="20" width="520" height="34" rx="8" fill="#1f2c52"/><rect x="20" y="70" width="330" height="170" rx="10" fill="#1d2b5c"/><rect x="366" y="70" width="174" height="80" rx="10" fill="#0f766e"/><rect x="366" y="160" width="174" height="80" rx="10" fill="#6d28d9"/></svg>');
const meta = {
  title: "Corrige o cálculo de rotas com paradas removidas", state: "open", draft: false, conflict: false, author: "ana", author_avatar: "", created_at: ago(180),
  body: "## Resumo\n\nRecalcula as rotas quando uma parada é removida e **evita ciclos**.\n\n- [x] Cobertura de teste\n- [ ] Documentar no README\n\n| Antes | Depois |\n|---|---|\n| 3 s | 0,4 s |\n\n![antes e depois](https://user-images.githubusercontent.com/1/rotas.png)\n\nFecha #37.",
  labels: [{ name: "bug", color: "d73a4a" }, { name: "rotas", color: "0e8a16" }], assignees: ["ana"], milestone: "v0.82", merge_methods: ["squash", "merge", "rebase"],
  reactions: [{ id: 1, emoji: "👍", user: "voce" }, { id: 2, emoji: "👍", user: "bia" }, { id: 3, emoji: "🎉", user: "bia" }],
};
const profile = { login: "bia", name: "Bia Lima", bio: "Revisa tudo que mexe em rotas.", company: "Acme", location: "Recife", public_repos: 21, followers: 54, since: 2018, url: "https://github.com/bia" };
const rich = { ...fixed, github_pr_meta: meta, forge_image: pic, pr_blob_image: pic, github_repo_labels: meta.labels, github_pr_act: null, github_pr_detail: detail, github_pr_conversation: talk, github_pr_files: changed, github_pr_review: null, github_pr_reply: null, github_profile: profile };

test("clicking a PR opens its view; approving asks for a confirmation first", async ({ page }) => {
  await mockTauri(page, { fixed: rich });
  await page.goto("/");
  await goTab(page, "GitHub");
  await page.getByText("acme/atlas#41").click();
  const view = page.getByRole("dialog", { name: "PR acme/atlas#41" });
  await expect(view.getByText("fix/rotas → main")).toBeVisible();
  await expect(view.getByText("Fecha #37.")).toBeVisible();
  await expect(view.getByAltText("antes e depois")).toBeVisible();
  await expect(view.getByRole("button", { name: "mesclar" })).toBeVisible();
  await view.getByRole("tab", { name: /Revisores/ }).click();
  await view.getByRole("button", { name: "ver perfil de @bia" }).click();
  await expect(view.getByRole("region", { name: "perfil de @bia" }).getByText("Acme · Recife")).toBeVisible();
  await view.getByRole("button", { name: "aprovar" }).click();
  await expect(view.getByRole("button", { name: "confirmar aprovação" })).toBeVisible();
  if (process.env.SHOT) await page.setViewportSize({ width: 420, height: 860 }), await page.screenshot({ path: process.env.SHOT });
  await view.getByRole("button", { name: "confirmar aprovação" }).click();
  await expect(view.getByRole("status")).toHaveText("aprovação enviada");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the conversation groups replies, hides bots and the diff shows the thread on its line", async ({ page }) => {
  if (process.env.SHOT) await page.setViewportSize({ width: 420, height: 860 });
  await mockTauri(page, { fixed: rich });
  await page.goto("/");
  await goTab(page, "GitHub");
  await page.getByText("acme/atlas#41").click();
  const view = page.getByRole("dialog", { name: "PR acme/atlas#41" });
  await view.getByRole("tab", { name: /Conversa/ }).click();
  await expect(view.getByText("src/rotas/calcular.ts:2")).toHaveCount(1);
  await expect(view.getByText("Coberto no último commit.")).toBeVisible();
  await expect(view.getByText("Cobertura: 87%")).toBeVisible();
  await view.getByRole("button", { name: "ocultar bots" }).click();
  await expect(view.getByText("Cobertura: 87%")).toHaveCount(0);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  await view.getByRole("tab", { name: /^Arquivos/ }).click();
  await view.getByRole("button", { name: /calcular.ts/ }).click();
  await expect(view.getByText("E se a lista de paradas vier vazia?")).toBeVisible();
  if (process.env.SHOT2) await page.screenshot({ path: process.env.SHOT2 });
});

test("an MR opens the same view with its pipeline stages and no request-changes", async ({ page }) => {
  if (process.env.SHOT) await page.setViewportSize({ width: 420, height: 860 });
  const mr = (n: number, title: string) => ({ ...pr(n, title), url: `https://gitlab.com/acme/atlas/-/merge_requests/${n}`, reference: `acme/atlas!${n}` });
  const stages = { ...detail, jobs: [
    { name: "compile", state: "success", url: "", stage: "build", seconds: 71, label: "" },
    { name: "lint", state: "success", url: "", stage: "test", seconds: 42, label: "" },
    { name: "unit", state: "failure", url: "", stage: "test", seconds: 198, label: "" },
    { name: "review-app", state: "none", url: "", stage: "deploy", seconds: 0, label: "manual" },
  ] };
  await mockTauri(page, { hiddenTabs: [], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"], fixed: { ...fixed, gitlab_status: { connected: true, username: "voce", base_url: "https://gitlab.com" }, gitlab_lists: { ...lists, review_requested: { total: 1, items: [mr(41, "Corrige o cálculo de rotas com paradas")], fetched_at: now } }, gitlab_mr_detail: stages, gitlab_mr_conversation: [], gitlab_mr_files: changed, gitlab_mr_review: null } });
  await page.goto("/");
  await goTab(page, "GitLab");
  await page.getByText("acme/atlas!41").click();
  const view = page.getByRole("dialog", { name: "MR acme/atlas!41" });
  await view.getByRole("tab", { name: /Pipeline/ }).click();
  await expect(view.getByRole("region", { name: "estágio test" }).getByText("unit")).toBeVisible();
  await expect(view.getByText("manual")).toBeVisible();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  await view.getByRole("tab", { name: /Revisores/ }).click();
  await expect(view.getByRole("button", { name: "aprovar" })).toBeVisible();
  await expect(view.getByRole("button", { name: "pedir mudanças" })).toHaveCount(0);
});

test("a running CI can be watched and a review request can be snoozed for longer", async ({ page }) => {
  await mockTauri(page, { fixed: { ...fixed, github_prs_checks: [{ repo: "acme/atlas", number: 41, status: "running" }] } });
  await page.goto("/");
  await goTab(page, "GitHub");
  const row = page.getByRole("listitem").filter({ hasText: "Corrige o cálculo de rotas com paradas" });
  await row.hover();
  await row.getByRole("button", { name: /avisar quando o CI de/ }).click();
  await expect(row.getByRole("button", { name: /parar de avisar/ })).toHaveAttribute("aria-pressed", "true");
  await expect(row.getByRole("button", { name: /até amanhã$/ })).toBeVisible();
  await page.waitForTimeout(400);
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  await row.getByRole("button", { name: /até amanhã$/ }).click();
  await expect(page.getByText("Corrige o cálculo de rotas com paradas")).toHaveCount(0);
});
