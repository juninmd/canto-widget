import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

export const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "market", "reads", "activity",
];
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "market", "reads"];

/** Fictitious city and reading: a real forecast would read as a fact. */
export const WEATHER_FIXED = {
  weather_get: {
    place: { city: "Aurora", admin1: "", country: "Brasil", lat: -23.5, lon: -46.6 },
    forecast: {
      now: { temp: 22.4, feels: 24.1, condition: "cloudy", humidity: 71, wind: 12.6, wind_dir: 90, is_day: true },
      hours: [
        { at: "2026-10-17T10:00", temp: 22.4, rain: 10, condition: "cloudy" },
        { at: "2026-10-17T11:00", temp: 25.2, rain: 70, condition: "rain" },
      ],
      days: [
        { date: "2026-10-17", min: 16.4, max: 27, rain: 80, condition: "rain", sunrise: "2026-10-17T05:40", sunset: "2026-10-17T18:12", uv: 8.4 },
        { date: "2026-10-18", min: 15, max: 25, rain: 10, condition: "clear", sunrise: "", sunset: "", uv: 0 },
      ],
      rain_from: "2026-10-17T11:00",
    },
    fetched_at: Date.now(),
    error: null,
  },
};

test("the weather tab shows the sky, the details, the hours, the days and the rain window", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: WEATHER_FIXED });
  await page.goto("/");
  await goTab(page, "Clima");
  await expect(page.getByText("Aurora · Brasil")).toBeVisible();
  await expect(page.locator("[data-weather-now]")).toContainText("22°C");
  await expect(page.getByText("chuva a partir das 11:00")).toBeVisible();
  await expect(page.getByText("sensação de 24 °C")).toBeVisible();
  await expect(page.locator("[data-weather-day]").first()).toContainText("hoje");
  await expect(page.locator("[data-weather-day]").first()).toContainText("27°");
  await expect(page.locator("[data-weather-details]")).toContainText("71%");
  await expect(page.locator("[data-weather-details]")).toContainText("18:12");
  await expect(page.locator("[data-weather-hour]")).toHaveCount(2);
  await expect(page.getByText(/dados: Open-Meteo/)).toBeVisible();
});

test("without a city the tab searches and offers the candidates before saving one", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: {
      weather_get: { place: null, forecast: null, fetched_at: 0, error: null },
      // "Londres" really is the name of several cities: the first match alone would have picked Argentina.
      weather_search: [
        { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5074, lon: -0.1278 },
        { city: "Londres", admin1: "Catamarca", country: "Argentina", lat: -27.0, lon: -67.0 },
      ],
    },
  });
  await page.goto("/");
  await goTab(page, "Clima");
  await expect(page.getByText("Escolher a cidade")).toBeVisible();
  await page.getByRole("combobox", { name: "Cidade" }).fill("Londres");
  await page.getByRole("button", { name: "buscar" }).click();

  // Only the typed name leaves, and only once the user picks a city are coordinates saved.
  const searched = (await calls(page)).find((c) => c.cmd === "weather_search");
  expect(searched?.args).toEqual({ query: "Londres" });
  expect((await calls(page)).some((c) => c.cmd === "weather_set_place")).toBe(false);

  await expect(page.getByRole("option", { name: /Inglaterra, Reino Unido/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Catamarca, Argentina/ })).toBeVisible();
  await page.getByRole("option", { name: /Reino Unido/ }).click();
  const saved = (await calls(page)).find((c) => c.cmd === "weather_set_place");
  expect(saved?.args).toEqual({
    place: { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5074, lon: -0.1278 },
  });
});

test("the city field is a usable text field, not the 18px checkbox box", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: { weather_get: { place: null, forecast: null, fetched_at: 0, error: null } },
  });
  await page.goto("/");
  await goTab(page, "Clima");
  const field = page.getByRole("combobox", { name: "Cidade" });
  await field.fill("Londres");
  // `.canto-box` is the checkbox style (1.125rem square): on the city field it hid what was typed.
  const box = (await field.boundingBox())!;
  expect(box.width).toBeGreaterThan(150);
  expect(box.height).toBeGreaterThan(22);
});

test("the results show up while typing and the keyboard picks the city", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: {
      weather_get: { place: null, forecast: null, fetched_at: 0, error: null },
      weather_search: [
        { city: "Londres", admin1: "Inglaterra", country: "Reino Unido", lat: 51.5074, lon: -0.1278 },
        { city: "Londres", admin1: "Catamarca", country: "Argentina", lat: -27.0, lon: -67.0 },
      ],
    },
  });
  await page.goto("/");
  await goTab(page, "Clima");
  await page.getByRole("combobox", { name: "Cidade" }).pressSequentially("Londres");
  await expect(page.getByRole("option")).toHaveCount(2);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  const saved = (await calls(page)).find((c) => c.cmd === "weather_set_place");
  expect(saved?.args).toMatchObject({ place: { admin1: "Catamarca", country: "Argentina" } });
});

test("a popular city is one click away and trocar de cidade keeps the saved one until another is picked", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: WEATHER_FIXED });
  await page.goto("/");
  await goTab(page, "Clima");
  await page.getByRole("button", { name: "trocar de cidade" }).click();
  await expect(page.getByText("cidades populares")).toBeVisible();
  expect((await calls(page)).some((c) => c.cmd === "weather_clear")).toBe(false);
  await page.getByRole("button", { name: "Recife" }).click();
  const saved = (await calls(page)).find((c) => c.cmd === "weather_set_place");
  expect(saved?.args).toMatchObject({ place: { city: "Recife", admin1: "PE", country: "Brasil" } });
});

test("atualizar asks Rust to bypass the 30 min cache", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: WEATHER_FIXED });
  await page.goto("/");
  await goTab(page, "Clima");
  await page.getByRole("button", { name: "atualizar" }).click();
  const args = (await calls(page)).filter((c) => c.cmd === "weather_get").map((c) => c.args);
  expect(args[0]).toEqual({ force: false });
  expect(args.at(-1)).toEqual({ force: true });
});
