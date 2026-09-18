import { useState } from "react";
import type { GithubFilter } from "../lib/api";
import { KINDS } from "../lib/github";

/** Text only searches on Enter: each search costs 5 of GitHub's 30 search calls per minute. */
export default function GithubFilterBar({ filter, onApply }: { filter: GithubFilter; onApply: (f: GithubFilter) => void }) {
  const [text, setText] = useState(filter.text);

  return (
    <div className="flex flex-col gap-1.5">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onApply({ ...filter, text: text.trim() });
        }}
        className="flex gap-1.5"
      >
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={120}
          aria-label="Filtrar issues e PRs"
          placeholder="filtrar: texto, repo:dono/nome, label:bug"
          className="min-w-0 flex-1 rounded-lg border border-edge bg-ink px-2 py-1 text-xs text-fg placeholder:text-faint"
        />
        <button type="submit" className="rounded-lg bg-edge px-2.5 text-xs text-fg">
          filtrar
        </button>
      </form>
      <div role="group" aria-label="Tipo" className="flex gap-1 text-[11px]">
        {KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={filter.kind === kind}
            onClick={() => onApply({ text: text.trim(), kind })}
            className={`min-h-6 rounded-full px-2.5 ${filter.kind === kind ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:text-fg"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
