import { test } from "@playwright/test";
import { mapFixed } from "./data-map";
import { fullScene, openTab } from "./scene";

// Real waits: the page clock is frozen, and the CSS entrance animations run on the real one.
test("o mapa com o trânsito, o termômetro e os trajetos", async ({ browser }) => {
  const page = await fullScene(browser, { height: 760, fixed: await mapFixed(browser) });
  await openTab(page, "Mapa");
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "docs/prints/app/100-mapa.png", omitBackground: true });
  await page.locator("[data-map-incidents]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/prints/app/101-mapa-ocorrencias.png", omitBackground: true });
});
