import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { GmailSummary } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let summary: GmailSummary | Error | Promise<GmailSummary>;

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

/** The tab opens on the inbox; the important view is one tap away. */
async function showImportant() {
  fireEvent.click(await screen.findByText("Importantes"));
  await waitFor(() => expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "important", search: "" } }));
}

test("the unread count and the important mail show, each with its actions", async () => {
  render(<GmailTab onNotice={() => {}} />);
  expect(await screen.findByText("27")).toBeTruthy();
  expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "inbox", search: "" } });
  await showImportant();
  expect(await screen.findByText("2 importantes")).toBeTruthy();
  expect(screen.getByText("Contrato revisado")).toBeTruthy();
  expect(screen.getByText("ML")).toBeTruthy();
  fireEvent.click(screen.getAllByText("abrir no Gmail")[0]);
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://mail.google.com/mail/u/0/#inbox/t1" } });
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
  await showImportant();
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

test("in the inbox a mail marked as read stays listed, only no longer bold", async () => {
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click((await screen.findAllByText("marcar como lido"))[0]);
  expect(await screen.findByText("marcar como não lido")).toBeTruthy();
  expect(screen.getByText("Contrato revisado")).toBeTruthy();
  expect(document.querySelector("[data-gmail-unread]")?.textContent).toBe("26");
});

test("in the important view marking as read takes the mail off the list and out of the count", async () => {
  render(<GmailTab onNotice={() => {}} />);
  await showImportant();
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

test("a disabled Gmail API says so and offers the console page that turns it on", async () => {
  const url = "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=123";
  summary = new Error(`google: gmail: API desativada no projeto do Google Cloud deste Client ID. Ative em ${url}`);
  render(<GmailTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByText("ativar a API"));
  expect(screen.getByRole("alert").textContent).not.toContain(url);
  expect(calls).toContainEqual({ cmd: "open_link", args: { url } });
});

test("a slow answer for an earlier view does not replace the view picked after it", async () => {
  render(<GmailTab onNotice={() => {}} />);
  await screen.findByText("Contrato revisado");
  let late: (s: GmailSummary) => void = () => {};
  summary = new Promise((resolve) => (late = resolve));
  fireEvent.click(screen.getByText("Com estrela"));
  await waitFor(() => expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "starred", search: "" } }));
  summary = { unread: 3, important: [{ ...INBOX.important[0], id: "u1", subject: "Só os não lidos" }] };
  fireEvent.click(screen.getByText("Não lidos"));
  expect(await screen.findByText("Só os não lidos")).toBeTruthy();
  late({ unread: 3, important: [{ ...INBOX.important[1], id: "s1", subject: "Resposta atrasada" }] });
  await new Promise((r) => setTimeout(r, 30));
  expect(screen.queryByText("Resposta atrasada") === null).toBe(true);
});

test("a double click on mark as read sends one request, and the row's actions wait for it", async () => {
  render(<GmailTab onNotice={() => {}} />);
  const button = (await screen.findAllByText("marcar como lido"))[0];
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.click(screen.getByLabelText("dar estrela em Contrato revisado"));
  expect(await screen.findByText("marcar como não lido")).toBeTruthy();
  expect(calls.filter((c) => c.cmd === "gmail_modify")).toEqual([{ cmd: "gmail_modify", args: { ids: ["m1"], action: "read" } }]);
  expect(document.querySelector("[data-gmail-unread]")?.textContent).toBe("26");
  await waitFor(() => expect(document.querySelector("[aria-busy=true]") === null).toBe(true));
});

test("j/k walk the mail from the keyboard, s stars and e archives the focused one", async () => {
  render(<GmailTab onNotice={() => {}} />);
  const first = await screen.findByLabelText("selecionar Contrato revisado");
  first.focus();
  fireEvent.keyDown(first, { key: "j" });
  const second = screen.getByLabelText("selecionar Fatura de outubro");
  expect(document.activeElement === second).toBe(true);
  fireEvent.keyDown(second, { key: "k" });
  expect(document.activeElement === first).toBe(true);
  fireEvent.keyDown(first, { key: "s" });
  expect(await screen.findByLabelText("tirar a estrela de Contrato revisado")).toBeTruthy();
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m1"], action: "star" } });
  fireEvent.keyDown(first, { key: "e" });
  expect(document.activeElement === second).toBe(true);
  await waitFor(() => expect(screen.queryByText("Contrato revisado") === null).toBe(true));
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m1"], action: "archive" } });
  fireEvent.keyDown(second, { key: "x" });
  expect(await screen.findByLabelText("1 selecionados")).toBeTruthy();
});

test("/ reaches the Gmail search like the other tabs", async () => {
  render(<GmailTab onNotice={() => {}} />);
  expect((await screen.findByLabelText("buscar no Gmail")).getAttribute("data-shortcut")).toBe("search");
});

