import { expect, test, type Page } from "@playwright/test";
import { shoot } from "./out";
import { FIXED, fullScene, openTab } from "./scene";
import { openScene, settle } from "./stage";

/** Brings a settings section to the top of the tab by its heading (h2/h3) or legend. */
async function toSection(page: Page, title: RegExp) {
  const heading = page.locator("h2, h3, legend").filter({ hasText: title }).first();
  await expect(heading).toHaveCount(1);
  await heading.evaluate((el) => (el.closest("section, fieldset") ?? el).scrollIntoView({ block: "start" }));
  await settle(page, 500);
}

for (const skin of ["hueco-mundo", "dracula", "glass", "claro"] as const) {
  test(`skin: ${skin}`, async ({ browser }) => {
    const page = await fullScene(browser, { skin });
    await settle(page, 900);
    await shoot(page, `skin-${skin}`);
    if (skin === "glass") {
      await page.screenshot({ path: "docs/prints/app/79-skin-glass.png", omitBackground: true });
    }
  });
}

test("settings: the top of the tab", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Ajustes");
  await shoot(page, "settings");
});

for (const [name, legend] of [
  ["security", /Segurança/],
  ["sync", /Pasta sincronizada/],
  ["dnd", /Não perturbe/],
  ["tabs", /Abas visíveis/],
] as const) {
  test(`settings: ${name}`, async ({ browser }) => {
    const page = await fullScene(browser);
    await openTab(page, "Ajustes");
    await toSection(page, legend);
    await shoot(page, `settings-${name}`);
  });
}

test("a locked vault", async ({ browser }) => {
  const page = await openScene(browser, { unlocked: false, fixed: { biometric_status: FIXED.biometric_status } });
  await settle(page, 800);
  await shoot(page, "lock");
});

/** A vault that does not exist yet becomes unlocked once `vault_create` is called, as in a first run. */
async function firstRun(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem("canto.onboarding.visto");
    const w = window as unknown as { __TAURI_INTERNALS__: { invoke: (cmd: string, args?: unknown) => Promise<unknown> } };
    const base = w.__TAURI_INTERNALS__.invoke;
    let created = false;
    w.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
      if (cmd === "vault_create") return void (created = true);
      if (cmd === "vault_status") return { exists: created, unlocked: created };
      return base(cmd, args);
    };
  });
}

test("first run: create the vault, then the welcome", async ({ browser }) => {
  const page = await fullScene(browser, { before: firstRun });
  await settle(page, 800);
  await page.getByPlaceholder("senha mestra", { exact: true }).fill("demo-demo-demo");
  await page.getByPlaceholder("repita a senha").fill("demo-demo-demo");
  await settle(page, 400);
  await shoot(page, "create-vault");
  await page.getByRole("button", { name: /criar/i }).click();
  await settle(page, 1200);
  await shoot(page, "onboarding");
});
