import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "map", "market", "reads", "activity", "gmail", "gdrive", "contacts",
];
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "weather", "market", "reads", "gmail", "gdrive", "contacts"];
const ORIGIN = { name: "Rua das Acácias, 120", detail: "Aurora", lat: -23.5, lon: -46.6 };
const TRIP = { id: "t1", name: "Trabalho", icon: "work", to: { name: "Av. Central, 900", detail: "", lat: -23.49, lon: -46.59 } };

/** Fictitious place and reading; the tiles come back empty, the map frame and overlays still render. */
const LIVE = {
  traffic_get: {
    status: { has_key: true, origin: ORIGIN, trips: [TRIP] },
    suggested: null,
    reading: {
      slowdown: 22,
      incidents: [{ kind: "accident", text: "Acidente", road: "Av. Central", delay_s: 420, km: 0.8, lat: -23.497, lon: -46.6, magnitude: 3 }],
      routes: [{ trip: "t1", minutes: 18, free_minutes: 14, km: 5.2, points: [[-23.5, -46.6], [-23.49, -46.59]], error: null }],
    },
    fetched_at: Date.now(),
    history: [],
    error: null,
  },
  traffic_map: { zoom: 14, tiles: [], source: "tomtom" },
  traffic_departures: [18, 17, 14].map((minutes, i) => ({ at: Date.now() + i * 900_000, minutes })),
};

test("the map tab starts hidden and, once shown, reads the traffic around the starting point", async ({ page }) => {
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS, fixed: LIVE });
  await page.goto("/");
  await goTab(page, "Mapa");
  await expect(page.locator("[data-map-view]")).toContainText("Rua das Acácias, 120");
  await expect(page.locator("[data-map-pulse]")).toContainText("22%");
  await expect(page.locator("[data-map-trip]")).toContainText("18 min");
  await expect(page.locator("[data-map-trip]")).toContainText("+4 min");
  await expect(page.locator("[data-map-leave-text]")).toContainText("leve 14 min");
  await expect(page.locator("[data-map-incident]")).toContainText("Acidente");
  await expect(page.locator("[data-map-pin]")).toHaveCount(1);
  const map = (await calls(page)).find((c) => c.cmd === "traffic_map");
  expect(map?.args.zoom).toBe(14);
});

test("a fresh install keeps the map tab hidden by default", async ({ page }) => {
  await mockTauri(page, { fixed: LIVE });
  await page.goto("/");
  await page.getByRole("tablist").first().waitFor();
  await expect(page.getByRole("tab", { name: "Mapa", exact: true })).toHaveCount(0);
});

test("without a key the map asks for one and saves only on submit", async ({ page }) => {
  await mockTauri(page, {
    hiddenTabs: HIDDEN,
    knownTabs: ALL_TABS,
    fixed: { ...LIVE, traffic_get: { ...LIVE.traffic_get, status: { has_key: false, origin: ORIGIN, trips: [] }, reading: null }, traffic_set_key: { has_key: true, origin: ORIGIN, trips: [] } },
  });
  await page.goto("/");
  await goTab(page, "Mapa");
  await expect(page.locator("[data-map-key]")).toContainText("Mapa sem trânsito");
  await page.getByLabel("Chave da TomTom").fill("chaveficticia0123456789abcdefABCD");
  expect((await calls(page)).some((c) => c.cmd === "traffic_set_key")).toBe(false);
  await page.getByRole("button", { name: "salvar chave" }).click();
  await expect.poll(async () => (await calls(page)).find((c) => c.cmd === "traffic_set_key")?.args.key).toBe("chaveficticia0123456789abcdefABCD");
});
