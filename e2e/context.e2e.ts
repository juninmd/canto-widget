import { expect, test, type Page } from "@playwright/test";
import { calls, mockTauri } from "./mock";

const DAY = new Date().toLocaleDateString("sv-SE");
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
  task("t1", "Mandar o relatório da semana", { context: { kind: "app", name: "Slack" } }),
  task("t2", "Imprimir o contrato", { context: { kind: "wifi", name: "Escritorio" } }),
  task("t3", "Responder o time", { hora: "10:30" }),
  task("t4", "Preparar a retro"),
];
const NOTES = [
  { id: "n1", title: "Retro da sprint", body: "o que funcionou", tags: ["time"], created_at: 1, updated_at: 2 },
  { id: "n2", title: "Ideias de onboarding", body: "- checklist", tags: ["ux"], created_at: 1, updated_at: 1 },
];
const SOON = new Date(Date.now() + 3_600_000);
const EVENT = {
  id: "e1",
  title: "Retro com o time",
  start: SOON.toISOString(),
  end: new Date(SOON.getTime() + 3_600_000).toISOString(),
  all_day: false,
  location: "",
  meet: "",
  link: "",
};
const TRANSCRIPT = { name: "retro-da-sprint.md", modified_at: Date.now() - 86_400_000, size: 120, preview: "decisões da retro" };

test.beforeEach(({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

const shot = (page: Page, name: string) =>
  process.env.SHOT_DIR ? page.screenshot({ path: `${process.env.SHOT_DIR}/${name}.png` }) : undefined;

test("context reminders: pick an app and a Wi-Fi from the details, see where each task waits", async ({ page }) => {
  await mockTauri(page, { fixed: { tasks_for_day: TASKS } });
  await page.goto("/");
  await expect(page.getByText("ao abrir Slack")).toBeVisible();
  await expect(page.getByText("no Wi-Fi Escritorio")).toBeVisible();
  await expect(page.getByText("ao abrir Slack")).toHaveCount(1);

  await page.getByRole("button", { name: "horário, repetição, prioridade e PR de Responder o time" }).click();
  const kind = page.getByLabel("onde lembrar Responder o time");
  await expect(kind).toHaveValue("");
  await expect(page.getByLabel("nome do app ou da rede de Responder o time")).toHaveCount(0);
  await kind.selectOption("app");
  const name = page.getByLabel("nome do app ou da rede de Responder o time");
  await name.fill("  Outlook ");
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => (await calls(page)).filter((c) => c.cmd === "task_set_context").map((c) => c.args))
    .toEqual([{ id: "t3", context: { kind: "app", name: "Outlook" } }]);
  await name.scrollIntoViewIfNeeded();
  await shot(page, "lembrete-por-contexto");

  // The fixture is static, so clearing is shown on a task that already waits for an app.
  await page.getByRole("button", { name: "horário, repetição, prioridade e PR de Mandar o relatório da semana" }).click();
  const slack = page.getByLabel("onde lembrar Mandar o relatório da semana");
  await expect(slack).toHaveValue("app");
  await expect(page.getByLabel("nome do app ou da rede de Mandar o relatório da semana")).toHaveValue("Slack");
  await slack.selectOption("");
  await expect
    .poll(async () => (await calls(page)).filter((c) => c.cmd === "task_set_context").map((c) => c.args))
    .toEqual([
      { id: "t3", context: { kind: "app", name: "Outlook" } },
      { id: "t1", context: null },
    ]);
});

test("global search: tasks, agenda, notes, transcripts and clipboard answer together and each jumps to its tab", async ({ page }) => {
  await mockTauri(page, {
    notes: NOTES,
    fixed: { tasks_for_day: TASKS, agenda_today: [EVENT], transcripts_list: [TRANSCRIPT], transcripts_dir: "~/Reuniões" },
  });
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("searchbox", { name: "busca global" });
  await search.fill("retro");

  await expect(page.getByRole("button", { name: "tarefas de hoje →" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preparar a retro", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "agenda de hoje →" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retro com o time" })).toBeVisible();
  await expect(page.getByRole("button", { name: "transcrições →" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retro da sprint" })).toBeVisible();
  await shot(page, "busca-global-fontes");

  await search.press("ArrowDown");
  await expect(page.getByRole("button", { name: "tarefas de hoje →" })).toBeFocused();

  await page.getByRole("button", { name: "retro-da-sprint.md" }).click();
  await expect(page.getByRole("tab", { name: "Agenda" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("buscar nas transcrições")).toHaveValue("retro");
  await expect(page.getByText("retro-da-sprint.md")).toBeVisible();
  await shot(page, "busca-global-transcricao");
});
