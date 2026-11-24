import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

test.use({ viewport: { width: 440, height: 900 } });

test("the sidebar has its own block with the screen side and the monitor", async ({ page }) => {
  await mockTauri(page, {
    hiddenTabs: [],
    knownTabs: ["tasks", "notes", "settings"],
    fixed: {
      window_config: { position: null, size: null, always_on_top: true, mini: false, sidebar: true, sidebar_side: "left", sidebar_monitor: "Monitor 2" },
      strip_monitors: ["Monitor 1", "Monitor 2"],
    },
  });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await page.getByRole("button", { name: "Aplicativo" }).click();
  const section = page.locator('[data-settings-section="sidebar"]');
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByLabel("esquerda")).toBeChecked();
  await expect(section.getByLabel("monitor")).toHaveValue("Monitor 2");
  await section.screenshot({ path: "docs/prints/app/167-barra-lateral-lado-monitor.png" });
});
