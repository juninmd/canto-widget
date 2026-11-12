import { test } from "@playwright/test";
import { DEV } from "./data-dev";
import { fullScene, openTab } from "./scene";

const SHOTS: [string, string, string[]][] = [
  ["Portas", "132-dev-portas", []],
  ["Docker", "133-dev-docker", []],
  ["Git", "134-dev-git", []],
  ["Agenda", "135-dev-agenda", []],
];
const TOOLS: [string, string][] = [
  ["JSON", "136-dev-util-json"],
  ["JWT", "137-dev-util-jwt"],
  ["Base64", "138-dev-util-base64"],
  ["URL", "139-dev-util-url"],
  ["UUID e segredos", "140-dev-util-uuid"],
  ["Hash", "141-dev-util-hash"],
  ["Tempo", "142-dev-util-tempo"],
  ["Regex", "143-dev-util-regex"],
  ["Diff", "144-dev-util-diff"],
];

async function shot(page: import("@playwright/test").Page, file: string) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `docs/prints/app/${file}.png`, omitBackground: true });
}

// Real waits: the page clock is frozen, and the CSS entrance animations run on the real one.
test("a aba Dev e suas sub-abas", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: DEV });
  await openTab(page, "Dev");
  for (const [name, file] of SHOTS) {
    await page.getByRole("tab", { name, exact: true }).last().click();
    await shot(page, file);
  }
  await page.getByRole("tab", { name: "Docker", exact: true }).last().click();
  for (const [name, file] of [["Imagens", "145-dev-docker-imagens"], ["Volumes", "146-dev-docker-volumes"]]) {
    await page.getByRole("button", { name, exact: true }).click();
    await shot(page, file);
  }
  await page.getByRole("tab", { name: "Git", exact: true }).last().click();
  await page.getByRole("button", { name: /worktrees sincronizadas/ }).click();
  await shot(page, "147-dev-git-worktrees");
  await page.getByRole("tab", { name: "Utilitários", exact: true }).last().click();
  for (const [name, file] of TOOLS) {
    await page.getByRole("button", { name, exact: true }).click();
    await shot(page, file);
  }
});
