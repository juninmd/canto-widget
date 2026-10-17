import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "habits", "market", "snippets", "reads", "activity",
];
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "habits", "market", "snippets", "weather"];

const article = (id: string, title: string, unread = true, has_image = false) => ({
  id,
  title,
  url: `https://blog.exemplo.test/${id}`,
  host: "blog.exemplo.test",
  source: "Blog Exemplo",
  published_at: Date.now() - 7_200_000,
  summary: "Um resumo curto do texto.",
  unread,
  has_image,
});

/** Fictitious feeds and readings: real headlines would read as facts. */
export const READS_FIXED = {
  reads_get: {
    feeds: [
      { url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null },
      { url: "https://sumiu.test/feed", label: "", error: "o feed respondeu 404" },
    ],
    items: [article("a1", "Como o cache do Cargo decide o que recompilar", true, true), article("a2", "Notas sobre escrita técnica curta", false)],
    fetched_at: Date.now(),
  },
};

test("the reads tab lists the cards with the unread count and a broken feed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: READS_FIXED });
  await page.goto("/");
  await goTab(page, "Leituras");
  await expect(page.getByText("1 não lidos de 2")).toBeVisible();
  await expect(page.locator("[data-read=a1]")).toContainText("Como o cache do Cargo decide o que recompilar");
  await expect(page.locator("[data-read=a1]")).toContainText("do Cargo");
  await expect(page.locator("[data-feed='https://sumiu.test/feed']")).toHaveAttribute("title", "o feed respondeu 404");
  await expect(page.getByText("RSS e Atom, sem chave")).toBeVisible();
});

test("marking a card as read goes to Rust and turns the card down", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: { ...READS_FIXED, reads_mark: { feeds: READS_FIXED.reads_get.feeds, items: [article("a1", "Como o cache do Cargo decide o que recompilar", false)], fetched_at: Date.now() } },
  });
  await page.goto("/");
  await goTab(page, "Leituras");
  await page.locator("[data-read=a1]").getByRole("button", { name: "marcar como lido" }).click();
  await expect(page.getByText("0 não lidos de 1")).toBeVisible();
  const call = (await calls(page)).find((c) => c.cmd === "reads_mark");
  expect(call?.args).toEqual({ id: "a1", read: true });
});

test("without a feed the tab explains and only sends the address", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: { reads_get: { feeds: [], items: [], fetched_at: 0 } },
  });
  await page.goto("/");
  await goTab(page, "Leituras");
  await expect(page.getByText("nenhum feed ainda")).toBeVisible();
  await page.getByLabel("Endereço do feed").fill("https://blog.exemplo.test/feed");
  await page.getByRole("button", { name: "adicionar" }).click();
  const call = (await calls(page)).find((c) => c.cmd === "reads_add");
  expect(call?.args).toEqual({ feed: "https://blog.exemplo.test/feed" });
});
