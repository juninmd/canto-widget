import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ContactsView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let reply: ContactsView | string | Promise<ContactsView>;

const PHOTO = "https://lh3.googleusercontent.com/contacts/marina=s96-c";
const NONE = { nickname: "", department: "", birthday: null, addresses: [], urls: [], relations: [], note: "" };
const now = new Date();
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const VIEW: ContactsView = {
  total: 3,
  items: [
    { id: "c2", name: "Rafael Prado", emails: ["rafael@exemplo.com"], phones: [], org: "Vértice", title: "", starred: false, link: "https://contacts.google.com/person/c2", ...NONE,
      birthday: { day: tomorrow.getDate(), month: tomorrow.getMonth() + 1, year: null } },
    { id: "c1", name: "Marina Lopes", emails: ["marina@exemplo.com"], phones: ["+55 11 90000-0000"], org: "Vértice", title: "Diretora", starred: true, link: "https://contacts.google.com/person/c1", ...NONE,
      nickname: "Mari", department: "Vendas", birthday: { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() - 30 },
      addresses: ["Rua A, 10, São Paulo"], urls: ["https://marina.dev"], relations: ["Rui (Cônjuge)"], note: "Prefere WhatsApp." },
    { id: "c3", name: "Ana Souza", emails: [], phones: ["555-0100"], org: "", title: "", starred: false, link: "", ...NONE },
  ],
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "contact_photos") return Promise.resolve({ [PHOTO]: "data:image/png;base64,AA", "https://lh3.googleusercontent.com/x": "javascript:1" });
    if (cmd !== "contacts_list") return Promise.resolve(null);
    if (reply instanceof Promise) return reply;
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
  expect(await screen.findByText("Marina Lopes", { selector: "li[data-contact] span" })).toBeTruthy();
  expect(screen.getByText("Diretora · Vértice")).toBeTruthy();
  expect(screen.getByRole("img", { name: "favorito" })).toBeTruthy();
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent).filter((h) => h?.length === 1)).toEqual(["A", "M", "R"]);
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
  fireEvent.click(await screen.findByText("Marina Lopes", { selector: "li[data-contact] span" }));
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

test("today's birthdays sit on top with the age and a WhatsApp greeting already typed", async () => {
  render(<ContactsTab onNotice={() => {}} />);
  const section = await screen.findByRole("region", { name: "Aniversariantes de hoje" });
  expect(section.textContent).toContain("Marina Lopes");
  expect(section.textContent).toContain("faz 30 anos");
  expect(section.textContent).not.toContain("Ana Souza");
  expect(screen.getByRole("img", { name: "aniversário hoje" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "dar parabéns a Marina Lopes no WhatsApp" }));
  expect(calls.at(-1)).toEqual({
    cmd: "open_link",
    args: { url: `https://wa.me/5511900000000?text=${encodeURIComponent("Feliz aniversário, Mari! 🎉")}` },
  });
});

test("an open contact shows everything Google keeps and a WhatsApp link only for a dialable number", async () => {
  render(<ContactsTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByText("Marina Lopes", { selector: "li[data-contact] span" }));
  for (const text of ["Mari", "Vendas", "Rua A, 10, São Paulo", "Rui (Cônjuge)", "Prefere WhatsApp."]) expect(screen.getByText(text)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "abrir +55 11 90000-0000 no WhatsApp" }));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://wa.me/5511900000000" } });
  fireEvent.click(screen.getByRole("button", { name: "abrir https://marina.dev" }));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://marina.dev" } });
  fireEvent.click(screen.getByText("Ana Souza"));
  expect(screen.queryByRole("button", { name: "abrir 555-0100 no WhatsApp" })).toBeNull();
});

test("the next birthdays show how many days are left and lead to the contact", async () => {
  render(<ContactsTab onNotice={() => {}} />);
  const next = await screen.findByLabelText("Próximos aniversários");
  expect(next.textContent).toContain("Rafael");
  expect(next.textContent).toContain("amanhã");
  expect(next.textContent).not.toContain("Marina");
  fireEvent.click(screen.getByText("Com aniversário"));
  expect(screen.queryByText("Ana Souza") === null).toBe(true);
});

test("an e-mail opens Gmail's compose and the whole card copies as text", async () => {
  const copied: string[] = [];
  Object.defineProperty(navigator, "clipboard", { value: { writeText: (v: string) => (copied.push(v), Promise.resolve()) }, configurable: true });
  render(<ContactsTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByText("Marina Lopes", { selector: "li[data-contact] span" }));
  fireEvent.click(screen.getByLabelText("escrever para marina@exemplo.com no Gmail"));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://mail.google.com/mail/?view=cm&fs=1&to=marina%40exemplo.com" } });
  fireEvent.click(screen.getByText("copiar ficha"));
  await waitFor(() => expect(copied[0]?.split("\n").slice(0, 3)).toEqual(["Marina Lopes", "Diretora · Vértice", "marina@exemplo.com"]));
  fireEvent.click(screen.getByText("+ novo contato"));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://contacts.google.com/new" } });
});

test("the A to Z index lists only the letters in use and jumps to one", async () => {
  const extra = (id: string, name: string) => ({ ...VIEW.items[2], id, name });
  reply = { total: 5, items: [...VIEW.items, extra("c4", "Bruno Lima"), extra("c5", "Zélia Andrade")] };
  render(<ContactsTab onNotice={() => {}} />);
  const index = await screen.findByLabelText("ir para a letra");
  expect(index.textContent).toBe("ABMRZ");
  fireEvent.click(screen.getByLabelText("ir para Z"));
  await waitFor(() => expect(document.querySelector("[data-letter=Z]")?.className).toContain("canto-flash"));
});

test("a contact's Google photo replaces the initials, the others keep theirs", async () => {
  reply = { ...VIEW, items: VIEW.items.map((c) => (c.id === "c1" ? { ...c, photo: PHOTO } : c)) };
  render(<ContactsTab onNotice={() => {}} />);
  await waitFor(() => expect(document.querySelectorAll("[data-contact-photo]").length).toBeGreaterThan(0));
  expect(calls.find((c) => c.cmd === "contact_photos")?.args).toEqual({ urls: [PHOTO] });
  const row = document.querySelector('[data-contact="c1"]');
  expect(row?.querySelector("img")?.getAttribute("src")).toBe("data:image/png;base64,AA");
  expect(document.querySelector('[data-contact="c3"]')?.textContent).toContain("AS");
});

test("without photos no photo call is made", async () => {
  render(<ContactsTab onNotice={() => {}} />);
  await screen.findByText("Ana Souza");
  expect(calls.some((c) => c.cmd === "contact_photos")).toBe(false);
});

test("a slower, older load does not replace a newer refresh", async () => {
  const { requestRefresh } = await import("../lib/refreshEvent");
  let late: (v: ContactsView) => void = () => {};
  reply = new Promise<ContactsView>((resolve) => (late = resolve));
  render(<ContactsTab onNotice={() => {}} />);
  reply = { ...VIEW, total: 9 };
  requestRefresh("contacts");
  await waitFor(() => expect(document.querySelector("[data-contacts-total]")?.textContent).toBe("9"));
  late(VIEW);
  await new Promise((r) => setTimeout(r, 0));
  expect(document.querySelector("[data-contacts-total]")?.textContent).toBe("9");
});
