import { expect, test } from "bun:test";
import { fuzzyScore, rankCommands, type PaletteCommand } from "./palette";

const cmd = (id: string, title: string, keywords?: string[]): PaletteCommand => ({ id, title, keywords, run: () => {} });
const ids = (list: PaletteCommand[]) => list.map((c) => c.id);

const COMMANDS = [
  cmd("tab.notes", "Ir para Notas"),
  cmd("note.new", "Nova nota"),
  cmd("task.new", "Nova tarefa"),
  cmd("settings", "Abrir ajustes", ["configurações"]),
  cmd("lock", "Trancar o cofre"),
];

test("an empty query lists everything in registration order", () => {
  expect(ids(rankCommands(COMMANDS, "  "))).toEqual(ids(COMMANDS));
});

test("a prefix beats a word start, which beats a scattered subsequence", () => {
  expect(ids(rankCommands(COMMANDS, "nova"))).toEqual(["note.new", "task.new"]);
  expect(ids(rankCommands(COMMANDS, "notas"))[0]).toBe("tab.notes");
  expect(fuzzyScore("tra", "Trancar o cofre")!).toBeGreaterThan(fuzzyScore("cof", "Trancar o cofre")!);
  expect(fuzzyScore("cof", "Trancar o cofre")!).toBeGreaterThan(fuzzyScore("tcf", "Trancar o cofre")!);
});

test("typing initials finds the command, ignoring accents and case", () => {
  expect(ids(rankCommands(COMMANDS, "ntrf"))).toEqual(["task.new"]);
  expect(ids(rankCommands(COMMANDS, "CONFIGURACOES"))).toEqual(["settings"]);
});

test("letters out of order don't match", () => {
  expect(fuzzyScore("fct", "Trancar o cofre")).toBeNull();
  expect(rankCommands(COMMANDS, "xyz")).toEqual([]);
});

test("a keyword hit ranks just below the same hit on a title", () => {
  const list = [cmd("a", "Tema", ["Ajustes"]), cmd("b", "Ajustes")];
  expect(ids(rankCommands(list, "ajustes"))).toEqual(["b", "a"]);
});
