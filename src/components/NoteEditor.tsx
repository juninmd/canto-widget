// Mirror MAX_TITLE_CHARS / MAX_BODY_CHARS in cmd_notes.rs; the backend is the real guard.
const MAX_TITLE = 300;
const MAX_BODY = 100_000;

export type Draft = { id: string | undefined; title: string; body: string; tags: string };

type Props = {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSave: (e: React.FormEvent) => void | Promise<void>;
  onCancel: () => void;
};

export default function NoteEditor({ draft, onChange, onSave, onCancel }: Props) {
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
      <textarea
        value={draft.body}
        onChange={(e) => onChange({ ...draft, body: e.target.value })}
        placeholder="conteúdo do card"
        maxLength={MAX_BODY}
        className="flex-1 resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
      />
      <input
        value={draft.tags}
        onChange={(e) => onChange({ ...draft, tags: e.target.value })}
        placeholder="tags separadas por vírgula"
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-muted outline-none focus:border-accent"
      />
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
