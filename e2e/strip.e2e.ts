import { expect, test } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** Fictitious numbers only (public repository). */
const SNAPSHOT = {
  cpu: 23,
  memory: 61,
  weather: { temp: 24.4, condition: "cloudy" },
  event: { title: "Daily do time", in_min: 14, meet: true },
  reviews: 3,
  battery: [57, false],
  tasks: 5,
  notices: 2,
};

test.use({ viewport: { width: 420, height: 760 } });

test("the pill shows the numbers and a click pins the details with Entrar", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      "plugin:window|is_visible": true,
      strip_config_get: { enabled: true, edge: "top", items: ["cpu", "battery", "tasks", "weather", "event", "reviews", "notices"] },
      strip_snapshot: SNAPSHOT,
    },
  });
  await page.goto("/?strip");
  const pill = page.getByRole("button", { name: "Mini-dashboard do Canto" });
  await expect(pill).toContainText("23%");
  await expect(pill).toContainText("24°");
  await expect(pill).toContainText("em 14 min");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "strip_resize")).toBe(true);

  await pill.click();
  await expect(page.getByText("Daily do time")).toBeVisible();
  await page.mouse.move(300, 400);
  await expect(page.getByText("Daily do time")).toBeVisible();
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "strip_join")).toBe(true);
  await page.screenshot({ path: "docs/prints/app/150-mini-dashboard.png" });

  await page.keyboard.press("Escape");
  await expect(page.getByText("Daily do time")).toBeHidden();
});

test("arrow keys walk the pinned details and a tab button opens that tab", async ({ page }) => {
  await mockTauri(page, {
    fixed: {
      "plugin:window|is_visible": true,
      strip_config_get: { enabled: true, edge: "top", items: ["tasks"] },
      strip_snapshot: SNAPSHOT,
    },
  });
  await page.goto("/?strip");
  await page.getByRole("button", { name: "Mini-dashboard do Canto" }).click();
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "strip_focus" && c.args?.on === true)).toBe(true);
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: /Tarefas abertas/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "Notas" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "main_show")).toBe(true);
});
