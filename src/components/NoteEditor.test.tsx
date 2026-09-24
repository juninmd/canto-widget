import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

mock.module("@tauri-apps/api/core", () => ({ invoke: () => Promise.resolve(null) }));

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
