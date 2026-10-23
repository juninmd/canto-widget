import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GmailSummary } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let summary: GmailSummary | Error;

const INBOX: GmailSummary = {
  unread: 27,
  important: [
    { id: "m1", from: "Marina Lopes", subject: "Contrato revisado", snippet: "Consegue assinar até sexta?", date: Date.now(), link: "https://mail.google.com/mail/u/0/#inbox/t1", unread: true, starred: false },
    { id: "m2", from: "Banco Aurora", subject: "Fatura de outubro", snippet: "Vencimento em 28/10", date: Date.now(), link: "https://mail.google.com/mail/u/0/#inbox/t2", unread: true, starred: true },
  ],
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "gmail_summary") return summary instanceof Error ? Promise.reject(summary.message) : Promise.resolve(summary);
    if (cmd === "gmail_alerts_get") return Promise.resolve(false);
    if (cmd === "gmail_alerts_set") return Promise.resolve(args.on);
    if (cmd === "gtasks_add") return Promise.resolve({ id: "g1", title: args.title, due: "" });
    return Promise.resolve(null);
  },
}));

const { default: GmailTab } = await import("./GmailTab");

beforeEach(() => {
  calls.length = 0;
  summary = INBOX;
});
afterEach(cleanup);

test("the unread count and the important mail show, each with its actions", async () => {
  render(<GmailTab onNotice={() => {}} />);
  expect(await screen.findByText("27")).toBeTruthy();
  expect(screen.getByText("2 importantes")).toBeTruthy();
  expect(screen.getByText("Contrato revisado")).toBeTruthy();
  expect(screen.getByText("ML")).toBeTruthy();
  fireEvent.click(screen.getAllByText("abrir no Gmail")[0]);
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://mail.google.com/mail/u/0/#inbox/t1" } });
  expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "important", search: "" } });
});

test("another view and a search go to Rust", async () => {
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByText("Com estrela"));
  await waitFor(() => expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "starred", search: "" } }));
  fireEvent.change(screen.getByLabelText("buscar no Gmail"), { target: { value: "fatura" } });
  await waitFor(() => expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "starred", search: "fatura" } }));
});

test("archiving and trashing take the mail away; the star toggles in place", async () => {
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click((await screen.findAllByText("arquivar"))[0]);
  await waitFor(() => expect(screen.queryByText("Contrato revisado") === null).toBe(true));
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m1"], action: "archive" } });
  fireEvent.click(screen.getByLabelText("tirar a estrela de Fatura de outubro"));
  expect(await screen.findByLabelText("dar estrela em Fatura de outubro")).toBeTruthy();
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m2"], action: "unstar" } });
  fireEvent.click(screen.getByText("lixeira"));
  await waitFor(() => expect(screen.queryByText("Fatura de outubro") === null).toBe(true));
  expect(document.querySelector("[data-gmail-unread]")?.textContent).toBe("25");
});

test("selected mail is read in one batch from the bar", async () => {
  const notices: string[] = [];
  render(<GmailTab onNotice={(m) => notices.push(m)} />);
  fireEvent.click(await screen.findByLabelText("selecionar Contrato revisado"));
  const bar = await screen.findByLabelText("1 selecionados");
  fireEvent.click(screen.getByText("todos"));
  expect(bar.textContent).toContain("2 selecionados");
  fireEvent.click(screen.getAllByText("marcar como lido").at(-1)!);
  await waitFor(() => expect(document.querySelector("[role=toolbar]") === null).toBe(true));
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m1", "m2"], action: "read" } });
  expect(notices).toEqual(["Marcado como lido"]);
  expect(screen.getByText("Nada importante pendente. Pode focar.")).toBeTruthy();
});

test("marking as read takes the mail off the list and out of the count", async () => {
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click((await screen.findAllByText("marcar como lido"))[0]);
  await waitFor(() => {
    expect(screen.queryByText("Contrato revisado") === null).toBe(true);
    expect(document.querySelector("[data-gmail-unread]")?.textContent).toBe("26");
  });
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m1"], action: "read" } });
});

test("a mail becomes a Google task with its subject, and is then read", async () => {
  const notices: string[] = [];
  render(<GmailTab onNotice={(m) => notices.push(m)} />);
  fireEvent.click((await screen.findAllByText("virar tarefa"))[1]);
  await waitFor(() => expect(notices).toEqual(["Tarefa criada no Google Tarefas"]));
  expect(calls).toContainEqual({ cmd: "gtasks_add", args: { title: "Fatura de outubro" } });
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m2"], action: "read" } });
});

test("the important-only alert is off until turned on", async () => {
  render(<GmailTab onNotice={() => {}} />);
  const box = (await screen.findByLabelText(/Avisar só os importantes/)) as HTMLInputElement;
  expect(box.checked).toBe(false);
  fireEvent.click(box);
  expect(calls).toContainEqual({ cmd: "gmail_alerts_set", args: { on: true } });
});

test("without a Google login there is one button to sign in, and an old login asks for a reconnect", async () => {
  summary = new Error("entre com o Google para ver a agenda");
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByText("Entrar com Google"));
  expect(calls.some((c) => c.cmd === "drive_connect")).toBe(true);
  cleanup();
  summary = new Error("reconecte o Google em Ajustes para liberar Gmail, Tarefas e Drive");
  render(<GmailTab onNotice={() => {}} />);
  expect(await screen.findByText("Reconectar Google")).toBeTruthy();
});
