import { test } from "@playwright/test";
import { mockTauri, goTab } from "../e2e/mock";
import { CATALOGS } from "../src/i18n/catalogs";

test("capture the searchable language picker with public mock data", async ({ page }) => {
  await mockTauri(page, { language: "pt-BR" });
  await page.goto("/");
  await goTab(page, "Ajustes");
  const picker = page.locator("section").filter({ has: page.locator("#language-title") }).last();
  await picker.scrollIntoViewIfNeeded();
  await picker.screenshot({ path: "docs/prints/languages-picker.png" });
});

test("capture Arabic tasks with fictitious data", async ({ page }) => {
  await mockTauri(page, { language: "ar" });
  await page.goto("/");
  const messages = CATALOGS.ar;
  await page.getByPlaceholder(messages["tasks.addPlaceholder"], { exact: true }).fill("مراجعة التقرير التجريبي");
  await page.getByRole("button", { name: messages["tasks.add"], exact: true }).click();
  await page.getByText("مراجعة التقرير التجريبي").last().waitFor();
  await page.screenshot({ path: "docs/prints/languages-ar.png" });
});
