import { expect, test, type Page } from "@playwright/test";
import { shoot } from "./out";
import { fullScene, openTab } from "./scene";
import { STEAM } from "./data-ops";
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
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="231" height="87">` +
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

test("steam: wishlist deals, the ranking and the recent games", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: STEAM, before: steamArt });
  await openTab(page, "Steam", 1200);
  await page.screenshot({ path: "docs/prints/app/87-steam.png", omitBackground: true });
  await page.getByRole("tab", { name: "em alta" }).click();
  await settle(page, 900);
  await page.screenshot({ path: "docs/prints/app/88-steam-em-alta.png", omitBackground: true });
  await page.getByRole("tab", { name: "jogue agora" }).click();
  await settle(page, 900);
  await page.screenshot({ path: "docs/prints/app/89-steam-recentes.png", omitBackground: true });
  await page.getByRole("tab", { name: "catálogo" }).click();
  await settle(page, 900);
  await page.screenshot({ path: "docs/prints/app/90-steam-catalogo.png", omitBackground: true });
});

test("agentes: the installed CLIs with their latest release", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agentes");
  await page.screenshot({ path: "docs/prints/app/90-agentes.png", omitBackground: true });
});
