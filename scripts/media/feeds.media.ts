import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";

const SHOTS: [string, string][] = [
  ["Clima", "92-clima"],
  ["Mercado", "94-mercado"],
  ["Leituras", "96-leituras"],
];

test("clima, mercado e leituras", async ({ browser }) => {
  const page = await fullScene(browser);
  for (const [tab, name] of SHOTS) {
    await openTab(page, tab);
    await page.screenshot({ path: `docs/prints/app/${name}.png`, omitBackground: true });
  }
});
