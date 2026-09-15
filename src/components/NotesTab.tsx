import { useEffect, useState } from "react";
import { api, errText, type Note } from "../lib/api";
import { useDesfazer } from "../lib/useDesfazer";
import { ENTRAR, SAIR, useNovos, useSaida } from "../lib/movimento";
import NotaCard from "./NotaCard";

const EMPTY = { id: undefined as string | undefined, title: "", body: "", tags: "" };

export default function NotesTab({ onError }: { onError: (m: string) => void }) {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState(EMPTY);
  const [editing, setEditing] = useState(false);

  const [anuncio, setAnuncio] = useState("");
  const [carregadoPara, setCarregadoPara] = useState<string | null>(null);
  const { saindo, sair } = useSaida();

  async function reload(q = query) {
    try {
      setNotes(await api.notesSearch(q));
      setCarregadoPara(q);
    } catch (e) {
      onError(errText(e));
    }
  }

  const desfazivel = useDesfazer(onError, () => reload());
  const novo = useNovos(
    notes.map((n) => n.id),
    carregadoPara,
  );

  async function excluir(n: Note) {
    try {
      desfazivel(await api.itemDelete(n.id), `card "${n.title}" excluído`);
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  async function fixar(n: Note) {
    try {
      const fixada = await api.notePin(n.id);
      await reload();
      // Sem aviso a nota "pula" para o topo ou some do lugar sem explicacao.
      setAnuncio(fixada ? `"${n.title}" fixada no topo` : `"${n.title}" desafixada`);
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

  function cancelar() {
    setDraft(EMPTY);
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        onSubmit={save}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancelar();
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void save(e);
        }}
        className="flex h-full flex-col gap-2"
      >
        <input
          autoFocus
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="título"
          className="rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <textarea
          value={draft.body}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          placeholder="conteúdo do card"
          className="flex-1 resize-none rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
        <input
          value={draft.tags}
          onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
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
            onClick={cancelar}
            title="Esc"
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
          type="search"
          value={query}
          data-atalho="busca"
          aria-label="buscar notas"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="buscar em títulos, corpo e #tag"
          className="flex-1 rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY);
            setEditing(true);
          }}
          aria-label="novo card"
          data-atalho="novo"
          className="rounded-lg bg-edge px-3 text-sm text-fg"
        >
          +
        </button>
      </div>

      <p role="status" className="sr-only">
        {anuncio}
      </p>
      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {notes.map((n) => (
          <NotaCard
            key={n.id}
            nota={n}
            classe={`${novo(n.id) ? ENTRAR : ""} ${saindo.has(n.id) ? SAIR : ""}`}
            onAbrir={() => {
              setDraft({ id: n.id, title: n.title, body: n.body, tags: n.tags.join(", ") });
              setEditing(true);
            }}
            onFixar={() => void fixar(n)}
            onExcluir={() => void sair(n.id, () => excluir(n))}
            onTag={(t) => setQuery(`#${t}`)}
          />
        ))}
        {notes.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query ? "nenhum card encontrado" : "nenhum card salvo ainda — toque em + para criar"}
          </li>
        )}
      </ul>
    </div>
  );
}