test("in the important view u reads the focused mail away and focus moves on to the next one", async () => {
  render(<GmailTab onNotice={() => {}} />);
  await showImportant();
  const first = await screen.findByLabelText("selecionar Contrato revisado");
  first.focus();
  fireEvent.keyDown(first, { key: "u" });
  const second = screen.getByLabelText("selecionar Fatura de outubro");
  expect(document.activeElement === second).toBe(true);
  await waitFor(() => expect(screen.queryByText("Contrato revisado") === null).toBe(true));
  expect(calls).toContainEqual({ cmd: "gmail_modify", args: { ids: ["m1"], action: "read" } });
});

test("a busy mail keeps focus on its buttons and a second e neither moves focus nor sends again", async () => {
  render(<GmailTab onNotice={() => {}} />);
  const star = await screen.findByLabelText("dar estrela em Contrato revisado");
  star.focus();
  fireEvent.click(star);
  expect(star.getAttribute("aria-disabled")).toBe("true");
  expect(star.hasAttribute("disabled")).toBe(false);
  expect(document.activeElement === star).toBe(true);
  fireEvent.keyDown(star, { key: "e" });
  expect(document.activeElement === star).toBe(true);
  await screen.findByLabelText("tirar a estrela de Contrato revisado");
  expect(calls.filter((c) => c.cmd === "gmail_modify")).toEqual([{ cmd: "gmail_modify", args: { ids: ["m1"], action: "star" } }]);
});

test("while another view loads, the old list is dimmed and its actions are out of reach", async () => {
  render(<GmailTab onNotice={() => {}} />);
  await screen.findByText("Contrato revisado");
  let late: (s: GmailSummary) => void = () => {};
  summary = new Promise((resolve) => (late = resolve));
  fireEvent.click(screen.getByText("Com estrela"));
  await waitFor(() => expect(calls).toContainEqual({ cmd: "gmail_summary", args: { view: "starred", search: "" } }));
  const busy = document.querySelector("[aria-busy=true]");
  expect(busy?.hasAttribute("inert")).toBe(true);
  expect(busy?.textContent).toContain("Contrato revisado");
  late({ unread: 3, important: [{ ...INBOX.important[1], id: "s1", subject: "Só as com estrela" }] });
  expect(await screen.findByText("Só as com estrela")).toBeTruthy();
  expect(document.querySelector("[aria-busy=true]") === null).toBe(true);
});

test("when the new view fails, the old list goes and only the error stays, with nothing left busy", async () => {
  render(<GmailTab onNotice={() => {}} />);
  await screen.findByText("Contrato revisado");
  summary = new Error("falha de rede");
  fireEvent.click(screen.getByText("Com estrela"));
  expect(await screen.findByText(/falha de rede/)).toBeTruthy();
  await waitFor(() => expect(screen.queryByText("Contrato revisado") === null).toBe(true));
  expect(document.querySelector("[aria-busy=true]") === null).toBe(true);
  expect(document.querySelector("[inert]") === null).toBe(true);
  summary = INBOX;
  fireEvent.click(screen.getByText("tentar de novo"));
  expect(await screen.findByText("Contrato revisado")).toBeTruthy();
});

test("a double click on an action sends it once and creates one task", async () => {
  summary = { unread: 1, important: [INBOX.important[0], { ...INBOX.important[1], unread: false }] };
  render(<GmailTab onNotice={() => {}} />);
  const toTask = await screen.findAllByText("virar tarefa");
  fireEvent.click(toTask[0]);
  fireEvent.click(toTask[0]);
  fireEvent.click(toTask[1]);
  fireEvent.click(toTask[1]);
  await waitFor(() => expect(calls.filter((c) => c.cmd === "gtasks_add")).toHaveLength(2));
  await new Promise((r) => setTimeout(r, 30));
  expect(calls.filter((c) => c.cmd === "gtasks_add")).toEqual([
    { cmd: "gtasks_add", args: { title: "Contrato revisado" } },
    { cmd: "gtasks_add", args: { title: "Fatura de outubro" } },
  ]);
  expect(calls.filter((c) => c.cmd === "gmail_modify")).toHaveLength(1);
});

test("each row's actions are grouped under its subject, which keeps its full text on hover", async () => {
  render(<GmailTab onNotice={() => {}} />);
  const subject = await screen.findByText("Contrato revisado");
  expect(subject.getAttribute("title")).toBe("Contrato revisado");
  const group = screen.getByLabelText("Contrato revisado");
  expect(group.getAttribute("role")).toBe("group");
  expect(group.textContent).toContain("arquivar");
  expect(screen.getByText("Marina Lopes").getAttribute("title")).toBe("Marina Lopes");
});
