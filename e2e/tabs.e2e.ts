import { expect, test, type Page } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

/** Every tab drawn on the bar shows its whole name, and the bar itself never scrolls sideways. */
async function clipped(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const bad: string[] = [];
    const list = document.querySelector<HTMLElement>('[role="tablist"]')!;
    if (list.scrollWidth > list.clientWidth + 1) bad.push(`bar ${list.scrollWidth}>${list.clientWidth}`);
    for (const tab of list.querySelectorAll<HTMLElement>('[role="tab"]')) {
      const r = tab.getBoundingClientRect();
      const box = list.parentElement!.getBoundingClientRect();
      if (r.right > box.right + 0.5 || r.left < box.left - 0.5) bad.push(`${tab.textContent} outside the bar`);
      if (tab.scrollWidth > tab.clientWidth + 1) bad.push(`${tab.textContent} text cut`);
    }
    return bad;
  });
}

for (const [width, height] of [[420, 580], [360, 440]]) {
  test(`at ${width}x${height} no tab is cut: the ones without room wait in the 'mais' menu`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await mockTauri(page);
    await page.goto("/");
    await expect(page.getByRole("tab", { name: "Tarefas" })).toBeVisible();
    expect(await clipped(page)).toEqual([]);
    const more = page.getByRole("button", { name: /^mais/ });
    await expect(more).toBeVisible();
    const shown = await page.getByRole("tab").count();
    await more.click();
    const waiting = await page.getByRole("menuitem").count();
    expect(shown + waiting, "every tab is either on the bar or in the menu").toBe(7);
    await expect(page.getByRole("menuitem", { name: /^Ajustes/ })).toBeVisible();
  });
}

test("a tab picked from the menu takes a place on the bar and stays selected", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 580 });
  await mockTauri(page);
  await page.goto("/");
  await goTab(page, "Ajustes");
  const tab = page.getByRole("tab", { name: "Ajustes", exact: true });
  await expect(tab).toHaveAttribute("aria-selected", "true");
  expect(await clipped(page)).toEqual([]);
});

test("picking a tab from the menu does not scroll the window sideways", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 580 });
  await mockTauri(page);
  await page.goto("/");
  await page.waitForTimeout(600);
  await goTab(page, "Ajustes");
  const scrolled = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("*")].filter((el) => el.scrollLeft > 0).length);
  expect(scrolled).toBe(0);
});

test("the longer English names don't cut either", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 580 });
  await mockTauri(page, { language: "en" });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tasks" })).toBeVisible();
  expect(await clipped(page)).toEqual([]);
});

test("with room for everything the bar shows every tab and no menu", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 700 });
  await mockTauri(page);
  await page.goto("/");
  await expect(page.getByRole("tab")).toHaveCount(7);
  await expect(page.getByRole("button", { name: /^mais/ })).toHaveCount(0);
});

test("the compact density packs more tabs on the bar, still uncut", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("canto.densidade", "compacta"));
  await page.setViewportSize({ width: 420, height: 580 });
  await mockTauri(page);
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tarefas" })).toBeVisible();
  expect(await clipped(page)).toEqual([]);
});

test("arrows reach a tab that was in the menu", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 580 });
  await mockTauri(page);
  await page.goto("/");
  await page.getByRole("tab", { name: "Tarefas" }).focus();
  await page.keyboard.press("End");
  const last = page.getByRole("tab", { name: "Ajustes", exact: true });
  await expect(last).toHaveAttribute("aria-selected", "true");
  await expect(last).toBeFocused();
});

test.describe("vertical layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 580 });
    await mockTauri(page);
    await page.addInitScript(() => localStorage.setItem("canto.tabLayout", "vertical"));
    await page.goto("/");
  });

  test("every tab is on the rail, with no 'mais' menu, and the content keeps its width", async ({ page }) => {
    await expect(page.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    await expect(page.getByRole("tab")).toHaveCount(7);
    await expect(page.getByRole("button", { name: /^mais/ })).toHaveCount(0);
    const rail = await page.getByRole("tablist").evaluate((el) => el.parentElement!.getBoundingClientRect().width);
    expect(rail).toBeLessThanOrEqual(53);
    const scrolled = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(scrolled).toBeLessThanOrEqual(0);
  });

  test("hovering opens the labels over the content, and the pin button keeps them open", async ({ page }) => {
    const tab = page.getByRole("tab", { name: "Notas" });
    await expect(tab.getByText("Notas")).toBeHidden();
    await tab.hover();
    await expect(tab.getByText("Notas")).toBeVisible();
    await page.mouse.move(300, 300);
    await expect(tab.getByText("Notas")).toBeHidden();
    await page.getByRole("button", { name: "manter a barra aberta" }).click();
    await page.mouse.move(300, 300);
    await expect(tab.getByText("Notas")).toBeVisible();
  });

  test("clicking, Alt+N and the arrows switch tabs", async ({ page }) => {
    await page.getByRole("tab", { name: "Notas" }).click();
    await expect(page.getByRole("tab", { name: "Notas" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Alt+1");
    await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: "Tarefas" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("tab", { name: "Notas" })).toHaveAttribute("aria-selected", "true");
  });

  test("the choice is made in Ajustes and flips the bar back", async ({ page }) => {
    await goTab(page, "Ajustes");
    await page.mouse.move(300, 300);
    await page.getByRole("radio", { name: /Horizontal/ }).click();
    await expect(page.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
    await page.reload();
    await expect(page.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  });
});
