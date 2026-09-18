import { afterEach, expect, test } from "bun:test";
import { applySkin, loadSkin, resolveSkin } from "./theme";

const original = window.matchMedia;
function system(light: boolean) {
  window.matchMedia = ((q: string) => ({ matches: light && q.includes("light"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = original;
  localStorage.clear();
});

test("following the system picks light by day and the dark default at night", () => {
  expect(resolveSkin("sistema", true)).toBe("claro");
  expect(resolveSkin("sistema", false)).toBe("padrao");
  expect(resolveSkin("dracula", true)).toBe("dracula");
});

test("applies the resolved skin to the document but keeps the 'sistema' choice", () => {
  system(true);
  applySkin("sistema");
  expect(document.documentElement.dataset.skin).toBe("claro");
  expect(loadSkin()).toBe("sistema");
  system(false);
  applySkin(loadSkin());
  expect(document.documentElement.dataset.skin).toBe("padrao");
});

test("an unknown saved value falls back to the default", () => {
  localStorage.setItem("canto.skin", "neon");
  expect(loadSkin()).toBe("padrao");
});
