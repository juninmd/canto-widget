import { test } from "@playwright/test";
import { alertsBefore, ALERTS_AT, CI_FAILED, MEETING, NEW_MODEL, OUTAGE, TASK_REMINDER } from "./data-alerts";
import { shoot } from "./out";
import { fullScene } from "./scene";
import { settle } from "./stage";

const config = (mini: boolean) => ({ position: null, size: null, always_on_top: true, mini });

test("modes: the menu", async ({ browser }) => {
  const page = await fullScene(browser);
  await page.getByRole("button", { name: "trocar modo do canto" }).click();
  await settle(page, 700);
  await shoot(page, "modes-menu");
});

test("modes: mini dock with an alert under the pointer", async ({ browser }) => {
  const page = await fullScene(browser, { now: ALERTS_AT, width: 300, height: 220, fixed: { window_config: config(true), alert_payload: alertsBefore() } });
  await page.getByRole("group", { name: "avisos pendentes" }).hover();
  await page.getByRole("button", { name: /^abrir Revisão/ }).hover();
  await settle(page, 800);
  await shoot(page, "mini");
});

test("modes: maximized with the whole window for the open tab", async ({ browser }) => {
  const page = await fullScene(browser, { now: ALERTS_AT, width: 1180, height: 700, fixed: { alert_payload: alertsBefore() } });
  await page.getByRole("button", { name: "tela cheia" }).click();
  await settle(page, 1200);
  await shoot(page, "maximized");
});

test("modes: the alerts screen the header bell opens", async ({ browser }) => {
  const page = await fullScene(browser, {
    now: ALERTS_AT,
    width: 1180,
    height: 700,
    fixed: { alert_payload: [CI_FAILED, MEETING, OUTAGE, TASK_REMINDER, NEW_MODEL] },
  });
  await page.getByRole("button", { name: /avisos pendentes/ }).click();
  await settle(page, 700);
  // Two handled: the screen also shows what was resolved today under the pending cards.
  const panel = page.getByRole("dialog", { name: "notificações" });
  await panel.getByRole("button", { name: "fechar" }).nth(0).click();
  await settle(page, 500);
  await panel.getByRole("button", { name: "fechar" }).nth(1).click();
  await settle(page, 900);
  await shoot(page, "alerts-screen");
});
