/** Markdown as React elements: never raw HTML, and a link only does what the caller says it does. */
import type { ReactNode } from "react";
import { Marked, type Token, type Tokens } from "marked";

// Its own instance: the editor's markdown extension registers custom tokenizers on the shared one.
export const markdown = new Marked({ gfm: true });
// Alerts come from single-line sources (a comment, an incident, a summary of lines): a lone newline is
// a line break there, the way GitHub renders it.
export const inlineMarkdown = new Marked({ gfm: true, breaks: true });

export type Render = {
  /** Plain text: a note preview highlights the search term, an alert shows it as it is. */
  text: (text: string) => ReactNode;
  /** A link; without one the text stays text, which is what a card that is itself a button wants. */
  link?: (href: string, children: ReactNode, key: string) => ReactNode;
};

export function inline(tokens: Token[] | undefined, render: Render, key: string): ReactNode[] {
  return (tokens ?? []).map((tok, i) => {
    const k = `${key}-${i}`;
    switch (tok.type) {
      case "strong":
        return <strong key={k} className="font-semibold text-fg">{inline((tok as Tokens.Strong).tokens, render, k)}</strong>;
      case "em":
        return <em key={k}>{inline((tok as Tokens.Em).tokens, render, k)}</em>;
      case "del":
        return <del key={k}>{inline((tok as Tokens.Del).tokens, render, k)}</del>;
      case "codespan":
        return <code key={k} className="rounded bg-edge px-0.5 font-mono">{render.text((tok as Tokens.Codespan).text)}</code>;
      case "link": {
        const children = inline((tok as Tokens.Link).tokens, render, k);
        if (render.link) return render.link((tok as Tokens.Link).href, children, k);
        return <span key={k} className="text-accent-text underline decoration-dotted">{children}</span>;
      }
      case "image":
        return null;
      case "br":
        return <br key={k} />;
      case "text":
      case "escape": {
        const t = tok as Tokens.Text;
        return <span key={k}>{t.tokens ? inline(t.tokens, render, k) : render.text(t.text)}</span>;
      }
      default:
        return <span key={k}>{render.text("text" in tok ? String(tok.text) : tok.raw)}</span>;
    }
  });
}

export function block(tok: Token, render: Render, key: string): ReactNode {
  switch (tok.type) {
    case "space":
    case "hr":
      return null;
    case "heading":
      return <div key={key} className="font-semibold text-fg">{inline((tok as Tokens.Heading).tokens, render, key)}</div>;
    case "paragraph":
      return <div key={key}>{inline((tok as Tokens.Paragraph).tokens, render, key)}</div>;
    case "list": {
      const list = tok as Tokens.List;
      const checklist = list.items.some((i) => i.task);
      const items = list.items.map((item, i) => {
        const k = `${key}-${i}`;
        // A nested list or quote keeps its text (dropping the token would silently eat it), and it stays
        // outside the inline span: a block cannot live inside a span.
        const blocks: ReactNode[] = [];
        const inside: ReactNode[] = [];
        item.tokens.forEach((t, j) => {
          const child = `${k}-${j}`;
          if (t.type === "list" || t.type === "blockquote" || t.type === "code") blocks.push(block(t, render, child));
          else if (t.type === "text" || t.type === "paragraph") inside.push(...inline((t as Tokens.Text).tokens ?? [t], render, child));
        });
        return (
          <li key={k}>
            <span className={item.task ? "flex gap-1" : ""}>
              {item.task && <span aria-hidden="true">{item.checked ? "☑" : "☐"}</span>}
              <span className={item.checked ? "line-through opacity-70" : ""}>{inside}</span>
            </span>
            {blocks}
          </li>
        );
      });
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
          {render.text((tok as Tokens.Code).text)}
        </pre>
      );
    case "blockquote":
      return (
        <div key={key} className="border-l-2 border-line pl-1.5 italic">
          {(tok as Tokens.Blockquote).tokens.map((t, i) => block(t, render, `${key}-${i}`))}
        </div>
      );
    default:
      return <div key={key}>{render.text(tok.raw.trim())}</div>;
  }
}
