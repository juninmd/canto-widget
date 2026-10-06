import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

/** WCAG 2.x contrast of the tokens each skin ships, so a new skin or a tweak can't quietly drop below the bar. */
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

const skins: Record<string, Record<string, string>> = {};
for (const m of css.matchAll(/(:root(?:,\s*\n:root\[data-skin="padrao"\])|:root\[data-skin="([a-z-]+)"\])\s*\{([^}]*)\}/g)) {
  const name = m[2] ?? "padrao";
  skins[name] = Object.fromEntries([...m[3].matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((t) => [t[1], t[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("every skin was found, with the tokens the checks below read", () => {
  expect(Object.keys(skins).sort()).toEqual(["claro", "dracula", "hueco-mundo", "padrao"]);
  for (const t of Object.values(skins)) {
    for (const k of ["ink", "panel", "edge", "fg", "muted", "faint", "line", "accent", "accent-text", "on-accent", "danger", "ok", "warn"]) {
      expect(t[k], k).toMatch(/^#[0-9a-f]{6}$/i);
    }
  }
});

test("text tokens reach 4.5:1 on the panel and on the ink behind inputs and cards (WCAG 1.4.3)", () => {
  for (const [skin, t] of Object.entries(skins)) {
    for (const k of ["fg", "muted", "faint", "accent-text", "danger", "ok", "warn"]) {
      for (const bg of ["panel", "ink"]) {
        expect(ratio(t[k], t[bg]), `${skin}: ${k} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

test("muted text keeps 4.5:1 on the chip background, and the label on the accent button too", () => {
  for (const [skin, t] of Object.entries(skins)) {
    expect(ratio(t.muted, t.edge), `${skin}: muted on edge`).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t["on-accent"], t.accent), `${skin}: on-accent on accent`).toBeGreaterThanOrEqual(4.5);
  }
});

test("borders of controls and the accent reach 3:1 against the panel (WCAG 1.4.11)", () => {
  for (const [skin, t] of Object.entries(skins)) {
    expect(ratio(t.line, t.panel), `${skin}: line on panel`).toBeGreaterThanOrEqual(3);
    expect(ratio(t.accent, t.panel), `${skin}: accent on panel`).toBeGreaterThanOrEqual(3);
  }
});

const CATS = ["cat-games", "cat-meet", "cat-docs", "cat-chat", "cat-web", "cat-other"];

test("every skin ships the activity category colors", () => {
  for (const [skin, t] of Object.entries(skins)) {
    for (const k of CATS) expect(t[k], `${skin}: ${k}`).toMatch(/^#[0-9a-f]{6}$/i);
  }
});

test("the activity category colors reach 3:1 against the panel they are drawn on (WCAG 1.4.11)", () => {
  for (const [skin, t] of Object.entries(skins)) {
    for (const k of CATS) expect(ratio(t[k], t.panel), `${skin}: ${k} on panel`).toBeGreaterThanOrEqual(3);
  }
});
