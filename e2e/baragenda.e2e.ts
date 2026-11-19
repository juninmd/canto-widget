import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

test.use({ viewport: { width: 440, height: 900 } });

test("the agenda-in-the-bar option is off by default and offers the event count once on", async ({ page }) => {
  await mockTauri(page, {
    hiddenTabs: [],
    knownTabs: ["tasks", "notes", "settings"],
    fixed: { bar_agenda_get: { enabled: false, count: 1 }, bar_agenda_set: { enabled: true, count: 1 } },
  });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await page.getByRole("button", { name: "Aplicativo" }).click();
  const section = page.locator('[data-settings-section="barAgenda"]');
  await section.scrollIntoViewIfNeeded();
  const box = section.getByLabel("mostrar o próximo evento na barra do sistema");
  await expect(box).not.toBeChecked();
  await box.check();
  await expect(section.getByLabel("eventos na dica da bandeja")).toBeVisible();
  await section.screenshot({ path: "docs/prints/app/159-agenda-na-barra.png" });
});
