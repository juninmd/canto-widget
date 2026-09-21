import { useState } from "react";
import type { AgendaItem, NoteLink, Task } from "../lib/api";
import { renderMarkdown } from "../lib/markdown";
import NoteLinkPicker from "./NoteLinkPicker";

// Mirror MAX_TITLE_CHARS / MAX_BODY_CHARS in cmd_notes.rs; the backend is the real guard.
const MAX_TITLE = 300;
const MAX_BODY = 100_000;

export type Draft = { id: string | undefined; title: string; body: string; tags: string; link: NoteLink | null };

type Props = {
  draft: Draft;
  tasks: Task[];
  agenda: AgendaItem[];
  onChange: (d: Draft) => void;
  onSave: (e: React.FormEvent) => void | Promise<void>;
  onCancel: () => void;
};

export default function NoteEditor({ draft, tasks, agenda, onChange, onSave, onCancel }: Props) {
  const [preview, setPreview] = useState(false);
  const [picking, setPicking] = useState(false);
  return (
    <form
      onSubmit={onSave}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void onSave(e);
      }}
      className="flex h-full flex-col gap-2"
    >
      <input
        autoFocus
        value={draft.title}
        onChange={(e) => onChange({ ...draft, title: e.target.value })}
        placeholder="título"
        maxLength={MAX_TITLE}
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPreview(false)}
          aria-pressed={!preview}
          className={`min-h-6 rounded px-2 ${!preview ? "bg-edge text-fg" : "text-muted hover:text-fg"}`}
        >
          escrever
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          aria-pressed={preview}
          className={`min-h-6 rounded px-2 ${preview ? "bg-edge text-fg" : "text-muted hover:text-fg"}`}
        >
          visualizar
        </button>
      </div>
      {preview ? (
        <div className="flex-1 overflow-y-auto rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg [&_ol]:my-1 [&_p]:mb-2 [&_ul]:my-1">
          {draft.body.trim() ? renderMarkdown(draft.body) : <p className="text-faint">nada para visualizar ainda</p>}
        </div>
      ) : (
        <textarea
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
          placeholder="conteúdo do card (aceita **negrito**, *itálico*, `código`, listas e links)"
          maxLength={MAX_BODY}
          className="flex-1 resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
      )}
      <input
        value={draft.tags}
        onChange={(e) => onChange({ ...draft, tags: e.target.value })}
        placeholder="tags separadas por vírgula"
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-muted outline-none focus:border-accent"
      />
      {picking ? (
        <NoteLinkPicker
          tasks={tasks}
          agenda={agenda}
          onPick={(link) => {
            onChange({ ...draft, link });
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      ) : draft.link ? (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="min-w-0 flex-1 truncate">
            {draft.link.kind === "task" ? "✓" : "📅"} {draft.link.label}
          </span>
          <button type="button" onClick={() => onChange({ ...draft, link: null })} className="min-h-6 px-1 hover:text-danger">
            desvincular
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="min-h-6 self-start text-xs text-muted underline decoration-dotted hover:text-fg"
        >
          vincular a uma tarefa ou evento
        </button>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          title="Ctrl+Enter"
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
        >
          salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          title="Esc"
          className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg"
        >
          cancelar
        </button>
      </div>
    </form>
  );
}
