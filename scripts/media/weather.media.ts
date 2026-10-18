import { test } from "@playwright/test";
import { fullScene, openTab } from "./scene";
import { settle } from "./stage";

/** Invented candidates: "Londres" really is the name of several cities, which is why the list exists. */
const CANDIDATES = [
  { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5074, lon: -0.1278 },
  { city: "Londres", admin1: "Catamarca", country: "Argentina", lat: -27.0, lon: -67.0 },
  { city: "Londres", admin1: "Sinaloa", country: "México", lat: 25.0, lon: -107.0 },
];

test("a busca de cidade com os candidatos", async ({ browser }) => {
  const page = await fullScene(browser, {
    fixed: {
      weather_get: { place: null, forecast: null, fetched_at: 0, error: null },
      weather_search: CANDIDATES,
    },
  });
  await openTab(page, "Clima");
  await page.getByRole("textbox", { name: "Cidade" }).fill("Londres");
  await page.getByRole("button", { name: "buscar" }).click();
  await settle(page, 400);
  await page.screenshot({ path: "docs/prints/app/97-clima-busca.png", omitBackground: true });
});
