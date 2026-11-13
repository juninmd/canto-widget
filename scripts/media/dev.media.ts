import { test } from "@playwright/test";
import { DEV } from "./data-dev";
import { fullScene, openTab } from "./scene";

const SHOTS: [string, string, string[]][] = [
  ["Portas", "132-dev-portas", []],
  ["Docker", "133-dev-docker", []],
  ["Git", "134-dev-git", []],
  ["Agenda", "135-dev-agenda", []],
];
// Built at run time so no token-shaped literal sits in the repository (secret scanners flag it).
const part = (v: object) => Buffer.from(JSON.stringify(v)).toString("base64url");
const fakeToken = () => [part({ alg: "HS256", typ: "JWT" }), part({ sub: "42", name: "Ana", exp: 4102444800 }), "ZmljdGljaW8"].join(".");

// Utilities start empty: each print types its own fictitious input first.
const TOOLS: [string, string, [string, string][]][] = [
  ["JSON", "136-dev-util-json", [["#dev-json", '{"nome":"Canto","abas":[{"id":"portas","ativa":true},{"id":"docker","ativa":false}],"versao":2}'], ["#dev-json-path", "abas[0].id"]]],
  ["JWT", "137-dev-util-jwt", [["#dev-jwt", fakeToken()], ["#dev-jwt-secret", "segredo-de-teste"]]],
  ["Base64", "138-dev-util-base64", [["#dev-b64", "Canto Widget"]]],
  ["URL", "139-dev-util-url", [["#dev-url", "https://api.exemplo.dev/v1/tarefas?status=aberta&tag=dev&tag=urgente#topo"]]],
  ["UUID e segredos", "140-dev-util-uuid", []],
  ["Hash", "141-dev-util-hash", [["#dev-hash", "canto"]]],
  ["Tempo", "142-dev-util-tempo", [["#dev-time", "1762000000"]]],
  ["Regex", "143-dev-util-regex", [["#dev-re", "(\\w+)@(\\w+)\\.com"], ["#dev-re-text", "contato: ana@exemplo.com, bia@exemplo.com"]]],
  ["Diff", "144-dev-util-diff", [["#dev-diff-a", "porta=3000\nhost=localhost"], ["#dev-diff-b", "porta=3001\nhost=localhost\ndebug=true"]]],
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
  for (const [name, file, inputs] of TOOLS) {
    await page.getByRole("tab", { name, exact: true }).last().click();
    for (const [sel, value] of inputs) await page.locator(sel).fill(value);
    if (name.startsWith("UUID")) for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "Gerar", exact: true }).first().click();
    await page.evaluate(() => document.getElementById("dev-tool-panel")?.parentElement?.scrollTo(0, 0));
    await shot(page, file);
  }
});
