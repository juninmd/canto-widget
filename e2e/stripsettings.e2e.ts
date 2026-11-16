import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const CFG = {
  enabled: true, edge: "top", items: ["clock", "cpu", "memory", "tasks", "event", "weather"],
  density: "comfortable", icons: true, labels: false, opacity: 100, charts: true, launcher: true,
  align: "end", gap: 12, scale: 100, surface: "glass", dividers: true, refresh: 2, hover: true, hide_fullscreen: true, columns: 2,
};

test.use({ viewport: { width: 440, height: 900 } });

test("the mini dashboard settings have four pages and a preview that follows the choices", async ({ page }) => {
  await mockTauri(page, {
    hiddenTabs: [],
    knownTabs: ["tasks", "notes", "settings"],
    fixed: { strip_config_get: CFG, strip_monitors: ["Monitor 1", "Monitor 2"] },
  });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await expect(page.getByRole("button", { name: "Aparência" })).toBeVisible();
  await page.screenshot({ path: "docs/prints/app/152-ajustes-grupos.png" });
  await page.getByRole("button", { name: "Aplicativo" }).click();
  const section = page.locator('[data-settings-section="strip"]');
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator("[data-strip-preview]")).toBeVisible();
  for (const [tab, shot] of [["Itens", "items"], ["Posição", "position"], ["Aparência", "look"], ["Comportamento", "behavior"]] as const) {
    await section.getByRole("tab", { name: tab }).click();
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `docs/prints/app/151-mini-ajustes-${shot}.png` });
  }
  await expect(section.getByLabel("5 s")).toBeVisible();
});
