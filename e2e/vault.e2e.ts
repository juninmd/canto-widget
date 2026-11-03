import { expect, test, type Page } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

test.beforeEach(({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

async function openGroup(page: Page, name: string) {
  const group = page.getByRole("button", { name: new RegExp(`^${name}`) });
  if ((await group.getAttribute("aria-expanded")) !== "true") await group.click();
}

async function openSettings(page: Page) {
  await mockTauri(page, { fixed: { vault_change_password: { biometric_disabled: false, pending: false } } });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await openGroup(page, "Privacidade e segurança");
}

test("lock screen: the master password reaches vault_unlock", async ({ page }) => {
  await mockTauri(page, { unlocked: false });
  await page.goto("/");
  await page.getByLabel("senha mestra").fill("senha-de-teste-1");
  await page.getByRole("button", { name: "Destrancar" }).click();
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "vault_unlock")).toEqual([
    { cmd: "vault_unlock", args: { password: "senha-de-teste-1" } },
  ]);
});

test("settings: changing the master password sends both passwords and confirms", async ({ page }) => {
  await openSettings(page);
  await page.getByRole("button", { name: "trocar senha mestra" }).click();
  await page.getByLabel("senha atual").fill("senha-atual-1");
  await page.getByLabel("nova senha", { exact: true }).fill("senha-nova-22");
  await page.getByLabel("repita a nova senha").fill("senha-nova-22");
  await page.getByRole("button", { name: "trocar senha", exact: true }).click();
  await expect(page.getByText("senha mestra trocada")).toBeVisible();
  const sent = (await calls(page)).filter((c) => c.cmd === "vault_change_password");
  expect(sent).toEqual([{ cmd: "vault_change_password", args: { currentPassword: "senha-atual-1", newPassword: "senha-nova-22" } }]);
});

test("settings: a mismatching confirmation never reaches Rust", async ({ page }) => {
  await openSettings(page);
  await page.getByRole("button", { name: "trocar senha mestra" }).click();
  await page.getByLabel("senha atual").fill("senha-atual-1");
  await page.getByLabel("nova senha", { exact: true }).fill("senha-nova-22");
  await page.getByLabel("repita a nova senha").fill("outra-coisa-99");
  await page.getByRole("button", { name: "trocar senha", exact: true }).click();
  await expect(page.getByText("a nova senha e a confirmação não conferem")).toBeVisible();
  expect((await calls(page)).filter((c) => c.cmd === "vault_change_password")).toEqual([]);
});

test("backup reminder: asks for a first export, then counts the days", async ({ page }) => {
  await mockTauri(page, { fixed: { backup_export: "/home/ana/cofre.canto" } });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await openGroup(page, "Dados e contas");
  await expect(page.getByText(/Nenhum backup exportado ainda/)).toBeVisible();
  await page.getByRole("button", { name: "exportar" }).click();
  await expect(page.getByText(/exportado há 0 dia/)).toBeVisible();
});
