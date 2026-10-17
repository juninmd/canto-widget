import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "market", "reads", "activity",
];
/** Clima and Leituras are real features now; the market mockup still starts hidden. */
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents", "weather", "reads"];

/** One distinctive line of the mockup, in the order of the tab bar. */
const MARKERS: [string, string][] = [["Mercado", "+0,31% no dia"]];

test("each prototype tab opens with its mockup", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS });
  await page.goto("/");
  for (const [tab, marker] of MARKERS) {
    await goTab(page, tab);
    await expect(page.getByText(marker).first()).toBeVisible();
    await expect(page.getByText("protótipo")).toBeVisible();
  }
});

test("a prototype is a mockup: opening it asks nothing from Rust", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS });
  await page.goto("/");
  await goTab(page, "Mercado");
  const cmds = (await calls(page)).map((c) => c.cmd);
  expect(cmds.filter((cmd) => /proto|market/.test(cmd))).toEqual([]);
});

test("a prototype starts hidden for someone who saved a choice before it existed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"] });
  await page.goto("/");
  for (const tab of ["Mercado"]) {
    await expect(page.getByRole("tab", { name: tab, exact: true })).toHaveCount(0);
  }
});
