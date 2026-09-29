import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Editor } from "@tiptap/core";

const saved: unknown[] = [];
const opened: string[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    if (cmd === "note_image_save") saved.push(args?.data);
    if (cmd === "open_link") opened.push(args?.url as string);
    if (cmd === "note_image_get") return Promise.resolve("data:image/png;base64,QUI=");
    return Promise.resolve(cmd === "note_image_save" ? "f00d" : null);
  },
}));

const { default: NoteEditor } = await import("./NoteEditor");
type Draft = import("./NoteEditor").Draft;

beforeEach(() => {
  opened.length = 0;
});
afterEach(cleanup);

const base: Draft = { id: undefined, title: "t", body: "**forte** e um texto normal", tags: "", link: null };

/** Holds the draft like NotesTab does, so the editor sees its own changes come back as props. */
function mount(body: string, extra: Partial<Draft> = {}) {
  const changes: Draft[] = [];
  const saves: Draft[] = [];
  let cancelled = 0;
  function Harness() {
    const [draft, setDraft] = useState<Draft>({ ...base, body, ...extra });
    return (
      <NoteEditor
        draft={draft}
        tasks={[{ id: "t1", title: "comprar leite", done: false, day: "2026-09-09", created_at: 1, updated_at: 1 }]}
        agenda={[]}
        onChange={(d) => {
          changes.push(d);
          setDraft(d);
        }}
        onSave={(d) => void saves.push(d)}
        onCancel={() => cancelled++}
      />
    );
  }
  render(<Harness />);
  const box = screen.getByRole("textbox", { name: "conteúdo do card" });
  const editor = (box as unknown as { editor: Editor }).editor;
  return { changes, saves, box, editor, cancelled: () => cancelled, body: () => changes.at(-1)?.body };
}

/** Selects the first occurrence of `text`, as a user dragging over it would. */
function select(editor: Editor, text: string) {
  let from = -1;
  editor.state.doc.descendants((node, pos) => {
    if (from < 0 && node.isText && node.text!.includes(text)) from = pos + node.text!.indexOf(text);
  });
  act(() => void editor.commands.setTextSelection({ from, to: from + text.length }));
}

const click = (name: string) => act(() => void fireEvent.click(screen.getByRole("button", { name })));

test("the body opens formatted, with no raw markdown and no write/preview tabs", () => {
  const { box } = mount("# compras\n\n**forte**\n\n- [x] pão");
  expect(box.querySelector("h1")?.textContent).toBe("compras");
  expect(box.querySelector("strong")?.textContent).toBe("forte");
  expect((screen.getByRole("checkbox", { name: "pão" }) as HTMLInputElement).checked).toBe(true);
  expect(box.textContent).not.toContain("**");
  expect(screen.queryByRole("button", { name: "visualizar" })).toBeNull();
});

test.each([
  ["negrito", "um **texto**"],
  ["itálico", "um *texto*"],
  ["código", "um `texto`"],
  ["título", "## um texto"],
  ["lista", "- um texto"],
  ["lista numerada", "1. um texto"],
  ["lista de tarefas", "- [ ] um texto"],
  ["bloco de código", "```\num texto\n```"],
])("the %s button writes the matching markdown", async (button, expected) => {
  const { editor, body } = mount("um texto");
  select(editor, "texto");
  click(button);
  expect(screen.getByRole("button", { name: button }).getAttribute("aria-pressed")).toBe("true");
  await waitFor(() => expect(body()).toBe(expected));
});

test("ticking a checklist item right in the editor updates the markdown", async () => {
  const { body } = mount("- [ ] leite\n- [ ] pão");
  act(() => void fireEvent.click(screen.getByRole("checkbox", { name: "pão" })));
  await waitFor(() => expect(body()).toBe("- [ ] leite\n- [x] pão"));
});

test("Ctrl+Enter saves the latest body even before the debounced change fires", () => {
  const { editor, saves, box } = mount("um texto");
  select(editor, "texto");
  click("negrito");
  act(() => void fireEvent.keyDown(box, { key: "Enter", ctrlKey: true }));
  expect(saves.at(-1)?.body).toBe("um **texto**");
});

test("Esc cancels without emitting a pending edit", async () => {
  const { editor, box, changes, cancelled } = mount("um texto");
  select(editor, "texto");
  click("negrito");
  act(() => void fireEvent.keyDown(box, { key: "Escape" }));
  expect(cancelled()).toBe(1);
  await new Promise((r) => setTimeout(r, 200));
  expect(changes).toEqual([]);
});

