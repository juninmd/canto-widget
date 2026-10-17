import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "habits", "market", "snippets", "reads", "activity",
];
/** The five prototypes, plus what the other tabs already hide: the bar keeps its usual size. */
const HIDDEN = ["gitlab", "status", "activity", "steam", "agents"];

/** One distinctive line of each mockup, in the order of the tab bar. */
const MARKERS: [string, string][] = [
  ["Clima", "chuva a partir das 16:00"],
  ["Hábitos", "3 dias seguidos"],
  ["Mercado", "+0,31% no dia"],
  ["Snippets", "colar no app em foco"],
  ["Leituras", "não lidos"],
];

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

test("a prototype is a mockup: opening and copying ask nothing from Rust", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockTauri(page, { hiddenTabs: HIDDEN, knownTabs: ALL_TABS });
  await page.goto("/");
  await goTab(page, "Snippets");
  await page.locator("[data-proto-snippet=s3]").getByRole("button", { name: "copiar" }).click();
  await expect(page.locator("[data-proto-snippet=s3]").getByRole("button", { name: "copiar ✓" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("select date_trunc");
  const cmds = (await calls(page)).map((c) => c.cmd);
  expect(cmds.filter((cmd) => /proto|weather|habit|market|snippet|read/.test(cmd))).toEqual([]);
});

test("a prototype starts hidden for someone who saved a choice before it existed", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await mockTauri(page, { hiddenTabs: ["gitlab"], knownTabs: ["tasks", "notes", "clipboard", "agenda", "github", "gitlab"] });
  await page.goto("/");
  for (const tab of ["Clima", "Hábitos", "Mercado", "Snippets", "Leituras"]) {
    await expect(page.getByRole("tab", { name: tab, exact: true })).toHaveCount(0);
  }
});
