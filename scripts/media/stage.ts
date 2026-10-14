import type { Browser, Page } from "@playwright/test";
import { mockTauri, type MockOptions } from "../../e2e/mock";

/** One fixed instant for every shot, so "agora", "em 30 min" and the free gaps read the same on each run. */
export const NOW = new Date(2026, 9, 9, 10, 6, 0);
export const BASE = "http://localhost:1420";

export type SceneOptions = MockOptions & {
  width?: number;
  height?: number;
  skin?: "padrao" | "hueco-mundo" | "dracula" | "glass" | "claro";
  /** localStorage entries written before the app boots (hidden tabs, split width...). */
  storage?: Record<string, string>;
  /** Page to open: "/" for the widget, "/?alert" for the pop-up window. */
  path?: string;
  /** Overrides NOW for scenes that need another hour (the activity day is told at the end of the afternoon). */
  now?: Date;
  /** Registers more init scripts after the mock (like `seedVault`), before the first navigation. */
  before?: (page: Page) => Promise<void>;
};

/** A page with the Tauri runtime mocked, the clock frozen at NOW and a skin picked. Nothing touches a vault. */
export async function openScene(browser: Browser, opts: SceneOptions = {}): Promise<Page> {
  const { path = "/", now = NOW, width = 420, height = 580, skin = "padrao", storage = {}, before, ...mock } = opts;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: skin === "claro" ? "light" : "dark",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });
  const page = await context.newPage();
  await page.clock.install({ time: now });
  await mockTauri(page, mock);
  await page.addInitScript(
    ([s, entries]) => {
      localStorage.setItem("canto.skin", s);
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
    },
    [skin, storage] as const,
  );
  await before?.(page);
  await page.goto(new URL(path, BASE).href);
  await page.clock.runFor(400);
  return page;
}

/** Lets rAF-driven UI (TipTap focus, transitions) settle without moving the wall clock far. */
export async function settle(page: Page, ms = 350) {
  await page.clock.runFor(ms);
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
}
