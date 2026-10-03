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
