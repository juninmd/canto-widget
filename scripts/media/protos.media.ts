import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";

const SHOTS: [string, string][] = [
  ["Clima", "92-prototipo-clima"],
  ["Hábitos", "93-prototipo-habitos"],
  ["Mercado", "94-prototipo-mercado"],
  ["Snippets", "95-prototipo-snippets"],
  ["Leituras", "96-prototipo-leituras"],
];

test("protótipos: as cinco abas sugeridas", async ({ browser }) => {
  const page = await fullScene(browser);
  for (const [tab, name] of SHOTS) {
    await openTab(page, tab);
    await page.screenshot({ path: `docs/prints/app/${name}.png`, omitBackground: true });
  }
});
