import { lazy, Suspense, useEffect, useState } from "react";
import { useQuerySeed } from "../lib/useQuerySeed";
import { api, errText, type AgendaItem, type Note, type Task } from "../lib/api";
import { useUndo } from "../lib/useUndo";
import { useLatestRequest } from "../lib/useLatestRequest";
import { ENTER_CLASS, EXIT_CLASS, useNewIds, useExit } from "../lib/motion";
import { t } from "../i18n";
import NoteCard from "./NoteCard";
import NoteFilterChip from "./NoteFilterChip";
import NoteList from "./NoteList";
import NoteTagChips from "./NoteTagChips";
import NoteViewToggle from "./NoteViewToggle";
import { activeTag, censusOf, type TagCensus } from "../lib/noteTags";
import { useNotesView } from "../lib/useNotesView";
import { useAnnouncement } from "../lib/useAnnouncement";
import { DownloadIcon, PlusIcon, SearchIcon } from "./Icons";
import { useNoteDraft, type NoteDraft } from "../lib/useNoteDraft";
import type { Draft } from "./NoteEditor";

// TipTap roughly doubles the bundle; only people who open a note pay for loading it.
const NoteEditor = lazy(() => import("./NoteEditor"));

const PAGE = 50;

type Props = {
  today: string;
  agenda?: AgendaItem[];
  privacy: boolean;
  /** Seeds the search field once, e.g. arriving from the global search overlay. */
  initialQuery?: string;
  /** Changes on each new jump, so an already-open tab picks up `initialQuery` again. */
  querySeq?: number;
  onOpenTasks: () => void;
  onOpenAgenda: () => void;
  onError: (m: string) => void;
  /** The draft being edited, owned by the caller so it outlives this tab; standalone uses its own. */
  note?: NoteDraft;
};

