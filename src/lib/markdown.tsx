import type { ReactNode } from "react";
import { api } from "./api";

/** Bold, italic, inline code and http(s) links; anything else stays literal text (React escapes it). */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) nodes.push(<strong key={`${keyPrefix}-${key++}`}>{m[1]}</strong>);
    else if (m[2] !== undefined) nodes.push(<em key={`${keyPrefix}-${key++}`}>{m[2]}</em>);
    else if (m[3] !== undefined) {
      nodes.push(
        <code key={`${keyPrefix}-${key++}`} className="rounded bg-edge px-1 text-[0.9em]">
          {m[3]}
        </code>,
      );
    }
    else if (m[4] !== undefined && m[5] !== undefined) {
      const url = m[5];
      // Same rule as opening any other link in Canto: http(s) only, through the validated command.
      nodes.push(
        url.startsWith("https://") || url.startsWith("http://") ? (
          <button
            key={`${keyPrefix}-${key++}`}
            type="button"
            className="text-accent underline decoration-dotted"
            onClick={() => void api.openLink(url)}
          >
            {m[4]}
          </button>
        ) : (
          m[0]
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function heading(level: number, key: string, content: ReactNode[]) {
  const className = "font-semibold text-fg";
  if (level === 1) return <h1 key={key} className={`text-base ${className}`}>{content}</h1>;
  if (level === 2) return <h2 key={key} className={`text-sm ${className}`}>{content}</h2>;
  return <h3 key={key} className={`text-sm ${className}`}>{content}</h3>;
}

/** A small, dependency-free subset: headings, lists, bold/italic/code, links. No raw HTML passthrough. */
export function renderMarkdown(text: string): ReactNode {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  function flushList() {
    if (!list) return;
    const items = list.items;
    const className = list.ordered ? "list-decimal pl-5" : "list-disc pl-5";
    blocks.push(
      list.ordered ? (
        <ol key={`b${key++}`} className={className}>
          {items.map((it, i) => (
            <li key={i}>{inline(it, `li${key}-${i}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={`b${key++}`} className={className}>
          {items.map((it, i) => (
            <li key={i}>{inline(it, `li${key}-${i}`)}</li>
          ))}
        </ul>
      ),
    );
    list = null;
  }

  for (const line of text.split("\n")) {
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      blocks.push(heading(h[1].length, `b${key++}`, inline(h[2], `h${key}`)));
    } else if (bullet) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={`b${key++}`}>{inline(line, `p${key}`)}</p>);
    }
  }
  flushList();
  return <>{blocks}</>;
}
