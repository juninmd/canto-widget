import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";

const SHOTS: [string, string][] = [
  ["Mercado", "94-prototipo-mercado"],
  ["Leituras", "96-leituras"],
];

test("leituras e o protótipo de mercado", async ({ browser }) => {
  const page = await fullScene(browser);
  for (const [tab, name] of SHOTS) {
    await openTab(page, tab);
    // Real wait: the page clock is frozen, and the CSS entrance animations run on the real one.
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `docs/prints/app/${name}.png`, omitBackground: true });
  }
});
