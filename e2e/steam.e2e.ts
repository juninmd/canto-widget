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

const ONE_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const STEAM_FIXED = {
  steam_status: { configured: true, steamid: "76561190000000000", has_key: true, name: "Ana Exemplo" },
  steam_image: ONE_PIXEL,
  steam_deals: {
    has_more: true,
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
  steam_trending: { has_more: false, items: [row(900002, "Nimbus Racer", "R$ 89,90", { review: 88, review_count: 250 })] },
  steam_catalog: { has_more: true, items: [row(900003, "Maré Profunda", "R$ 24,99", { review: 97, review_count: 1 })] },
  steam_recent: {
    has_key: true,
    items: [
      {
        appid: 900004,
        name: "Forja Tática",
        recent_min: 135,
        total_min: 4000,
        art: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/900004/capsule_231x87.jpg",
      },
    ],
  },
};

test("the Steam tab shows the deals with art, score, price and what they save", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab", "status", "activity"], knownTabs: ALL_TABS, fixed: STEAM_FIXED });
  await page.goto("/");
  await goTab(page, "Steam");
  await expect(page.getByRole("tab", { name: "ofertas" })).toBeVisible();
  await expect(page.locator("[data-steam]").first()).toContainText("Aurora Drift");
  await expect(page.locator("[data-steam]").first()).toContainText("91% Muito positivas");
  await expect(page.locator("[data-steam]").first()).toContainText("12.345 análises");
  await expect(page.getByText("-75%")).toBeVisible();
  // The space Intl puts after "R$" is a non-breaking one; `\s` matches both it and a plain space.
  await expect(page.getByText(/economize R\$\s45,00/)).toBeVisible();
  await expect(page.locator('[data-steam] img[src^="data:image/"]')).toHaveCount(1);
  await page.getByRole("tab", { name: "jogue agora" }).click();
  await expect(page.locator("[data-steam]").first()).toContainText("Forja Tática");
  await expect(page.locator("[data-steam]").first()).toContainText("2 h 15 min");
});

test("an unconnected Steam tab asks for the SteamID and connects", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: ["gitlab", "status", "activity"],
    knownTabs: ALL_TABS,
    fixed: {
      ...STEAM_FIXED,
      steam_status: { configured: false, steamid: "", has_key: false, name: "" },
      steam_connect: { configured: true, steamid: "76561190000000000", has_key: false, name: "" },
    },
  });
  await page.goto("/");
  await goTab(page, "Steam");
  await expect(page.getByText("Conectar à Steam")).toBeVisible();
  await page.getByLabel("SteamID64, link do perfil ou nome de perfil").fill("76561190000000000");
  await page.getByRole("button", { name: "conectar" }).click();
  await expect(page.getByRole("tab", { name: "ofertas" })).toBeVisible();
  const connect = (await calls(page)).find((c) => c.cmd === "steam_connect");
  expect(connect?.args).toEqual({ steamId: "76561190000000000", apiKey: "" });
});

test("the Steam tab starts hidden for someone who saved a choice before it existed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"] });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Steam", exact: true })).toHaveCount(0);
});
