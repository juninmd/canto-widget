import { afterEach, beforeEach, expect, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LanguagePicker from "./LanguagePicker";

// Other suites clear localStorage; this one starts from an explicit choice.
beforeEach(() => localStorage.setItem("canto.language", "pt-BR"));

afterEach(() => {
  cleanup();
  localStorage.setItem("canto.language", "pt-BR");
});

test("offers automatic plus each language in its own name, and reloads on a new choice", async () => {
  let reloads = 0;
  render(<LanguagePicker reload={() => reloads++} />);
  expect(screen.getByRole("radio", { name: "Português (Brasil)" }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("radio", { name: "Automático (sistema)" })).toBeTruthy();

  await act(async () => {
    fireEvent.click(screen.getByRole("radio", { name: "English" }));
  });
  expect(localStorage.getItem("canto.language")).toBe("en");
  expect(reloads).toBe(1);

  await act(async () => {
    fireEvent.click(screen.getByRole("radio", { name: "English" }));
  });
  expect(reloads, "picking the current language again must not reload").toBe(1);
});
