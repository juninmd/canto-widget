import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GTask } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let listed: GTask[] | string;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "gtasks_list") return typeof listed === "string" ? Promise.reject(listed) : Promise.resolve(listed);
    if (cmd === "gtasks_add") return Promise.resolve({ id: "n1", title: args.title, due: "" });
    return Promise.resolve(null);
  },
}));

const { default: GoogleTasksSection } = await import("./GoogleTasksSection");

beforeEach(() => {
  calls.length = 0;
  listed = [
    { id: "a", title: "Renovar seguro do carro", due: "2026-10-20" },
    { id: "b", title: "Comprar presente da Lia", due: "" },
  ];
});
afterEach(cleanup);

test("open Google tasks show under the day's, a past due day stands out, and one can be checked off", async () => {
  render(<GoogleTasksSection today="2026-10-21" onError={() => {}} />);
  expect(await screen.findByText("Renovar seguro do carro")).toBeTruthy();
  expect(screen.getByText("20/10").className).toContain("text-danger");
  fireEvent.click(screen.getByRole("button", { name: "concluir Comprar presente da Lia" }));
  await waitFor(() => expect(screen.queryByText("Comprar presente da Lia") === null).toBe(true));
  expect(calls).toContainEqual({ cmd: "gtasks_complete", args: { id: "b" } });
});

test("the capture adds straight to Google Tasks", async () => {
  render(<GoogleTasksSection today="2026-10-21" onError={() => {}} />);
  const input = await screen.findByLabelText("adicionar no Google Tarefas…");
  fireEvent.change(input, { target: { value: "  Enviar proposta  " } });
  fireEvent.submit(input);
  expect(await screen.findByText("Enviar proposta")).toBeTruthy();
  expect(calls).toContainEqual({ cmd: "gtasks_add", args: { title: "Enviar proposta" } });
});

test("without a Google login the section stays out of the Tasks tab, silently", async () => {
  listed = "entre com o Google para ver a agenda";
  const errors: string[] = [];
  render(<GoogleTasksSection today="2026-10-21" onError={(m) => errors.push(m)} />);
  await waitFor(() => expect(calls).toHaveLength(1));
  expect(screen.queryByText("Google Tarefas")).toBeNull();
  expect(errors).toEqual([]);
});

test("the section folds to its header and remembers it", async () => {
  localStorage.removeItem("canto.gtasksOpen");
  render(<GoogleTasksSection today="2026-10-21" onError={() => {}} />);
  fireEvent.click(await screen.findByRole("button", { name: /Google Tarefas · 2/ }));
  expect(screen.queryByText("Renovar seguro do carro")).toBeNull();
  expect(localStorage.getItem("canto.gtasksOpen")).toBe("0");
  cleanup();
  render(<GoogleTasksSection today="2026-10-21" onError={() => {}} />);
  expect(await screen.findByRole("button", { name: /Google Tarefas · 2/ })).toBeTruthy();
  expect(screen.queryByText("Renovar seguro do carro")).toBeNull();
  localStorage.removeItem("canto.gtasksOpen");
});
