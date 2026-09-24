import type { ReactNode } from "react";

type Grammar = { comment: string[]; strings: string[]; keywords: string[]; ignoreCase?: boolean };

const C_COMMENTS = ["//[^\\n]*", "/\\*[\\s\\S]*?\\*/"];
const DQ = '"(?:[^"\\\\\\n]|\\\\.)*"';
const SQ = "'(?:[^'\\\\\\n]|\\\\.)*'";
const BT = "`(?:[^`\\\\]|\\\\.)*`";

const GRAMMARS: Record<string, Grammar> = {
  js: {
    comment: C_COMMENTS,
    strings: [DQ, SQ, BT],
    keywords: "async await break case catch class const continue default delete do else export extends false finally for from function if import in instanceof interface let new null return static super switch this throw true try type typeof undefined var void while yield".split(" "),
  },
  rust: {
    comment: C_COMMENTS,
    strings: [DQ],
    keywords: "as async await break const continue crate else enum false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while".split(" "),
  },
  python: {
    comment: ["#[^\\n]*"],
    strings: [DQ, SQ],
    keywords: "and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield".split(" "),
  },
  shell: {
    comment: ["#[^\\n]*"],
    strings: [DQ, SQ],
    keywords: "case do done elif else esac exit export fi for function if in local return then until while".split(" "),
  },
  sql: {
    comment: ["--[^\\n]*", "/\\*[\\s\\S]*?\\*/"],
    strings: [SQ],
    keywords: "and as asc by create delete desc distinct drop from group having in index insert into is join left limit not null on or order select set table update values where with".split(" "),
    ignoreCase: true,
  },
  json: { comment: [], strings: [DQ], keywords: ["true", "false", "null"] },
  go: {
    comment: C_COMMENTS,
    strings: [DQ, BT],
    keywords: "break case chan const continue default defer else false for func go if import interface map nil package range return select struct switch true type var".split(" "),
  },
  c: {
    comment: C_COMMENTS,
    strings: [DQ, SQ],
    keywords: "bool break case catch char class const continue default do double else enum false final float for if int long namespace new null private protected public return static string struct switch this throw true try using void while".split(" "),
  },
};

const ALIASES: Record<string, string> = {
  javascript: "js", jsx: "js", ts: "js", tsx: "js", typescript: "js",
  rs: "rust", py: "python", sh: "shell", bash: "shell", zsh: "shell",
  golang: "go", java: "c", cs: "c", csharp: "c", cpp: "c", kotlin: "c", kt: "c",
};

const CLASSES = {
  comment: "text-faint italic",
  string: "text-danger",
  number: "text-danger",
  keyword: "font-semibold text-accent",
} as const;

function grammarFor(lang: string): Grammar | undefined {
  const key = lang.trim().toLowerCase();
  return GRAMMARS[ALIASES[key] ?? key];
}

/** Colors comments, strings, numbers and keywords; an unknown language comes back as plain text. */
export function highlightCode(code: string, lang: string): ReactNode {
  const g = grammarFor(lang);
  if (!g) return code;
  const alt = (xs: string[]) => (xs.length ? xs.join("|") : "(?!)");
  const re = new RegExp(
    `(${alt(g.comment)})|(${alt(g.strings)})|(\\b(?:0x[\\da-fA-F]+|\\d[\\d_]*(?:\\.\\d+)?)\\b)|\\b(${g.keywords.join("|")})\\b`,
    g.ignoreCase ? "gi" : "g",
  );
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m.index > last) nodes.push(code.slice(last, m.index));
    const kind = m[1] !== undefined ? "comment" : m[2] !== undefined ? "string" : m[3] !== undefined ? "number" : "keyword";
    nodes.push(
      <span key={m.index} className={CLASSES[kind]}>
        {m[0]}
      </span>,
    );
    last = re.lastIndex;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}
