import { test } from "@playwright/test";
import { shoot } from "./out";
import { fullScene, openTab } from "./scene";
import { settle } from "./stage";

test("tasks: details panel scrolled into view", async ({ browser }) => {
  const page = await fullScene(browser);
  const title = "Responder o time sobre a estimativa da migração";
  await page.getByRole("button", { name: `horário, repetição, prioridade e PR de ${title}` }).click({ force: true });
  await settle(page, 900);
  await page.getByRole("button", { name: "fechar" }).scrollIntoViewIfNeeded();
  await settle(page, 400);
  await shoot(page, "tasks-details");
});

test("tasks: day summary", async ({ browser }) => {
  const page = await fullScene(browser, { now: new Date(2026, 9, 9, 17, 40) });
  await page.getByRole("button", { name: "resumo do dia" }).click();
  await settle(page, 900);
  await shoot(page, "summary");
});

test("clipboard: copy rewritten", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Clipboard");
  await page.getByText('{"status":"ok"').first().hover();
  await settle(page, 600);
  await shoot(page, "clipboard-transform");
});

test("command palette", async ({ browser }) => {
  const page = await fullScene(browser);
  await page.keyboard.press("Control+Shift+P");
  await settle(page, 700);
  await shoot(page, "palette");
});

test("global search", async ({ browser }) => {
  const page = await fullScene(browser);
  await page.keyboard.press("Control+K");
  await settle(page, 500);
  await page.keyboard.type("relat");
  await settle(page, 700);
  await shoot(page, "search");
});
