import { useEffect, useState } from "react";
import { api, errText, type ClipItem } from "../lib/api";
import { useUndo } from "../lib/useUndo";
import { useLatestRequest } from "../lib/useLatestRequest";
import { ENTER_CLASS, EXIT_CLASS, useNewIds, useExit } from "../lib/motion";
import { clipKind, KIND_LABEL, type ClipKind } from "../lib/clip";
import ClipCard from "./ClipCard";

const KIND_OPTIONS: (ClipKind | "all")[] = ["all", "link", "color", "json", "email", "phone", "code", "text"];

type Props = { privacy: boolean; initialQuery?: string; onError: (m: string) => void };

export default function ClipboardTab({ privacy, initialQuery, onError }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [kindFilter, setKindFilter] = useState<ClipKind | "all">("all");
  const [items, setItems] = useState<ClipItem[]>([]);
  const [maxPinned, setMaxPinned] = useState(100);
  const [copied, setCopied] = useState("");

  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const { leaving, leave } = useExit();
  const { bump, isLatest } = useLatestRequest();

  // The 150ms debounce and the 2.5s background poll can both be in flight at once; without this
  // guard, an older (slower) reply could land after a newer one and overwrite fresher data.
  async function reload(q = query) {
    const id = bump();
    try {
      const list = await api.clipList(q);
      if (!isLatest(id)) return;
      setItems(list.items);
      setMaxPinned(list.max_pinned);
      setLoadedFor(q);
    } catch (e) {
      if (isLatest(id)) onError(errText(e));
    }
  }

  const visible = items.filter((i) => kindFilter === "all" || clipKind(i.preview) === kindFilter);

  async function saveMaxPinned(next: number) {
    const clamped = Math.min(1000, Math.max(1, Math.round(next) || 1));
    setMaxPinned(clamped);
    try {
      await api.clipSetMaxPinned(clamped);
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
      <div className="flex items-center gap-2 text-[11px]">
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as ClipKind | "all")}
          aria-label="filtrar por tipo"
          className="rounded-lg border border-line bg-ink px-2 py-1 text-fg outline-none focus:border-accent"
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k === "all" ? "todos os tipos" : KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <label className="ml-auto flex items-center gap-1 text-faint" title="quantos itens fixados o histórico aceita">
          máx. fixados
          <input
            type="number"
            min={1}
            max={1000}
            value={maxPinned}
            onChange={(e) => void saveMaxPinned(e.target.valueAsNumber)}
            aria-label="máximo de itens fixados"
            className="w-14 rounded border border-line bg-ink px-1.5 py-0.5 text-fg outline-none focus:border-accent"
          />
        </label>
      </div>

      <ul className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {visible.map((i) => (
          <ClipCard
            key={i.id}
            item={i}
            copied={copied === i.id}
            privacy={privacy}
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
        {visible.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">
            {query || kindFilter !== "all" ? "nada encontrado" : "copie algo e aparecerá aqui"}
          </li>
        )}
      </ul>
    </div>
  );
}
