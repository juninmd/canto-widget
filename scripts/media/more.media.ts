import { test } from "@playwright/test";
import { shoot } from "./out";
import { fullScene, openTab } from "./scene";
import { STEAM } from "./data-ops";
import { settle } from "./stage";

const EVENING = new Date(2026, 9, 9, 17, 40);

test("agenda: event details", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agenda");
  const card = page.getByRole("button", { name: /^Planejamento da sprint/ }).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await settle(page, 1000);
  await card.evaluate((el) => el.scrollIntoView({ block: "start" }));
  await settle(page, 600);
  await shoot(page, "agenda-event");
});

test("agenda: another day", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agenda");
  await page.getByRole("button", { name: "Próximo dia" }).click();
  await settle(page, 1000);
  await shoot(page, "agenda-day");
});

test("agenda: the day as a timeline", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agenda");
  await page.getByText("Café com fornecedor").last().scrollIntoViewIfNeeded();
  await settle(page, 700);
  await shoot(page, "agenda-timeline");
});

test("status API: my endpoints", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Status API");
  await page.getByText("meus endpoints", { exact: true }).click();
  await settle(page, 900);
  await shoot(page, "endpoints");
  await page.getByText("Painel interno").first().click();
  await settle(page, 900);
  await shoot(page, "endpoints-open");
});

test("activity: week, off and a wide window", async ({ browser }) => {
  const page = await fullScene(browser, { now: EVENING });
  await openTab(page, "Atividade", 1400);
  await page.getByRole("button", { name: "Semana" }).click();
  await settle(page, 1000);
  await shoot(page, "activity-week");
  const off = await fullScene(browser, { now: EVENING, fixed: { activity_status: { supported: true, enabled: false } } });
  await openTab(off, "Atividade", 1000);
  await shoot(off, "activity-off");
  const wide = await fullScene(browser, { now: EVENING, width: 980, height: 640 });
  await openTab(wide, "Atividade", 1400);
  await shoot(wide, "activity-wide");
});

test("steam: wishlist deals and the recent games", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: STEAM });
  await openTab(page, "Steam");
  await page.screenshot({ path: "docs/prints/app/86-steam.png", omitBackground: true });
  await page.getByRole("tab", { name: "jogue agora" }).click();
  await settle(page, 800);
  await page.screenshot({ path: "docs/prints/app/87-steam-recentes.png", omitBackground: true });
});

test("agentes: the installed CLIs with their latest release", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agentes");
  await page.screenshot({ path: "docs/prints/app/90-agentes.png", omitBackground: true });
});
