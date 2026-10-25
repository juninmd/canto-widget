import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { Subtask } from "../lib/api";

let failAdd = false;
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => (cmd === "subtask_add" && failAdd ? Promise.reject("sem conexão") : Promise.resolve(null)),
}));

const { default: TaskSubtasks } = await import("./TaskSubtasks");

const START: Subtask[] = [
  { id: "s1", title: "levar sacola", done: false },
  { id: "s2", title: "pegar troco", done: false },
];

function Harness({ onError = () => {} }: { onError?: (m: string) => void }) {
  const [subs, setSubs] = useState(START);
  return (
    <>
      <TaskSubtasks taskId="t1" subtasks={subs} onError={onError} onChange={() => {}} />
      <button type="button" onClick={() => setSubs((l) => l.slice(1))}>
        recarregar
      </button>
    </>
  );
}

beforeEach(() => {
  failAdd = false;
});
afterEach(cleanup);

test("removing a subtask hands focus to the next one once the list reloads", async () => {
  render(<Harness />);
  const del = screen.getByLabelText("excluir subtarefa levar sacola");
  del.focus();
  await act(async () => {
    fireEvent.click(del);
  });
  await act(async () => {
    fireEvent.click(screen.getByText("recarregar"));
  });
  await waitFor(() => expect(document.activeElement === screen.getByLabelText("pegar troco")).toBe(true));
});

test("a subtask that fails to save gives its text back", async () => {
  failAdd = true;
  const errors: string[] = [];
  render(<Harness onError={(m) => errors.push(m)} />);
  const field = screen.getByLabelText("nova subtarefa") as HTMLInputElement;
  await act(async () => {
    fireEvent.change(field, { target: { value: "comprar pão" } });
    fireEvent.submit(field.closest("form")!);
  });
  expect(errors).toEqual(["sem conexão"]);
  expect(field.value).toBe("comprar pão");
});
