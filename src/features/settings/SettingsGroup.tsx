import type { ReactNode } from "react";
import { BellIcon, ChevronIcon, ClipboardIcon, ImageIcon, LockIcon, WindowIcon } from "../../components/Icons";

/** Each group wears a color, so the long list reads as a few places, not one wall of text. */
const LOOK: Record<string, { icon: ReactNode; tint: string }> = {
  appearance: { icon: <ImageIcon />, tint: "var(--color-cat-chat)" },
  notifications: { icon: <BellIcon on />, tint: "var(--color-warn)" },
  privacy: { icon: <LockIcon />, tint: "var(--color-cat-games)" },
  data: { icon: <ClipboardIcon />, tint: "var(--color-cat-meet)" },
  app: { icon: <WindowIcon />, tint: "var(--color-accent)" },
};

type Props = { id: string; title: string; open: boolean; onToggle: () => void; children: ReactNode };

/** The body stays mounted when collapsed: sections load their state once, not on every open. */
export default function SettingsGroup({ id, title, open, onToggle, children }: Props) {
  const look = LOOK[id];
  return (
    <section className="overflow-hidden rounded-2xl border border-edge bg-ink/40 shadow-sm">
      <h2>
        <button
          type="button"
          id={`settings-group-${id}`}
          aria-expanded={open}
          aria-controls={`settings-panel-${id}`}
          onClick={onToggle}
          className="canto-hit flex min-h-[44px] w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold text-fg hover:bg-hover"
        >
          {look && (
            <span
              aria-hidden="true"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
              style={{ color: look.tint, background: `color-mix(in srgb, ${look.tint} 16%, transparent)` }}
            >
              {look.icon}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{title}</span>
          <span aria-hidden="true" className={`text-muted transition-transform ${open ? "rotate-90" : ""}`}>
            <ChevronIcon dir="right" />
          </span>
        </button>
      </h2>
      <div id={`settings-panel-${id}`} hidden={!open} className="flex flex-col gap-5 border-t border-edge px-3 pb-3 pt-3">
        {children}
      </div>
    </section>
  );
}
