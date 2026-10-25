import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { DriveFile, DrivePage } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let hold: Promise<DrivePage> | null = null;

const FILES: DriveFile[] = [
  { id: "1", name: "Roadmap Q4 2026", kind: "doc", link: "https://docs.google.com/document/d/1/edit", modified: "2026-10-01T14:20:00Z", starred: true, editor: "", folder: "https://drive.google.com/drive/folders/f1", size: 0 },
  { id: "2", name: "Kickoff Vértice", kind: "slide", link: "", modified: "2026-10-02T09:00:00Z", starred: false, editor: "Rafael Prado", folder: "", size: 2_202_009 },
];

const FOLDER: DriveFile = { id: "f1", name: "Projetos", kind: "folder", link: "https://drive.google.com/drive/folders/f1", modified: "2026-10-03T09:00:00Z", starred: false, editor: "", folder: "", size: 0 };
const INSIDE: DriveFile = { ...FILES[0], id: "3", name: "Orçamento 2027", kind: "sheet" };
const LATER: DriveFile = { ...FILES[0], id: "4", name: "Ata antiga" };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "gdrive_quota") return Promise.resolve({ used: 4_509_715_660, limit: 16_106_127_360 });
    if (cmd !== "gdrive_list") return Promise.resolve(null);
    if (args.folder === "f1") return hold ?? Promise.resolve({ files: [INSIDE], next: "" });
    if (args.page === "p2") return Promise.resolve({ files: [LATER], next: "" });
    return Promise.resolve({ files: [FOLDER, ...FILES], next: "p2" });
  },
}));

const { default: GDriveTab } = await import("./GDriveTab");
const { forgetPages } = await import("../lib/driveCache");
const list = (filter: string, kind = "", search = "", folder = "", page = "") => ({ cmd: "gdrive_list", args: { filter, kind, search, folder, page } });

beforeEach(() => {
  calls.length = 0;
  hold = null;
  forgetPages();
});
afterEach(cleanup);

test("all of My Drive shows its folders and files, and a folder opens in place with a path back", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  expect(await screen.findByText("PASTA")).toBeTruthy();
  expect(calls.find((c) => c.cmd === "gdrive_list")).toEqual(list("all"));
  fireEvent.click(screen.getByLabelText("entrar na pasta Projetos"));
  expect(await screen.findByText("Orçamento 2027")).toBeTruthy();
  expect(calls.at(-1)).toEqual(list("all", "", "", "f1"));
  const path = screen.getByRole("navigation", { name: "caminho da pasta" });
  expect(path.textContent).toBe("Meu Drive›Projetos");
  const before = calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Meu Drive" }));
  expect(await screen.findByText("Roadmap Q4 2026")).toBeTruthy();
  expect(calls.length).toBe(before);
});

test("the next page loads on demand and stays when coming back", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByRole("button", { name: "carregar mais" }));
  expect(await screen.findByText("Ata antiga")).toBeTruthy();
  expect(calls.at(-1)).toEqual(list("all", "", "", "", "p2"));
  expect(screen.queryByRole("button", { name: "carregar mais" })).toBeNull();
  fireEvent.click(screen.getByLabelText("entrar na pasta Projetos"));
  await screen.findByText("Orçamento 2027");
  fireEvent.click(screen.getByRole("button", { name: "Meu Drive" }));
  expect(await screen.findByText("Ata antiga")).toBeTruthy();
});

test("recent files show their kind, who edited them and open in the browser", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByRole("button", { name: "Recentes" }));
  expect(await screen.findByLabelText("Antes")).toBeTruthy();
  expect(screen.getByText("DOC")).toBeTruthy();
  expect(screen.getByText("APRES")).toBeTruthy();
  expect(screen.getByText(/^editado por você · 01\/10/)).toBeTruthy();
  expect(screen.getByText(/^Rafael Prado editou · 02\/10\/? .*· 2 MB$/)).toBeTruthy();
  expect(screen.getByRole("img", { name: "com estrela" })).toBeTruthy();
  const open = screen.getAllByRole("button", { name: "abrir" });
  expect(open).toHaveLength(1);
  fireEvent.click(open[0]);
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://docs.google.com/document/d/1/edit" } });
  expect(calls.filter((c) => c.cmd === "gdrive_list").at(-1)).toEqual(list("recent"));
});

test("a filter and a name search go to Rust", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByRole("button", { name: "Compartilhados comigo" }));
  await waitFor(() => expect(calls.at(-1)).toEqual(list("shared")));
  fireEvent.change(screen.getByLabelText("buscar no Drive"), { target: { value: "roadmap" } });
  await waitFor(() => expect(calls.at(-1)).toEqual(list("shared", "", "roadmap")));
});

test("the storage in use shows as text and a meter, and blank documents open in the browser", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  expect((await screen.findByText("4,2 GB de 15 GB")).hasAttribute("data-drive-quota")).toBe(true);
  expect(document.querySelector("[role=meter]")?.getAttribute("aria-valuenow")).toBe("28");
  fireEvent.click(screen.getByLabelText("criar novo Planilha no navegador"));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://sheets.new" } });
});

test("a kind and my own files narrow the list in Rust, and files sit under their day", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  fireEvent.click(await screen.findByText("Meus arquivos"));
  expect(await screen.findByLabelText("Antes")).toBeTruthy();
  fireEvent.click(screen.getByText("Planilhas"));
  await waitFor(() => expect(calls.at(-1)).toEqual(list("mine", "sheet")));
});

test("a file's folder opens and its link copies", async () => {
  const notices: string[] = [];
  const writes: string[] = [];
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (v: string) => void writes.push(v) } });
  render(<GDriveTab onNotice={(m) => notices.push(m)} />);
  fireEvent.click(await screen.findByLabelText("abrir a pasta de Roadmap Q4 2026"));
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://drive.google.com/drive/folders/f1" } });
  fireEvent.click(screen.getByLabelText("copiar link de Roadmap Q4 2026"));
  await waitFor(() => expect(notices).toEqual(["Link copiado"]));
  expect(writes).toEqual(["https://docs.google.com/document/d/1/edit"]);
});

test("while a folder loads, the previous listing is dimmed and out of reach so a stale row can't push onto the path", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  await screen.findByText("Roadmap Q4 2026");
  let answer: (page: DrivePage) => void = () => {};
  hold = new Promise((resolve) => (answer = resolve));
  fireEvent.click(screen.getByLabelText("entrar na pasta Projetos"));
  await waitFor(() => expect(calls.at(-1)).toEqual(list("all", "", "", "f1")));
  const busy = document.querySelector("[aria-busy=true]");
  expect(busy?.hasAttribute("inert")).toBe(true);
  expect(busy?.textContent).toContain("Roadmap Q4 2026");
  answer({ files: [INSIDE], next: "" });
  expect(await screen.findByText("Orçamento 2027")).toBeTruthy();
  expect(document.querySelector("[aria-busy=true]") === null).toBe(true);
  expect(screen.getByRole("navigation", { name: "caminho da pasta" }).textContent).toBe("Meu Drive›Projetos");
});

test("a long file name keeps its full text on hover, and the open button says which file it opens", async () => {
  render(<GDriveTab onNotice={() => {}} />);
  const name = await screen.findByText("Roadmap Q4 2026");
  expect(name.getAttribute("title")).toBe("Roadmap Q4 2026");
  expect(screen.getByText("abrir").getAttribute("aria-describedby")).toBe(name.id);
  expect(screen.getByLabelText("entrar na pasta Projetos").getAttribute("title")).toBe("Projetos");
});
