import { useEffect, useRef, useState } from "react";
import { REGIONS, regionNames } from "../lib/steam";
import { t } from "../i18n";
import SteamFlag from "./SteamFlag";

const plain = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** The storefront picker: flag, currency code and symbol on the button; a searchable list of the 12
 *  stores, by country or currency, that the keyboard can walk. */
export default function SteamRegionPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hl, setHl] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = REGIONS.find((r) => r.code === value) ?? REGIONS[0];
  const rows = REGIONS.map((r) => ({ region: r, ...regionNames(r) })).filter((r) => {
    const q = plain(query.trim());
    return !q || plain(`${r.country} ${r.currency} ${r.region.currency} ${r.region.symbol}`).includes(q);
  });

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  function toggle() {
    setQuery("");
    setHl(Math.max(0, REGIONS.findIndex((r) => r.code === value)));
    setOpen((o) => !o);
  }

  function pick(code: string) {
    setOpen(false);
    button.current?.focus();
    if (code !== value) onChange(code);
  }

  function keys(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHl((i) => Math.min(rows.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHl((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && rows[hl]) {
      e.preventDefault();
      pick(rows[hl].region.code);
    } else if (e.key === "Escape") {
      setOpen(false);
      button.current?.focus();
    }
  }

  const names = regionNames(current);
  return (
    <div ref={box} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("steam.region")}
        title={`${names.country} · ${names.currency}`}
        className={`canto-hit flex items-center gap-1.5 rounded-lg border bg-ink py-0.5 pl-1 pr-2 text-[11px] font-semibold text-fg transition ${open ? "border-accent" : "border-edge hover:border-line"}`}
      >
        <SteamFlag country={current.country} />
        <span>{current.currency}</span>
        <span className="font-mono font-normal text-muted">{current.symbol}</span>
        <span aria-hidden="true" className={`text-[8px] text-faint transition-transform ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {open && (
        <div className="steam-pop absolute left-0 top-full z-30 mt-1.5 flex w-64 flex-col gap-1.5 rounded-xl border border-edge bg-panel p-2 shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHl(0);
            }}
            onKeyDown={keys}
            placeholder={t("steam.region.search")}
            aria-label={t("steam.region.search")}
            className="canto-field px-2 py-1 text-xs"
          />
          <ul role="listbox" aria-label={t("steam.region")} className="max-h-72 space-y-px overflow-y-auto">
            {rows.length === 0 && <li className="p-2 text-center text-[11px] text-faint">{t("steam.region.empty")}</li>}
            {rows.map((r, i) => (
              <li
                key={r.region.code}
                role="option"
                aria-selected={r.region.code === value}
                data-region={r.region.code}
                onMouseEnter={() => setHl(i)}
                onClick={() => pick(r.region.code)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-fg ${r.region.code === value ? "bg-accent/15" : i === hl ? "bg-hover" : ""}`}
              >
                <SteamFlag country={r.region.country} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{r.country}</span>
                  <span className="truncate text-[10px] text-faint">{r.currency}</span>
                </span>
                <span className="rounded bg-ink px-1.5 font-mono text-[10px] text-muted">{r.region.currency}</span>
                <span aria-hidden="true" className="w-3 text-center font-bold text-accent-text">
                  {r.region.code === value ? "✓" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
