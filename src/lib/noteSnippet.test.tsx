import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { matchSnippet } from "./noteSnippet";
import NotePreview from "../components/NotePreview";

afterEach(cleanup);

const filler = "Lorem ipsum dolor sit amet consectetur adipiscing elit. ".repeat(8);
const long = `# Reunião\n\n${filler}\n\n- [ ] ligar para o **fornecedor** amanhã cedo\n\n${filler}`;

test("cuts a word-aligned excerpt around a match deep in the body", () => {
  const s = matchSnippet(long, "fornecedor", 160)!;
  expect(s).toContain("ligar para o fornecedor amanhã cedo");
  expect(s.startsWith("…")).toBe(true);
  expect(s.endsWith("…")).toBe(true);
  // Markdown markers are dropped from the excerpt.
  expect(s).not.toContain("**");
  expect(s).not.toContain("[ ]");
  expect(s.length).toBeLessThan(200);
  // Lines are joined with a separator, never left dangling next to the ellipsis.
  expect(s).not.toContain("…·");
  expect(s).not.toContain("·…");
});

test("matches regardless of case", () => {
  expect(matchSnippet(long, "FORNECEDOR", 160)).toContain("fornecedor");
});

test("returns null when the preview already shows the match, or there is nothing to show", () => {
  expect(matchSnippet(long, "Reunião", 160)).toBeNull();
  expect(matchSnippet(long, "inexistente", 160)).toBeNull();
  expect(matchSnippet(long, "", 160)).toBeNull();
  expect(matchSnippet(long, "#trabalho", 160)).toBeNull();
});

test("a narrower preview needs the excerpt sooner", () => {
  const body = "Comprar pão, leite, ovos, manteiga, café e depois passar no banco para pagar a conta";
  expect(matchSnippet(body, "banco", 160)).toBeNull();
  expect(matchSnippet(body, "banco", 30)).toContain("banco");
});

test("NotePreview shows the highlighted excerpt instead of the note's start", () => {
  render(<NotePreview body={long} query="fornecedor" />);
  const snippet = screen.getByTestId("note-snippet");
  expect(snippet.querySelector("mark")?.textContent).toBe("fornecedor");
  expect(screen.queryByText("Reunião")).toBeNull();
});

test("NotePreview keeps the rendered start when there is no query", () => {
  render(<NotePreview body={long} query="" />);
  expect(screen.queryByTestId("note-snippet")).toBeNull();
  expect(screen.getByText("Reunião")).toBeTruthy();
});
