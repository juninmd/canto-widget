import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "market", "reads", "activity",
];
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "weather", "reads"];

/** Fictitious quotes: a real reading would age badly in a repository. */
const MARKET = {
  market_get: {
    quotes: [
      { symbol: "USD/BRL", label: "Dólar", value: 5.0826, change: 0.6038, decimals: 4 },
      { symbol: "BTC/BRL", label: "Bitcoin", value: 411553, change: -0.51, decimals: 0 },
      { symbol: "IBOV", label: "Ibovespa", value: 205430.33, change: 0.54, decimals: 2 },
    ],
    fetched_at: 1_700_000_000_000,
    error: null,
  },
};

test("the market tab lists each quote with its label, its number and the day's variation", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: MARKET });
  await page.goto("/");
  await goTab(page, "Mercado");
  const ibov = page.locator("[data-market-quote=IBOV]");
  await expect(ibov).toContainText("Ibovespa");
  await expect(ibov).toContainText("205.430,33");
  await expect(ibov).toContainText("+0,54% no dia");
  await expect(page.locator("[data-market-quote='USD/BRL']")).toContainText("5,0826");
  await expect(page.locator("[data-market-quote='USD/BRL']")).toContainText("+0,60% no dia");
  await expect(page.locator("[data-market-quote='BTC/BRL']")).toContainText("-0,51% no dia");
  await expect(page.getByText("BCB · CoinGecko · CNBC")).toBeVisible();
});

test("atualizar asks Rust to bypass the 15 min cache", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: MARKET });
  await page.goto("/");
  await goTab(page, "Mercado");
  await page.getByRole("button", { name: "atualizar" }).click();
  const args = (await calls(page)).filter((c) => c.cmd === "market_get").map((c) => c.args);
  expect(args[0]).toEqual({ force: false });
  expect(args.at(-1)).toEqual({ force: true });
});

test("a reading that failed keeps the last list and says it is stale", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: { market_get: { ...MARKET.market_get, error: "sem resposta da fonte" } },
  });
  await page.goto("/");
  await goTab(page, "Mercado");
  await expect(page.getByText(/Não foi possível atualizar/)).toBeVisible();
  await expect(page.locator("[data-market-quote]")).toHaveCount(3);
});
