import { expect, test, type Page } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const midnight = new Date();
midnight.setHours(0, 0, 0, 0);
const at = (h: number) => midnight.getTime() / 1000 + h * 3600;
const summary = {
  spans: [
    { app: "Code", start: at(8.7), end: at(10.4) },
    { app: "Slack", start: at(10.4), end: at(10.6) },
    { app: "Code", start: at(10.6), end: at(11.5) },
    { app: "Teams", start: at(11.5), end: at(12.3) },
    { app: "Notion", start: at(14), end: at(14.8) },
    { app: "Code", start: at(14.8), end: at(16.2) },
    { app: "cs2", start: at(16.6), end: at(17.7) },
  ],
  apps: [
    { app: "Code", secs: 14_400 },
    { app: "cs2", secs: 3_960 },
    { app: "Teams", secs: 2_880 },
    { app: "Notion", secs: 2_880 },
    { app: "Slack", secs: 720 },
  ],
  total_secs: 24_840,
  idle: [{ start: at(12.3), end: at(14) }],
  idle_secs: 6_120,
  focus: [
    { task: "a", title: "Revisar PR do cofre", secs: 6_300 },
    { task: "b", title: "Aba Atividade", secs: 4_020 },
    { task: "c", title: null, secs: 540 },
  ],
};

async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 760 });
  await mockTauri(page, {
    hiddenTabs: [],
    knownTabs: ["tasks", "notes", "clipboard", "transcripts", "agenda", "github", "gitlab", "status", "activity", "settings"],
    fixed: { activity_status: { supported: true, enabled: true }, activity_summary: summary },
  });
  await page.goto("/");
  await goTab(page, "Atividade");
  await expect(page.getByRole("img", { name: "Distribuição do tempo por categoria" })).toBeVisible();
}

/** The tab is its own scroller: it may scroll down, never sideways. */
async function sideways(page: Page): Promise<number> {
  return page.evaluate(() => {
    const tab = document.querySelector<HTMLElement>('[aria-label="Distribuição do tempo por categoria"]')?.closest<HTMLElement>(".overflow-y-auto");
    return tab ? tab.scrollWidth - tab.clientWidth : -1;
  });
}

for (const width of [360, 420, 900]) {
  test(`at ${width}px the day shows its donut, goal and timeline without scrolling sideways`, async ({ page }) => {
    await open(page, width);
    await expect(page.getByRole("progressbar", { name: "Meta de foco em código" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Linha do tempo" })).toBeVisible();
    expect(await sideways(page)).toBeLessThanOrEqual(0);
  });
}

test("on a wide window the summary and the timeline sit side by side, on a narrow one they stack", async ({ page }) => {
  await open(page, 900);
  const legend = await page.getByRole("group", { name: "categorias" }).boundingBox();
  const timeline = await page.getByRole("region", { name: "Linha do tempo" }).boundingBox();
  expect(timeline!.x).toBeGreaterThan(legend!.x + legend!.width);
  expect(Math.abs(timeline!.y - legend!.y)).toBeLessThan(60);
  await page.setViewportSize({ width: 420, height: 760 });
  const stacked = await page.getByRole("region", { name: "Linha do tempo" }).boundingBox();
  const hero = await page.getByRole("group", { name: "categorias" }).boundingBox();
  expect(stacked!.y).toBeGreaterThan(hero!.y + hero!.height);
});

test("the legend filters the day and the week is a column chart", async ({ page }) => {
  await open(page, 420);
  const code = page.getByRole("button", { name: /^Código/ });
  await code.click();
  await expect(code).toHaveAttribute("aria-pressed", "false");
  await code.click();
  await page.getByRole("button", { name: "Semana" }).click();
  await expect(page.getByRole("img", { name: "Tempo ativo por dia, últimos 7 dias" })).toBeVisible();
  await expect(page.getByText("Quando você rende mais")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test("the tasks tab lists the focus timer's time and a removed task keeps its time", async ({ page }) => {
  await open(page, 420);
  await page.getByRole("button", { name: "Tarefas" }).click();
  await expect(page.getByText("Revisar PR do cofre")).toBeVisible();
  await expect(page.getByText("Tarefa removida")).toBeVisible();
});

test("tracking off explains what is kept before asking to turn it on", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 760 });
  await mockTauri(page, { hiddenTabs: [], knownTabs: ["tasks", "notes", "clipboard", "transcripts", "agenda", "github", "gitlab", "status", "activity", "settings"], fixed: { activity_status: { supported: true, enabled: false } } });
  await page.goto("/");
  await goTab(page, "Atividade");
  await expect(page.getByText("Veja para onde o tempo vai")).toBeVisible();
  await expect(page.getByText(/título de janela/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Ativar coleta" })).toBeVisible();
});
