import { afterEach, expect, test } from "bun:test";
import { applySkin, loadSkin, resolverSkin } from "./theme";

const original = window.matchMedia;
function sistema(claro: boolean) {
  window.matchMedia = ((q: string) => ({ matches: claro && q.includes("light"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = original;
  localStorage.clear();
});

test("seguir o sistema escolhe claro de dia e padrao escuro a noite", () => {
  expect(resolverSkin("sistema", true)).toBe("claro");
  expect(resolverSkin("sistema", false)).toBe("padrao");
  expect(resolverSkin("dracula", true)).toBe("dracula");
});

test("aplica a skin resolvida no documento mas guarda a escolha 'sistema'", () => {
  sistema(true);
  applySkin("sistema");
  expect(document.documentElement.dataset.skin).toBe("claro");
  expect(loadSkin()).toBe("sistema");
  sistema(false);
  applySkin(loadSkin());
  expect(document.documentElement.dataset.skin).toBe("padrao");
});

test("valor desconhecido salvo volta para a padrao", () => {
  localStorage.setItem("canto.skin", "neon");
  expect(loadSkin()).toBe("padrao");
});
