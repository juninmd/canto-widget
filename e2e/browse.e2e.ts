import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "map", "market", "system", "dev", "reads", "activity", "gmail", "gdrive", "contacts",
];
const day = new Date().toLocaleDateString("sv");
const task = (id: string, title: string) => ({ id, title, done: false, day, created_at: 1, updated_at: 1 });

const agent = (id: string, name: string, installed: boolean, tag: string | null) => ({
  id, name, repo: `acme/${id}`, site: `https://github.com/acme/${id}`, install_tool: "npm", install_command: `npm install -g ${id}`, installed,
  path: installed ? `/usr/local/bin/${id}` : null,
  release: tag ? { tag, name: tag, published_at: "2026-10-16T20:53:06Z", url: `https://github.com/acme/${id}/releases/tag/${tag}`, notes: "" } : null,
  error: null,
});

const file = (id: string, name: string, kind: string, starred = false) => ({ id, name, kind, link: `https://docs.example.test/${id}`, modified: new Date().toISOString(), starred, editor: "", folder: "", size: 0 });

test("Tarefas: a busca filtra o dia e mostra quantas sobram", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 580 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockTauri(page, { fixed: { tasks_for_day: [task("t1", "Revisar o PR do filtro"), task("t2", "Enviar relatório semanal"), task("t3", "Marcar consulta de rotina")] } });
  await page.goto("/");
  await goTab(page, "Notas");
  await goTab(page, "Tarefas");
  await page.getByRole("searchbox", { name: "buscar tarefas" }).fill("relat");
  await expect(page.getByText("1 de 3").first()).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/prints/app/159-tarefas-busca.png" });
});

test("Agentes: busca, filtro e visão em tabela", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 580 });
  await mockTauri(page, {
    hiddenTabs: [], knownTabs: ALL_TABS,
    fixed: { harness_list: [agent("claude", "Claude Code", true, "v2.4.0"), agent("codex", "Codex CLI", false, "v0.9.1"), agent("gemini", "Gemini CLI", true, "v1.8.2")] },
  });
  await page.goto("/");
  await goTab(page, "Agentes");
  await page.getByRole("button", { name: "tabela" }).click();
  const table = page.getByRole("table", { name: "Agentes" });
  await expect(table.locator("tbody tr")).toHaveCount(3);
  await page.getByRole("button", { name: /^instalados/ }).click();
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/prints/app/160-agentes-tabela.png" });
});

test("Drive: grade de arquivos com a escolha lembrada", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 640 });
  await mockTauri(page, {
    hiddenTabs: [], knownTabs: ALL_TABS,
    fixed: {
      gdrive_list: { files: [file("d1", "Roadmap Q4 2026", "doc", true), file("d2", "Orçamento 2026", "sheet"), file("d3", "Apresentação trimestral", "slide"), file("d4", "Manual do usuário", "pdf")], next: "" },
      gdrive_quota: { used: 1_073_741_824, limit: 16_106_127_360 },
    },
  });
  await page.goto("/");
  await goTab(page, "Drive");
  await page.getByRole("button", { name: "grade" }).click();
  await expect(page.locator("[data-drive-file]")).toHaveCount(4);
  await page.reload();
  await goTab(page, "Drive");
  await expect(page.getByRole("button", { name: "grade" })).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/prints/app/161-drive-grade.png" });
});
