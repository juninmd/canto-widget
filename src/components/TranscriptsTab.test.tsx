import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    if (cmd === "transcripts_dir") return Promise.resolve("C:/nao/existe");
    if (cmd === "transcripts_list") return Promise.reject("pasta de transcrições não encontrada");
    return Promise.resolve(null);
  },
}));

const { default: TranscriptsTab } = await import("./TranscriptsTab");

afterEach(cleanup);

const settle = () => act(() => new Promise((r) => setTimeout(r, 200)));

test("an invalid folder shows in the tab with an escape hatch, no global alert per search", async () => {
  const globalErrors: string[] = [];
  render(<TranscriptsTab onError={(m) => globalErrors.push(m)} />);
  await settle();
  fireEvent.change(screen.getByPlaceholderText("buscar no que foi dito nas reuniões"), { target: { value: "daily" } });
  await settle();

  expect(screen.getByRole("alert").textContent).toContain("pasta de transcrições não encontrada");
  expect(screen.queryByText("nenhuma transcrição nesta pasta")).toBeNull();
  expect(globalErrors).toEqual([]);

  fireEvent.click(screen.getByRole("button", { name: "escolher outra pasta" }));
  expect(screen.getByDisplayValue("C:/nao/existe")).toBeTruthy();
});
