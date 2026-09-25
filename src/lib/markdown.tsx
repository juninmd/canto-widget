import type { ReactNode } from "react";
import { api } from "./api";
import { highlightCode } from "./codeHighlight";

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

type ListKind = "ul" | "ol" | "check";
type ListItem = { text: string; line: number; done: boolean };

const CHECK = /^[-*]\s+\[( |x|X)\]\s+(.*)$/;
const FENCE = /^```\s*([\w+#-]*)\s*$/;

/** Link targets and emphasis markers dropped, for an accessible name. */
function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "");
}

/** Flips `- [ ]` <-> `- [x]` on one line; any other line leaves the text untouched. */
export function toggleChecklist(text: string, line: number): string {
  const lines = text.split("\n");
  const m = CHECK.exec((lines[line] ?? "").replace(/\r$/, ""));
  if (!m) return text;
  lines[line] = lines[line].replace(/\[( |x|X)\]/, m[1] === " " ? "[x]" : "[ ]");
  return lines.join("\n");
}

/**
 * A small, dependency-free subset: headings, lists, checklists, fenced code, bold/italic/code, links.
 * No raw HTML passthrough. Checkboxes only toggle when `onToggle` is given (it gets the source line).
 */
export function renderMarkdown(text: string, onToggle?: (line: number) => void): ReactNode {
  const blocks: ReactNode[] = [];
  let list: { kind: ListKind; items: ListItem[] } | null = null;
  let fence: { lang: string; lines: string[] } | null = null;
  let key = 0;

  function flushList() {
    if (!list) return;
    const k = key++;
    const items = list.items.map((it, i) =>
      list!.kind === "check" ? (
        // Not a <label>: it would forward a click on a link inside the item to the checkbox.
        <li key={i} className="flex items-start gap-1.5">
          <input
            type="checkbox"
            checked={it.done}
            disabled={!onToggle}
            onChange={() => onToggle?.(it.line)}
            aria-label={plainText(it.text)}
            className="mt-1 accent-[var(--color-accent)]"
          />
          <span className={it.done ? "text-muted line-through" : ""}>{inline(it.text, `li${k}-${i}`)}</span>
        </li>
      ) : (
        <li key={i}>{inline(it.text, `li${k}-${i}`)}</li>
      ),
    );
    if (list.kind === "ol") blocks.push(<ol key={`b${k}`} className="list-decimal pl-5">{items}</ol>);
    else blocks.push(<ul key={`b${k}`} className={list.kind === "ul" ? "list-disc pl-5" : ""}>{items}</ul>);
    list = null;
  }

  function flushFence() {
    if (!fence) return;
    blocks.push(
      <pre key={`b${key++}`} className="my-1 overflow-x-auto rounded border border-edge bg-ink p-2 text-xs" data-lang={fence.lang || undefined}>
        <code>{highlightCode(fence.lines.join("\n"), fence.lang)}</code>
      </pre>,
    );
    fence = null;
  }

  function pushItem(kind: ListKind, item: ListItem) {
    if (!list || list.kind !== kind) {
      flushList();
      list = { kind, items: [] };
    }
    list.items.push(item);
  }

  text.split("\n").forEach((raw, n) => {
    // CRLF bodies (pasted or synced from Windows) would otherwise defeat every `(.*)$` below.
    const line = raw.replace(/\r$/, "");
    const opener = FENCE.exec(line);
    if (fence) {
      if (opener && !opener[1]) flushFence();
      else fence.lines.push(line);
      return;
    }
    if (opener) {
      flushList();
      fence = { lang: opener[1], lines: [] };
      return;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    const check = CHECK.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      blocks.push(heading(h[1].length, `b${key++}`, inline(h[2], `h${key}`)));
    } else if (check) pushItem("check", { text: check[2], line: n, done: check[1] !== " " });
    else if (bullet) pushItem("ul", { text: bullet[1], line: n, done: false });
    else if (numbered) pushItem("ol", { text: numbered[1], line: n, done: false });
    else if (line.trim() === "") flushList();
    else {
      flushList();
      blocks.push(<p key={`b${key++}`}>{inline(line, `p${key}`)}</p>);
    }
  });
  // An unclosed fence still shows as code, like GitHub does.
  flushFence();
  flushList();
  return <>{blocks}</>;
}
