import { test, type Page } from "@playwright/test";
import { alertsBefore, ALERTS_AT, MEETING, OUTAGE, TASK_REMINDER } from "./data-alerts";
import { Reel } from "./out";
import { fullScene } from "./scene";
import { openScene, settle } from "./stage";

/** Dock layout + Aurora skin: what the README shows first. Not part of the e2e suite (see playwright.config.ts). */
const STORAGE = { "canto.tabLayout": "dock", "canto.skin": "aurora" };

async function go(page: Page, label: string) {
  await page.getByRole("button", { name: "todas as abas" }).click();
  await settle(page, 500);
  await page.getByRole("dialog", { name: "todas as abas" }).getByRole("button", { name: label, exact: true }).click();
  await settle(page, 900);
}

/** The pop-up is its own window; here it is rendered apart and laid over the widget, like it lands on the desktop. */
async function popupImage(browser: Parameters<typeof openScene>[0], alerts: unknown[]) {
  const page = await openScene(browser, { path: "/?alert", now: ALERTS_AT, width: 420, height: 640, storage: STORAGE, fixed: { alert_payload: alerts } });
  await settle(page, 900);
  const box = (await page.getByRole("alertdialog").boundingBox())!;
  await page.setViewportSize({ width: 420, height: Math.ceil(box.height) });
  await settle(page, 300);
  await page.waitForTimeout(1200);
  const data = (await page.screenshot({ omitBackground: true, animations: "disabled" })).toString("base64");
  await page.context().close();
  return `data:image/png;base64,${data}`;
}

async function overlay(page: Page, src: string) {
  await page.evaluate((s) => {
    document.getElementById("hero-popup")?.remove();
    const img = document.createElement("img");
    img.id = "hero-popup";
    img.src = s;
    img.style.cssText = "position:fixed;top:44px;left:50%;width:372px;transform:translateX(-50%);z-index:99999;border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.6)";
    document.body.appendChild(img);
    return img.decode();
  }, src);
  await settle(page, 400);
}

test("gif: hero, tabs through the dock and a meeting alert popping up", async ({ browser }) => {
  const popup = await popupImage(browser, [MEETING]);
  const page = await fullScene(browser, { now: ALERTS_AT, height: 640, storage: STORAGE, fixed: { alert_payload: alertsBefore() } });
  const reel = new Reel();
  await settle(page, 1200);
  await reel.frame(page, 1600);
  for (const label of ["Agenda", "Notas", "GitHub", "Clima", "Sistema", "Tarefas"]) {
    await go(page, label);
    await page.waitForTimeout(900);
    await reel.frame(page, 1400);
  }
  await overlay(page, popup);
  await reel.frame(page, 3000);
  reel.save("hero", 420);
});

test("prints: the dock grid and the Aurora skin", async ({ browser }) => {
  const page = await fullScene(browser, { height: 640, storage: STORAGE });
  await settle(page, 1200);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/131-skin-aurora.png", omitBackground: true });
  await page.getByRole("button", { name: "todas as abas" }).click();
  await settle(page, 700);
  await page.waitForTimeout(800);
  await page.screenshot({ path: "docs/prints/app/106-dock-aurora.png", omitBackground: true });
});
