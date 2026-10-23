import { expect, test, type Page } from "@playwright/test";
import { shoot } from "./out";
import { fullScene, openTab } from "./scene";
import { AGENTS, STEAM } from "./data-ops";
import { settle } from "./stage";

/** Fake capsules for invented games: `steam_image` answers a gradient derived from the appid, so the
 *  screenshot shows the layout without borrowing any real cover art. */
async function steamArt(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __TAURI_INTERNALS__: { invoke: (cmd: string, args?: unknown) => Promise<unknown> };
    };
    const base = w.__TAURI_INTERNALS__.invoke;
    w.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
      if (cmd !== "steam_image") return base(cmd, args);
      const url = String((args as { url?: string })?.url ?? "");
      const appid = Number(url.match(/apps\/(\d+)/)?.[1] ?? 0);
      const hue = (appid * 47) % 360;
      const [w2, h2] = url.includes("library_600x900") ? [300, 450] : url.includes("header") ? [460, 215] : [231, 87];
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w2}" height="${h2}" viewBox="0 0 231 87" preserveAspectRatio="none">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="hsl(${hue},68%,46%)"/>` +
        `<stop offset="1" stop-color="hsl(${(hue + 70) % 360},68%,22%)"/>` +
        `</linearGradient></defs><rect width="231" height="87" fill="url(#g)"/>` +
        `<circle cx="196" cy="14" r="52" fill="hsl(${(hue + 140) % 360},78%,64%)" opacity="0.3"/></svg>`;
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };
  });
}

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

test("steam: play now in three views, updates, wishlist, most played, deals, top sellers and the catalog", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: STEAM, before: steamArt });
  await openTab(page, "Steam", 1200);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/119-steam-jogue-agora.png", omitBackground: true });
  await page.getByRole("button", { name: "lista" }).click();
  await settle(page, 900);
  // The rows rise in with CSS animations, which run on the real clock, not the frozen one.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/89-steam-recentes.png", omitBackground: true });
  await page.getByRole("button", { name: "grade" }).click();
  await settle(page, 900);
  // The rows rise in with CSS animations, which run on the real clock, not the frozen one.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/98-steam-biblioteca.png", omitBackground: true });
  await page.getByRole("button", { name: "cards" }).click();
  await page.getByRole("tab", { name: "atualizações" }).click();
  await settle(page, 900);
  // The rows rise in with CSS animations, which run on the real clock, not the frozen one.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/120-steam-atualizacoes.png", omitBackground: true });
  await page.getByRole("tab", { name: "desejos" }).click();
  await settle(page, 1200);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/121-steam-desejos.png", omitBackground: true });
  await page.getByRole("tab", { name: "mais jogados" }).click();
  await settle(page, 1200);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/122-steam-mais-jogados.png", omitBackground: true });
  await page.getByRole("tab", { name: "ofertas" }).click();
  await settle(page, 900);
  // The rows rise in with CSS animations, which run on the real clock, not the frozen one.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/87-steam.png", omitBackground: true });
  await page.getByRole("tab", { name: "em alta" }).click();
  await settle(page, 900);
  // The rows rise in with CSS animations, which run on the real clock, not the frozen one.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/88-steam-em-alta.png", omitBackground: true });
  await page.getByRole("tab", { name: "catálogo" }).click();
  await settle(page, 900);
  // The rows rise in with CSS animations, which run on the real clock, not the frozen one.
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/90-steam-catalogo.png", omitBackground: true });
});

test("agentes: the installed CLIs with their latest release", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agentes");
  await page.screenshot({ path: "docs/prints/app/90-agentes.png", omitBackground: true });
});

test("agentes: every provider mark, installed, on the light skin", async ({ browser }) => {
  const all = AGENTS.harness_list.map((a) => ({ ...a, installed: true, path: `D:\\tools\\bin\\${a.id}.cmd` }));
  const page = await fullScene(browser, { skin: "claro", fixed: { harness_list: all } });
  await openTab(page, "Agentes");
  await page.screenshot({ path: "docs/prints/app/91-agentes-claro.png", omitBackground: true });
});