test("Ctrl+K on a selection sets an http(s) link and refuses other schemes", async () => {
  const { editor, box, body } = mount("veja o site");
  const global: string[] = [];
  const listener = (e: KeyboardEvent) => global.push(e.code);
  window.addEventListener("keydown", listener);
  select(editor, "site");
  act(() => void fireEvent.keyDown(box, { key: "k", code: "KeyK", ctrlKey: true }));
  window.removeEventListener("keydown", listener);
  // The app-wide Ctrl+K (global search) must not fire on top of the link field.
  expect(global).toEqual([]);
  const url = screen.getByRole("textbox", { name: "endereço do link" });
  act(() => void fireEvent.change(url, { target: { value: "javascript:alert(1)" } }));
  act(() => void fireEvent.keyDown(url, { key: "Enter" }));
  expect(screen.getByRole("alert").textContent).toBe("use um endereço http:// ou https://");
  act(() => void fireEvent.change(url, { target: { value: "https://exemplo.com" } }));
  act(() => void fireEvent.keyDown(url, { key: "Enter" }));
  await waitFor(() => expect(body()).toBe("veja o [site](https://exemplo.com)"));
});

test("a link never navigates on click; Ctrl+click opens it through the validated command", () => {
  const { box } = mount("veja [o site](https://exemplo.com)");
  const link = box.querySelector("a")!;
  const plain = new MouseEvent("click", { bubbles: true, cancelable: true });
  act(() => void link.dispatchEvent(plain));
  expect(plain.defaultPrevented).toBe(true);
  expect(opened).toEqual([]);
  act(() => void fireEvent.click(link, { ctrlKey: true }));
  expect(opened).toEqual(["https://exemplo.com"]);
});

test("the markdown toggle shows the raw text and edits there come back to the editor", async () => {
  const { box, saves } = mount("**forte**");
  click("editar o markdown");
  const raw = screen.getByRole("textbox", { name: "markdown do card" }) as HTMLTextAreaElement;
  expect(raw.value).toBe("**forte**");
  act(() => void fireEvent.change(raw, { target: { value: "# novo" } }));
  click("editar o markdown");
  const rich = screen.getByRole("textbox", { name: "conteúdo do card" });
  expect(rich.querySelector("h1")?.textContent).toBe("novo");
  act(() => void fireEvent.keyDown(rich, { key: "Enter", ctrlKey: true }));
  expect(saves.at(-1)?.body).toBe("# novo");
  expect(box.isConnected).toBe(true);
});

test("an edit past the 100 000 character limit is refused with a warning", async () => {
  const { editor, body } = mount("a".repeat(99_999));
  act(() => void editor.commands.insertContentAt(editor.state.doc.content.size - 1, "bcd"));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain("100.000");
  expect(editor.getText().length).toBe(99_999);
  expect(body()).toBeUndefined();
});

test("pasting an image stores it and inserts the image node at the cursor", async () => {
  const { box, editor, body } = mount("oi");
  act(() => void editor.commands.setTextSelection(3));
  const file = new File([new Uint8Array([0x47, 0x49, 0x46])], "print.gif", { type: "image/gif" });
  fireEvent.paste(box, { clipboardData: { files: [file], getData: () => "", types: ["Files"] } });
  await waitFor(() => expect(body()).toBe("oi![](canto-img:f00d)"));
  expect(saved.at(-1)).toBe("R0lG");
  expect(await screen.findByRole("img", { name: "imagem" })).toBeTruthy();
});

test("picking an unsupported file through the button shows the error instead of inserting", async () => {
  const { changes } = mount("x");
  expect(screen.getByRole("button", { name: "anexar imagem" })).toBeTruthy();
  const bmp = new File(["BM"], "a.bmp", { type: "image/bmp" });
  fireEvent.change(screen.getByLabelText("anexar imagem", { selector: "input" }), { target: { files: [bmp] } });
  expect((await screen.findByRole("alert")).textContent).toContain("formato de imagem não suportado");
  expect(changes).toEqual([]);
});

test("picking a task from the link picker sets the link, and it can be removed", () => {
  const { changes } = mount("x");
  click("vincular a uma tarefa ou evento");
  click("✓ comprar leite");
  expect(changes.at(-1)?.link).toEqual({ kind: "task", id: "t1", label: "comprar leite" });
  click("desvincular");
  expect(changes.at(-1)?.link).toBeNull();
});

test("Esc inside the link picker closes only the picker, not the whole note", () => {
  const { cancelled } = mount("x");
  click("vincular a uma tarefa ou evento");
  act(() => void fireEvent.keyDown(screen.getByText("✓ comprar leite"), { key: "Escape" }));
  expect(cancelled()).toBe(0);
  expect(screen.queryByText("✓ comprar leite")).toBeNull();
});

test("a 50 KB note opens in the editor without stalling", () => {
  const block = "## Seção\n\n- [ ] item com **negrito** e [link](https://exemplo.com)\n\n```ts\nconst x = 1;\n```\n\n";
  const start = performance.now();
  const { box } = mount(block.repeat(Math.ceil(50_000 / block.length)));
  // Generous for CI under happy-dom; the real webview is faster.
  expect(performance.now() - start).toBeLessThan(3000);
  expect(box.querySelectorAll("pre").length).toBeGreaterThan(500);
});
