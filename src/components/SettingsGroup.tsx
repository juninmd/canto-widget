import type { ReactNode } from "react";
import { ChevronIcon } from "./Icons";

type Props = { id: string; title: string; open: boolean; onToggle: () => void; children: ReactNode };

/** The body stays mounted when collapsed: sections load their state once, not on every open. */
export default function SettingsGroup({ id, title, open, onToggle, children }: Props) {
  return (
    <section className="rounded-xl border border-edge bg-ink/40">
      <h2>
        <button
          type="button"
          id={`settings-group-${id}`}
          aria-expanded={open}
          aria-controls={`settings-panel-${id}`}
          onClick={onToggle}
          className="canto-hit flex min-h-[32px] w-full items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-left text-sm font-semibold text-fg hover:bg-hover"
        >
          {title}
          <span aria-hidden="true" className={`text-muted transition-transform ${open ? "rotate-90" : ""}`}>
            <ChevronIcon dir="right" />
          </span>
        </button>
      </h2>
      <div id={`settings-panel-${id}`} hidden={!open} className="flex flex-col gap-4 px-3 pb-3">
        {children}
      </div>
    </section>
  );
}
