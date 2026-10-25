import { useEffect, useRef, useState } from "react";
import type { ModelRow } from "../lib/api";
import { MAX_PICK, PRESETS, SERIES, preset } from "../lib/modelsCompare";
import { formatScore } from "../lib/models";
import { t } from "../i18n";

type Props = { rows: readonly ModelRow[]; picked: readonly ModelRow[]; onChange: (ids: string[]) => void };

/** The picked models as colored chips, a search to add one more, and one-tap sets for the usual questions. */
export default function ModelPicker({ rows, picked, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLSpanElement>(null);
  const ids = picked.map((r) => r.id);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const needle = q.trim().toLowerCase();
  const options = rows.filter((r) => !ids.includes(r.id) && `${r.name} ${r.creator}`.toLowerCase().includes(needle)).slice(0, 30);

  function add(id: string) {
    onChange([...ids, id]);
    setQ("");
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {picked.map((r, i) => (
          <span key={r.id} className="canto-pop flex max-w-full items-center gap-1.5 rounded-full border border-edge bg-ink py-0.5 pr-1 pl-2 text-[11px] font-medium text-fg">
            <i aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: SERIES[i] }} />
            <span className="truncate">{r.name}</span>
            <button
              type="button"
              onClick={() => onChange(ids.filter((x) => x !== r.id))}
              aria-label={t("models.cmp.remove", { name: r.name })}
              className="canto-hit grid size-4 place-items-center rounded-full text-faint hover:bg-hover hover:text-fg"
            >
              ×
            </button>
          </span>
        ))}
        {picked.length < MAX_PICK && (
          <span ref={box} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="canto-hit rounded-full border border-dashed border-edge px-2.5 py-0.5 text-[11px] text-muted hover:border-muted hover:text-fg"
            >
              {t("models.cmp.add")}
            </button>
            {open && (
              <div className="canto-unfold absolute top-full left-0 z-20 mt-1.5 w-60 rounded-xl border border-edge bg-panel p-1.5 shadow-[var(--shadow-raised)]">
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpen(false);
                    if (e.key === "Enter" && options[0]) add(options[0].id);
                  }}
                  placeholder={t("models.cmp.search")}
                  aria-label={t("models.cmp.search")}
                  className="mb-1 w-full rounded-lg border border-edge bg-ink px-2 py-1 text-[11.5px] text-fg outline-none focus:border-accent"
                />
                <div className="flex max-h-52 flex-col overflow-y-auto">
                  {options.length === 0 ? (
                    <span className="px-2 py-1.5 text-[11px] text-faint">{t("models.cmp.none")}</span>
                  ) : (
                    options.map((r) => (
                      <button key={r.id} type="button" onClick={() => add(r.id)} className="canto-hit flex shrink-0 justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[11.5px] text-fg hover:bg-hover">
                        <span className="truncate">{r.name}</span>
                        <span className="shrink-0 text-faint tabular-nums">
                          {r.creator} · {formatScore(r.score)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1 text-[10.5px]">
        <span className="mr-0.5 text-faint">{t("models.cmp.presets")}</span>
        {PRESETS.map((p) => {
          const set = preset(rows, p);
          if (set.length < 2) return null;
          return (
            <button key={p} type="button" onClick={() => onChange(set)} className="canto-hit rounded-md border border-edge px-1.5 py-px text-muted hover:bg-hover hover:text-fg">
              {t(`models.cmp.preset.${p}`)}
            </button>
          );
        })}
        {picked.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="canto-hit rounded-md border border-edge px-1.5 py-px text-muted hover:bg-hover hover:text-fg">
            {t("models.cmp.clear")}
          </button>
        )}
      </div>
    </div>
  );
}