export default function NotesTab({ today, agenda = [], privacy, initialQuery, querySeq, onOpenTasks, onOpenAgenda, onError, note }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");
  useQuerySeed(initialQuery, querySeq, setQuery);
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE);
  const [view, setView] = useNotesView();
  // Tag counts come from the last unfiltered list, so the chips do not collapse to one tag once it is picked.
  const [census, setCensus] = useState<TagCensus | null>(null);
  const own = useNoteDraft();
  const { draft, original, editing, setDraft, open, close } = note ?? own;
  const [tasks, setTasks] = useState<Task[]>([]);

  const [announcement, setAnnouncement] = useAnnouncement();
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { leaving, leave } = useExit();
  const { bump, isLatest } = useLatestRequest();

  async function reload(q = query, lim = limit) {
    const id = bump();
    try {
      const page = await api.notesSearch(q, lim);
      if (!isLatest(id)) return;
      setNotes(page.items);
      setTotal(page.total);
      if (!q.trim()) setCensus(censusOf(page.items, page.total));
      setLoadedFor(`${q}
${lim}`);
    } catch (e) {
      onError(errText(e));
    }
  }

  const tagCensus = census ?? (notes.length > 0 ? { ...censusOf(notes, total), complete: false } : null);

  const undoable = useUndo(onError, () => reload());
  const isNew = useNewIds(
    notes.map((n) => n.id),
    loadedFor,
  );

  async function remove(n: Note) {
    try {
      undoable(await api.itemDelete(n.id), t("notes.deleted", { title: n.title }));
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  async function pin(n: Note) {
    try {
      const pinned = await api.notePin(n.id);
      await reload();
      // Without an announcement the note "jumps" to the top or vanishes with no explanation.
      setAnnouncement(pinned ? t("notes.pinnedAnnouncement", { title: n.title }) : t("notes.unpinnedAnnouncement", { title: n.title }));
    } catch (e) {
      onError(errText(e));
    }
  }

  async function exportMd(n: Note) {
    try {
      const where = await api.noteExportMd(n.id);
      if (where) setAnnouncement(t("notes.exportedAnnouncement", { title: n.title, where }));
    } catch (e) {
      onError(errText(e));
    }
  }

  async function importKeep() {
    try {
      const r = await api.notesImportKeep();
      if (!r) return;
      setAnnouncement(t("notes.keep.done", { n: r.imported, dup: r.duplicates, skip: r.skipped }));
      if (r.imported > 0 && query !== "#keep") setQuery("#keep");
      else void reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    setLimit(PAGE);
    const timer = setTimeout(() => void reload(query, PAGE), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Fetched only when the editor opens: the link picker needs today's list, nothing else does.
  useEffect(() => {
    if (!editing) return;
    api.tasksForDay(today).then(setTasks).catch(() => setTasks([]));
  }, [editing, today]);

  async function save(draft: Draft) {
    if (!draft.title.trim() && !draft.body.trim()) return;
    try {
      await api.noteSave({
        id: draft.id,
        title: draft.title.trim() || t("notes.untitledDefault"),
        body: draft.body,
        tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        link: draft.link,
      });
      close();
      await reload();
      setAnnouncement(t("notes.savedAnnouncement", { title: draft.title.trim() || t("notes.untitledDefault") }));
    } catch (e) {
      onError(errText(e));
    }
  }

  if (editing) {
    return (
      <Suspense fallback={<p className="px-2 py-6 text-center text-xs text-faint">{t("notes.editorLoading")}</p>}>
        <NoteEditor draft={draft} original={original} tasks={tasks} agenda={agenda} onChange={setDraft} onSave={save} onCancel={close} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            data-shortcut="search"
            aria-label={t("notes.searchLabel")}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("notes.searchPlaceholder")}
            className="canto-field w-full py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <NoteViewToggle view={view} onChange={setView} />
        <button
          type="button"
          onClick={() => void importKeep()}
          aria-label={t("notes.keep.import")}
          title={t("notes.keep.help")}
          className="canto-hit grid w-9 shrink-0 place-items-center rounded-xl border border-edge text-muted hover:bg-hover hover:text-fg"
        >
          <DownloadIcon />
        </button>
        <button
          type="button"
          onClick={() => open()}
          aria-label={t("notes.newLabel")}
          data-shortcut="new"
          className="grid w-10 place-items-center rounded-xl bg-accent text-on-accent shadow-[var(--shadow-raised)] hover:brightness-110"
        >
          <PlusIcon />
        </button>
      </div>

      {tagCensus && (
        <NoteTagChips
          census={tagCensus}
          active={activeTag(query)}
          unfiltered={query.trim() === ""}
          onTag={(tag) => setQuery(`#${tag}`)}
          onAll={() => setQuery("")}
        />
      )}
      <NoteFilterChip query={query} total={total} onClear={() => setQuery("")} />
      <p
        role="status"
        title={announcement}
        key={announcement}
        className={announcement ? "truncate rounded-md bg-edge px-2 py-1 text-[11px] text-fg motion-safe:animate-surgir" : "sr-only"}
      >
        {announcement}
      </p>
      <NoteList
        notes={notes}
        total={total}
        loaded={loadedFor !== null}
        query={query}
        view={view}
        onMore={() => {
          setLimit(limit + PAGE);
          void reload(query, limit + PAGE);
        }}
        onClearQuery={() => setQuery("")}
        card={(n, compact) => (
          <NoteCard
            key={n.id}
            note={n}
            query={query}
            privacy={privacy}
            compact={compact}
            className={`${isNew(n.id) ? ENTER_CLASS : ""} ${leaving.has(n.id) ? EXIT_CLASS : ""}`}
            onOpen={() => open({ id: n.id, title: n.title, body: n.body, tags: n.tags.join(", "), link: n.link ?? null })}
            onPin={() => void pin(n)}
            onDelete={() => void leave(n.id, () => remove(n))}
            onTag={(tag) => setQuery(`#${tag}`)}
            onOpenLink={(kind) => (kind === "task" ? onOpenTasks() : onOpenAgenda())}
            onExport={() => void exportMd(n)}
          />
        )}
      />
    </div>
  );
}
