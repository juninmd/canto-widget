import { useEffect, useState } from "react";
import { t } from "../../i18n";
import type { ForgeItem } from "../../lib/api";

type Props = { items: ForgeItem[]; renderItem: (item: ForgeItem) => React.ReactNode; onPeek?: (item: ForgeItem) => void };

const BTN = "canto-hit min-h-8 flex-1 rounded-xl border border-edge px-3 text-xs font-semibold text-fg hover:bg-hover active:bg-active disabled:opacity-40";

/** One PR at a time, J and K to move: for working through the list without scanning it. */
export default function ForgeQueue({ items, renderItem, onPeek }: Props) {
  const [at, setAt] = useState(0);
  const last = items.length - 1;
  const index = Math.min(at, Math.max(0, last));
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === "j") setAt(Math.min(last, index + 1));
      else if (e.key === "k") setAt(Math.max(0, index - 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, last]);
  if (items.length === 0) return <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">{t("forge.queue.empty")}</p>;
  const item = items[index];
  return (
    <section aria-label={t("forge.layout.queue")} className="space-y-2">
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <span className="tabular-nums">{t("forge.queue.pos", { n: index + 1, total: items.length })}</span>
        <span aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-edge">
          <i className="block h-full bg-accent" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </span>
        <kbd className="rounded border border-edge px-1 font-mono text-[10px]">J</kbd>
        <kbd className="rounded border border-edge px-1 font-mono text-[10px]">K</kbd>
      </div>
      <ul className="space-y-1.5">{renderItem(item)}</ul>
      <div className="flex gap-1.5">
        <button type="button" className={BTN} disabled={index === 0} onClick={() => setAt(index - 1)}>
          {t("forge.queue.prev")}
        </button>
        <button type="button" className={BTN} disabled={index === last} onClick={() => setAt(index + 1)}>
          {t("forge.queue.next")}
        </button>
        {onPeek && (
          <button type="button" className={`${BTN} border-accent bg-accent text-on-accent hover:bg-accent`} onClick={() => onPeek(item)}>
            {t("forge.peek.open")}
          </button>
        )}
      </div>
    </section>
  );
}
