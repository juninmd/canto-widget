import type { AnyExtension, JSONContent } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";
import { LINK_CLOSE, LINK_MID, LINK_OPEN, noteExtensions } from "./noteSchema";

const WORD = /[\p{L}\p{N}]/u;
const SPACE = /\s/;
const PUNCT = /[!-/:-@[-`{-~]/;

/**
 * Escapes only what would really change meaning when the note is read back. Tiptap's default escapes every `*`,
 * `_`, `[`, `<` and `&`, which would rewrite `snake_case`, `2 * 3` or `a < b` in notes the user never touched and
 * break search and the card preview over those words.
 */
export function escapeText(text: string): string {
  let out = "";
  const tildes = (text.match(/~/g) ?? []).length;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const prev = text[i - 1] ?? "";
    const next = text[i + 1] ?? "";
    let escape = false;
    if (c === "`") escape = true;
    else if (c === "\\") escape = next === "" || next === "\n" || PUNCT.test(next);
    else if (c === "*") escape = !(SPACE.test(prev) && SPACE.test(next));
    else if (c === "_") escape = !((WORD.test(prev) && WORD.test(next)) || (SPACE.test(prev) && SPACE.test(next)));
    else if (c === "~") escape = tildes > 1;
    else if (c === "&" && /^&(amp|lt|gt|quot);/.test(text.slice(i))) {
      out += "&amp;";
      continue;
    }
    out += escape ? `\\${c}` : c;
  }
  return out;
}

type Internals = {
  encodeTextForMarkdown: (text: string, node: JSONContent, parent?: JSONContent) => string;
  parseHTMLToken: (token: { raw?: string; text?: string; block?: boolean }) => JSONContent | JSONContent[] | null;
  htmlAsLiteralText: (html: string, block: boolean) => JSONContent | JSONContent[] | null;
};

function createManager(extensions: AnyExtension[]): MarkdownManager {
  const manager = new MarkdownManager({ extensions, markedOptions: { gfm: true, breaks: false } });
  // Private in Tiptap: the default still decides what is code (left raw); only the escaping rule is ours.
  const target = manager as unknown as Internals;
  const original = target.encodeTextForMarkdown.bind(manager);
  target.encodeTextForMarkdown = (text, node, parent) => (original(text, node, parent) === text ? text : escapeText(text));
  // Raw HTML in a note was always shown as text; parsing it would drop tags or smuggle in markup.
  const literal = target.htmlAsLiteralText.bind(manager);
  target.parseHTMLToken = (token) => literal(String(token.raw ?? token.text ?? ""), !!token.block);
  return manager;
}

let shared: MarkdownManager | null = null;

/** One manager for the note schema; building it registers tokenizers, so it is made once. */
export function noteMarkdown(): MarkdownManager {
  shared ??= createManager(noteExtensions());
  return shared;
}

const CHUNK = 1024;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/**
 * Cuts at a single blank line followed by an unindented line outside a code fence: nothing from before can
 * continue past that point, so each piece parses the same as the whole.
 */
export function splitBlocks(markdown: string): string[] {
  const lines = markdown.split("\n");
  const chunks: string[] = [];
  let start = 0;
  let size = 0;
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = FENCE.exec(line)?.[1];
    if (fence) {
      if (open && open[0] === fence[0] && open.length >= fence.length && line.trim() === open) fence = null;
    } else if (open) fence = open;
    size += line.length + 1;
    const next = lines[i + 2];
    if (!fence && size >= CHUNK && lines[i + 1] === "" && next !== undefined && /^[^\s]/.test(next)) {
      chunks.push(lines.slice(start, i + 1).join("\n"));
      start = i + 2;
      size = 0;
      i++;
    }
  }
  chunks.push(lines.slice(start).join("\n"));
  return chunks;
}

// marked's block rules rescan the rest of the text at every block, which WebKit (macOS, Linux) makes quadratic.
export function parseNote(markdown: string): JSONContent {
  const manager = noteMarkdown();
  const content = splitBlocks(markdown.replace(/\r\n?/g, "\n")).flatMap((chunk) => manager.parse(chunk).content ?? []);
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

const LINK = new RegExp(`${LINK_OPEN}([^${LINK_MID}]*)${LINK_MID}([\\s\\S]*?)${LINK_CLOSE}`, "g");

/** A link whose text is its own URL goes back out bare, as the autolink it was typed as. */
function writeLinks(markdown: string): string {
  return markdown.replace(LINK, (_, href: string, text: string) => {
    const plain = text.replace(/\\([!-/:-@[-`{-~])/g, "$1");
    if (!/\s/.test(plain) && (plain === href || `http://${plain}` === href)) return plain;
    return `[${text}](${href})`;
  });
}

export function serializeNote(doc: JSONContent): string {
  const content = [...(doc.content ?? [])];
  // The editor keeps an empty paragraph after a trailing list or code block so the cursor can leave it.
  while (content.length && content.at(-1)?.type === "paragraph" && !content.at(-1)?.content?.length) content.pop();
  return writeLinks(noteMarkdown().serialize({ ...doc, content }));
}
