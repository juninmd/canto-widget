import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReadsView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: ReadsView;
let thumb: string | null = null;
let icon: string | null = null;
let pendingMark: ((value: ReadsView) => void) | null = null;
let removeFails = false;
let holdMark = false;

const article = (id: string, title: string, unread = true) => ({
  id,
  title,
  url: `https://blog.exemplo.test/${id}`,
  host: "blog.exemplo.test",
  source: "Blog Exemplo",
  published_at: Date.now() - 7_200_000,
  summary: "Um resumo curto do texto.",
  unread,
  has_image: thumb !== null,
});

const EMPTY: ReadsView = { feeds: [], items: [], fetched_at: 0 };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "reads_get") return Promise.resolve(view);
    if (cmd === "reads_add") return Promise.resolve({ feeds: [{ url: "https://novo.test/feed", label: "Novo Feeds", error: null }], items: [article("n1", "Primeira leitura")], fetched_at: Date.now() });
    if (cmd === "reads_remove") {
      if (removeFails) return Promise.reject("o cofre está trancado");
      return Promise.resolve({ ...view, feeds: view.feeds.filter((f) => f.url !== args.feed) });
    }
    if (cmd === "reads_mark" && holdMark) return new Promise((resolve) => (pendingMark = resolve));
    if (cmd === "reads_mark") return Promise.resolve({ ...view, items: view.items.map((a) => (a.id === args.id ? { ...a, unread: false } : a)) });
    if (cmd === "reads_thumb") return Promise.resolve(thumb);
    if (cmd === "reads_favicon") return Promise.resolve(icon);
    return Promise.resolve(null);
  },
}));

const { default: ReadsTab } = await import("./ReadsTab");

async function show() {
  render(<ReadsTab onError={() => {}} />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  thumb = null;
  icon = null;
  pendingMark = null;
  removeFails = false;
  holdMark = false;
  view = EMPTY;
});
afterEach(cleanup);

test("without a feed the tab explains and adds one only after Rust confirms it", async () => {
  await show();
  expect(screen.getByText("nenhum feed ainda")).toBeTruthy();
  await act(async () => fireEvent.change(screen.getByLabelText("Endereço do feed"), { target: { value: "https://novo.test/feed" } }));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "adicionar" })));
  expect(calls.find((c) => c.cmd === "reads_add")?.args).toEqual({ feed: "https://novo.test/feed" });
  expect(document.querySelectorAll("[data-read]")).toHaveLength(1);
  expect(screen.getByText("Primeira leitura")).toBeTruthy();
});

test("the header counts what is unread and a card can be marked as read", async () => {
  view = {
    feeds: [{ url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null }],
    items: [article("a1", "Como o cache do Cargo funciona"), article("a2", "Notas sobre escrita curta", false)],
    fetched_at: Date.now(),
  };
  await show();
  expect(screen.getByText("1 não lidos de 2")).toBeTruthy();
  await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "marcar como lido" })[0]));
  expect(calls.find((c) => c.cmd === "reads_mark")?.args).toEqual({ id: "a1", read: true });
  expect(screen.getByText("0 não lidos de 2")).toBeTruthy();
});

test("a feed that failed stays visible in red instead of hiding the others", async () => {
  view = {
    feeds: [
      { url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null },
      { url: "https://sumiu.test/feed", label: "", error: "o feed respondeu 404" },
    ],
    items: [article("a1", "Como o cache do Cargo funciona")],
    fetched_at: Date.now(),
  };
  await show();
  const broken = document.querySelector("[data-feed='https://sumiu.test/feed']")!;
  expect(broken.className).toContain("text-danger");
  expect(broken.getAttribute("title")).toBe("o feed respondeu 404");
  expect(screen.getByText("Como o cache do Cargo funciona")).toBeTruthy();
});

