import { test } from "@playwright/test";
import { shoot } from "./out";
import { fullScene, openTab } from "./scene";
import { settle } from "./stage";

test("tasks: the current task, its timer and the day grouped", async ({ browser }) => {
  const page = await fullScene(browser);
  await settle(page, 900);
  await shoot(page, "tasks");
});

test("tasks: one task opened with subtasks, priority and PR", async ({ browser }) => {
  const page = await fullScene(browser);
  const title = "Responder o time sobre a estimativa da migração";
  await page.getByRole("button", { name: `horário, repetição, prioridade e PR de ${title}` }).click({ force: true, timeout: 5000 });
  await settle(page, 900);
  await shoot(page, "tasks-details");
});

test("agenda: today", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Agenda");
  await shoot(page, "agenda-today");
});

test("notes: cards", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Notas");
  await shoot(page, "notes");
});

test("clipboard: types and a giant copy", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Clipboard");
  await shoot(page, "clipboard");
});

test("github: summary strip, radar and CI badges", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "GitHub");
  await shoot(page, "github");
});

test("gitlab: the same strip on self-hosted", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "GitLab");
  await shoot(page, "gitlab");
});

test("status API: services grid", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Status API");
  await shoot(page, "status");
});

test("AI models", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Modelos IA");
  await shoot(page, "models");
});

test("activity: the day", async ({ browser }) => {
  const page = await fullScene(browser, { now: new Date(2026, 9, 9, 17, 40) });
  await openTab(page, "Atividade", 1400);
  await shoot(page, "activity");
});
