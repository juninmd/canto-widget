import { useEffect, useRef } from "react";
import { SHORTCUT_GROUPS } from "../lib/shortcuts";

/** Key as a block with its own height: inline kbd with padding overflowed the line and got clipped. */
function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1" aria-label={keys.join(" + ")}>
      {keys.map((t, i) => (
        <span key={t} className="flex items-center gap-1" aria-hidden="true">
          {i > 0 && <span className="text-[11px] text-faint">+</span>}
          <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-b-2 border-line bg-ink px-1.5 font-sans text-[11px] leading-none text-fg">
            {t}
          </kbd>
        </span>
      ))}
    </span>
  );
}

export default function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const previous = useRef<Element | null>(null);

  useEffect(() => {
    previous.current = document.activeElement;
    closeButton.current?.focus();
    // Returns focus to where the user was: leaving help can't throw the keyboard to the top.
    return () => (previous.current as HTMLElement | null)?.focus?.();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="atalhos-titulo"
      aria-describedby="atalhos-dica"
      onKeyDown={(e) => {
        // Only focusable control: Tab can't leave the modal to the app hidden behind it.
        if (e.key === "Tab") {
          e.preventDefault();
          closeButton.current?.focus();
        }
        if (e.key === "Escape" || e.key === "?") {
          e.stopPropagation();
          onClose();
        }
      }}
      className="absolute inset-0 z-40 flex flex-col gap-3 rounded-2xl bg-panel p-4 text-fg motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <header>
        <h2 id="atalhos-titulo" className="text-sm font-semibold">
          Atalhos de teclado
        </h2>
        <p id="atalhos-dica" className="mt-0.5 text-[11px] text-muted">
          Letras soltas não valem enquanto você digita num campo.
        </p>
      </header>

      <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
        {SHORTCUT_GROUPS.map((g) => (
          <section key={g.title} className="mb-3 last:mb-0">
            <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">{g.title}</h3>
            <ul className="divide-y divide-edge rounded-lg border border-edge bg-ink/40">
              {g.items.map((a) => (
                <li key={a.description} className="flex items-center justify-between gap-3 px-2.5 py-2">
                  <span className="min-w-0 text-xs text-muted">{a.description}</span>
                  <Keys keys={a.keys} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <button ref={closeButton} type="button" onClick={onClose} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
        fechar
      </button>
    </div>
  );
}
