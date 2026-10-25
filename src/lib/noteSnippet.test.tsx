import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { noteSnippet, snippetStart } from "./noteSnippet";
import NotePreview from "../components/NotePreview";

afterEach(cleanup);

const filler = Array.from({ length: 12 }, (_, i) => `Linha ${i} de enchimento sem nada.`).join("\n");

test("a match near the top keeps the note's start", () => {
  expect(snippetStart("Pauta: ação imediata\nresto", "acao")).toBe(0);
  expect(noteSnippet("curta", "acao")).toBe("curta");
});

test("an empty or #tag query keeps the start", () => {
  const text = `${filler}\nPlano de ação`;
  expect(snippetStart(text, "")).toBe(0);
  expect(snippetStart(text, "#acao")).toBe(0);
});

test("a deep match starts at its line, ignoring accents and case", () => {
  expect(noteSnippet(`${filler}\nPlano de AÇÃO para amanhã`, "acao")).toBe("… Plano de AÇÃO para amanhã");
  expect(noteSnippet(`${filler}\nproxima acao`, "Ação")).toBe("… proxima acao");
});

test("offsets stay right when folding changes the length (NFD marks)", () => {
  // Every accent is decomposed, so the folded text is shorter than the original.
  const nfd = `${"Reunião sobre decisões já tomadas. ".repeat(6)}\nAção final`.normalize("NFD");
  const start = snippetStart(nfd, "acao");
  expect(nfd.slice(start)).toBe("Ação final".normalize("NFD"));
});

test("a long line cuts at a word shortly before the match", () => {
  const out = noteSnippet(`${"palavra ".repeat(40)}e então a ação começa`, "acao");
  expect(out.startsWith("… palavra")).toBe(true);
  expect(out.endsWith("e então a ação começa")).toBe(true);
  expect(out.length).toBeLessThan(80);
});

test("the card preview shows and highlights a deep accent-insensitive match", () => {
  render(<NotePreview body={`${filler}\nPlano de ação`} query="acao" />);
  expect(screen.getByText("ação").tagName).toBe("MARK");
});
