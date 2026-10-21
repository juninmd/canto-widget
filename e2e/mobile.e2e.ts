import { devices, expect, test } from "@playwright/test";
import { calls, mockTauri } from "./mock";

// The webview of the Android and iOS builds is a phone's: same bundle, phone layout.
const { defaultBrowserType: _browser, ...phone } = devices["Pixel 7"];
test.use(phone);

test.beforeEach(({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

test("the tabs sit at the bottom and the window controls are gone", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  const bar = page.getByRole("tablist");
  await expect(bar.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  const box = (await bar.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.y + box.height).toBeGreaterThan(viewport.height - 100);
  for (const control of [/esconder/i, /tela cheia/i, /trocar modo do canto/i]) {
    await expect(page.getByRole("button", { name: control })).toHaveCount(0);
  }
  await expect(page.getByRole("button", { name: "Busca global" })).toBeVisible();
});

test("the sheet reaches the other tabs and Ajustes drops the desktop-only settings", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  await page.getByRole("button", { name: /^mais/ }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("button", { name: "Atividade" })).toHaveCount(0);
  await sheet.getByRole("button", { name: "Ajustes" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("tabpanel")).toBeVisible();
  for (const group of ["Aparência", "Notificações", "Privacidade", "Dados"]) {
    await expect(page.getByRole("button", { name: new RegExp(group) }).first()).toBeVisible();
  }
  await expect(page.getByRole("button", { name: /^Aplicativo/ })).toHaveCount(0);
  const asked = (await calls(page)).map((c) => c.cmd);
  for (const desktopOnly of ["window_config", "update_check", "autostart_status", "window_mini_set"]) {
    expect(asked).not.toContain(desktopOnly);
  }
});

test("opening the clipboard tab reads the clipboard, since a phone has no watcher", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  await page.getByRole("tab", { name: "Clipboard" }).click();
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "clip_capture").length).toBeGreaterThan(0);
});
