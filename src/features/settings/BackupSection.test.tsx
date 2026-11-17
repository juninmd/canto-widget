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

test("asks for a first export, then shows how old the last one is", async () => {
  localStorage.clear();
  responses.backup_export = () => Promise.resolve("/tmp/cofre.canto");
  await click("exportar");
  expect(screen.getByText(/exportado há 0 dia/)).toBeTruthy();
  expect(screen.queryByText(/Nenhum backup exportado/)).toBeNull();
});

test("a never exported vault and a stale export both warn", () => {
  localStorage.clear();
  render(<BackupSection onError={() => {}} />);
  expect(screen.getByRole("status").textContent).toMatch(/Nenhum backup exportado/);
  cleanup();
  localStorage.setItem("canto.lastExport", String(Date.now() - 45 * 86_400_000));
  render(<BackupSection onError={() => {}} />);
  expect(screen.getByRole("status").textContent).toMatch(/há 45 dias/);
  localStorage.clear();
});

test("a saved copy restores in one click and says the previous state was kept", async () => {
  const calls: unknown[] = [];
  responses.backup_list = () =>
    Promise.resolve([
      { name: "2026-11-03.canto", kind: "daily", day: "2026-11-03", at: null },
      { name: "2026-11-02T5000-import.canto", kind: "import", day: "2026-11-02", at: 5000 },
    ]);
  responses.backup_restore = () => {
    calls.push("restore");
    return Promise.resolve({ tasks: 4, notes: 1 });
  };
  render(<BackupSection onError={() => {}} />);
  await act(async () => {});
  fireEvent.click(screen.getByText("cópias automáticas"));
  expect(screen.getByText("diária de 2026-11-03")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("restaurar — diária de 2026-11-03"));
  });
  expect(calls).toEqual(["restore"]);
  expect(screen.getByText(/4 tarefas e 1 notas/)).toBeTruthy();
});

test("with no saved copies the list does not appear", async () => {
  render(<BackupSection onError={() => {}} />);
  await act(async () => {});
  expect(screen.queryByText("cópias automáticas")).toBeNull();
});
