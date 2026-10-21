import { block, markdown, type Render } from "../lib/markdown";
import { highlight } from "../lib/highlight";
import { stripImageRefs } from "../lib/noteImages";

/** A card only shows its first lines: lexing a 100 KB note for them would stall a long list. */
const MAX_SOURCE = 2000;
const MAX_BLOCKS = 6;

function head(body: string): string {
  const text = stripImageRefs(body);
  if (text.length <= MAX_SOURCE) return text;
  const cut = text.lastIndexOf("\n", MAX_SOURCE);
  return text.slice(0, cut > 0 ? cut : MAX_SOURCE);
}

/** The start of a note rendered like the editor shows it (titles, lists, checklists, code), clipped to a few lines. */
export default function NotePreview({ body, query, className = "", compact = false }: { body: string; query: string; className?: string; compact?: boolean }) {
  const tokens = markdown.lexer(head(body)).filter((t) => t.type !== "space").slice(0, compact ? 3 : MAX_BLOCKS);
  if (tokens.length === 0) return null;
  // Links stay text: the whole card is already a button.
  const render: Render = { text: (text) => highlight(text, query) };
  return (
    <div
      className={`mt-0.5 space-y-0.5 overflow-hidden break-words text-xs text-muted ${
        compact ? "max-h-14 [mask-image:linear-gradient(to_bottom,black_2.5rem,transparent_3.5rem)]" : "max-h-24 [mask-image:linear-gradient(to_bottom,black_4.5rem,transparent_6rem)]"
      } ${className}`}
    >
      {tokens.map((t, i) => block(t, render, `b${i}`))}
    </div>
  );
}
