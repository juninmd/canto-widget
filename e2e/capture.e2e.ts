import { expect, test } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** The capture window loads the same bundle with `?capture`; the save goes through the mocked IPC. */
test("quick capture saves a task for today from the keyboard and closes", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/?capture");

  const field = page.getByRole("textbox", { name: "captura rápida" });
  await expect(field).toBeFocused();
  await field.fill("Revisar o orçamento");
  await field.press("Enter");

  await expect.poll(async () => (await calls(page)).map((c) => c.cmd)).toContain("capture_close");
  const sent = (await calls(page)).find((c) => c.cmd === "task_add");
  expect(sent?.args).toMatchObject({ title: "Revisar o orçamento" });
  if (process.env.SHOT) {
    await page.setViewportSize({ width: 400, height: 150 });
    await field.fill("Ligar para o dentista");
    await page.screenshot({ path: process.env.SHOT });
  }
});

test("Ctrl+Enter saves a note and Esc closes without saving", async ({ page }) => {
  await mockTauri(page);
  await page.goto("/?capture");

  const field = page.getByRole("textbox", { name: "captura rápida" });
  await field.fill("Trilha do sprint 12");
  await field.press("Control+Enter");
  await expect.poll(async () => (await calls(page)).map((c) => c.cmd)).toContain("note_save");

  await field.fill("rascunho");
  await field.press("Escape");
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "capture_close").length).toBe(2);
  expect((await calls(page)).map((c) => c.cmd)).not.toContain("task_add");
});
