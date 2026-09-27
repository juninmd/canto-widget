import { useEffect, useMemo, useRef, useState } from "react";
import { rankCommands, type PaletteCommand } from "../lib/palette";
import { t } from "../i18n";

type Props = {
  commands: readonly PaletteCommand[];
  onRun: (cmd: PaletteCommand) => void;
  onClose: () => void;
};

const optionId = (id: string) => `paleta-${id.replace(/\W/g, "-")}`;

/** WAI-ARIA combobox + listbox: focus stays in the input, arrows move `aria-activedescendant`. */
export default function CommandPalette({ commands, onRun, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const previous = useRef<Element | null>(null);
  const results = useMemo(() => rankCommands(commands, query), [commands, query]);
  const current = results[Math.min(active, results.length - 1)];

  useEffect(() => {
    previous.current = document.activeElement;
    input.current?.focus();
    return () => (previous.current as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    if (current) list.current?.querySelector(`#${optionId(current.id)}`)?.scrollIntoView?.({ block: "nearest" });
  }, [current]);

  function onKeyDown(e: React.KeyboardEvent) {
    const n = results.length;
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (move !== undefined && n > 0) {
      e.preventDefault();
      setActive((i) => (Math.min(i, n - 1) + move + n) % n);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setActive(e.key === "Home" ? 0 : n - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current) onRun(current);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    } else if (e.key === "Tab") {
      // Only focusable control: Tab can't leave the modal to the app hidden behind it.
      e.preventDefault();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("palette.label")}
      onKeyDown={onKeyDown}
      className="absolute inset-0 z-40 flex flex-col gap-3 rounded-2xl bg-panel p-4 text-fg motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <input
        ref={input}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="paleta-lista"
        aria-autocomplete="list"
        aria-activedescendant={current ? optionId(current.id) : undefined}
        aria-label={t("palette.label")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        placeholder={t("palette.placeholder")}
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />
      <ul
        ref={list}
        id="paleta-lista"
        role="listbox"
        aria-label={t("palette.results")}
        className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1"
      >
        {results.map((cmd) => (
          <li
            key={cmd.id}
            id={optionId(cmd.id)}
            role="option"
            aria-selected={cmd === current}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onRun(cmd)}
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs ${
              cmd === current ? "bg-edge text-fg" : "text-muted hover:text-fg"
            }`}
          >
            <span className="min-w-0 truncate">{cmd.title}</span>
            {cmd.keys && (
              <span className="shrink-0 text-[11px] text-faint" aria-hidden="true">
                {cmd.keys.join("+")}
              </span>
            )}
          </li>
        ))}
      </ul>
      {results.length === 0 && <p className="px-1 text-xs text-muted">{t("palette.empty")}</p>}
      <p className="text-[11px] text-faint">{t("palette.hint")}</p>
    </div>
  );
}
