import { describe, expect, test } from "bun:test";
import { clipKind, sizeLabel } from "./clip";

describe("clipKind", () => {
  test("a lone URL is a link, but a sentence containing one is text", () => {
    expect(clipKind(" https://example.com/docs?a=1 ")).toBe("link");
    expect(clipKind("veja https://example.com depois")).toBe("text");
  });

  test("hex and css colors get a swatch", () => {
    expect(clipKind("#4f46e5")).toBe("color");
    expect(clipKind("#fff")).toBe("color");
    expect(clipKind("rgb(10, 20, 30)")).toBe("color");
    expect(clipKind("#4f46e")).toBe("text");
    expect(clipKind("#issue-12")).toBe("text");
  });

  test("snippets are shown as code so indentation survives", () => {
    expect(clipKind("SELECT id FROM tarefas;")).toBe("code");
    expect(clipKind("const a = () => 1")).toBe("code");
    expect(clipKind("fn main() {\n  println!(\"oi\");\n}")).toBe("code");
    expect(clipKind("Obrigado pelo retorno! Sigo com a revisão amanhã.")).toBe("text");
    expect(clipKind("2026-09-18 14:00:10 INFO worker-0 job 4200")).toBe("code");
  });
});

test("sizeLabel stays readable from a few characters to millions", () => {
  expect(sizeLabel(42)).toBe("42 caracteres");
  expect(sizeLabel(32_000)).toBe("32 mil caracteres");
  expect(sizeLabel(2_150_000)).toBe("2,2 mi caracteres");
});
