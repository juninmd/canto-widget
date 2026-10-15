import { expect, test } from "@playwright/test";
import { ALERTS_AT, MEETING } from "./data-alerts";
import { shoot } from "./out";
import { fullScene, openTab } from "./scene";
import { openScene, settle } from "./stage";

const DAY = 86_400_000;
const AVAILABLE = { current: "0.25.0", latest: "0.25.1", available: true, notes: "", date: "2026-10-09" };

test("notes: the editor (waits for the lazy chunk)", async ({ browser }) => {
  const page = await fullScene(browser);
  await openTab(page, "Notas");
  await page.getByText("Retro da sprint 42").first().click();
  await expect(page.locator(".ProseMirror")).toBeVisible();
  await settle(page, 1200);
  await shoot(page, "note-editor");
});

test("tasks: the weekly report", async ({ browser }) => {
  const page = await fullScene(browser, { now: new Date(2026, 9, 9, 17, 40) });
  await page.getByRole("button", { name: "resumo do dia" }).click();
  await page.getByRole("button", { name: "semana" }).click();
  await settle(page, 1000);
  await shoot(page, "report-week");
});

test("do not disturb: the moon in the header", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: { dnd_get: { active: true, untilMs: new Date(2026, 9, 9, 12, 0).getTime() } } });
  await settle(page, 1000);
  await shoot(page, "dnd");
});

test("updates: a new version is waiting", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: { update_check: AVAILABLE } });
  await settle(page, 7000);
  await shoot(page, "update-toast");
  await openTab(page, "Ajustes");
  await page.locator("#updates-title").evaluate((el) => (el.closest("section, fieldset") ?? el).scrollIntoView({ block: "start" }));
  await settle(page, 600);
  await shoot(page, "settings-updates");
});

test("github: connect with a token or from the browser", async ({ browser }) => {
  const page = await fullScene(browser, { fixed: { github_status: { connected: false, login: "", source: "", device_flow: true } } });
  await openTab(page, "GitHub");
  await shoot(page, "github-connect");
});

test("tabs: the ones that do not fit wait in a menu", async ({ browser }) => {
  const page = await fullScene(browser);
  await page.getByRole("button", { name: /^mais/ }).click();
  await settle(page, 700);
  await shoot(page, "tabs-more");
});

test("shortcuts help", async ({ browser }) => {
  const page = await fullScene(browser);
  await page.keyboard.press("Shift+?");
  await settle(page, 700);
  await shoot(page, "shortcuts");
});

test("alert: the snooze menu", async ({ browser }) => {
  const page = await openScene(browser, { path: "/?alert", now: ALERTS_AT, width: 420, height: 380, fixed: { alert_payload: [MEETING] } });
  await settle(page, 900);
  await page.getByRole("button", { name: "mais opções de adiar" }).click();
  await settle(page, 700);
  await shoot(page, "alert-snooze");
});

test("agenda: meetings, notes and transcripts in one list", async ({ browser }) => {
  const page = await fullScene(browser, {
    fixed: {
      transcripts_list: [
        { name: "Planejamento da sprint.vtt", modified_at: Date.now() - DAY, size: 48_000, preview: "Ana: vamos começar pelos bloqueios da sprint anterior..." },
        { name: "Retro da sprint 42.md", modified_at: Date.now() - 3 * DAY, size: 12_000, preview: "O que funcionou: revisões em até 24 h e deploys menores." },
        { name: "1:1 com a liderança.txt", modified_at: Date.now() - 6 * DAY, size: 9_000, preview: "Combinamos a meta do trimestre e o plano de carreira." },
      ],
      gemini_docs: [{ meeting: "Revisão de arquitetura", start: "2026-10-08T14:00:00-03:00", title: "Anotações do Gemini", url: "https://docs.google.com/document/d/demo" }],
    },
  });
  await openTab(page, "Agenda");
  await page.getByRole("button", { name: "Reuniões" }).click();
  await settle(page, 1000);
  await shoot(page, "agenda-meetings");
});

test("language: the interface in English", async ({ browser }) => {
  const page = await fullScene(browser, { language: "en" });
  await settle(page, 900);
  await shoot(page, "english");
});
