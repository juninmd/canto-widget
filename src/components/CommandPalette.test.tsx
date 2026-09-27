import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CommandPalette from "./CommandPalette";
import { useShortcuts } from "../lib/shortcuts";
import type { PaletteCommand } from "../lib/palette";

afterEach(cleanup);

const ran: string[] = [];
const cmd = (id: string, title: string): PaletteCommand => ({ id, title, run: () => void ran.push(id) });
const COMMANDS = [cmd("tab.tasks", "Ir para Tarefas"), cmd("note.new", "Nova nota"), cmd("task.new", "Nova tarefa"), cmd("lock", "Trancar o cofre")];

/** Same wiring as App: the shortcut toggles it, and running closes it before the action. */
function Host() {
  const [open, setOpen] = useState(false);
  useShortcuts(true, (a) => a.type === "palette" && setOpen((v) => !v));
  return (
    <>
      <button type="button">antes</button>
      {open && (
        <CommandPalette
          commands={COMMANDS}
          onClose={() => setOpen(false)}
          onRun={(c) => {
            setOpen(false);
            void c.run();
          }}
        />
      )}
    </>
  );
}

function openPalette() {
  fireEvent.keyDown(window, { key: "P", code: "KeyP", ctrlKey: true, shiftKey: true });
  return screen.getByRole("combobox", { name: "paleta de comandos" });
}

test("Ctrl+Shift+P opens it, typing filters, Enter runs the top match and closes", () => {
  ran.length = 0;
  render(<Host />);
  const input = openPalette();
  expect(screen.getByRole("dialog", { name: "paleta de comandos" })).toBeTruthy();
  expect(document.activeElement).toBe(input);
  expect(screen.getAllByRole("option").length).toBe(4);

  fireEvent.change(input, { target: { value: "nova" } });
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Nova nota", "Nova tarefa"]);

  fireEvent.keyDown(input, { key: "ArrowDown" });
  const selected = screen.getByRole("option", { selected: true });
  expect(selected.textContent).toBe("Nova tarefa");
  expect(input.getAttribute("aria-activedescendant")).toBe(selected.id);

  fireEvent.keyDown(input, { key: "Enter" });
  expect(ran).toEqual(["task.new"]);
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("arrows wrap around and a query with no match says so", () => {
  render(<Host />);
  const input = openPalette();
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(screen.getByRole("option", { selected: true }).textContent).toBe("Trancar o cofre");
  fireEvent.change(input, { target: { value: "xyz" } });
  expect(screen.queryAllByRole("option").length).toBe(0);
  expect(screen.getByText("nenhuma ação com esse nome")).toBeTruthy();
});

test("Esc closes it and gives focus back to where the user was", () => {
  ran.length = 0;
  render(<Host />);
  const before = screen.getByRole("button", { name: "antes" });
  before.focus();
  const input = openPalette();
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(before);
  expect(ran).toEqual([]);
});

test("clicking an option runs it", () => {
  ran.length = 0;
  render(<Host />);
  openPalette();
  fireEvent.click(screen.getByRole("option", { name: /Trancar/ }));
  expect(ran).toEqual(["lock"]);
});
