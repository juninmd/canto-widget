import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

test("render and capture commenters catalog", async ({ page }) => {
  const item = {
    repo: "dev-exemplo/canto-widget",
    number: 7,
    reference: "dev-exemplo/canto-widget#7",
    title: "feat: lembretes e recorrência de tarefas, Windows Hello, janela persistente",
    url: "https://github.com/dev-exemplo/canto-widget/pull/7",
    created_at: "2026-09-15T03:32:30Z",
    updated_at: "2026-09-15T10:26:50Z",
    comments: 2,
    is_pr: true,
    draft: false,
    author: "dev-exemplo",
  };

  const empty = { total: 0, items: [] };

  await mockTauri(page, {
    fixed: {
      github_status: { connected: true, login: "dev-exemplo", source: "pat", device_flow: false },
      github_lists: {
        assigned: empty,
        my_prs: { total: 1, items: [item] },
        review_requested: empty,
        my_issues: empty,
      },
      github_pr_comments: [
        {
          id: 5678637273,
          author: "colega-exemplo",
          author_type: "User",
          avatar_url: "",
          body: "Que app legal! Vou testar 🗡️",
          created_at: "2026-09-15T10:26:50Z",
          url: "https://github.com/dev-exemplo/canto-widget/pull/7#issuecomment-5678637273",
        },
        {
          id: 5674322398,
          author: "sonarqubecloud[bot]",
          author_type: "Bot",
          avatar_url: "",
          body: "❌ The last analysis has failed.",
          created_at: "2026-09-15T03:33:54Z",
          url: "https://github.com/dev-exemplo/canto-widget/pull/7#issuecomment-5674322398",
        },
      ],
    },
  });

  await page.goto("/");
  // Switch to GitHub tab
  await goTab(page, "GitHub");
  await expect(page.getByText("Catálogo de comentaristas", { exact: false })).toBeHidden();

  // Click on "Comentários (1)" tab
  const commentersTab = page.getByRole("tab", { name: "Comentários (1)" });
  await expect(commentersTab).toBeVisible();
  await commentersTab.click();

  // Verify catalog header and cards
  await expect(page.getByText("Catálogo de comentaristas")).toBeVisible();
  const card = page.getByRole("button", { name: /@colega-exemplo/ });
  await expect(card).toBeVisible();

  // Take screenshot: Catalog overview
  await page.screenshot({
    path: "docs/prints/28-comentarios-pr.png",
  });

  // Click on @colega-exemplo card
  await card.click();
  await expect(page.getByText("Filtrando por @colega-exemplo")).toBeVisible();
  await expect(page.getByText("Que app legal! Vou testar 🗡️")).toBeVisible();
});

test("picking a commenter shows their GitHub profile", async ({ page }) => {
  const item = {
    repo: "acme/atlas",
    number: 7,
    reference: "acme/atlas#7",
    title: "Corrige o cálculo de rotas com paradas",
    url: "https://github.com/acme/atlas/pull/7",
    created_at: "2026-09-15T03:32:30Z",
    updated_at: "2026-09-15T10:26:50Z",
    comments: 1,
    is_pr: true,
    draft: false,
    author: "voce",
  };
  const empty = { total: 0, items: [] };
  await mockTauri(page, {
    fixed: {
      github_status: { connected: true, login: "voce", source: "pat", device_flow: false },
      github_lists: { assigned: empty, my_prs: { total: 1, items: [item] }, review_requested: empty, my_issues: empty },
      github_pr_comments: [
        { id: 1, author: "ana", author_type: "User", avatar_url: "", body: "Pode seguir, as rotas ficaram claras.", created_at: "2026-09-15T10:26:50Z", url: "https://github.com/acme/atlas/pull/7#issuecomment-1" },
      ],
      github_profile: { login: "ana", name: "Ana Souza", bio: "Cuida das rotas e da fila de entregas.", company: "Acme", location: "Recife", public_repos: 12, followers: 38, since: 2019, url: "https://github.com/ana" },
    },
  });
  await page.goto("/");
  await goTab(page, "GitHub");
  await page.getByRole("tab", { name: "Comentários (1)" }).click();
  await page.getByRole("button", { name: /@ana/ }).click();
  const card = page.getByRole("region", { name: "perfil de @ana" });
  await expect(card.getByText("Acme · Recife")).toBeVisible();
  await expect(card.getByText("12 repositórios · 38 seguidores · no GitHub desde 2019")).toBeVisible();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
});
