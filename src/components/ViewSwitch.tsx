import { t } from "../i18n";
import { GridIcon, ListIcon, TableIcon } from "./Icons";

export type BrowseView = "list" | "grid" | "table";

const ICON: Record<BrowseView, () => React.JSX.Element> = { list: ListIcon, grid: GridIcon, table: TableIcon };

type Props<V extends BrowseView> = { value: V; options: readonly V[]; onChange: (view: V) => void };

/** List, grid or table: the same control in every tab, with the choice kept per tab by `useViewPref`. */
export default function ViewSwitch<V extends BrowseView>({ value, options, onChange }: Props<V>) {
  if (options.length < 2) return null;
  return (
    <div role="group" aria-label={t("browse.view.label")} className="flex shrink-0 gap-0.5 self-center rounded-lg border border-edge bg-ink/60 p-0.5">
      {options.map((view) => {
        const name = t(`browse.view.${view}`);
        return (
          <button
            key={view}
            type="button"
            aria-pressed={value === view}
            aria-label={name}
            title={name}
            onClick={() => onChange(view)}
            className={`canto-hit grid size-7 place-items-center rounded-md transition-colors ${
              value === view ? "bg-raised text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"
            }`}
          >
            {ICON[view]()}
          </button>
        );
      })}
    </div>
  );
}
