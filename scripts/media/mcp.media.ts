import { test, type Page } from "@playwright/test";
import { FIXED, openTab } from "./scene";
import { openScene, settle } from "./stage";

const perms = { notifications: true, tasks: true, notes: false, agenda: true, prs: true, system: true, weather: true, tasks_write: false, notes_write: false };
const on = { enabled: true, running: true, port: 47615, endpoint: "http://127.0.0.1:47615/mcp", perms, error: null };
const TOKEN = "canto_Zx3kQ9vT1mYh7LwR2nPdA8sUe4cJbF6oGiVtNqXyHk0";

async function scene(browser: Parameters<typeof openScene>[0], view: object) {
  const page = await openScene(browser, {
    width: 420,
    height: 2400,
    storage: { "canto.settingsGroups": JSON.stringify(["app"]) },
    fixed: { ...FIXED, mcp_get: view, mcp_token_get: TOKEN },
  });
  await openTab(page, "Ajustes");
  await settle(page, 600);
  return page;
}

async function section(page: Page, name: string) {
  const box = page.getByRole("group", { name: "Servidor MCP" });
  await settle(page, 400);
  const b = (await box.boundingBox())!;
  await page.screenshot({ path: `docs/prints/mcp/${name}.png`, animations: "disabled", clip: { x: 0, y: b.y - 8, width: 420, height: b.height + 16 } });
}

test("mcp: off", async ({ browser }) => {
  const page = await scene(browser, { ...on, enabled: false, running: false });
  await section(page, "mcp-desligado");
});

test("mcp: on, token and permissions", async ({ browser }) => {
  const page = await scene(browser, on);
  await page.getByText("mostrar", { exact: true }).click();
  await section(page, "mcp-ligado");
});

test("mcp: agent snippets", async ({ browser }) => {
  const page = await scene(browser, on);
  await page.getByText("Claude Code", { exact: true }).click();
  await page.getByText("Codex", { exact: true }).click();
  await page.getByText("OpenCode", { exact: true }).click();
  await section(page, "mcp-agentes");
});
