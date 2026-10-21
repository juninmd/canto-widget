import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GmailSummary } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let summary: GmailSummary | Error;

const INBOX: GmailSummary = {
  unread: 27,
  important: [
    { id: "m1", from: "Marina Lopes", subject: "Contrato revisado", snippet: "Consegue assinar até sexta?", date: Date.now(), link: "https://mail.google.com/mail/u/0/#inbox/t1" },
    { id: "m2", from: "Banco Aurora", subject: "Fatura de outubro", snippet: "Vencimento em 28/10", date: Date.now(), link: "https://mail.google.com/mail/u/0/#inbox/t2" },
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
});

test("marking as read takes the mail off the list and out of the count", async () => {
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click((await screen.findAllByText("marcar como lido"))[0]);
  await waitFor(() => {
    expect(screen.queryByText("Contrato revisado") === null).toBe(true);
    expect(document.querySelector("[data-gmail-unread]")?.textContent).toBe("26");
  });
  expect(calls).toContainEqual({ cmd: "gmail_mark_read", args: { id: "m1" } });
});

test("a mail becomes a Google task with its subject, and is then read", async () => {
  const notices: string[] = [];
  render(<GmailTab onNotice={(m) => notices.push(m)} />);
  fireEvent.click((await screen.findAllByText("virar tarefa"))[1]);
  await waitFor(() => expect(notices).toEqual(["Tarefa criada no Google Tarefas"]));
  expect(calls).toContainEqual({ cmd: "gtasks_add", args: { title: "Fatura de outubro" } });
  expect(calls).toContainEqual({ cmd: "gmail_mark_read", args: { id: "m2" } });
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
