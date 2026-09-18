import { afterEach, beforeEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SkinPicker from "./SkinPicker";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

test("each skin shows by name, not just by color", () => {
  render(<SkinPicker />);
  for (const name of ["Padrão", "Hueco Mundo", "Drácula", "Claro", "Seguir o sistema"]) {
    expect(screen.getByRole("radio", { name })).toBeTruthy();
  }
});

test("picking a skin applies it to the document and is remembered", () => {
  render(<SkinPicker />);
  fireEvent.click(screen.getByRole("radio", { name: "Drácula" }));
  expect(document.documentElement.dataset.skin).toBe("dracula");
  expect(screen.getByRole("radio", { name: "Drácula" }).getAttribute("aria-checked")).toBe("true");
  cleanup();
  render(<SkinPicker />);
  expect(screen.getByRole("radio", { name: "Drácula" }).getAttribute("aria-checked")).toBe("true");
});
