import { expect, test, type Page } from "@playwright/test";
import { calls, mockTauri } from "./mock";

const NOTE = { id: "n1", title: "Lista fictícia", body: "comprar pão", tags: [], created_at: 1, updated_at: 1 };
// 1x1 PNG, generated for the test; nothing real.
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

test.beforeEach(({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});

async function openNote(page: Page, body = NOTE.body) {
  await mockTauri(page, { notes: [{ ...NOTE, body }], images: { e2e0: `data:image/png;base64,${PNG}` } });
  await page.goto("/");
  // The shortcuts listen only once the app has rendered; a key pressed earlier is lost.
  await expect(page.getByRole("tab", { name: "Tarefas" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Alt+2");
  await page.getByText("Lista fictícia").click();
  const editor = page.getByRole("textbox", { name: "conteúdo do card" });
  await expect(editor).toBeVisible();
  return editor;
}

async function savedBody(page: Page) {
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "note_save")).toBe(true);
  return (await calls(page)).find((c) => c.cmd === "note_save")?.args.body;
}

/** Lets rAF-scheduled editor work (TipTap's delayed focus, ProseMirror's selection read) run first. */
async function nextFrames(page: Page) {
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(null)))));
}

/** End right after a toolbar click is sometimes dropped at automation speed; retry until the caret sits at the line end. */
async function caretToLineEnd(page: Page) {
  await expect(async () => {
    await page.keyboard.press("End");
    const atEnd = await page.evaluate(() => {
      const s = getSelection();
      return !!s?.focusNode && s.isCollapsed && s.focusOffset === (s.focusNode.textContent?.length ?? -1);
    });
    expect(atEnd).toBe(true);
  }).toPass({ timeout: 5000 });
}

test("formatting with the bar and markdown shortcuts saves the expected markdown", async ({ page }) => {
  const editor = await openNote(page);
  await editor.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Shift+Home");
  await page.getByRole("button", { name: "lista de tarefas" }).click();
  await page.getByRole("button", { name: "negrito" }).click();
  await expect(page.getByRole("button", { name: "negrito" })).toHaveAttribute("aria-pressed", "true");
  await caretToLineEnd(page);
  // Enter on the empty item leaves the checklist, like any editor.
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.keyboard.type("## Receita\n");
  await page.keyboard.type("```ts\nconst sal = 1;");
  await page.keyboard.press("Control+Enter");
  expect(await savedBody(page)).toBe("- [ ] **comprar pão**\n\n## Receita\n\n```ts\nconst sal = 1;\n```");
});

test("a checklist item ticks right in the editor and the link bar only takes http(s)", async ({ page }) => {
  const editor = await openNote(page, "- [ ] leite\n- [ ] pão\n\nveja o site");
  await page.getByRole("checkbox", { name: "pão" }).click();
  await expect(page.getByRole("checkbox", { name: "pão" })).toBeChecked();
  // The tick refocuses the editor on the next frame and restores its old selection; select only after that.
  await nextFrames(page);
  await editor.getByText("veja o site").dblclick();
  await expect.poll(() => page.evaluate(() => getSelection()?.toString())).toBe("site");
  await nextFrames(page);
  await page.keyboard.press("Control+k");
  const url = page.getByRole("textbox", { name: "endereço do link" });
  await url.fill("javascript:alert(1)");
  await url.press("Enter");
  await expect(page.getByRole("alert").filter({ hasText: "http" })).toHaveText("use um endereço http:// ou https://");
  await url.fill("https://exemplo.com");
  await url.press("Enter");
  await expect(editor.locator("a")).toHaveAttribute("href", "https://exemplo.com");
  await page.getByRole("button", { name: "salvar" }).click();
  expect(await savedBody(page)).toBe("- [ ] leite\n- [x] pão\n\nveja o [site](https://exemplo.com)");
});

test("attaching an image inserts it at the cursor and the raw markdown mode shows the reference", async ({ page }) => {
  const editor = await openNote(page);
  await editor.click();
  await caretToLineEnd(page);
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "anexar imagem" }).click();
  await (await chooser).setFiles({ name: "print.png", mimeType: "image/png", buffer: Buffer.from(PNG, "base64") });
  await expect(editor.getByRole("img", { name: "imagem" })).toHaveAttribute("src", /^data:image\/png;base64,/);
  await page.getByRole("button", { name: "editar o markdown" }).click();
  await expect(page.getByRole("textbox", { name: "markdown do card" })).toHaveValue("comprar pão![](canto-img:e2e0)");
  await page.keyboard.press("Control+Enter");
  expect(await savedBody(page)).toBe("comprar pão![](canto-img:e2e0)");
  expect((await calls(page)).some((c) => c.cmd === "note_image_save")).toBe(true);
});
