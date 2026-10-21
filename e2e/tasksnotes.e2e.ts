import { expect, test, type Page } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const DAY = "2026-09-09";
const task = (id: string, title: string, extra: Record<string, unknown> = {}) => ({
  id,
  title,
  done: false,
  day: DAY,
  created_at: 1,
  updated_at: 1,
  ...extra,
});
const TASKS = [
  task("t1", "Revisar o PR", { priority: "high", hora: "10:30" }),
  task("t2", "Pagar a conta", { priority: "low" }),
  task("t3", "Enviar o relatório", { done: true }),
];
const NOTES = [
  { id: "n1", title: "Ideias de onboarding", body: "- checklist", tags: ["produto", "ux"], fixada: true, created_at: 1, updated_at: 3 },
  { id: "n2", title: "Retro da sprint", body: "o que funcionou", tags: ["time"], created_at: 1, updated_at: 2 },
  { id: "n3", title: "Comandos do git", body: "git log", tags: ["dev", "produto"], created_at: 1, updated_at: 1 },
];

test.beforeEach(({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

async function openApp(page: Page) {
  await mockTauri(page, { notes: NOTES, fixed: { tasks_for_day: TASKS } });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
}

test("tasks: ring, segmented priority filter, menu and folded done group", async ({ page }) => {
  await openApp(page);
  await expect(page.getByRole("progressbar", { name: "1/3 concluídas" })).toBeVisible();
  await expect(page.getByText("1 de 3")).toBeVisible();

  const filter = page.getByRole("group", { name: "filtrar por prioridade" });
  await filter.getByRole("button", { name: "baixa" }).click();
  await expect(page.getByText("Pagar a conta").last()).toBeVisible();
  await expect(page.getByText("Revisar o PR")).toHaveCount(0);
  await filter.getByRole("button", { name: "todas" }).click();

  const done = page.getByRole("button", { name: "concluídas · 1" });
  await expect(done).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Enviar o relatório")).toHaveCount(0);
  await done.click();
  await expect(page.getByText("Enviar o relatório")).toBeVisible();

  const menu = page.getByRole("button", { name: "ações da lista" });
  await menu.click();
  await expect(page.getByRole("menuitem", { name: "resumo do dia" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "puxar pendências" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(menu).toBeFocused();
});

test("tasks: shortcut chips write the quick-add tokens", async ({ page }) => {
  await openApp(page);
  const field = page.getByPlaceholder(/nova tarefa/);
  await field.fill("Daily");
  const chips = page.getByRole("group", { name: "atalhos de digitação" });
  await chips.getByRole("button", { name: "!média" }).click();
  await chips.getByRole("button", { name: "hora" }).click();
  await expect(field).toHaveValue("Daily !média 9:00");
  await field.press("Enter");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "task_set_priority")).toBe(true);
  const sent = await calls(page);
  expect(sent.find((c) => c.cmd === "task_set_priority")?.args.priority).toBe("medium");
  expect(sent.find((c) => c.cmd === "task_set_schedule")?.args.time).toBe("09:00");
});

test("notes: tag chips filter like #tag, the grid choice survives a reload", async ({ page }) => {
  await openApp(page);
  await goTab(page, "Notas");
  const tags = page.getByRole("group", { name: "filtrar por tag" });
  await expect(tags.getByRole("button", { name: "#produto, 2 cards" })).toBeVisible();
  await expect(page.getByText("fixadas")).toBeVisible();
  await expect(page.getByText("recentes")).toBeVisible();

  await tags.getByRole("button", { name: "#produto, 2 cards" }).click();
  await expect(page.getByRole("searchbox", { name: "buscar notas" })).toHaveValue("#produto");
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "notes_search" && c.args.query === "#produto")).toBe(true);

  await page.getByRole("button", { name: "grade" }).click();
  await expect(page.getByRole("button", { name: "grade" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => localStorage.getItem("canto.notesView"))).toBe("grid");
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(sideways).toBe(false);

  await page.reload();
  await goTab(page, "Notas");
  await expect(page.getByRole("button", { name: "grade" })).toHaveAttribute("aria-pressed", "true");
});
