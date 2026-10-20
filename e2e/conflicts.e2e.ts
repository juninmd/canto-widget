import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const now = new Date().toISOString();
const empty = { total: 0, items: [] };
const pr = (
  forge: "github" | "gitlab",
  number: number,
  title: string,
  conflict: boolean,
) => {
  const sigil = forge === "github" ? "#" : "!";
  const url =
    forge === "github"
      ? `https://github.com/acme/atlas/pull/${number}`
      : `https://gitlab.acme.io/acme/atlas/-/merge_requests/${number}`;
  return {
    repo: "acme/atlas",
    number,
    reference: `acme/atlas${sigil}${number}`,
    title,
    url,
    created_at: now,
    updated_at: now,
    comments: 1,
    is_pr: true,
    draft: false,
    author: "bia",
    conflict,
  };
};

test("a GitHub PR with a merge conflict carries the badge once the CI batch answers", async ({
  page,
}) => {
  const items = [
    pr("github", 41, "Trocar o cliente HTTP do sync", true),
    pr("github", 42, "Ajustar o tema escuro", false),
  ];
  await mockTauri(page, {
    fixed: {
      github_status: {
        connected: true,
        login: "ana",
        source: "pat",
        device_flow: false,
      },
      github_lists: {
        assigned: empty,
        my_prs: {
          total: 2,
          items: items.map((i) => ({ ...i, conflict: false })),
        },
        review_requested: empty,
        my_issues: empty,
      },
      github_prs_checks: items.map((i) => ({
        repo: i.repo,
        number: i.number,
        status: "success",
        conflict: i.conflict,
      })),
    },
  });
  await page.goto("/");
  await goTab(page, "GitHub");
  const badge = page.getByTitle(
    "tem conflito de merge com a branch base: resolva antes de mesclar",
  );
  await expect(badge).toHaveCount(1);
  await expect(page.getByRole("listitem").filter({ has: badge })).toContainText(
    "acme/atlas#41",
  );
  if (process.env.SHOT) {
    await page.setViewportSize({ width: 420, height: 720 });
    await page.screenshot({
      path: `${process.env.SHOT}/100-github-conflito.png`,
    });
  }
});

test("a GitLab MR the list marks as conflicting shows the badge straight away", async ({
  page,
}) => {
  const items = [
    pr("gitlab", 7, "Migrar a fila de e-mails", true),
    pr("gitlab", 8, "Cache das cotações", false),
  ];
  await mockTauri(page, {
    hiddenTabs: [],
    knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"],
    fixed: {
      gitlab_status: {
        connected: true,
        username: "ana",
        base_url: "https://gitlab.acme.io",
      },
      gitlab_lists: {
        assigned: empty,
        my_prs: { total: 2, items },
        review_requested: empty,
        my_issues: empty,
      },
    },
  });
  await page.goto("/");
  await goTab(page, "GitLab");
  const badge = page.getByTitle(
    "tem conflito de merge com a branch base: resolva antes de mesclar",
  );
  await expect(badge).toHaveCount(1);
  await expect(page.getByRole("listitem").filter({ has: badge })).toContainText(
    "acme/atlas!7",
  );
  if (process.env.SHOT) {
    await page.setViewportSize({ width: 420, height: 720 });
    await page.screenshot({
      path: `${process.env.SHOT}/101-gitlab-conflito.png`,
    });
  }
});
