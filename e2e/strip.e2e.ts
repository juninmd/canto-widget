import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

/** Fictitious numbers only (public repository). */
const SNAPSHOT = {
  cpu: 23,
  memory: 61,
  disk: 48,
  network: [1_250_000, 84_000],
  gpu: 12,
  temp: 54,
  market: { symbol: "USDBRL=X", price: 5.12, change: 0.31, currency: "BRL" },
  health: { down: 1, total: 4 },
  history: {
    cpu: [12, 18, 15, 22, 30, 26, 20, 24, 28, 23, 19, 21, 25, 31, 27, 22, 18, 20, 24, 23],
    memory: [58, 58, 59, 60, 60, 61, 61, 60, 61, 61, 62, 61, 61, 60, 61, 61, 61, 62, 61, 61],
    net_down: [200, 800, 1200, 400, 300, 900, 1500, 2200, 1800, 1100, 600, 700, 1300, 1250, 900, 400, 600, 1000, 1200, 1250].map((k) => k * 1000),
  },
  weather: { temp: 24.4, condition: "cloudy" },
  event: { title: "Daily do time", in_min: 14, meet: true },
  reviews: 3,
  battery: [57, false],
  tasks: 5,
  notices: 2,
};

const LOOK = { density: "comfortable", icons: true, labels: false, opacity: 100, charts: true };

test.use({ viewport: { width: 440, height: 860 } });

test("the pill shows the numbers and a click pins the details with Entrar", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      "plugin:window|is_visible": true,
      strip_config_get: {
        ...LOOK,
        enabled: true,
        edge: "top",
        items: ["clock", "cpu", "memory", "network", "weather", "event", "tasks", "reviews", "health", "market"],
      },
      strip_snapshot: SNAPSHOT,
    },
  });
  await page.clock.setFixedTime(new Date(2026, 10, 16, 9, 30));
  await page.goto("/?strip");
  const pill = page.getByRole("button", { name: "Mini-dashboard do Canto" });
  await expect(pill).toContainText("23%");
  await expect(pill).toContainText("24°");
  await expect(pill).toContainText("3/4");
  await expect(pill).toContainText("em 14 min");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "strip_resize")).toBe(true);

  await pill.click();
  await expect(page.getByText("Daily do time", { exact: true })).toBeVisible();
  await page.mouse.move(300, 400);
  await expect(page.getByText("Daily do time", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "strip_join")).toBe(true);
  await page.screenshot({ path: "docs/prints/app/150-mini-dashboard.png" });

  await page.keyboard.press("Escape");
  await expect(page.getByText("Daily do time", { exact: true })).toBeHidden();
});

test("Ocultar switches the pill off from the details", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      "plugin:window|is_visible": true,
      strip_config_get: { ...LOOK, enabled: true, edge: "top", items: ["cpu"] },
      strip_snapshot: SNAPSHOT,
    },
  });
  await page.goto("/?strip");
  await page.getByRole("button", { name: "Mini-dashboard do Canto" }).click();
  await page.getByRole("button", { name: "Ocultar" }).click();
  await expect
    .poll(async () => (await calls(page)).find((c) => c.cmd === "strip_config_set")?.args)
    .toMatchObject({ config: { enabled: false } });
});

test("compact with names: the pill reads without icons", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      "plugin:window|is_visible": true,
      strip_config_get: { ...LOOK, density: "compact", icons: false, labels: true, enabled: true, edge: "top", items: ["cpu", "memory", "gpu", "disk", "battery"] },
      strip_snapshot: { ...SNAPSHOT, battery: [57, false] },
    },
  });
  await page.goto("/?strip");
  const pill = page.getByRole("button", { name: "Mini-dashboard do Canto" });
  await expect(pill).toContainText("RAM61%");
  await expect(pill).toContainText("Disco48%");
  await expect(pill.locator("svg")).toHaveCount(0);
});

test("arrow keys walk the pinned details and Personalizar opens the settings", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      "plugin:window|is_visible": true,
      strip_config_get: { ...LOOK, enabled: true, edge: "top", items: ["tasks"] },
      strip_snapshot: SNAPSHOT,
    },
  });
  await page.goto("/?strip");
  await page.getByRole("button", { name: "Mini-dashboard do Canto" }).click();
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "strip_focus" && c.args?.on === true)).toBe(true);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: /Tarefas abertas/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "Personalizar" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Notas" })).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "main_show")).toBe(true);
});

test("Ajustes: switch items on, reorder them and preview the look", async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 1400 });
  await mockTauri(page, {
    hiddenTabs: [],
    fixed: {
      strip_config_get: { ...LOOK, enabled: true, edge: "top", items: ["cpu", "weather", "event", "reviews"] },
      strip_monitors: ["Monitor 1", "Monitor 2"],
    },
  });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await page.getByRole("searchbox", { name: "buscar ajuste" }).fill("mini-dashboard");
  const section = page.getByRole("group", { name: "Mini-dashboard" });
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByText("Prévia")).toBeVisible();
  await section.screenshot({ path: "docs/prints/app/151-mini-dashboard-ajustes.png" });
  await section.getByRole("button", { name: "subir Clima" }).click();
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "strip_config_set").at(-1)?.args).toMatchObject({
    config: { items: ["weather", "cpu", "event", "reviews"] },
  });
});
