import { expect, test } from "bun:test";
import { Glob } from "bun";
import { parseQuickTask } from "./quickAdd";
import { insertPriority, insertTime, TIME_TOKEN } from "./quickAddTokens";

test("a priority token is appended after the title and selected for the caller", () => {
  const edit = insertPriority("Daily", "!alta");
  expect(edit).toEqual({ value: "Daily !alta", start: 6, end: 11 });
  expect(parseQuickTask(edit.value)).toEqual({ title: "Daily", time: null, priority: "high" });
});

test("an empty field takes the bare token and trailing spaces do not double up", () => {
  expect(insertPriority("", "!baixa").value).toBe("!baixa");
  expect(insertPriority("Daily   ", "!média").value).toBe("Daily !média");
});

test("a second priority replaces the first instead of stacking two", () => {
  const edit = insertPriority("Daily !alta", "!baixa");
  expect(edit.value).toBe("Daily !baixa");
  expect(parseQuickTask(edit.value).priority).toBe("low");
});

test("the time token lands after the text, selected, and parses as 09:00", () => {
  const edit = insertTime("Daily")!;
  expect(edit.value).toBe(`Daily ${TIME_TOKEN}`);
  expect(edit.value.slice(edit.start, edit.end)).toBe(TIME_TOKEN);
  expect(parseQuickTask(edit.value)).toEqual({ title: "Daily", time: "09:00" });
});

test("a line that already has a time is left alone, since the parser reads only the first", () => {
  expect(insertTime("Daily às 14h30")).toBeNull();
});

test("the Spanish and English spellings of the priorities are understood by the parser", () => {
  expect(parseQuickTask("x !baja").priority).toBe("low");
  expect(parseQuickTask("x !media").priority).toBe("medium");
  expect(parseQuickTask("x !high").priority).toBe("high");
});

test("every language's shortcut chip token is a priority the quick-add parser reads", async () => {
  const files = [...new Glob("../i18n/*/uiTasksNotes.ts").scanSync({ cwd: import.meta.dir })];
  expect(files.length).toBeGreaterThanOrEqual(3);
  const expected = { high: "high", medium: "medium", low: "low" } as const;
  for (const file of files) {
    const catalog = (await import(`${import.meta.dir}/${file}`)).uiTasksNotes as Record<string, string>;
    for (const [key, priority] of Object.entries(expected)) {
      const token = catalog[`uiTasksNotes.chip.${key}`]!;
      expect(parseQuickTask(`tarefa ${token}`).priority, `${file} ${key}`).toBe(priority);
    }
  }
});
