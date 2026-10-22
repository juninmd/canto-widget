import { useRef, type ReactNode } from "react";
import { useFlip } from "../lib/useFlip";
import { t } from "../i18n";
import type { Note } from "../lib/api";
import type { NotesView } from "../lib/useNotesView";
import EmptyState from "./EmptyState";
import { NoteIcon, SearchIcon } from "./Icons";
import Skeleton from "./Skeleton";

const LABEL = "px-1 pt-1 text-[11px] uppercase tracking-wider text-faint";

type Props = {
  notes: Note[];
  total: number;
  loaded: boolean;
  query: string;
  view: NotesView;
  card: (note: Note, compact: boolean) => ReactNode;
  onMore: () => void;
  onClearQuery: () => void;
};

/** The cards under "Fixadas" and "Recentes", as a list or a two-column grid, plus the paging and empty states. */
export default function NoteList({ notes, total, loaded, query, view, card, onMore, onClearQuery }: Props) {
  const grid = view === "grid";
  const span = grid ? "col-span-2" : "";
  const pinned = notes.filter((n) => n.fixada);
  const recent = notes.filter((n) => !n.fixada);
  const list = useRef<HTMLUListElement>(null);
  useFlip(list, notes.map((n) => `${n.id}:${n.fixada}`).join());
  return (
    // Keyed by the view: switching list and grid rebuilds the cards with a short settle instead of a hard swap.
    <ul
      ref={list}
      key={view}
      className={`flex-1 content-start overflow-y-auto pr-1 motion-safe:animate-surgir ${grid ? "grid grid-cols-2 gap-2" : "space-y-2"}`}
    >
      {pinned.length > 0 && (
        <li aria-hidden="true" className={`${LABEL} ${span}`}>
          {t("uiTasksNotes.section.pinned")}
        </li>
      )}
      {pinned.map((n) => card(n, grid))}
      {recent.length > 0 && (
        <li aria-hidden="true" className={`${LABEL} ${span} ${pinned.length > 0 ? "pt-2" : ""}`}>
          {t("uiTasksNotes.section.recent")}
        </li>
      )}
      {recent.map((n) => card(n, grid))}
      {total > notes.length && (
        <li className={span}>
          <button
            type="button"
            onClick={onMore}
            className="canto-hit w-full rounded-xl bg-edge px-3 py-1.5 text-xs text-muted hover:bg-active hover:text-fg active:bg-active"
          >
            {t("notes.showMore", { n: total - notes.length })}
          </button>
        </li>
      )}
      {notes.length === 0 && !loaded && (
        <li className={span}>
          <Skeleton label={t("notes.loading")} />
        </li>
      )}
      {notes.length === 0 && loaded && (
        <EmptyState className={span} icon={query ? <SearchIcon /> : <NoteIcon />}>
          {query ? t("notes.emptySearch") : t("notes.empty")}
          {query && <span className="mt-1.5 block text-[11px] text-faint/90">{t("uiTasksNotes.emptyHint")}</span>}
          {query && (
            <button
              type="button"
              onClick={onClearQuery}
              className="canto-hit mt-2 min-h-[24px] rounded-md bg-edge px-2 text-[11px] text-muted hover:bg-active hover:text-fg active:bg-active"
            >
              {t("uiTasksNotes.clearSearch")}
            </button>
          )}
        </EmptyState>
      )}
    </ul>
  );
}
