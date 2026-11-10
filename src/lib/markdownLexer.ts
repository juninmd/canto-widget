import { Marked, type Token } from "marked";

// Its own instance: the editor's markdown extension registers custom tokenizers on the shared one.
const blocks = new Marked({ gfm: true });
// Alerts come from single-line sources (a comment, an incident, a summary of lines): a lone newline is
// a line break there, the way GitHub renders it.
const lines = new Marked({ gfm: true, breaks: true });

export const lexers = {
  block: (text: string): Token[] => blocks.lexer(text),
  inline: (text: string): Token[] => lines.lexer(text),
};
