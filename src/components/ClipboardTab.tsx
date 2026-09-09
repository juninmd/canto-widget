import { useEffect, useState } from "react";
import { api, errText, type ClipItem } from "../lib/api";

export default function ClipboardTab({ onError }: { onError: (m: string) => void }) {
  const [query, setQuery] = useState("");
  const [itens, setItens] = useState<ClipItem[]>([]);
  const [copiado, setCopiado] = useState("");

  async function reload(q = query) {
    try {
      setItens(await api.clipList(q));
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    const t = setTimeout(() => void reload(query), 150);
    const tick = setInterval(() => void reload(query), 2500);
    return () => {
      clearTimeout(t);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <p className="text-[11px] text-faint">
        Histórico local e cifrado — <span className="text-muted">nunca vai para o Drive</span>.
      </p>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="buscar no que você copiou"
          className="flex-1 rounded-lg border border-edge bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => run(api.clipClear)}
          title="limpar tudo, menos os fixados"
          className="rounded-lg bg-edge px-3 text-xs text-fg"
        >
          limpar
        </button>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
        {itens.map((i) => (
          <li key={i.id} className="group rounded-lg border border-edge bg-ink/60 p-2">
            <button
              type="button"
              className="w-full text-left"
              title="clique para copiar de novo"
              onClick={() =>
                run(async () => {
                  await api.clipCopy(i.id);
                  setCopiado(i.id);
                  setTimeout(() => setCopiado(""), 1200);
                })
              }
            >
              <p className="line-clamp-3 whitespace-pre-wrap break-all text-xs text-fg">{i.text}</p>
            </button>
            <div className="mt-1 flex items-center justify-between text-[10px] text-faint">
              <span>{copiado === i.id ? "copiado!" : new Date(i.copied_at).toLocaleTimeString()}</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => run(() => api.clipPin(i.id))} className="hover:text-fg">
                  {i.pinned ? "fixado" : "fixar"}
                </button>
                <button
                  type="button"
                  onClick={() => run(() => api.clipDelete(i.id))}
                  className="hidden hover:text-danger group-hover:inline"
                >
                  excluir
                </button>
              </span>
            </div>
          </li>
        ))}
        {itens.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query ? "nada encontrado" : "copie algo e aparecerá aqui"}
          </li>
        )}
      </ul>
    </div>
  );
}
