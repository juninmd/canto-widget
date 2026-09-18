import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => (responses[cmd] ?? (() => Promise.resolve(null)))(),
}));

const { default: BackupSection } = await import("./BackupSection");

async function click(label: string, onError = (_: string) => {}) {
  render(<BackupSection onError={onError} />);
  await act(async () => {
    fireEvent.click(screen.getByText(label));
  });
}

beforeEach(() => {
  responses = {};
});

afterEach(cleanup);

test("cancelling the dialog produces neither an error nor a success message", async () => {
  const errors: string[] = [];
  responses.backup_export = () => Promise.resolve(null);
  await click("exportar", (m) => errors.push(m));
  expect(errors).toEqual([]);
  expect(screen.queryByText(/backup salvo/)).toBeNull();
});

test("import shows how much the vault has after the merge", async () => {
  responses.backup_import = () => Promise.resolve({ tasks: 3, notes: 2 });
  await click("importar");
  expect(screen.getByText(/3 tarefas e 2 notas/)).toBeTruthy();
});

test("a different password reaches the user via the error banner", async () => {
  const errors: string[] = [];
  responses.backup_import = () => Promise.reject("o backup foi criado com outra senha mestra");
  await click("importar", (m) => errors.push(m));
  expect(errors).toEqual(["o backup foi criado com outra senha mestra"]);
  expect(screen.queryByText(/mesclado/)).toBeNull();
});
