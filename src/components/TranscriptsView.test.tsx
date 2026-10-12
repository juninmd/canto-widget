import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const FULL = "C:/reunioes/2026/times/produto/transcricoes-muito-longas";
const file = { name: "daily.txt", modified_at: 1_760_000_000_000, size: 40, preview: "falamos do deploy" };
let files = [file];
let geminiError = false;
let readGate: (() => void) | null = null;
const calls: { cmd: string; args?: Record<string, unknown> }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "transcripts_dir") return Promise.resolve(FULL);
    if (cmd === "transcripts_list") return Promise.resolve(files);
    if (cmd === "gemini_docs") return geminiError ? Promise.reject("entre com o Google") : Promise.resolve([]);
    if (cmd === "transcript_read") return new Promise((r) => (readGate = () => r("o deploy saiu ontem")));
    return Promise.resolve(null);
  },
}));

const { default: TranscriptsTab } = await import("./TranscriptsTab");

const settle = () => act(() => new Promise((r) => setTimeout(r, 200)));
const reads = () => calls.filter((c) => c.cmd === "transcript_read").length;

async function mount(privacy = false) {
  render(<TranscriptsTab privacy={privacy} onError={() => {}} />);
  await settle();
}

async function openFile() {
  fireEvent.click(screen.getByRole("button", { name: /daily\.txt/ }));
  await act(async () => readGate!());
}

beforeEach(() => {
  files = [file];
  geminiError = false;
  readGate = null;
  calls.length = 0;
});
afterEach(cleanup);

test("the search box is a labelled search field", async () => {
  await mount();
  expect((screen.getByRole("searchbox", { name: "buscar nas transcrições" }) as HTMLInputElement).type).toBe("search");
});

test("privacy blurs file names, previews and the opened text", async () => {
  await mount(true);
  expect(screen.getByText("daily.txt").className).toContain("blur-sm");
  expect(screen.getByText("falamos do deploy").className).toContain("blur-sm");
  await openFile();
  expect(screen.getByText("o deploy saiu ontem").className).toContain("blur-sm");
  expect(screen.getByText("daily.txt").className).toContain("blur-sm");
});

test("Esc closes the transcript and puts the focus back on its card", async () => {
  await mount();
  await openFile();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "voltar" }));
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("button", { name: "voltar" }), { key: "Escape" });
  });
  expect(document.activeElement).toBe(screen.getByRole("button", { name: /daily\.txt/ }));
});

test("the search term is highlighted in the opened text and it can be copied", async () => {
  const written: string[] = [];
  Object.defineProperty(navigator, "clipboard", { value: { writeText: (s: string) => (written.push(s), Promise.resolve()) }, configurable: true });
  await mount();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "deploy" } });
  await settle();
  await openFile();
  expect(document.querySelector("mark")?.textContent).toBe("deploy");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "copiar" }));
  });
  expect(written).toEqual(["o deploy saiu ontem"]);
  expect(screen.getByRole("button", { name: "copiado" })).toBeTruthy();
});

test("while a transcript loads there is a pending status and a second click does not read it again", async () => {
  await mount();
  const card = screen.getByRole("button", { name: /daily\.txt/ });
  fireEvent.click(card);
  fireEvent.click(card);
  expect(reads()).toBe(1);
  expect(card.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByText("abrindo daily.txt")).toBeTruthy();
  await act(async () => readGate!());
});

test("cancelling the folder edit, by button or Esc, keeps the saved path; the display carries it whole", async () => {
  await mount();
  const display = screen.getByRole("button", { name: /pasta:/ });
  expect(display.getAttribute("title")).toContain(FULL);
  fireEvent.click(display);
  fireEvent.change(screen.getByLabelText("pasta das transcrições"), { target: { value: "D:/outra" } });
  fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
  expect(screen.queryByLabelText("pasta das transcrições")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /pasta:/ }));
  expect((screen.getByLabelText("pasta das transcrições") as HTMLInputElement).value).toBe(FULL);
  fireEvent.keyDown(screen.getByLabelText("pasta das transcrições"), { key: "Escape" });
  expect(screen.queryByLabelText("pasta das transcrições")).toBeNull();
  expect(calls.some((c) => c.cmd === "transcripts_set_dir")).toBe(false);
});

test("an empty folder shows one empty state, not one for the files and another for Gemini", async () => {
  files = [];
  await mount();
  expect(screen.getByText("nenhuma transcrição nesta pasta")).toBeTruthy();
  expect(screen.queryByText(/nenhuma anotação ou transcrição do Gemini/)).toBeNull();
});

test("a failed Gemini read offers a retry that asks again", async () => {
  geminiError = true;
  await mount();
  expect(screen.getByRole("alert").textContent).toContain("entre com o Google");
  geminiError = false;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  expect(calls.filter((c) => c.cmd === "gemini_docs")).toHaveLength(2);
  expect(screen.queryByRole("alert")).toBeNull();
});
