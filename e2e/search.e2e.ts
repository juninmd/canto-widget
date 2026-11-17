import { expect, test } from "@playwright/test";
import { calls, mockTauri } from "./mock";

const REPO = { id: "", name: "canto-demo", full_name: "exemplo/canto-demo", group: "exemplo", description: "painel de exemplo", url: "https://example.com/r", private: false, fork: false, archived: false, stars: 1, forks: 0, open_issues: 0, language: "Rust" };

test("the global search lists cached repositories and opens the forge tab", async ({ page }) => {
  await mockTauri(page, {
    fixed: { repos_cached: [{ page: 1, repos: [REPO], has_next: false, fetched_at: 0, limited_until: null, revalidated: false }] },
  });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ControlOrMeta+K");
  await page.getByRole("searchbox", { name: "busca global" }).fill("canto-demo");
  await expect(page.getByRole("button", { name: "repositórios →" })).toBeVisible();
  await page.getByRole("button", { name: "exemplo/canto-demo" }).first().click();
  await expect(page.getByRole("tab", { name: "GitHub" })).toHaveAttribute("aria-selected", "true");
  // Nothing but local reads: no network-backed command was asked for.
  expect((await calls(page)).some((c) => c.cmd === "contacts_list")).toBe(false);
});
