import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

export const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "habits", "market", "snippets", "reads", "activity",
];
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "habits", "market", "snippets", "reads"];

/** Fictitious city and reading: a real forecast would read as a fact. */
export const WEATHER_FIXED = {
  weather_get: {
    place: { city: "Aurora", country: "Brasil", lat: -23.5, lon: -46.6 },
    forecast: {
      now: { temp: 22.4, feels: 24.1, condition: "cloudy" },
      hours: [
        { at: "2026-10-17T10:00", temp: 22.4, rain: 10, condition: "cloudy" },
        { at: "2026-10-17T11:00", temp: 25.2, rain: 70, condition: "rain" },
      ],
      days: [{ date: "2026-10-18", min: 16.4, max: 27, rain: 80, condition: "rain" }],
      rain_from: "2026-10-17T11:00",
    },
    fetched_at: Date.now(),
    error: null,
  },
};

test("the weather tab shows the city, the hours, the days and the rain window", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: WEATHER_FIXED });
  await page.goto("/");
  await goTab(page, "Clima");
  await expect(page.getByText("Aurora · Brasil")).toBeVisible();
  await expect(page.locator("[data-weather-now]")).toContainText("22°C");
  await expect(page.getByText("chuva a partir das 11:00")).toBeVisible();
  await expect(page.getByText("sensação de 24 °C")).toBeVisible();
  await expect(page.locator("[data-weather-day]")).toContainText("27° / 16°");
  await expect(page.getByText("dados: Open-Meteo")).toBeVisible();
});

test("without a city the tab asks for one and only sends the name", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: { weather_get: { place: null, forecast: null, fetched_at: 0, error: null } },
  });
  await page.goto("/");
  await goTab(page, "Clima");
  await expect(page.getByText("Escolher a cidade")).toBeVisible();
  await page.getByRole("textbox", { name: "Cidade" }).fill("Recife");
  await page.getByRole("button", { name: "buscar" }).click();
  const call = (await calls(page)).find((c) => c.cmd === "weather_set_city");
  expect(call?.args).toEqual({ city: "Recife" });
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
