import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

test.use({ viewport: { width: 440, height: 700 } });

test("auto-lock offers 'never' and saves 0 minutes", async ({ page }) => {
  await mockTauri(page, { hiddenTabs: [], knownTabs: ["tasks", "notes", "settings"], fixed: { autolock_get: 15 } });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await page.getByRole("button", { name: "Segurança" }).click();
  const select = page.getByLabel(/trancar sozinho após/);
  await select.scrollIntoViewIfNeeded();
  await select.selectOption("0");
  await expect(select).toHaveValue("0");
  await page.screenshot({ path: "docs/prints/app/autolock-nunca.png" });
});
