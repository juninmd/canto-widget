import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "market", "reads", "activity",
];
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "weather", "reads"];

const MARKET = {
  quotes: [
    { symbol: "USD/BRL", price: 5.42, change: 0.31, points: [5.4, 5.41, 5.43, 5.42] },
    { symbol: "IBOV", price: 132540, change: -0.44, points: [133100, 132800, 132540] },
  ],
  fetched_at: Date.now(),
  error: null,
};

test("the market tab shows the live quotes, without the prototype badge", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: { market_get: MARKET } });
  await page.goto("/");
  await goTab(page, "Mercado");
  await expect(page.getByText("+0,31% no dia")).toBeVisible();
  await expect(page.getByText("protótipo")).toHaveCount(0);
  await page.getByRole("button", { name: /Ibovespa/ }).click();
  await expect(page.getByText("-0,44% no dia")).toBeVisible();
  await page.getByRole("button", { name: "atualizar" }).click();
  const args = (await calls(page)).filter((c) => c.cmd === "market_get").map((c) => c.args);
  expect(args[0]).toEqual({ force: false });
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "market_get").at(-1)?.args).toEqual({ force: true });
});

test("the market tab starts hidden for someone who saved a choice before it existed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"] });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Mercado", exact: true })).toHaveCount(0);
});
