import { expect, test } from "@playwright/test";
import { calls, mockTauri } from "./mock";

test.beforeEach(({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

test("an unlocked vault shows the tab bar", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  const bar = page.getByRole("tablist");
  for (const label of ["Tarefas", "Notas", "Clipboard", "Ajustes"]) {
    await expect(bar.getByRole("tab", { name: label })).toBeVisible();
  }
  await expect(bar.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
});

test("adding a task calls task_add and the task survives a reload", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  await page.getByPlaceholder("nova tarefa (ex.: Daily às 9h30)").fill("Revisar relatório fictício");
  await page.getByRole("button", { name: "adicionar tarefa" }).click();
  await expect(page.getByText("Revisar relatório fictício")).toBeVisible();
  const added = (await calls(page)).find((c) => c.cmd === "task_add");
  expect(added?.args.title).toBe("Revisar relatório fictício");
  await page.reload();
  await expect(page.getByText("Revisar relatório fictício")).toBeVisible();
});

test("Alt+2 and a click switch tabs", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Alt+2");
  await expect(page.getByRole("tab", { name: "Notas" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByPlaceholder("buscar em títulos, corpo e #tag")).toBeVisible();
  await page.getByRole("tab", { name: "Clipboard" }).click();
  await expect(page.getByRole("tab", { name: "Clipboard" })).toHaveAttribute("aria-selected", "true");
});

test("a locked vault asks for the master password", async ({ page }) => {
  await mockTauri(page, { unlocked: false });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Cofre trancado" })).toBeVisible();
  await expect(page.getByPlaceholder("senha mestra")).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
});

test("the Status API tab lists the services from api_status", async ({ page }) => {
  await mockTauri(page, {
    hiddenTabs: ["gitlab"],
    statuses: [
      {
        id: "exemplo",
        label: "Serviço Exemplo",
        items: [{ title: "Lentidão na API fictícia", link: "https://status.example.com/i/1", published_at: Date.now() - 3_600_000 }],
        error: null,
      },
      { id: "outro", label: "Outro Serviço", items: [], error: null },
    ],
  });
  await page.goto("/");
  await page.getByRole("tab", { name: "Status API" }).click();
  await expect(page.getByText("1 com problema · 1 operacionais")).toBeVisible();
  await expect(page.getByText("Serviço Exemplo")).toBeVisible();
  await expect(page.getByText("Outro Serviço")).toBeVisible();
  await expect(page.getByText("sem incidentes")).toBeVisible();
  await expect(page.getByText("incidente recente")).toBeVisible();
});

test("English can be chosen and is pushed to Rust", async ({ page }) => {
  await mockTauri(page, { language: "en" });
  await page.goto("/");
  const bar = page.getByRole("tablist");
  await expect(bar.getByRole("tab", { name: "Tasks" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect((await calls(page)).find((c) => c.cmd === "language_set")?.args).toEqual({ lang: "en" });
});

test("with no choice saved, an English system gets the English UI", async ({ page }) => {
  await mockTauri(page, { language: null });
  await page.goto("/");
  await expect(page.getByRole("tablist").getByRole("tab", { name: "Notes" })).toBeVisible();
});
