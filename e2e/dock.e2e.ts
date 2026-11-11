import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

test("the dock layout keeps every tab one click away and survives a reload", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("canto.tabLayout", "dock"));
  await mockTauri(page, { hiddenTabs: ["gitlab"] });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "todas as abas" }).click();
  await page.getByRole("dialog", { name: "todas as abas" }).getByRole("button", { name: "Ajustes" }).click();
  await expect(page.getByRole("tab", { name: "Ajustes" })).toHaveAttribute("aria-selected", "true");
  await page.reload();
  await goTab(page, "Notas");
  await expect(page.getByRole("tab", { name: "Notas" })).toHaveAttribute("aria-selected", "true");
});
