import { expect, test } from "bun:test";
import type { JSONContent } from "@tiptap/core";
import { escapeText, parseNote, serializeNote, splitBlocks } from "./noteMarkdown";
import { imageIds, stripImageRefs } from "./noteImages";

const roundTrip = (md: string) => serializeNote(parseNote(md));

function nodes(doc: JSONContent, type: string): JSONContent[] {
  const found: JSONContent[] = [];
  const walk = (n: JSONContent) => {
    if (n.type === type) found.push(n);
    n.content?.forEach(walk);
  };
  walk(doc);
  return found;
}

test.each([
  ["headings", "# um\n\n## dois\n\n### três"],
  ["bullet list", "- a\n- b\n- c"],
  ["numbered list", "1. a\n2. b\n3. c"],
  ["numbered list starting later", "3. c\n4. d"],
  ["checklist", "- [ ] leite\n- [x] pão"],
  ["fenced code with language", "```ts\nconst a = 1;\n\n# não é título\n**nem negrito**\n```"],
  ["fenced code without language", "```\nx = 1\n```"],
  ["bold, italic and inline code", "**forte** e *itálico* e `código`"],
  ["http link", "veja [o site](https://exemplo.com/a_b)"],
  ["bare URL", "veja https://exemplo.com/a_b e www.exemplo.com"],
  ["note image", "antes ![](canto-img:ab12) depois"],
  ["note image with alt text", "![planta](canto-img:ab12)"],
  ["paragraphs", "primeiro\n\nsegundo"],
  ["line break inside a paragraph", "linha um\nlinha dois"],
  ["nested checklist", "- [ ] pai\n  - [x] filho"],
  ["quote and rule", "> citação\n\n---"],
  ["strikethrough", "~~feito~~"],
])("%s survives text → editor → text unchanged", (_, md) => {
  expect(roundTrip(md)).toBe(md);
});

test("a real legacy note mixing everything keeps every word and settles after one save", () => {
  const legacy = [
    "# compras da semana",
    "- [x] leite",
    "- [ ] pão integral",
    "* ovos",
    "1. mercado",
    "2. feira",
    "texto solto com **negrito**, *itálico*, `código`, snake_case e 2 * 3 < 4",
    "```rust",
    "fn main() {}",
    "```",
    "![](canto-img:ab12)",
    "veja [o PR](https://github.com/exemplo/repo/pull/1)",
  ].join("\n");
  const once = roundTrip(legacy);
  expect(roundTrip(once)).toBe(once);
  const words = (s: string) => s.match(/[\p{L}\p{N}_]+/gu) ?? [];
  expect(words(once).sort()).toEqual(words(legacy).sort());
  expect(once).toContain("- [x] leite\n- [ ] pão integral");
  expect(once).toContain("```rust\nfn main() {}\n```");
  expect(once).toContain("snake_case e 2 * 3 < 4");
  expect(imageIds(once)).toEqual(["ab12"]);
});

test.each([
  ["a table", "| a | b |\n|---|---|\n| 1 | 2 |"],
  ["raw HTML", "<div>oi</div> e <b>x</b>"],
  ["inline HTML", "texto <span class=\"x\">y</span> fim"],
  ["a reference definition", "[1]: https://exemplo.com"],
  ["a remote image", "![x](https://exemplo.invalid/a.png)"],
  ["a file image", "![y](file:///c/a.png)"],
  ["a javascript: link", "[clique](javascript:alert(1))"],
  ["an e-mail autolink", "fale com a@exemplo.com"],
  ["a fourth-level heading", "#### quatro"],
  ["a tilde path", "~/pasta/arquivo"],
])("markdown the editor has no node for (%s) comes back as the same text", (_, md) => {
  expect(roundTrip(md)).toBe(md);
});

test("remote, file and data images never become image nodes", () => {
  const doc = parseNote("![a](https://x.invalid/a.png) ![b](file:///a.png) ![c](data:image/png;base64,QUI=) ![d](canto-img:XYZ)");
  expect(nodes(doc, "cantoImage")).toEqual([]);
});

test("a non-http(s) markdown link stays text instead of a link mark", () => {
  const doc = parseNote("[a](javascript:alert(1)) [b](file:///etc/passwd) [c](https://ok.example)");
  const hrefs = JSON.stringify(doc).match(/"href":"[^"]*"/g);
  expect(hrefs).toEqual(['"href":"https://ok.example"']);
});

test("literal characters typed by the user are escaped only where they would turn into formatting", () => {
  expect(escapeText("snake_case e 2 * 3 e a < b & c")).toBe("snake_case e 2 * 3 e a < b & c");
  expect(escapeText("*não itálico* e _nem este_")).toBe("\\*não itálico\\* e \\_nem este\\_");
  expect(escapeText("use `crase` e \\* e ~~x~~")).toBe("use \\`crase\\` e \\\\\\* e \\~\\~x\\~\\~");
  expect(escapeText("&amp; literal")).toBe("&amp;amp; literal");
  const typed = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "*a* _b_ `c` &lt;" }] }] };
  expect(serializeNote(parseNote(serializeNote(typed)))).toBe(serializeNote(typed));
  expect(JSON.stringify(parseNote(serializeNote(typed)))).toContain('"text":"*a* _b_ `c` &lt;"');
});

test("the card preview and image list read the serialized markdown as before", () => {
  const md = roundTrip("topo\n\n![](canto-img:ab12)\n\nfim");
  expect(stripImageRefs(md)).toBe("topo\n\nfim");
  expect(imageIds(md)).toEqual(["ab12"]);
});

test("CRLF notes parse like LF ones", () => {
  expect(roundTrip("# lista\r\n- [x] leite")).toBe("# lista\n\n- [x] leite");
});

test("large notes are cut only between top-level blocks, never inside a fence", () => {
  const fence = "```\n" + "linha\n\nsolta\n".repeat(200) + "```";
  const md = "a".repeat(1100) + "\n\n" + fence + "\n\nfim";
  const chunks = splitBlocks(md);
  expect(chunks.join("\n\n")).toBe(md);
  expect(chunks.some((c) => c.startsWith("```") && c.endsWith("```"))).toBe(true);
  expect(chunks.at(-1)).toBe("fim");
});

test("a 50 KB note opens and saves quickly and without changes", () => {
  const chunk = "# Seção\n\nTexto com **negrito**, *itálico*, `código` e [link](https://exemplo.com).\n\n- [ ] a fazer\n- [x] feito\n\n1. um\n2. dois\n\n```ts\nconst x = 1;\n```\n\n";
  let md = "";
  while (md.length < 50_000) md += chunk;
  md = md.trimEnd();
  const start = performance.now();
  const doc = parseNote(md);
  const out = serializeNote(doc);
  // Generous for CI; locally this is ~150 ms on JavaScriptCore and much less on V8.
  expect(performance.now() - start).toBeLessThan(1500);
  expect(out).toBe(md);
});
