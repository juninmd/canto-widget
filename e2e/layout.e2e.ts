import { expect, test, type Page } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const LONG = "Revisar a proposta comercial do cliente fictício com os novos prazos de entrega e o cronograma de testes";
const TABS = ["Tarefas", "Notas", "Clipboard", "Agenda", "GitHub", "Status API", "Ajustes"];

/** A task carrying every row badge (time, ↻, subtasks, PR): the widest row the list can get. */
async function seedBusyTask(page: Page) {
  await page.addInitScript((title: string) => {
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const task = {
      id: "t1", title, done: false, day, created_at: 1, updated_at: 1, hora: "10:30", repetir: { tipo: "diaria" },
      priority: "high", pr_url: "https://github.com/exemplo/app/pull/1",
      subtasks: [{ id: "s1", title: "a", done: true }, { id: "s2", title: "b", done: false }],
    };
    if (!sessionStorage.getItem("e2e.tasks")) sessionStorage.setItem("e2e.tasks", JSON.stringify([task]));
  }, LONG);
}

test("at the minimum window size a long task title keeps most of the row", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 440 });
  await seedBusyTask(page);
  await mockTauri(page, { hiddenTabs: ["gitlab"] });
  await page.goto("/");
  const title = page.getByText(LONG).last();
  await expect(title).toBeVisible();
  const box = (await title.boundingBox())!;
  // The row is ~330 px; badges on the right used to squeeze the title into ~60 px, one word per line.
  expect(box.width).toBeGreaterThan(150);
});

for (const [width, height] of [[360, 440], [1920, 1080]]) {
  test(`no tab scrolls the whole page at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await seedBusyTask(page);
    await mockTauri(page, { hiddenTabs: ["gitlab"] });
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
    for (const name of TABS) {
      await goTab(page, name);
      await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute("aria-selected", "true");
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        return { x: de.scrollWidth - innerWidth, y: de.scrollHeight - innerHeight };
      });
      expect(overflow, name).toEqual({ x: 0, y: 0 });
    }
  });
}
