import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";

/** Invented candidates: "Londres" really is the name of several cities, which is why the list exists. */
const CANDIDATES = [
  { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5074, lon: -0.1278 },
  { city: "Londres", admin1: "Catamarca", country: "Argentina", lat: -27.0, lon: -67.0 },
  { city: "Londres", admin1: "Sinaloa", country: "México", lat: 25.0, lon: -107.0 },
];

// Real waits: the page clock is frozen, and the CSS entrance animations run on the real one.
test("o clima da cidade: o céu, os detalhes, as horas e os dias", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Clima");
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "docs/prints/app/92-clima.png", omitBackground: true });
  await page.locator("[data-weather-hours]").scrollIntoViewIfNeeded();
  await page.getByRole("tabpanel").evaluate((el) => (el.firstElementChild!.scrollTop = 9999));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "docs/prints/app/93-clima-previsao.png", omitBackground: true });
});

test("a busca de cidade com os candidatos", async ({ browser }) => {
  const page = await fullScene(browser, {
    fixed: {
      weather_get: { place: null, forecast: null, fetched_at: 0, error: null },
      weather_search: CANDIDATES,
    },
  });
  await openTab(page, "Clima");
  await page.getByRole("combobox", { name: "Cidade" }).fill("Londres");
  await page.getByRole("button", { name: "buscar" }).click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "docs/prints/app/97-clima-busca.png", omitBackground: true });
});

test("a escolha da cidade antes de digitar: populares num clique", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: { weather_get: { place: null, forecast: null, fetched_at: 0, error: null } } });
  await openTab(page, "Clima");
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "docs/prints/app/99-clima-cidades.png", omitBackground: true });
});
