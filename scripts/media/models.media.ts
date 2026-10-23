import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";

// Real waits: the page clock is frozen, and the CSS entrance animations run on the real one.
test("modelos de IA: a ficha aberta no ranking", async ({ browser }) => {
  const page = await fullScene(browser, { height: 760, storage: { "canto.models.compare": JSON.stringify(["aurora", "orca"]) } });
  await openTab(page, "Modelos IA");
  await page.getByTitle("ver a ficha de Nimbus Ultra").click();
  await page.locator('[data-model="nimbus"]').evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "docs/prints/app/116-modelos-ficha.png", omitBackground: true });
});

test("modelos de IA: três modelos lado a lado", async ({ browser }) => {
  const page = await fullScene(browser, { height: 760, storage: { "canto.models.compare": JSON.stringify(["aurora", "nimbus", "orca"]) } });
  await openTab(page, "Modelos IA");
  await page.getByRole("tab", { name: /Comparar/ }).click();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "docs/prints/app/117-modelos-comparar.png", omitBackground: true });
  await page.locator('[data-metric="ttft"]').evaluate((el) => el.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(900);
  await page.screenshot({ path: "docs/prints/app/118-modelos-comparar-metricas.png", omitBackground: true });
});
