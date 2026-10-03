import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

test("starting a task pins the timer bar under every tab and pausing saves the time", async ({ page }) => {
  await page.addInitScript((day: string) => {
    if (!sessionStorage.getItem("e2e.tasks"))
      sessionStorage.setItem(
        "e2e.tasks",
        JSON.stringify([{ id: "a", title: "Revisar PR", done: false, day, created_at: 1, updated_at: 1, estimate_min: 45, tracked_secs: 120 }]),
      );
  }, today());
  await mockTauri(page);
  await page.goto("/");
  await page.getByText("Revisar PR").hover();
  await page.getByLabel("iniciar foco em Revisar PR").click();
  const bar = page.getByRole("region", { name: "tarefa em foco" });
  await expect(bar).toContainText("Revisar PR");
  await goTab(page, "Agenda");
  await expect(bar).toBeVisible();
  await bar.getByRole("button", { name: "Pausar" }).click();
  await expect(bar).toBeHidden();
});

test("the agenda day view lists the tasks that have a time", async ({ page }) => {
  await page.addInitScript((day: string) => {
    if (!sessionStorage.getItem("e2e.tasks"))
      sessionStorage.setItem("e2e.tasks", JSON.stringify([{ id: "b", title: "Escrever changelog", done: false, day, created_at: 1, updated_at: 1, hora: "11:00" }]));
  }, today());
  await mockTauri(page);
  await page.goto("/");
  await goTab(page, "Agenda");
  await page.getByRole("button", { name: "Dia" }).click();
  await expect(page.getByText("Escrever changelog")).toBeVisible();
});
