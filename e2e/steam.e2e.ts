import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

export const ALL_TABS = ["tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "activity"];

/** Fictitious games only: a real title shown with a price would read as a fact. */
const row = (appid: number, name: string, price: string, extra: Record<string, unknown> = {}) => ({
  appid,
  name,
  price,
  original: "",
  discount: 0,
  review: null,
  review_key: "",
  review_count: 0,
  saved_cents: 0,
  art: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`,
  ...extra,
});

const play = (appid: number, name: string, total_min: number, recent_min: number, installed: boolean) => ({
  appid,
  name,
  art: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
  cover: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`,
  total_min,
  recent_min,
  last_played: Math.floor(Date.now() / 1000) - 86_400,
  installed,
  size_bytes: installed ? 12e9 : 0,
});

const ONE_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const STEAM_FIXED = {
  steam_status: { configured: true, steamid: "76561190000000000", has_key: true, name: "Ana Exemplo", region: "br", watching: false },
  steam_image: ONE_PIXEL,
  steam_watch_set: true,
  steam_deals: {
    has_more: true,
    currency: "BRL",
    items: [
      row(900001, "Aurora Drift", "R$ 14,99", {
        original: "R$ 59,99",
        discount: 75,
        review: 91,
        review_key: "very_positive",
        review_count: 12345,
        saved_cents: 4500,
      }),
    ],
  },
  steam_trending: { has_more: false, currency: "BRL", items: [row(900002, "Nimbus Racer", "R$ 89,90", { review: 88, review_count: 250 })] },
  steam_catalog: { has_more: true, currency: "BRL", items: [row(900003, "Maré Profunda", "R$ 24,99", { review: 97, review_count: 1 })] },
  steam_play: {
    has_key: true,
    total: 2,
    minutes: 4135,
    pages: 1,
    counts: { all: 2, recent: 1, installed: 1 },
    hero: play(900004, "Forja Tática", 4000, 135, true),
    items: [play(900004, "Forja Tática", 4000, 135, true), play(900005, "Vento Valley", 135, 0, false)],
  },
  steam_news: {
    unread: 1,
    items: [
      {
        gid: "n1",
        appid: 900004,
        game: "Forja Tática",
        title: "Atualização 1.2",
        url: "https://store.steampowered.com/news/app/900004",
        date: Math.floor(Date.now() / 1000) - 3600,
        lines: ["Novo mapa cooperativo", "Corrige o salvamento"],
        fresh: true,
      },
    ],
  },
  steam_top: {
    players: 2_000_000,
    pages: 1,
    updated: 0,
    items: [{ rank: 1, appid: 900007, name: "Kestrel Arena", art: "", players: 1_482_311, peak: 1_702_455, moved: 2, mine: false }],
  },
  steam_wishlist: {
    total: 3,
    on_sale: 1,
    hot: 1,
    pages: 1,
    currency: "BRL",
    items: [row(900001, "Aurora Drift", "R$ 11,99", { original: "R$ 59,99", discount: 80, saved_cents: 4800 })],
  },
};

test("the Steam tab opens on play now and walks every sub-tab", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab", "status", "activity"], knownTabs: ALL_TABS, fixed: STEAM_FIXED });
  await page.goto("/");
  await goTab(page, "Steam");
  await expect(page.locator("[data-steam-hero]")).toContainText("Forja Tática");
  await expect(page.locator("[data-steam]").first()).toContainText("Forja Tática");
  await expect(page.getByText("2 jogos · 68 h 55 min jogados")).toBeVisible();
  await page.getByRole("button", { name: "jogar Forja Tática" }).first().click();
  expect((await calls(page)).find((c) => c.cmd === "steam_launch")?.args).toEqual({ appid: 900004 });
  await page.getByRole("button", { name: "grade" }).click();
  await expect(page.locator('[data-steam] img[src^="data:image/"]').first()).toBeVisible();

  await page.getByRole("tab", { name: "atualizações" }).click();
  await expect(page.getByText("Novo mapa cooperativo")).toBeVisible();

  await page.getByRole("tab", { name: "desejos" }).click();
  await expect(page.locator("[data-steam]").first()).toContainText("Aurora Drift");
  await expect(page.locator(".steam-hot-badge").filter({ hasText: "-80%" })).toBeVisible();

  await page.getByRole("tab", { name: "mais jogados" }).click();
  await expect(page.locator("[data-steam]").first()).toContainText("1.482.311");

  await page.getByRole("tab", { name: "ofertas" }).click();
  await expect(page.locator("[data-steam]").first()).toContainText("Aurora Drift");
  await expect(page.locator("[data-steam]").first()).toContainText("91% Muito positivas");
  await expect(page.locator("[data-steam]").first()).toContainText("12.345 análises");
  await expect(page.getByText("-75%")).toBeVisible();
  // The space Intl puts after "R$" is a non-breaking one; `\s` matches both it and a plain space.
  await expect(page.getByText(/economize R\$\s45,00/)).toBeVisible();
  await page.getByRole("tab", { name: "catálogo" }).click();
  await expect(page.getByRole("button", { name: "ver mais jogos" })).toBeVisible();
  const catalog = (await calls(page)).filter((c) => c.cmd === "steam_catalog").at(-1);
  expect(catalog?.args).toEqual({ term: "", page: 0, sort: "reviews", onlySale: false, force: false });
});

