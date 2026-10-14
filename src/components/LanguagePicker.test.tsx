import { afterEach, beforeEach, expect, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LanguagePicker from "./LanguagePicker";
import { languageNames } from "../i18n/languages";

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
  expect(screen.getAllByRole("radio")).toHaveLength(languageNames.length + 1);

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

test("search finds a language by its native name or locale and persists the choice", async () => {
  let reloads = 0;
  render(<LanguagePicker reload={() => reloads++} />);
  await act(async () => fireEvent.change(screen.getByRole("searchbox"), { target: { value: "francais" } }));
  expect(screen.getByRole("radio", { name: "Français" })).toBeTruthy();
  expect(screen.queryByRole("radio", { name: "English" })).toBeNull();
  await act(async () => fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ja" } }));
  await act(async () => fireEvent.click(screen.getByRole("radio", { name: "日本語" })));
  expect(localStorage.getItem("canto.language")).toBe("ja");
  expect(reloads).toBe(1);
});
