const MARKDOWN_SPECIALS = new Set("\\`*_{}[]()<>#+.!|~");

/** `\*` back to `*`: the notes escape what Markdown would read as formatting. */
function unescape(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\\" && MARKDOWN_SPECIALS.has(text[i + 1] ?? "")) i += 1;
    out += text[i];
  }
  return out;
}

/** `[label](url)` becomes `label`; text that only looks like a link is left alone. */
function withoutLinks(text: string): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const close = text[i] === "[" ? text.indexOf("](", i) : -1;
    const end = close === -1 ? -1 : text.indexOf(")", close);
    if (end === -1) {
      out += text[i];
      i += 1;
    } else {
      out += text.slice(i + 1, close);
      i = end + 1;
    }
  }
  return out;
}

/**
 * The updater card shows the release body as plain text, so headings, bold, links and the install table would
 * read as symbols. Keeps the summary and the lists on consecutive lines (the card is short), drops the download section.
 */
export function plainNotes(markdown: string): string {
  const lines: string[] = [];
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("## ⬇️")) break;
    if (line === "") continue;
    const text = line.replace(/^#{1,6}\s+/, "").replace(/^>\s?/, "").replace(/^[-*]\s+/, "• ");
    lines.push(unescape(withoutLinks(text.replaceAll("**", "").replaceAll("`", ""))));
  }
  return lines.join("\n").trim();
}
