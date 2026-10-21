import { useState } from "react";
import type { ForgeFilter } from "../lib/api";
import { kinds, type Forge } from "../lib/forge";
import { t } from "../i18n";
import { SearchIcon } from "./Icons";
import ForgeSortMenu from "./ForgeSortMenu";

type Props = { forge: Forge; filter: ForgeFilter; onApply: (f: ForgeFilter) => void };

/** Text only searches on Enter: on GitHub each search costs up to 6 of the 30 search calls per minute. */
export default function ForgeFilterBar({ forge, filter, onApply }: Props) {
  const [text, setText] = useState(filter.text);
  const [focused, setFocused] = useState(false);
  const hint = focused || text.trim() !== filter.text;
  const apply = (patch: Partial<ForgeFilter>) => onApply({ ...filter, text: text.trim(), ...patch });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            apply({});
          }}
          className="min-w-[9.5rem] flex-1"
        >
          <div className="relative min-w-0">
            <button
              type="submit"
              aria-label={t("forge.filter")}
              title={t("forge.filter")}
              className="canto-hit absolute left-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-faint hover:bg-hover hover:text-fg"
            >
              <SearchIcon />
            </button>
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={120}
              data-shortcut="search"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-describedby={hint ? "forge-filter-hint" : undefined}
              aria-label={t("forge.filterLabel")}
              placeholder={forge === "github" ? t("forge.filterPlaceholderGithub") : t("forge.filterPlaceholderGitlab")}
              className="canto-field w-full py-1.5 pl-8 pr-2 text-xs"
            />
          </div>
        </form>
        <div role="group" aria-label={t("forge.kindGroup")} className="flex gap-1 text-[11px]">
          {kinds(forge).map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              aria-pressed={filter.kind === kind}
              onClick={() => apply({ kind })}
              className={`canto-hit min-h-[24px] rounded-full px-2.5 ${filter.kind === kind ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:bg-active hover:text-fg active:bg-active"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <ForgeSortMenu forge={forge} filter={filter} onApply={apply} />
      </div>
      {hint && (
        <p id="forge-filter-hint" className="px-1 text-[10.5px] text-faint">
          {t("forge.filterHint")}
        </p>
      )}
    </div>
  );
}
