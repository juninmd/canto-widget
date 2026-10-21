import { t } from "../i18n";
import type { NotesView } from "../lib/useNotesView";

const svg = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const RowsIcon = () => (
  <svg {...svg}>
    <rect x="3" y="4" width="18" height="6" rx="1.5" />
    <rect x="3" y="14" width="18" height="6" rx="1.5" />
  </svg>
);

const GridIcon = () => (
  <svg {...svg}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
  </svg>
);

/** List or two-column grid for the cards. */
export default function NoteViewToggle({ view, onChange }: { view: NotesView; onChange: (view: NotesView) => void }) {
  const btn = (active: boolean) =>
    `canto-hit grid size-7 place-items-center rounded-md transition-colors ${
      active ? "bg-raised text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"
    }`;
  return (
    <div role="group" aria-label={t("uiTasksNotes.view.label")} className="flex shrink-0 gap-0.5 self-center rounded-lg border border-edge bg-ink/60 p-0.5">
      <button type="button" aria-pressed={view === "list"} aria-label={t("uiTasksNotes.view.list")} title={t("uiTasksNotes.view.list")} onClick={() => onChange("list")} className={btn(view === "list")}>
        <RowsIcon />
      </button>
      <button type="button" aria-pressed={view === "grid"} aria-label={t("uiTasksNotes.view.grid")} title={t("uiTasksNotes.view.grid")} onClick={() => onChange("grid")} className={btn(view === "grid")}>
        <GridIcon />
      </button>
    </div>
  );
}
