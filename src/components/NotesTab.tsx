import { useEffect, useState } from "react";
import { api, errText, type Note } from "../lib/api";

const EMPTY = { id: undefined as string | undefined, title: "", body: "", tags: "" };

export default function NotesTab({ onError }: { onError: (m: string) => void }) {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState(EMPTY);
  const [editing, setEditing] = useState(false);

  async function reload(q = query) {
    try {
      setNotes(await api.notesSearch(q));
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    const t = setTimeout(() => void reload(query), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() && !draft.body.trim()) return;
    try {
      await api.noteSave({
        id: draft.id,
        title: draft.title.trim() || "sem titulo",
        body: draft.body,
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setDraft(EMPTY);
      setEditing(false);
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="flex h-full flex-col gap-2">
        <input
          autoFocus
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="titulo"
          className="rounded-lg border border-edge bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <textarea
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          placeholder="conteudo do card"
          className="flex-1 resize-none rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
        <input
          value={draft.tags}
          onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
          placeholder="tags separadas por virgula"
          className="rounded-lg border border-edge bg-ink px-3 py-1.5 text-xs text-muted outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent">
            salvar
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY);
              setEditing(false);
            }}
            className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg"
          >
            cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="buscar em titulos, corpo e tags"
          className="flex-1 rounded-lg border border-edge bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY);
            setEditing(true);
          }}
          className="rounded-lg bg-edge px-3 text-sm text-fg"
        >
          +
        </button>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {notes.map((n) => (
          <li key={n.id} className="group rounded-lg border border-edge bg-ink/60 p-2">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className="flex-1 text-left"
                onClick={() => {
                  setDraft({ id: n.id, title: n.title, body: n.body, tags: n.tags.join(", ") });
                  setEditing(true);
                }}
              >
                <p className="truncate text-sm font-medium text-fg">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>
              </button>
              <button
                type="button"
                onClick={() => void api.itemDelete(n.id).then(() => reload())}
                className="hidden text-xs text-faint hover:text-danger group-hover:block"
                aria-label={`excluir ${n.title}`}
              >
                x
              </button>
            </div>
            {n.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {n.tags.map((t) => (
                  <span key={t} className="rounded bg-edge px-1.5 py-0.5 text-[10px] text-muted">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
        {notes.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query ? "nenhum card encontrado" : "nenhum card salvo ainda"}
          </li>
        )}
      </ul>
    </div>
  );
}
