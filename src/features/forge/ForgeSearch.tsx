import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "../../i18n";
import type { ForgeItem } from "../../lib/api";

type Props = { items: ForgeItem[]; onPick: (item: ForgeItem) => void; onClose: () => void };

/** Ctrl+K: jump to any loaded PR, MR or issue by title, repo or number. */
export default function ForgeSearch({ items, onPick, onClose }: Props) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((it) => !s || `${it.title} ${it.reference}`.toLowerCase().includes(s)).slice(0, 30);
  }, [items, q]);
  const at = Math.min(sel, Math.max(0, found.length - 1));
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") (e.preventDefault(), setSel(Math.min(found.length - 1, at + 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), setSel(Math.max(0, at - 1)));
    else if (e.key === "Enter" && found[at]) onPick(found[at]);
  }
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/35 p-3 pt-10" onMouseDown={onClose}>
      <div role="dialog" aria-label={t("forge.search.label")} onKeyDown={onKey} onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md overflow-hidden rounded-2xl border border-edge bg-panel shadow-raised">
        <input
          ref={input}
          value={q}
          onChange={(e) => (setQ(e.target.value), setSel(0))}
          aria-label={t("forge.search.label")}
          placeholder={t("forge.search.placeholder")}
          className="w-full border-b border-edge bg-transparent px-3.5 py-3 text-sm text-fg outline-none placeholder:text-faint"
        />
        <ul className="max-h-72 overflow-y-auto p-1">
          {found.length === 0 && <li className="px-3 py-3 text-center text-[11px] text-faint">{t("forge.search.empty")}</li>}
          {found.map((it, k) => (
            <li key={it.url}>
              <button type="button" onClick={() => onPick(it)} className={`canto-hit flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs ${k === at ? "bg-accent/15" : "hover:bg-hover"}`}>
                <span className="min-w-0 flex-1 truncate text-fg">{it.title}</span>
                <span className="shrink-0 font-mono text-[10.5px] text-faint">{it.reference}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
