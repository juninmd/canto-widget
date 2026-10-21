import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ContactsView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let reply: ContactsView | string;

const VIEW: ContactsView = {
  total: 3,
  items: [
    { id: "c2", name: "Rafael Prado", emails: ["rafael@exemplo.com"], phones: [], org: "Vértice", title: "", starred: false, link: "https://contacts.google.com/person/c2" },
    { id: "c1", name: "Marina Lopes", emails: ["marina@exemplo.com"], phones: ["+55 11 90000-0000"], org: "Vértice", title: "Diretora", starred: true, link: "https://contacts.google.com/person/c1" },
    { id: "c3", name: "Ana Souza", emails: [], phones: ["555-0100"], org: "", title: "", starred: false, link: "" },
  ],
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd !== "contacts_list") return Promise.resolve(null);
    return typeof reply === "string" ? Promise.reject(reply) : Promise.resolve(reply);
  },
}));

const { default: ContactsTab } = await import("./ContactsTab");

beforeEach(() => {
  calls.length = 0;
  reply = VIEW;
});
afterEach(cleanup);

test("contacts come in A to Z sections with the star and the job line", async () => {
  render(<ContactsTab onNotice={() => {}} />);
  expect(await screen.findByText("Marina Lopes")).toBeTruthy();
  expect(screen.getByText("Diretora · Vértice")).toBeTruthy();
  expect(screen.getByRole("img", { name: "favorito" })).toBeTruthy();
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["A", "M", "R"]);
  expect(document.querySelector("[data-contacts-total]")?.textContent).toBe("3");
});

test("a filter and a search narrow the list; the counts stay put", async () => {
  render(<ContactsTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByRole("button", { name: /^Com telefone/ }));
  expect(screen.queryByText("Rafael Prado")).toBeNull();
  expect(screen.getByText("Ana Souza")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /^Todos/ }));
  fireEvent.change(screen.getByLabelText("buscar contato"), { target: { value: "VERTICE" } });
  expect(screen.queryByText("Ana Souza")).toBeNull();
  expect(screen.getByText("Rafael Prado")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("buscar contato"), { target: { value: "zzz" } });
  expect(screen.getByText("Nenhum contato encontrado com esse filtro.")).toBeTruthy();
});

test("opening a contact shows its numbers; copy and the Google link work", async () => {
  const copied: string[] = [];
  Object.defineProperty(navigator, "clipboard", { value: { writeText: (v: string) => (copied.push(v), Promise.resolve()) }, configurable: true });
  const notices: string[] = [];
  render(<ContactsTab onNotice={(m) => notices.push(m)} />);
  fireEvent.click(await screen.findByText("Marina Lopes"));
  fireEvent.click(screen.getByRole("button", { name: "copiar marina@exemplo.com" }));
  await waitFor(() => expect(notices).toEqual(["Copiado"]));
  expect(copied).toEqual(["marina@exemplo.com"]);
  fireEvent.click(screen.getByRole("button", { name: "abrir no Google Contatos" }));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://contacts.google.com/person/c1" } });
});

test("without a Google login or with an old grant the tab asks for it", async () => {
  reply = "entre com o Google para ver a agenda";
  render(<ContactsTab onNotice={() => {}} />);
  expect(await screen.findByRole("button", { name: "Entrar com Google" })).toBeTruthy();
  cleanup();
  reply = "reconecte o Google em Ajustes para liberar Gmail, Tarefas, Drive e Contatos";
  render(<ContactsTab onNotice={() => {}} />);
  expect(await screen.findByRole("button", { name: "Reconectar Google" })).toBeTruthy();
});
