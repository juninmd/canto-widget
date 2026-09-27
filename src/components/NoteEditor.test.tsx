import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const saved: unknown[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    if (cmd === "note_image_save") saved.push(args?.data);
    return Promise.resolve(cmd === "note_image_save" ? "f00d" : null);
  },
}));

const { default: NoteEditor } = await import("./NoteEditor");

afterEach(cleanup);

const draft = { id: undefined, title: "t", body: "**forte** e um texto normal", tags: "", link: null };

test("starts in write mode with the raw textarea", () => {
  render(<NoteEditor draft={draft} tasks={[]} agenda={[]} onChange={() => {}} onSave={() => {}} onCancel={() => {}} />);
  expect(screen.getByPlaceholderText(/conteúdo do card/).tagName).toBe("TEXTAREA");
  expect(screen.queryByText("forte")).toBeNull();
});

test("visualizar renders the markdown instead of the textarea", () => {
  render(<NoteEditor draft={draft} tasks={[]} agenda={[]} onChange={() => {}} onSave={() => {}} onCancel={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "visualizar" }));
  expect(screen.queryByPlaceholderText(/conteúdo do card/)).toBeNull();
  expect(screen.getByText("forte").tagName).toBe("STRONG");
});

test("an empty body shows a placeholder message in preview instead of nothing", () => {
  render(
    <NoteEditor draft={{ ...draft, body: "   " }} tasks={[]} agenda={[]} onChange={() => {}} onSave={() => {}} onCancel={() => {}} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "visualizar" }));
  expect(screen.getByText("nada para visualizar ainda")).toBeTruthy();
});

test("picking a task from the link picker sets the link, and it can be removed", () => {
  const changes: unknown[] = [];
  const tasks = [{ id: "t1", title: "comprar leite", done: false, day: "2026-09-09", created_at: 1, updated_at: 1 }];
  render(
    <NoteEditor draft={draft} tasks={tasks} agenda={[]} onChange={(d) => changes.push(d)} onSave={() => {}} onCancel={() => {}} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "vincular a uma tarefa ou evento" }));
  fireEvent.click(screen.getByRole("button", { name: "✓ comprar leite" }));
  expect(changes.at(-1)).toEqual({ ...draft, link: { kind: "task", id: "t1", label: "comprar leite" } });
});
test("ticking a checklist item in preview updates the draft body", () => {
  const changes: { body: string }[] = [];
  render(
    <NoteEditor
      draft={{ ...draft, body: "- [ ] leite\n- [ ] pão" }}
      tasks={[]}
      agenda={[]}
      onChange={(d) => changes.push(d)}
      onSave={() => {}}
      onCancel={() => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "visualizar" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "pão" }));
  expect(changes.at(-1)?.body).toBe("- [ ] leite\n- [x] pão");
});

test("pasting an image stores it and inserts its reference at the caret", async () => {
  const changes: { body: string }[] = [];
  render(
    <NoteEditor draft={{ ...draft, body: "oi" }} tasks={[]} agenda={[]} onChange={(d) => changes.push(d)} onSave={() => {}} onCancel={() => {}} />,
  );
  const file = new File([new Uint8Array([0x47, 0x49, 0x46])], "print.gif", { type: "image/gif" });
  fireEvent.paste(screen.getByPlaceholderText(/conteúdo do card/), { clipboardData: { files: [file] } });
  await waitFor(() => expect(changes.at(-1)?.body).toBe("oi\n![](canto-img:f00d)\n"));
  expect(saved.at(-1)).toBe("R0lG");
});

test("picking an unsupported file through the button shows the error instead of inserting", async () => {
  const changes: unknown[] = [];
  render(<NoteEditor draft={draft} tasks={[]} agenda={[]} onChange={(d) => changes.push(d)} onSave={() => {}} onCancel={() => {}} />);
  expect(screen.getByRole("button", { name: "anexar imagem" })).toBeTruthy();
  const bmp = new File(["BM"], "a.bmp", { type: "image/bmp" });
  fireEvent.change(screen.getByLabelText("anexar imagem", { selector: "input" }), { target: { files: [bmp] } });
  expect((await screen.findByRole("alert")).textContent).toContain("formato de imagem não suportado");
  expect(changes).toEqual([]);
});
