import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = ["tasks", "notes", "clipboard", "agenda", "github", "gitlab", "status", "models"];

/** Fictitious models only (public repository). */
export const FAKE_MODELS = [
  ["aurora", "Aurora 4", "Lumen Labs", 73.2, 3.44, 142, "new"],
  ["nimbus", "Nimbus Ultra", "Stratos", 71.8, 6.25, 88, "up"],
  ["orca", "Orca Think", "Pelagic AI", 70.4, 1.1, 205, null],
  ["kestrel", "Kestrel Pro", "Altitude", 68.9, 2.75, 121, null],
  ["tide", "Tide 3 Large", "Maré Labs", 66.3, 0.62, 176, null],
  ["ember", "Ember Reason", "Forja AI", 64.0, 4.8, 64, "up"],
  ["quill", "Quill Flash", "Papiro", 60.7, 0.18, 312, null],
  ["basalt", "Basalt 2", "Rochedo", 58.1, null, 97, null],
].map(([id, name, creator, score, price, speed, badge], i) => ({ id, name, creator, score, price, speed, rank: i + 1, badge }));

export const MODELS_VIEW = {
  alerts: true,
  models: FAKE_MODELS,
  total: 187,
  fetched_at: Date.now() - 2 * 3_600_000,
  next_fetch_at: Date.now() + 3_600_000,
  throttled: false,
  error: null,
};

test("the AI models tab ranks models and cycles the sort", async ({ page }) => {
  await mockTauri(page, { hiddenTabs: ["gitlab", "status"], knownTabs: ALL_TABS, models: MODELS_VIEW });
  await page.goto("/");
  await goTab(page, "Modelos IA");
  await expect(page.getByText("Intelligence Index · 187 modelos")).toBeVisible();
  await expect(page.locator("[data-model]").first()).toContainText("Aurora 4");
  await expect(page.getByText("$3,44 / 1M tokens")).toBeVisible();
  await page.getByRole("button", { name: /ordenar por inteligência/ }).click();
  await expect(page.locator("[data-model]").first()).toContainText("Quill Flash");
  await page.getByRole("button", { name: "parar de avisar sobre o top 10" }).click();
  expect((await calls(page)).find((c) => c.cmd === "models_alerts_set")?.args).toEqual({ enabled: false });
});

test("the AI models tab is on the bar by default, even for a saved choice from before it existed", async ({ page }) => {
  // Wide enough for every tab: the narrow window sends the last ones to the "mais" menu (tabs.e2e.ts).
  await page.setViewportSize({ width: 1100, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], models: MODELS_VIEW });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Status API" })).toBeVisible();
  await goTab(page, "Modelos IA");
  await expect(page.locator("[data-model]").first()).toContainText("Aurora 4");
  await expect(page.getByLabel(/chave/i)).toHaveCount(0);
});
