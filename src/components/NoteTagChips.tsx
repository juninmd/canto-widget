import { t } from "../i18n";
import type { TagCensus } from "../lib/noteTags";

type Props = {
  census: TagCensus;
  /** The tag the search is narrowed to, when the query is a `#tag`. */
  active: string | null;
  /** Nothing typed: "Todas" is the current view. */
  unfiltered: boolean;
  onTag: (tag: string) => void;
  onAll: () => void;
};

/** A chip per tag with its count. A chip sets the very query typing `#tag` would; "Todas" clears it. */
export default function NoteTagChips({ census, active, unfiltered, onTag, onAll }: Props) {
  const tags = active && !census.tags.some((x) => x.tag.toLowerCase() === active) ? [...census.tags, { tag: active, count: 0 }] : census.tags;
  if (tags.length === 0) return null;
  const chip = (on: boolean) =>
    `canto-hit inline-flex min-h-[24px] shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 text-[11px] transition-colors ${
      on ? "bg-accent/20 font-semibold text-accent-text" : "bg-edge text-muted hover:bg-active hover:text-fg active:bg-active"
    }`;
  const count = (n: number) => (census.complete ? <span className="tabular-nums opacity-70">{n}</span> : null);
  return (
    <div role="group" aria-label={t("uiTasksNotes.tags.label")} className="flex gap-1 overflow-x-auto pb-0.5">
      <button
        type="button"
        aria-pressed={unfiltered}
        aria-label={census.total > 0 ? `${t("uiTasksNotes.tags.all")}, ${t("notes.filterCount", { n: census.total })}` : undefined}
        onClick={onAll}
        className={chip(unfiltered)}
      >
        {t("uiTasksNotes.tags.all")}
        {census.total > 0 && <span className="tabular-nums opacity-70">{census.total}</span>}
      </button>
      {tags.map(({ tag, count: n }) => (
        <button
          key={tag}
          type="button"
          aria-pressed={active === tag.toLowerCase()}
          title={t("notes.filterByTag", { tag })}
          aria-label={census.complete && n > 0 ? `#${tag}, ${t("notes.filterCount", { n })}` : undefined}
          onClick={() => onTag(tag)}
          className={chip(active === tag.toLowerCase())}
        >
          #{tag}
          {n > 0 && count(n)}
        </button>
      ))}
    </div>
  );
}
