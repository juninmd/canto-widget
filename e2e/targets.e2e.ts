import { expect, test, type Page } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** WCAG 2.5.8: pointer targets of at least 24 CSS px. The compact density scales the rem, the case that used to break it. */
const MIN = 24;

async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("button, select, [role=tab], a[href]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < min - 0.5 || r.height < min - 0.5) {
        bad.push(`${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 20)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return bad;
  }, MIN);
}

test("every button and tab on the Tasks tab is at least 24 px, also in the compact density", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("canto.densidade", "compacta");
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const task = { id: "t1", title: "Revisar o PR", done: false, day, created_at: 1, updated_at: 1, hora: "10:30", pr_url: "https://github.com/o/r/pull/1" };
    if (!sessionStorage.getItem("e2e.tasks")) sessionStorage.setItem("e2e.tasks", JSON.stringify([task]));
  });
  await mockTauri(page);
  await page.goto("/");
  await page.getByText("Revisar o PR").last().hover();
  expect(await smallTargets(page)).toEqual([]);
});

test("the checkbox has a name and a 24 px target around its 20 px circle", async ({ page }) => {
  await page.addInitScript(() => {
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const task = { id: "t1", title: "Revisar o PR", done: false, day, created_at: 1, updated_at: 1 };
    if (!sessionStorage.getItem("e2e.tasks")) sessionStorage.setItem("e2e.tasks", JSON.stringify([task]));
  });
  await mockTauri(page);
  await page.goto("/");
  const box = page.getByRole("checkbox", { name: "Revisar o PR" });
  const circle = (await box.boundingBox())!;
  const target = (await box.locator("xpath=..").boundingBox())!;
  expect(target.width).toBeGreaterThanOrEqual(24);
  expect(target.height).toBeGreaterThanOrEqual(24);
  // A click on the label's edge, outside the circle, still toggles the task.
  await page.mouse.click(circle.x - 1.5, circle.y + circle.height / 2);
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "task_toggle")).toBe(true);
});
