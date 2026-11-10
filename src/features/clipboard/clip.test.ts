import { describe, expect, test } from "bun:test";
import { clipKind, kindCounts, parseMaxPinned, sameClips, sizeLabel } from "./clip";

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

  test("a lone JSON object or array is parsed and shown as json, not code", () => {
    expect(clipKind('{"nome":"Ana","idade":30}')).toBe("json");
    expect(clipKind("[1, 2, 3]")).toBe("json");
    expect(clipKind("{not valid json}")).toBe("code");
  });

  test("a lone e-mail address is recognized, a sentence containing one is not", () => {
    expect(clipKind("ana@example.com")).toBe("email");
    expect(clipKind("fale com ana@example.com amanhã")).toBe("text");
  });

  test("common phone shapes are recognized, a plain date is not", () => {
    expect(clipKind("(11) 98765-4321")).toBe("phone");
    expect(clipKind("+55 11 98765-4321")).toBe("phone");
    expect(clipKind("11987654321")).toBe("phone");
    expect(clipKind("2026-09-18")).toBe("text");
  });
});

test("sizeLabel stays readable from a few characters to millions", () => {
  expect(sizeLabel(42)).toBe("42 caracteres");
  expect(sizeLabel(32_000)).toBe("32 mil caracteres");
  expect(sizeLabel(2_150_000)).toBe("2,2 mi caracteres");
});

test("kindCounts tallies every kind, zero included", () => {
  expect(kindCounts(["https://a.io", "https://b.io", "#fff", "oi", "x@y.com"])).toEqual({ link: 2, color: 1, json: 0, email: 1, phone: 0, code: 0, text: 1 });
  expect(Object.values(kindCounts([])).every((n) => n === 0)).toBe(true);
});

test("parseMaxPinned accepts whole numbers up to 1000 and ignores a keystroke in progress", () => {
  expect(parseMaxPinned("25")).toBe(25);
  expect(parseMaxPinned(" 7 ")).toBe(7);
  expect(parseMaxPinned("5000")).toBe(1000);
  for (const bad of ["", "0", "-3", "1.5", "abc"]) expect(parseMaxPinned(bad)).toBeNull();
});

describe("sameClips", () => {
  const a = { id: "c1", preview: "oi", chars: 2, kept: 2, truncated: false, copied_at: 1, pinned: false };
  test("fresh copies of the same clips are the same list", () => {
    expect(sameClips([a], [{ ...a }])).toBe(true);
    expect(sameClips([], [])).toBe(true);
  });
  test("a new clip, a pin or a re-copy is a change", () => {
    expect(sameClips([a], [a, { ...a, id: "c2" }])).toBe(false);
    expect(sameClips([a], [{ ...a, pinned: true }])).toBe(false);
    expect(sameClips([a], [{ ...a, copied_at: 2 }])).toBe(false);
  });
});
