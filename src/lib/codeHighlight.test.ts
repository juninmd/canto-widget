import { expect, test } from "bun:test";
import { codeTokens } from "./codeHighlight";

function spans(code: string, lang: string) {
  return codeTokens(code, lang).map((tk) => ({ text: code.slice(tk.from, tk.to), cls: tk.className }));
}

test("keywords, strings, numbers and comments each get their own color", () => {
  const out = spans('const n = 42; // total\nlet s = "oi";', "ts");
  expect(out).toContainEqual({ text: "const", cls: "font-semibold text-accent-text" });
  expect(out).toContainEqual({ text: "42", cls: "text-danger" });
  expect(out).toContainEqual({ text: "// total", cls: "text-faint italic" });
  expect(out).toContainEqual({ text: '"oi"', cls: "text-danger" });
});

test("a keyword inside a string or a comment is not colored as a keyword", () => {
  const out = spans('# return early\nx = "if not"', "py");
  expect(out.map((s) => s.text)).toEqual(["# return early", '"if not"']);
});

test("an escaped quote does not end the string early", () => {
  expect(spans('"a \\" b"', "rust").map((s) => s.text)).toEqual(['"a \\" b"']);
});

test("an identifier that only contains a keyword is left alone", () => {
  expect(spans("letter = format", "js")).toEqual([]);
});

test("SQL keywords match regardless of case", () => {
  expect(spans("select * FROM t", "sql").map((s) => s.text)).toEqual(["select", "FROM"]);
});

test("an unknown or missing language gives no ranges, so the code stays plain text", () => {
  expect(codeTokens("const x = 1", "cobol")).toEqual([]);
  expect(codeTokens("const x = 1", "")).toEqual([]);
  expect(codeTokens("const x = 1", null)).toEqual([]);
});
