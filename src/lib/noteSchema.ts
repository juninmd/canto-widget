import { Extension, type AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import { OrderedList, TaskItem, TaskList } from "@tiptap/extension-list";
import { CantoImage } from "./noteImageNode";

/** Same rule as every other link Canto opens: http(s) only. */
export function isHttpUrl(url: unknown): url is string {
  return typeof url === "string" && /^https?:\/\/[^\s]+$/i.test(url.trim());
}

export const LINK_OPEN = "\uE010";
export const LINK_MID = "\uE011";
export const LINK_CLOSE = "\uE012";

const SafeLink = Link.extend({
  // Typing right after a link starts plain text again instead of silently growing the link.
  inclusive: () => false,
  parseMarkdown: (token, helpers) => {
    // A javascript:, file: or mailto: link stays the text the user wrote instead of becoming clickable.
    if (!isHttpUrl(token.href)) return { type: "text", text: String(token.raw ?? "") };
    return helpers.applyMark("link", helpers.parseInline(token.tokens ?? []), { href: token.href, title: token.title || null });
  },
  renderMarkdown: (node, h) => {
    const href = String(node.attrs?.href ?? "");
    if (node.attrs?.title) return `[${h.renderChildren(node)}](${href} "${String(node.attrs.title).replace(/"/g, '\\"')}")`;
    // Marks are rendered as open/close strings without seeing their text; noteMarkdown decides bare URL vs [text](url).
    return `${LINK_OPEN}${href}${LINK_MID}${h.renderChildren(node)}${LINK_CLOSE}`;
  },
}).configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  defaultProtocol: "https",
  isAllowedUri: (url) => isHttpUrl(url),
  HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
});

/** Markdown the editor has no node for (tables, reference definitions) is kept as the literal text it was. */
function literalBlock(token: string): AnyExtension {
  return Extension.create({
    name: `literal-${token}`,
    markdownTokenName: token,
    parseMarkdown: (tk) => {
      const text = String(tk.raw ?? "").replace(/\s+$/, "");
      return text ? { type: "paragraph", content: [{ type: "text", text }] } : [];
    },
  });
}

type Tokenizer = NonNullable<typeof TaskList.config.markdownTokenizer>;

/**
 * Tiptap's list tokenizers split the whole remaining note into lines at every block marked tries; a cheap look at
 * the first line first keeps a 50 KB note from taking seconds to open.
 */
function firstLineOnly(tokenizer: Tokenizer | undefined, firstLine: RegExp): Tokenizer | undefined {
  if (!tokenizer) return tokenizer;
  return { ...tokenizer, tokenize: (src, tokens, lexer) => (firstLine.test(src) ? tokenizer.tokenize(src, tokens, lexer) : undefined) };
}

const FastOrderedList = OrderedList.extend({
  markdownTokenizer: firstLineOnly(OrderedList.config.markdownTokenizer, /^[ \t]*\d+[.)][ \t]/),
});
const FastTaskList = TaskList.extend({
  markdownTokenizer: firstLineOnly(TaskList.config.markdownTokenizer, /^[ \t]*[-+*][ \t]+\[[ xX]\][ \t]/),
});

// Mod-Enter saves the note; without this it would first drop a line break into the text.
const SoftBreak = HardBreak.extend({
  addKeyboardShortcuts() {
    return { "Shift-Enter": () => this.editor.commands.setHardBreak() };
  },
});

/** The nodes and marks a note can hold; everything else is dropped on paste by the schema itself. */
export function noteExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({ link: false, hardBreak: false, underline: false, orderedList: false }),
    FastOrderedList,
    SoftBreak,
    SafeLink,
    FastTaskList,
    TaskItem.configure({ nested: true, a11y: { checkboxLabel: (node) => node.textContent } }),
    CantoImage,
    literalBlock("table"),
    literalBlock("def"),
  ];
}
