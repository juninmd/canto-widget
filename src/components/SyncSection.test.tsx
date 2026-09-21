import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => (responses[cmd] ?? (() => Promise.resolve(null)))(),
}));

const { default: SyncSection } = await import("./SyncSection");

async function open(onError = (_: string) => {}) {
  render(<SyncSection onError={onError} />);
  await act(async () => Promise.resolve());
}

beforeEach(() => {
  responses = { sync_get: () => Promise.resolve(null) };
});

afterEach(cleanup);

test("without a folder configured, only 'escolher pasta' is offered", async () => {
  await open();
  expect(screen.getByText("nenhuma pasta escolhida")).toBeTruthy();
  expect(screen.getByText("escolher pasta")).toBeTruthy();
  expect(screen.queryByText("sincronizar agora")).toBeNull();
});

test("a configured folder shows its path and the sync/stop actions", async () => {
  responses.sync_get = () => Promise.resolve("D:\\Dropbox\\canto");
  await open();
  expect(screen.getByText("D:\\Dropbox\\canto")).toBeTruthy();
  expect(screen.getByText("sincronizar agora")).toBeTruthy();
});

test("cancelling the folder dialog changes nothing", async () => {
  responses.sync_set_folder = () => Promise.resolve(null);
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("escolher pasta"));
  });
  expect(screen.getByText("nenhuma pasta escolhida")).toBeTruthy();
});

test("'sincronizar agora' reports the merge result, or that there was nothing new", async () => {
  responses.sync_get = () => Promise.resolve("D:\\Dropbox\\canto");
  responses.sync_now = () => Promise.resolve({ tasks: 4, notes: 1 });
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("sincronizar agora"));
  });
  expect(screen.getByText(/4 tarefas e 1 notas/)).toBeTruthy();
});

test("'parar' clears the folder and hides the sync actions again", async () => {
  responses.sync_get = () => Promise.resolve("D:\\Dropbox\\canto");
  responses.sync_clear = () => Promise.resolve(null);
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("parar"));
  });
  expect(screen.getByText("nenhuma pasta escolhida")).toBeTruthy();
  expect(screen.queryByText("sincronizar agora")).toBeNull();
});
