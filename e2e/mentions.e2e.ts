import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

/** Fictitious data only (public repository). */
const now = Date.now();
const empty = { total: 0, items: [], fetched_at: now };
const row = (n: number, title: string, who: { name: string; login: string } | null, preview: string, extra = {}) => ({
  id: `github:acme/atlas#${n}`,
  title,
  reference: `acme/atlas#${n}`,
  url: `https://github.com/acme/atlas/pull/${n}`,
  is_pr: true,
  at: new Date(now - n * 600_000).toISOString(),
  sender: who && { ...who, avatar: "" },
  preview,
  ...extra,
});

const mentions = [
  row(128, "Corrige o parser de CSV com aspas", { name: "Marina Souza", login: "marina" }, "…o retry está em 3 tentativas. @voce consegue olhar o backoff antes da release?"),
  row(131, "Cache de relatórios por período", { name: "Caio Prado", login: "caio-prado" }, "@voce o teste de carga passou, pode aprovar?"),
  row(120, "Migra o job de relatórios para a fila nova", null, "", { is_pr: false }),
];

test("the mentions subtab shows who mentioned me, a preview of the text and the link", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      github_status: { connected: true, login: "voce", source: "pat", device_flow: true },
      github_lists: { assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty },
      github_mentions: mentions,
    },
  });
  await page.goto("/");
  await goTab(page, "GitHub");
  expect((await calls(page)).some((c) => c.cmd === "github_mentions")).toBe(false);

  await page.getByRole("tab", { name: "menções" }).click();
  const list = page.getByRole("list", { name: "menções" });
  await expect(list.getByRole("listitem")).toHaveCount(3);
  await expect(list).toContainText("Marina Souza");
  await expect(list).toContainText("@marina");
  await expect(list).toContainText("@voce consegue olhar o backoff antes da release?");
  await expect(list).toContainText("o comentário com a menção não foi encontrado");

  await list.getByRole("button", { name: "abrir Corrige o parser de CSV com aspas" }).click();
  expect((await calls(page)).find((c) => c.cmd === "open_link")?.args).toEqual({ url: mentions[0].url });
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });

  await page.getByRole("tab", { name: "PRs e issues" }).click();
  await expect(page.getByRole("tab", { name: "PRs e issues" })).toHaveAttribute("aria-selected", "true");
});