test("ofertas pages through the wishlist and the region picker switches the store", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: ["gitlab", "status", "activity"],
    knownTabs: ALL_TABS,
    fixed: {
      ...STEAM_FIXED,
      steam_region_set: { configured: true, steamid: "76561190000000000", has_key: true, name: "Ana Exemplo", region: "us", watching: false },
    },
  });
  await page.goto("/");
  await goTab(page, "Steam");

  await page.getByRole("tab", { name: "ofertas" }).click();
  const picker = page.getByRole("button", { name: "região da loja" });
  await expect(picker).toContainText("BRL");
  const bell = page.getByRole("button", { name: "avisar promoções de 75% ou mais e atualizações dos jogos" });
  await expect(bell).toHaveAttribute("aria-pressed", "false");
  await bell.click();
  const watch = (await calls(page)).find((c) => c.cmd === "steam_watch_set");
  expect(watch?.args).toEqual({ enabled: true });
  await expect(bell).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "ver mais jogos" }).click();
  const more = (await calls(page)).filter((c) => c.cmd === "steam_deals").at(-1);
  expect(more?.args).toEqual({ page: 1, force: false });

  await picker.click();
  await page.locator('[data-region="us"]').click();
  const region = (await calls(page)).find((c) => c.cmd === "steam_region_set");
  expect(region?.args).toEqual({ region: "us" });
  // The lists on screen belonged to the other store, so they are refetched.
  const reloads = (await calls(page)).filter((c) => c.cmd === "steam_deals").length;
  expect(reloads).toBeGreaterThan(2);
});

test("a keyless account pastes the Web API key from the header", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: ["gitlab", "status", "activity"],
    knownTabs: ALL_TABS,
    fixed: {
      ...STEAM_FIXED,
      steam_status: { configured: true, steamid: "76561190000000000", has_key: false, name: "Ana Exemplo", region: "br", watching: false },
    },
  });
  await page.goto("/");
  await goTab(page, "Steam");
  await page.getByRole("button", { name: "sem chave" }).click();
  await page.getByLabel("Chave da Steam Web API (opcional)").fill("chave-nova");
  await page.getByRole("button", { name: "conectar", exact: true }).click();
  const key = (await calls(page)).find((c) => c.cmd === "steam_connect");
  expect(key?.args).toEqual({ steamId: "76561190000000000", apiKey: "chave-nova" });
});

test("an unconnected Steam tab asks for the SteamID and connects", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: ["gitlab", "status", "activity"],
    knownTabs: ALL_TABS,
    fixed: {
      ...STEAM_FIXED,
      steam_status: { configured: false, steamid: "", has_key: false, name: "", region: "br", watching: false },
      steam_connect: { configured: true, steamid: "76561190000000000", has_key: false, name: "", region: "br", watching: false },
    },
  });
  await page.goto("/");
  await goTab(page, "Steam");
  await expect(page.getByText("Conectar à Steam")).toBeVisible();
  await page.getByLabel("SteamID64, link do perfil ou nome de perfil").fill("76561190000000000");
  await page.getByRole("button", { name: "conectar", exact: true }).click();
  await expect(page.getByRole("tab", { name: "jogue agora" })).toBeVisible();
  const connect = (await calls(page)).find((c) => c.cmd === "steam_connect");
  expect(connect?.args).toEqual({ steamId: "76561190000000000", apiKey: "" });
});

test("the Steam tab starts hidden for someone who saved a choice before it existed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"] });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Steam", exact: true })).toHaveCount(0);
});
