import { afterEach, expect, test } from "bun:test";
import { applyDensity, loadDensity } from "./density";

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.density;
});

test("applies the density to the document and persists the choice", () => {
  applyDensity("compacta");
  expect(document.documentElement.dataset.density).toBe("compacta");
  expect(loadDensity()).toBe("compacta");
});

test("defaults to 'padrao' with nothing saved or an unknown saved value", () => {
  expect(loadDensity()).toBe("padrao");
  localStorage.setItem("canto.densidade", "gigante");
  expect(loadDensity()).toBe("padrao");
});
