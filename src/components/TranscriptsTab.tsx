import { useEffect, useState } from "react";
import { api, errText, type TranscriptMeta } from "../lib/api";

export default function TranscriptsTab({ onError }: { onError: (m: string) => void }) {
  const [dir, setDir] = useState("");
  const [editandoDir, setEditandoDir] = useState(false);
  const [query, setQuery] = useState("");
  const [itens, setItens] = useState<TranscriptMeta[]>([]);
  const [aberta, setAberta] = useState<{ nome: string; texto: string } | null>(null);

  async function reload(q = query) {
    try {
      setDir(await api.transcriptsDir());
      setItens(await api.transcriptsList(q));
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    const t = setTimeout(() => void reload(query), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (aberta) {
    return (
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-fg">{aberta.nome}</p>
          <button type="button" onClick={() => setAberta(null)} className="text-xs text-muted hover:text-fg">
            voltar
          </button>
        </div>
        <p className="flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg border border-edge bg-ink p-2 text-xs leading-relaxed text-fg">
          {aberta.texto}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {editandoDir ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.transcriptsSetDir(dir);
              setEditandoDir(false);
              await reload();
            } catch (err) {
              onError(errText(err));
            }
          }}
          className="flex gap-1"
        >
          <input
            autoFocus
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            className="flex-1 rounded-lg border border-edge bg-ink px-2 py-1 text-[11px] text-fg outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-2 text-[11px] font-semibold text-on-accent">
            ok
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditandoDir(true)}
          title="clique para trocar a pasta"
          className="truncate text-left text-[11px] text-faint hover:text-muted"
        >
          pasta: {dir || "(não definida)"}
        </button>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="buscar no que foi dito nas reuniões"
        className="rounded-lg border border-edge bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />

      <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
        {itens.map((t) => (
          <li key={t.name}>
            <button
              type="button"
              onClick={async () => {
                try {
                  setAberta({ nome: t.name, texto: await api.transcriptRead(t.name) });
                } catch (e) {
                  onError(errText(e));
                }
              }}
              className="w-full rounded-lg border border-edge bg-ink/60 p-2 text-left"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-fg">{t.name}</p>
                <span className="shrink-0 text-[10px] text-faint">
                  {new Date(t.modified_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-3 text-xs text-muted">{t.preview}</p>
            </button>
          </li>
        ))}
        {itens.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query ? "nenhuma transcrição bate com a busca" : "nenhuma transcrição nesta pasta"}
          </li>
        )}
      </ul>
    </div>
  );
}