test("a thumbnail and a favicon come from Rust as images, a missing favicon leaves the initial", async () => {
  thumb = "data:image/png;base64,cG5n";
  icon = null;
  view = { feeds: [{ url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null }], items: [article("a1", "Com foto")], fetched_at: Date.now() };
  await show();
  expect(document.querySelectorAll("img")).toHaveLength(1);
  expect(screen.getByText("B")).toBeTruthy();
  expect(calls.some((c) => c.cmd === "reads_thumb" && c.args.id === "a1")).toBe(true);
  expect(calls.some((c) => c.cmd === "reads_favicon" && c.args.host === "blog.exemplo.test")).toBe(true);
});

test("atualizar asks for a fresh list and opening a card leaves for the browser", async () => {
  view = { feeds: [{ url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null }], items: [article("a1", "Com foto")], fetched_at: Date.now() };
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "atualizar" })));
  expect(calls.filter((c) => c.cmd === "reads_get").map((c) => c.args)).toEqual([{ force: false }, { force: true }]);
  await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "abrir no navegador" })[0]));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://blog.exemplo.test/a1" });
});

const TWO_FEEDS: ReadsView = {
  feeds: [
    { url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null },
    { url: "https://outro.test/feed", label: "Outro", error: null },
  ],
  items: [article("a1", "Como o cache do Cargo funciona")],
  fetched_at: Date.now(),
};

test("the + button is named, says whether the form is open and focuses the address", async () => {
  view = TWO_FEEDS;
  await show();
  const plus = screen.getByLabelText("Adicionar um feed");
  expect(plus.getAttribute("aria-expanded")).toBe("false");
  await act(async () => fireEvent.click(plus));
  expect(plus.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement === screen.getByLabelText("Endereço do feed")).toBe(true);
});

test("removing a feed asks a second time and Escape gives up", async () => {
  view = TWO_FEEDS;
  await show();
  await act(async () => fireEvent.click(screen.getByLabelText("remover Outro")));
  expect(calls.some((c) => c.cmd === "reads_remove")).toBe(false);
  const confirm = screen.getByText("remover o feed");
  await act(async () => fireEvent.keyDown(confirm, { key: "Escape" }));
  expect(screen.queryByText("remover o feed") === null).toBe(true);
  expect(document.activeElement === screen.getByLabelText("remover Outro")).toBe(true);
  expect(calls.some((c) => c.cmd === "reads_remove")).toBe(false);

  await act(async () => fireEvent.click(screen.getByLabelText("remover Outro")));
  await act(async () => fireEvent.click(screen.getByText("remover o feed")));
  expect(calls.filter((c) => c.cmd === "reads_remove")).toHaveLength(1);
  expect(document.querySelector("[data-feed='https://outro.test/feed']") === null).toBe(true);
});

test("a feed that cannot be removed reports the error instead of failing silently", async () => {
  view = TWO_FEEDS;
  removeFails = true;
  const errors: string[] = [];
  render(<ReadsTab onError={(m) => errors.push(m)} />);
  await act(async () => {});
  await act(async () => fireEvent.click(screen.getByLabelText("remover Outro")));
  await act(async () => fireEvent.click(screen.getByText("remover o feed")));
  expect(errors).toEqual(["o cofre está trancado"]);
  expect(document.querySelector("[data-feed='https://outro.test/feed']") === null).toBe(false);
  expect(document.activeElement === screen.getByLabelText("remover Outro")).toBe(true);
});

test("a double click on marcar como lido sends a single request", async () => {
  view = TWO_FEEDS;
  holdMark = true;
  await show();
  const button = screen.getByRole("button", { name: "marcar como lido" });
  await act(async () => {
    fireEvent.click(button);
    fireEvent.click(button);
  });
  expect(calls.filter((c) => c.cmd === "reads_mark")).toHaveLength(1);
  await act(async () => pendingMark?.({ ...view, items: view.items.map((a) => ({ ...a, unread: false })) }));
  expect(screen.getByText("0 não lidos de 1")).toBeTruthy();
});
