import { useEffect, useState } from "react";
import { api, errText, type AgendaItem, type Note, type Task } from "../lib/api";
import { useUndo } from "../lib/useUndo";
import { ENTER_CLASS, EXIT_CLASS, useNewIds, useExit } from "../lib/motion";
import { t } from "../i18n";
import NoteCard from "./NoteCard";
import NoteEditor, { type Draft } from "./NoteEditor";

const PAGE = 50;
const EMPTY: Draft = { id: undefined, title: "", body: "", tags: "", link: null };

type Props = {
  today: string;
  agenda?: AgendaItem[];
  privacy: boolean;
  /** Seeds the search field once, e.g. arriving from the global search overlay. */
  initialQuery?: string;
  onOpenTasks: () => void;
  onOpenAgenda: () => void;
  onError: (m: string) => void;
};

export default function NotesTab({ today, agenda = [], privacy, initialQuery, onOpenTasks, onOpenAgenda, onError }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [notes, setNotes] = useState<Note[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE);
  const [draft, setDraft] = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [announcement, setAnnouncement] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { leaving, leave } = useExit();

  async function reload(q = query, lim = limit) {
    try {
      const page = await api.notesSearch(q, lim);
      setNotes(page.items);
      setTotal(page.total);
      setLoadedFor(`${q}
${lim}`);
    } catch (e) {
      onError(errText(e));
    }
  }

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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() && !draft.body.trim()) return;
    try {
      await api.noteSave({
        id: draft.id,
        title: draft.title.trim() || t("notes.untitledDefault"),
        body: draft.body,
        tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        link: draft.link,
      });
      setDraft(EMPTY);
      setEditing(false);
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  function cancel() {
    setDraft(EMPTY);
    setEditing(false);
  }

  if (editing) {
    return <NoteEditor draft={draft} tasks={tasks} agenda={agenda} onChange={setDraft} onSave={save} onCancel={cancel} />;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          data-shortcut="search"
          aria-label={t("notes.searchLabel")}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("notes.searchPlaceholder")}
          className="flex-1 rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY);
            setEditing(true);
          }}
          aria-label={t("notes.newLabel")}
          data-shortcut="new"
          className="rounded-lg bg-edge px-3 text-sm text-fg"
        >
          +
        </button>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            query={query}
            privacy={privacy}
            className={`${isNew(n.id) ? ENTER_CLASS : ""} ${leaving.has(n.id) ? EXIT_CLASS : ""}`}
            onOpen={() => {
              setDraft({ id: n.id, title: n.title, body: n.body, tags: n.tags.join(", "), link: n.link ?? null });
              setEditing(true);
            }}
            onPin={() => void pin(n)}
            onDelete={() => void leave(n.id, () => remove(n))}
            onTag={(tag) => setQuery(`#${tag}`)}
            onOpenLink={(kind) => (kind === "task" ? onOpenTasks() : onOpenAgenda())}
            onExport={() => void exportMd(n)}
          />
        ))}
        {total > notes.length && (
          <li>
            <button
              type="button"
              onClick={() => {
                setLimit(limit + PAGE);
                void reload(query, limit + PAGE);
              }}
              className="w-full rounded-lg bg-edge px-3 py-1.5 text-xs text-muted hover:text-fg"
            >
              {t("notes.showMore", { n: total - notes.length })}
            </button>
          </li>
        )}
        {notes.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query ? t("notes.emptySearch") : t("notes.empty")}
          </li>
        )}
      </ul>
    </div>
  );
}
