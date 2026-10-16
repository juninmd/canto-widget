import { expect, test, type Page } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** Fictitious alerts only (public repository). */
function alerts(now = Date.now()) {
  const base = { end: "", all_day: false, location: "", meet: "", link: "" };
  return [
    { ...base, id: "pr:acme/atlas#482", title: "PR #482 · CI falhou", start: new Date(now - 3 * 60_000).toISOString(), tag: "ci", link: "https://github.com/acme/atlas/pull/482" },
    { ...base, id: "evt-sprint", title: "Planejamento da sprint", start: new Date(now + 2 * 60_000).toISOString(), end: new Date(now + 47 * 60_000).toISOString(), meet: "https://meet.example.com/a-b-c", location: "Sala Azul" },
    { ...base, id: "task:t1", title: "Enviar relatório semanal", start: new Date(now).toISOString() },
  ];
}

const MIN = 24;
async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("button, select, [role=tab], [role=menuitemradio]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < min - 0.5 || r.height < min - 0.5) bad.push(`${el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 20)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    return bad;
  }, MIN);
}

const config = (mini: boolean) => ({ position: null, size: null, always_on_top: true, mini });

test("the header has a mode icon whose menu offers the four modes, all with 24 px targets", async ({ page }) => {
  await mockTauri(page, { fixed: { window_config: config(false) } });
  await page.goto("/");
  await page.getByRole("button", { name: "trocar modo do canto" }).click();
  const menu = page.getByRole("menu", { name: "modo do canto" });
  await expect(menu.getByRole("menuitemradio")).toHaveText([/Mini/, /Escondido/, /Normal/, /Maximizado/]);
  await expect(menu.getByRole("menuitemradio", { name: /Normal/ })).toHaveAttribute("aria-checked", "true");
  expect(await smallTargets(page)).toEqual([]);
});

test("mini mode lists one row per pending alert and asks Rust for the dock size", async ({ page }) => {
  await mockTauri(page, { fixed: { window_config: config(true), alert_payload: alerts() } });
  await page.goto("/");
  const dock = page.getByRole("group", { name: "avisos pendentes" });
  await expect(dock.getByRole("button", { name: /^abrir / })).toHaveCount(3);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  expect(await smallTargets(page)).toEqual([]);
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "window_mini_resize").length).toBeGreaterThan(0);
  const first = (await calls(page)).find((c) => c.cmd === "window_mini_resize");
  expect(first?.args).toEqual({ width: 24, height: 196 });
});

test("pointing at the dock widens it and pointing at a row shows the alert text", async ({ page }) => {
  await mockTauri(page, { fixed: { window_config: config(true), alert_payload: alerts() } });
  await page.goto("/");
  const row = page.getByRole("button", { name: "abrir Planejamento da sprint" });
  await row.hover();
  await expect(row).toContainText("Planejamento da sprint");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "window_mini_resize" && c.args.width === 300)).toBe(true);
});

test("clicking a row opens the normal window with that alert on top", async ({ page }) => {
  await mockTauri(page, { fixed: { window_config: config(true), alert_payload: alerts() } });
  await page.goto("/");
  await page.getByRole("button", { name: "abrir Planejamento da sprint" }).click();
  expect((await calls(page)).some((c) => c.cmd === "window_mini_set" && c.args.enabled === false)).toBe(true);
  const focus = page.getByRole("region", { name: "aviso em foco" });
  await expect(focus).toContainText("Planejamento da sprint");
  await expect(focus.getByRole("button", { name: "entrar no Meet" })).toBeVisible();
  const box = (await focus.boundingBox())!;
  expect(box.x + box.width, "the alert card pushed the window wider than 420 px").toBeLessThanOrEqual(420);
  await focus.getByRole("button", { name: "fechar" }).click();
  await expect(focus).toHaveCount(0);
  expect((await calls(page)).find((c) => c.cmd === "alert_close")?.args).toEqual({ id: "evt-sprint" });
});

test("the dock's mode icon switches back to the normal window", async ({ page }) => {
  await mockTauri(page, { fixed: { window_config: config(true), alert_payload: [] } });
  await page.goto("/");
  await expect(page.getByRole("status", { name: "nenhum aviso pendente" })).toBeVisible();
  await page.getByRole("group", { name: "avisos pendentes" }).hover();
  await page.getByRole("button", { name: "trocar modo do canto" }).click();
  await page.getByRole("menuitemradio", { name: /Normal/ }).click();
  expect((await calls(page)).some((c) => c.cmd === "window_mini_set" && c.args.enabled === false)).toBe(true);
});

