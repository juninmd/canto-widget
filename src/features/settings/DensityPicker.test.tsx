import { afterEach, beforeEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import DensityPicker from "./DensityPicker";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

test("each density option shows by name", () => {
  render(<DensityPicker />);
  for (const name of ["Compacta", "Padrão", "Confortável"]) {
    expect(screen.getByRole("radio", { name })).toBeTruthy();
  }
});

test("picking a density applies it to the document and is remembered", () => {
  render(<DensityPicker />);
  fireEvent.click(screen.getByRole("radio", { name: "Compacta" }));
  expect(document.documentElement.dataset.density).toBe("compacta");
  expect(screen.getByRole("radio", { name: "Compacta" }).getAttribute("aria-checked")).toBe("true");
  cleanup();
  render(<DensityPicker />);
  expect(screen.getByRole("radio", { name: "Compacta" }).getAttribute("aria-checked")).toBe("true");
});
