import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";

const SHOTS: [string, string][] = [
  ["Gmail", "102-gmail"],
  ["Drive", "103-drive"],
  ["Tarefas", "104-google-tarefas"],
  ["Contatos", "115-contatos"],
];

test("gmail, drive, google tarefas e contatos", async ({ browser }) => {
  const page = await fullScene(browser);
  for (const [tab, name] of SHOTS) {
    await openTab(page, tab);
    // Real wait: the page clock is frozen, and the CSS entrance animations run on the real one.
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `docs/prints/app/${name}.png`, omitBackground: true });
  }
});
