import { useEffect, useState } from "react";
import { api, errText, type ClipItem } from "../lib/api";
import { useUndo } from "../lib/useUndo";
import { ENTER_CLASS, EXIT_CLASS, useNewIds, useExit } from "../lib/motion";
import ClipCard from "./ClipCard";

export default function ClipboardTab({ onError }: { onError: (m: string) => void }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ClipItem[]>([]);
  const [copied, setCopied] = useState("");

  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { leaving, leave } = useExit();

  async function reload(q = query) {
    try {
      setItems(await api.clipList(q));
      setLoadedFor(q);
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

  const undoable = useUndo(onError, () => reload());
  // The clipboard watcher brings in new items every 2.5s: they slide in at the top.
  const isNew = useNewIds(
    items.map((i) => i.id),
    loadedFor,
  );

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
        Histórico local e cifrado — <span className="text-muted">nunca entra no backup</span>.
      </p>
      <div className="flex gap-2">
        <input
          value={query}
          data-shortcut="search"
          aria-label="buscar no clipboard"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="buscar no que você copiou"
          className="flex-1 rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => run(async () => undoable(await api.clipClear(), "histórico limpo (fixados mantidos)"))}
          title="limpar tudo, menos os fixados"
          className="rounded-lg bg-edge px-3 text-xs text-fg"
        >
          limpar
        </button>
      </div>

      <ul className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {items.map((i) => (
          <ClipCard
            key={i.id}
            item={i}
            copied={copied === i.id}
            className={`${isNew(i.id) ? ENTER_CLASS : ""} ${leaving.has(i.id) ? EXIT_CLASS : ""}`}
            onCopy={() =>
              run(async () => {
                await api.clipCopy(i.id);
                setCopied(i.id);
                setTimeout(() => setCopied(""), 1200);
              })
            }
            onPin={() => run(() => api.clipPin(i.id))}
            onDelete={() =>
              void leave(i.id, () => run(async () => undoable(await api.clipDelete(i.id), "item excluído do histórico")))
            }
          />
        ))}
        {items.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query ? "nada encontrado" : "copie algo e aparecerá aqui"}
          </li>
        )}
      </ul>
    </div>
  );
}
