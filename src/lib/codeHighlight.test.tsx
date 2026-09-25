import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { highlightCode } from "./codeHighlight";

afterEach(cleanup);

function spans(code: string, lang: string) {
  const { container } = render(<code>{highlightCode(code, lang)}</code>);
  return [...container.querySelectorAll("span")].map((s) => ({ text: s.textContent, cls: s.className }));
}

test("keywords, strings, numbers and comments each get their own color", () => {
  const out = spans('const n = 42; // total\nlet s = "oi";', "ts");
  expect(out).toContainEqual({ text: "const", cls: "font-semibold text-accent" });
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

test("an unknown or missing language comes back as the untouched text", () => {
  expect(highlightCode("const x = 1", "cobol")).toBe("const x = 1");
  expect(highlightCode("const x = 1", "")).toBe("const x = 1");
});

test("markup inside code is shown as text, never parsed as HTML", () => {
  const { container } = render(<code>{highlightCode('el.innerHTML = "<img src=x onerror=alert(1)>"', "js")}</code>);
  expect(container.querySelector("img")).toBeNull();
  expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
});
