import type { ReactNode } from "react";
import { Marked, type Token, type Tokens } from "marked";
import { highlight } from "../lib/highlight";
import { stripImageRefs } from "../lib/noteImages";

/** A card only shows its first lines: lexing a 100 KB note for them would stall a long list. */
const MAX_SOURCE = 2000;
const MAX_BLOCKS = 6;
// Its own instance: the editor's markdown extension registers custom tokenizers on the shared one.
const md = new Marked({ gfm: true });

function head(body: string): string {
  const text = stripImageRefs(body);
  if (text.length <= MAX_SOURCE) return text;
  const cut = text.lastIndexOf("\n", MAX_SOURCE);
  return text.slice(0, cut > 0 ? cut : MAX_SOURCE);
}

/** Inline markdown as React elements: never raw HTML, and links stay text because the whole card is a button. */
function inline(tokens: Token[] | undefined, query: string, key: string): ReactNode[] {
  return (tokens ?? []).map((tok, i) => {
    const k = `${key}-${i}`;
    switch (tok.type) {
      case "strong":
        return <strong key={k} className="font-semibold text-fg">{inline((tok as Tokens.Strong).tokens, query, k)}</strong>;
      case "em":
        return <em key={k}>{inline((tok as Tokens.Em).tokens, query, k)}</em>;
      case "del":
        return <del key={k}>{inline((tok as Tokens.Del).tokens, query, k)}</del>;
      case "codespan":
        return <code key={k} className="rounded bg-edge px-0.5 font-mono">{highlight((tok as Tokens.Codespan).text, query)}</code>;
      case "link":
        return <span key={k} className="text-accent underline decoration-dotted">{inline((tok as Tokens.Link).tokens, query, k)}</span>;
      case "image":
        return null;
      case "br":
        return <br key={k} />;
      case "text":
      case "escape": {
        const t = tok as Tokens.Text;
        return <span key={k}>{t.tokens ? inline(t.tokens, query, k) : highlight(t.text, query)}</span>;
      }
      default:
        return <span key={k}>{highlight("text" in tok ? String(tok.text) : tok.raw, query)}</span>;
    }
  });
}

function block(tok: Token, query: string, key: string): ReactNode {
  switch (tok.type) {
    case "space":
    case "hr":
      return null;
    case "heading":
      return <div key={key} className="font-semibold text-fg">{inline((tok as Tokens.Heading).tokens, query, key)}</div>;
    case "paragraph":
      return <div key={key}>{inline((tok as Tokens.Paragraph).tokens, query, key)}</div>;
    case "list": {
      const list = tok as Tokens.List;
      const checklist = list.items.some((i) => i.task);
      const items = list.items.map((item, i) => (
        <li key={`${key}-${i}`} className={item.task ? "flex gap-1" : ""}>
          {item.task && <span aria-hidden="true">{item.checked ? "☑" : "☐"}</span>}
          <span className={item.checked ? "line-through opacity-70" : ""}>
            {item.tokens.flatMap((t, j) =>
              t.type === "text" || t.type === "paragraph" ? inline((t as Tokens.Text).tokens ?? [t], query, `${key}-${i}-${j}`) : [],
            )}
          </span>
        </li>
      ));
      return list.ordered ? (
        <ol key={key} start={typeof list.start === "number" ? list.start : undefined} className="list-decimal pl-4">
          {items}
        </ol>
      ) : (
        <ul key={key} className={checklist ? "" : "list-disc pl-4"}>
          {items}
        </ul>
      );
    }
    case "code":
      return (
        <pre key={key} className="overflow-hidden rounded bg-edge px-1 font-mono text-[11px]">
          {highlight((tok as Tokens.Code).text, query)}
        </pre>
      );
    case "blockquote":
      return (
        <div key={key} className="border-l-2 border-line pl-1.5 italic">
          {(tok as Tokens.Blockquote).tokens.map((t, i) => block(t, query, `${key}-${i}`))}
        </div>
      );
    default:
      return <div key={key}>{highlight(tok.raw.trim(), query)}</div>;
  }
}

/** The start of a note rendered like the editor shows it (titles, lists, checklists, code), clipped to a few lines. */
export default function NotePreview({ body, query, className = "" }: { body: string; query: string; className?: string }) {
  const tokens = md.lexer(head(body)).filter((t) => t.type !== "space").slice(0, MAX_BLOCKS);
  if (tokens.length === 0) return null;
  return (
    <div className={`mt-0.5 max-h-24 space-y-0.5 overflow-hidden break-words text-xs text-muted [mask-image:linear-gradient(to_bottom,black_4.5rem,transparent_6rem)] ${className}`}>
      {tokens.map((t, i) => block(t, query, `b${i}`))}
    </div>
  );
}
