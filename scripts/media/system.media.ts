import { test, type Page } from "@playwright/test";
import type { AgendaItem } from "../../src/lib/api";
import { ALERTS_AT } from "./data-alerts";
import { fullScene, openTab } from "./scene";
import { openScene, settle } from "./stage";

const SUBS: [string, string][] = [
  ["Geral", "123-sistema-geral"],
  ["CPU", "124-sistema-cpu"],
  ["Memória", "125-sistema-memoria"],
  ["Disco", "126-sistema-disco"],
  ["Energia", "127-sistema-energia"],
];

// Real waits: the page clock is frozen, and the CSS entrance animations run on the real one.
test("a aba Sistema e suas sub-abas", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Sistema");
  for (const [name, file] of SUBS) {
    await page.getByRole("tab", { name, exact: true }).last().click();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `docs/prints/app/${file}.png`, omitBackground: true });
  }
});

test("os avisos do sistema abertos", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Sistema");
  await page.getByRole("tab", { name: "Geral", exact: true }).last().click();
  await page.getByText("Avisos do sistema").click();
  await page.getByRole("tabpanel").evaluate((el) => (el.firstElementChild!.scrollTop = 9999));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/128-sistema-avisos.png", omitBackground: true });
});

const base = { end: "", all_day: false, location: "", meet: "", link: "", start: ALERTS_AT.toISOString() };
const DISK: AgendaItem = { ...base, id: "system:disk", title: "Disco quase cheio", description: "Restam 18,4 GB livres em C:.", organizer: "96%", tag: "severe" };

async function fit(page: Page) {
  const box = (await page.getByRole("alertdialog").boundingBox())!;
  await page.setViewportSize({ width: 420, height: Math.ceil(box.height) });
  await settle(page, 300);
}

test("o pop-up de aviso do sistema", async ({ browser }) => {
  const page = await openScene(browser, { path: "/?alert", now: ALERTS_AT, width: 420, height: 640, fixed: { alert_payload: [DISK] } });
  await page.waitForTimeout(1800);
  await fit(page);
  await page.screenshot({ path: "docs/prints/app/129-aviso-sistema.png", omitBackground: true });
});
