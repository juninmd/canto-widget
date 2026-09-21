import { useState } from "react";
import type { ForgeFilter, ForgeSort } from "../lib/api";
import { kinds, sorts, type Forge } from "../lib/forge";

type Props = { forge: Forge; filter: ForgeFilter; onApply: (f: ForgeFilter) => void };

/** Text only searches on Enter: on GitHub each search costs up to 6 of the 30 search calls per minute. */
export default function ForgeFilterBar({ forge, filter, onApply }: Props) {
  const [text, setText] = useState(filter.text);
  const apply = (patch: Partial<ForgeFilter>) => onApply({ ...filter, text: text.trim(), ...patch });

  return (
    <div className="flex flex-col gap-1.5">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          apply({});
        }}
        className="flex gap-1.5"
      >
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={120}
          aria-label="Filtrar issues e PRs"
          placeholder={forge === "github" ? "filtrar: texto, repo:dono/nome, label:bug" : "filtrar por texto no título ou descrição"}
          className="min-w-0 flex-1 rounded-lg border border-edge bg-ink px-2 py-1 text-xs text-fg placeholder:text-faint"
        />
        <button type="submit" className="rounded-lg bg-edge px-2.5 text-xs text-fg">
          filtrar
        </button>
      </form>
      <div className="flex flex-wrap items-center gap-1 text-[11px]">
        <div role="group" aria-label="Tipo" className="flex gap-1">
          {kinds(forge).map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              aria-pressed={filter.kind === kind}
              onClick={() => apply({ kind })}
              className={`min-h-6 rounded-full px-2.5 ${filter.kind === kind ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:text-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-1 text-muted">
          ordenar por
          <select
            value={filter.sort}
            onChange={(e) => apply({ sort: e.target.value as ForgeSort })}
            className="min-h-6 rounded-lg border border-edge bg-ink px-1 text-fg"
          >
            {sorts(forge).map(({ sort, label }) => (
              <option key={sort} value={sort}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => apply({ order: filter.order === "desc" ? "asc" : "desc" })}
          aria-label={filter.order === "desc" ? "ordem decrescente; trocar para crescente" : "ordem crescente; trocar para decrescente"}
          title={filter.order === "desc" ? "maior/mais recente primeiro" : "menor/mais antigo primeiro"}
          className="grid min-h-6 min-w-6 place-items-center rounded-lg bg-edge text-muted hover:text-fg"
        >
          {filter.order === "desc" ? "↓" : "↑"}
        </button>
      </div>
    </div>
  );
}
