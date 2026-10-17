import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

export const ALL_TABS = ["tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents", "activity"];

/** Fictitious paths and notes: a real one would read as this machine's setup. */
export const AGENTS = [
  {
    id: "claude",
    name: "Claude Code",
    repo: "anthropics/claude-code",
    site: "https://github.com/anthropics/claude-code",
    install_tool: "npm",
    install_command: "npm install -g @anthropic-ai/claude-code",
    installed: true,
    path: "D:\\tools\\npm\\claude.cmd",
    release: {
      tag: "v2.1.302",
      name: "2.1.302",
      published_at: "2026-10-16T20:53:06Z",
      url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.302",
      notes: "## O que mudou\n\n- corrige o modo plano\n- solta a flag nova\n",
    },
    error: null,
  },
  {
    id: "aider",
    name: "Aider",
    repo: "Aider-AI/aider",
    site: "https://github.com/Aider-AI/aider",
    install_tool: "pipx",
    install_command: "pipx install aider-chat",
    installed: false,
    path: null,
    release: null,
    error: "sem resposta do GitHub",
  },
];

test("the Agentes tab shows the installed CLI, the release notes and the install command", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab", "status", "activity", "steam"], knownTabs: ALL_TABS, fixed: { harness_list: AGENTS } });
  await page.goto("/");
  await goTab(page, "Agentes");
  await expect(page.getByText("1 de 2 instalados")).toBeVisible();
  const installed = page.locator("[data-agent=claude]");
  await expect(installed).toContainText("instalado");
  await expect(installed).toContainText("última versão v2.1.302");
  await expect(installed).toContainText("corrige o modo plano");
  await expect(installed.locator("code")).toHaveCount(0);
  const missing = page.locator("[data-agent=aider]");
  await expect(missing).toContainText("não instalado");
  await expect(missing).toContainText("instalar com pipx");
  await expect(missing.locator("code")).toHaveText("pipx install aider-chat");
  await expect(missing.getByRole("alert")).toHaveText("sem resposta do GitHub");
});

test("copying the command touches nothing but the clipboard", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockTauri(page, { hiddenTabs: ["gitlab", "status", "activity", "steam"], knownTabs: ALL_TABS, fixed: { harness_list: AGENTS } });
  await page.goto("/");
  await goTab(page, "Agentes");
  const before = (await calls(page)).length;
  await page.locator("[data-agent=aider]").getByRole("button", { name: "copiar" }).click();
  await expect(page.locator("[data-agent=aider]").getByText("comando copiado")).toBeVisible();
  await expect(page.getByText("nada é instalado pelo Canto")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pipx install aider-chat");
  expect((await calls(page)).length).toBe(before);
});

test("atualizar asks Rust to bypass the 30 min cache", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab", "status", "activity", "steam"], knownTabs: ALL_TABS, fixed: { harness_list: AGENTS } });
  await page.goto("/");
  await goTab(page, "Agentes");
  await page.getByRole("button", { name: "atualizar" }).click();
  const args = (await calls(page)).filter((c) => c.cmd === "harness_list").map((c) => c.args);
  expect(args[0]).toEqual({ force: false });
  expect(args.at(-1)).toEqual({ force: true });
});

test("the GitHub button opens the release page", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab", "status", "activity", "steam"], knownTabs: ALL_TABS, fixed: { harness_list: AGENTS } });
  await page.goto("/");
  await goTab(page, "Agentes");
  await page.locator("[data-agent=claude]").getByRole("button", { name: "abrir no GitHub" }).click();
  expect((await calls(page)).find((c) => c.cmd === "open_link")?.args).toEqual({
    url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.302",
  });
});

test("the Agentes tab starts hidden for someone who saved a choice before it existed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: ["gitlab"],
    knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "activity"],
  });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Agentes", exact: true })).toHaveCount(0);
});
