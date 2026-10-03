import { useState } from "react";
import type { ForgeFilter, ForgeSort } from "../lib/api";
import { kinds, sorts, type Forge } from "../lib/forge";
import { t } from "../i18n";
import { SearchIcon } from "./Icons";

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
        <div className="relative min-w-0 flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={120}
            aria-label={t("forge.filterLabel")}
            placeholder={forge === "github" ? t("forge.filterPlaceholderGithub") : t("forge.filterPlaceholderGitlab")}
            className="canto-field w-full py-1.5 pl-8 pr-2.5 text-xs"
          />
        </div>
        <button type="submit" className="canto-hit rounded-xl bg-edge px-3 text-xs text-fg hover:bg-active active:bg-active">
          {t("forge.filter")}
        </button>
      </form>
      <div className="flex flex-wrap items-center gap-1 text-[11px]">
        <div role="group" aria-label={t("forge.kindGroup")} className="flex gap-1">
          {kinds(forge).map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              aria-pressed={filter.kind === kind}
              onClick={() => apply({ kind })}
              className={`canto-hit min-h-[24px] rounded-full px-3 ${filter.kind === kind ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:bg-active hover:text-fg active:bg-active"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-1 text-muted">
          {t("forge.sortBy")}
          <select
            value={filter.sort}
            onChange={(e) => apply({ sort: e.target.value as ForgeSort })}
            className="canto-field canto-hit min-h-[24px] !rounded-lg px-1.5"
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
          aria-label={filter.order === "desc" ? t("forge.orderDescLabel") : t("forge.orderAscLabel")}
          title={filter.order === "desc" ? t("forge.orderDescTitle") : t("forge.orderAscTitle")}
          className="canto-hit grid min-h-[24px] min-w-[24px] place-items-center rounded-lg bg-edge text-muted hover:bg-active hover:text-fg active:bg-active"
        >
          {filter.order === "desc" ? "↓" : "↑"}
        </button>
      </div>
    </div>
  );
}
