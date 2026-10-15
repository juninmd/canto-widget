import { expect, test, type Page } from "@playwright/test";
import { goTab } from "../../e2e/mock";
import { alertsBefore, ALERTS_AT, MEETING, NEW_MODEL, OUTAGE, TASK_REMINDER } from "./data-alerts";
import { backdrop, Reel } from "./out";
import { fullScene } from "./scene";
import { openScene, settle } from "./stage";

/** A faux desktop behind the widget, so the dock reads as sitting on a screen edge. */
const WALLPAPER = "linear-gradient(135deg,#0a1322 0%,#17304f 55%,#244a6f 100%)";

async function tab(page: Page, name: string) {
  await goTab(page, name);
  await settle(page, 900);
}

test("gif: the focus timer follows you across tabs", async ({ browser }) => {
  const page = await fullScene(browser);
  const reel = new Reel();
  await settle(page, 900);
  await reel.frame(page, 1400);
  await page.getByRole("button", { name: "iniciar foco em Revisar o PR do filtro de relatórios" }).first().click();
  for (let i = 0; i < 3; i++) {
    await settle(page, 5_000);
    await reel.frame(page, 700);
  }
  await tab(page, "Agenda");
  await reel.frame(page, 1600);
  await tab(page, "GitHub");
  await reel.frame(page, 1300);
  await page.getByRole("region", { name: "tarefa em foco" }).getByRole("button", { name: "Pausar" }).click();
  await tab(page, "Tarefas");
  await reel.frame(page, 1900);
  reel.save("focus");
});

test("gif: every pending alert in one overlay", async ({ browser }) => {
  const page = await openScene(browser, { path: "/?alert", now: ALERTS_AT, width: 420, height: 380, fixed: { alert_payload: [OUTAGE, MEETING, NEW_MODEL, TASK_REMINDER] } });
  const reel = new Reel();
  await settle(page, 900);
  await reel.frame(page, 1700);
  const cards = page.getByRole("group", { name: "avisos pendentes" }).getByRole("button");
  await cards.nth(1).click();
  await settle(page, 700);
  await reel.frame(page, 2200);
  await cards.nth(2).click();
  await settle(page, 700);
  await reel.frame(page, 1700);
  await cards.nth(3).click();
  await settle(page, 700);
  await reel.frame(page, 1700);
  reel.save("alerts");
});

test("gif: writing a note with markdown shortcuts", async ({ browser }) => {
  const page = await fullScene(browser);
  const reel = new Reel();
  await goTab(page, "Notas");
  await settle(page, 900);
  await page.getByRole("button", { name: "novo card" }).click();
  await expect(page.locator(".ProseMirror")).toBeVisible();
  await settle(page, 900);
  await reel.frame(page, 800);
  const title = page.getByPlaceholder("título");
  await title.click();
  for (const word of ["Plano ", "da ", "semana"]) {
    await title.pressSequentially(word, { delay: 15 });
    await settle(page, 250);
    await reel.frame(page, 170);
  }
  await page.locator(".ProseMirror").click();
  await settle(page, 400);
  // One frame per word, so the shortcuts visibly turn into a heading, a checklist and a code block.
  const type = async (text: string, last = 260) => {
    const words = text.split(/(?<= )/);
    for (const [i, word] of words.entries()) {
      await page.keyboard.type(word, { delay: 14 });
      await settle(page, 250);
      await reel.frame(page, i === words.length - 1 ? last : 150);
    }
  };
  await type("# Prioridades", 500);
  await page.keyboard.press("Enter");
  await type("[ ] Revisar o PR do relatório");
  await page.keyboard.press("Enter");
  await type("Fechar a retro da sprint", 400);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await type("``` ", 300);
  await type("select * from tarefas", 500);
  await page.getByPlaceholder("tags separadas por vírgula").fill("semana, time");
  await settle(page, 500);
  await reel.frame(page, 1800);
  reel.save("note-editor");
});

test("gif: the modes, from the full window down to the dock", async ({ browser }) => {
  const page = await fullScene(browser, { now: ALERTS_AT, fixed: { alert_payload: alertsBefore() } });
  await backdrop(page, WALLPAPER);
  const reel = new Reel();
  await settle(page, 900);
  await reel.frame(page, 1300);
  await page.getByRole("button", { name: "trocar modo do canto" }).click();
  await settle(page, 600);
  await reel.frame(page, 1500);
  await page.getByRole("menuitemradio", { name: /Mini/ }).click();
  await settle(page, 900);
  await reel.frame(page, 1500);
  await page.getByRole("group", { name: "avisos pendentes" }).hover();
  await settle(page, 700);
  await reel.frame(page, 1100);
  await page.getByRole("button", { name: /^abrir Revisão/ }).hover();
  await settle(page, 700);
  await reel.frame(page, 1700);
  await page.getByRole("button", { name: /^abrir Revisão/ }).click();
  await settle(page, 1000);
  await reel.frame(page, 2200);
  reel.save("modes");
});

test("gif: the tour, tab by tab and then the skins", async ({ browser }) => {
  const page = await fullScene(browser);
  const reel = new Reel();
  await settle(page, 900);
  await reel.frame(page, 1700);
  for (const name of ["Agenda", "Notas", "Clipboard", "GitHub", "Status API", "Modelos IA"]) {
    await tab(page, name);
    await reel.frame(page, 1500);
  }
  await tab(page, "Tarefas");
  for (const skin of ["hueco-mundo", "dracula", "glass", "claro", "padrao"]) {
    await page.evaluate((s) => (document.documentElement.dataset.skin = s), skin);
    await settle(page, 500);
    await reel.frame(page, 1100);
  }
  reel.save("tour");
});