test("the mode menu in the dock sits inside the window's corner, away from the icons", async ({ page }) => {
  await mockTauri(page, { fixed: { window_config: config(true), alert_payload: [alerts()[0]] } });
  await page.goto("/");
  await page.getByRole("group", { name: "avisos pendentes" }).hover();
  await page.getByRole("button", { name: "trocar modo do canto" }).click();
  const menu = (await page.getByRole("menu").boundingBox())!;
  expect(menu.x).toBeGreaterThanOrEqual(8);
  expect(menu.y).toBeGreaterThanOrEqual(8);
  const icon = (await page.getByRole("button", { name: /^abrir PR/ }).boundingBox())!;
  expect(menu.x + menu.width, "the menu would cover the alert icons").toBeLessThanOrEqual(icon.x + 1);
});

test.describe("maximized", () => {
  test.use({ viewport: { width: 1180, height: 700 } });

  async function maximize(page: Page, pending = alerts()) {
    await mockTauri(page, { fixed: { window_config: config(false), alert_payload: pending } });
    await page.goto("/");
    await page.getByRole("button", { name: "tela cheia" }).click();
    return page;
  }

  test("the open tab takes the whole window: no column and no divider", async ({ page }) => {
    await maximize(page);
    await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("separator")).toHaveCount(0);
    await expect(page.getByRole("complementary")).toHaveCount(0);
    const main = (await page.getByRole("tabpanel").boundingBox())!;
    expect(main.width, "the task list used to stop around 416 px").toBeGreaterThan(1100);
  });

  test("the header bell opens the alerts screen with every pending alert and its actions", async ({ page }) => {
    await maximize(page);
    await page.getByRole("button", { name: /avisos pendentes/ }).click();
    const panel = page.getByRole("dialog", { name: "notificações" });
    await expect(panel.getByRole("list", { name: "avisos pendentes" }).getByRole("listitem")).toHaveCount(3);
    await expect(panel.getByRole("button", { name: "entrar no Meet" })).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(box.width, "the alerts used to live in a 300 px column").toBeGreaterThan(1100);
  });

  test("closing an alert here keeps the rest and lists what was handled today", async ({ page }) => {
    await maximize(page);
    await page.getByRole("button", { name: /avisos pendentes/ }).click();
    const panel = page.getByRole("dialog", { name: "notificações" });
    await panel.getByRole("button", { name: "fechar" }).first().click();
    await expect(panel.getByRole("list", { name: "avisos pendentes" }).getByRole("listitem")).toHaveCount(2);
    expect((await calls(page)).filter((c) => c.cmd === "alert_close")).toHaveLength(1);
    await expect(panel.getByText("resolvidas hoje")).toBeVisible();
    await expect(panel.getByRole("listitem").filter({ hasText: "fechado" })).toHaveCount(1);
  });

  test("going back and Esc return to the tab that was open", async ({ page }) => {
    await maximize(page);
    const bell = page.getByRole("button", { name: /avisos pendentes/ });
    await bell.click();
    await page.getByRole("dialog", { name: "notificações" }).getByRole("button", { name: "voltar" }).click();
    await expect(page.getByRole("dialog", { name: "notificações" })).toHaveCount(0);
    await expect(bell).toBeFocused();

    await bell.click();
    // A click on the empty area below the cards moves focus out of the dialog: Esc must still close it.
    await page.getByRole("dialog", { name: "notificações" }).click({ position: { x: 1000, y: 640 } });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "notificações" })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  });

  test("with the alerts up the keyboard cannot reach the bar behind them", async ({ page }) => {
    await maximize(page);
    await page.getByRole("button", { name: /avisos pendentes/ }).click();
    const panel = page.getByRole("dialog", { name: "notificações" });
    // Tab from the last control of the screen wraps back inside it: the bar behind never takes the focus.
    await panel.getByRole("button", { name: "fechar" }).last().focus();
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("button", { name: "dispensar todas" })).toBeFocused();
  });

  test("a shortcut pressed on the alerts screen lands in the field it opens", async ({ page }) => {
    await maximize(page);
    await page.getByRole("button", { name: /avisos pendentes/ }).click();
    await page.keyboard.press("n");
    await expect(page.getByRole("dialog", { name: "notificações" })).toHaveCount(0);
    await expect(page.locator('[data-shortcut="new"]')).toBeFocused();
  });
});
