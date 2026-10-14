import { expect, test } from "@playwright/test";
import { mockTauri } from "./mock";

test("render and capture commenters catalog", async ({ page }) => {
  const item = {
    repo: "juninmd/canto-widget",
    number: 7,
    reference: "juninmd/canto-widget#7",
    title: "feat: lembretes e recorrência de tarefas, Windows Hello, janela persistente",
    url: "https://github.com/juninmd/canto-widget/pull/7",
    created_at: "2026-09-15T03:32:30Z",
    updated_at: "2026-09-15T10:26:50Z",
    comments: 2,
    is_pr: true,
    draft: false,
    author: "juninmd",
  };

  const empty = { total: 0, items: [] };

  await mockTauri(page, {
    fixed: {
      github_status: { connected: true, login: "juninmd", source: "pat", device_flow: false },
      github_lists: {
        assigned: empty,
        my_prs: { total: 1, items: [item] },
        review_requested: empty,
        my_issues: empty,
      },
      github_pr_comments: [
        {
          id: 5678637273,
          author: "joaorafaelsoarest",
          author_type: "User",
          avatar_url: "",
          body: "Que app legal! Vou testar 🗡️",
          created_at: "2026-09-15T10:26:50Z",
          url: "https://github.com/juninmd/canto-widget/pull/7#issuecomment-5678637273",
        },
        {
          id: 5674322398,
          author: "sonarqubecloud[bot]",
          author_type: "Bot",
          avatar_url: "",
          body: "❌ The last analysis has failed.",
          created_at: "2026-09-15T03:33:54Z",
          url: "https://github.com/juninmd/canto-widget/pull/7#issuecomment-5674322398",
        },
      ],
    },
  });

  await page.goto("/");
  // Switch to GitHub tab
  await page.getByRole("tab", { name: "GitHub" }).click();
  await expect(page.getByText("Catálogo de comentaristas", { exact: false })).toBeHidden();

  // Click on "Comentários (1)" tab
  const commentersTab = page.getByRole("tab", { name: "Comentários (1)" });
  await expect(commentersTab).toBeVisible();
  await commentersTab.click();

  // Verify catalog header and cards
  await expect(page.getByText("Catálogo de comentaristas")).toBeVisible();
  const card = page.getByRole("button", { name: /@joaorafaelsoarest/ });
  await expect(card).toBeVisible();

  // Take screenshot: Catalog overview
  await page.screenshot({
    path: "docs/prints/28-comentarios-pr.png",
  });

  // Click on @joaorafaelsoarest card
  await card.click();
  await expect(page.getByText("Filtrando por @joaorafaelsoarest")).toBeVisible();
  await expect(page.getByText("Que app legal! Vou testar 🗡️")).toBeVisible();
});
