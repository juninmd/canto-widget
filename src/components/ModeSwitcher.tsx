import { useEffect, useId, useRef, useState } from "react";
import { t } from "../i18n";
import type { Mode } from "../lib/windowMode";
import { MODES } from "../lib/windowMode";
import { CheckIcon, DockIcon, EyeOffIcon, LayoutIcon, SplitIcon, WindowIcon } from "./Icons";

const ICONS: Record<Mode, () => React.JSX.Element> = { mini: DockIcon, hidden: EyeOffIcon, normal: WindowIcon, max: SplitIcon };
const LABEL: Record<Mode, () => string> = {
  mini: () => t("app.mode.mini"),
  hidden: () => t("app.mode.hidden"),
  normal: () => t("app.mode.normal"),
  max: () => t("app.mode.max"),
};
const HINT: Record<Mode, () => string> = {
  mini: () => t("app.mode.mini.hint"),
  hidden: () => t("app.mode.hidden.hint"),
  normal: () => t("app.mode.normal.hint"),
  max: () => t("app.mode.max.hint"),
};

type Props = {
  mode: Mode;
  onPick: (mode: Mode) => void;
  /** Where the menu sits relative to the button; the header opens it below, the dock beside. */
  menuClassName?: string;
  buttonClassName?: string;
  onOpenChange?: (open: boolean) => void;
};

/** The icon that swaps between mini, hidden, normal and maximized, with its menu. */
export default function ModeSwitcher({ mode, onPick, menuClassName = "right-0 top-full mt-1", buttonClassName = "", onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, onOpenChange]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      change(false);
      button.current?.focus();
      return;
    }
    const items = [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const target = { ArrowDown: (at + 1) % items.length, ArrowUp: (at - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    items[target]?.focus();
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        onClick={() => change(!open)}
        aria-label={t("app.mode.switch")}
        title={t("app.mode.switch")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`canto-hit grid size-7 place-items-center rounded-lg hover:bg-hover hover:text-fg active:bg-active ${open ? "bg-active text-fg" : ""} ${buttonClassName}`}
      >
        <LayoutIcon />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("app.mode.title")}
          className={`absolute z-40 w-64 rounded-xl border border-edge bg-panel p-1.5 text-fg shadow-2xl motion-safe:animate-surgir motion-reduce:animate-fade ${menuClassName}`}
        >
          <p className="px-2 pb-1 pt-1 text-[10px] uppercase tracking-widest text-faint">{t("app.mode.title")}</p>
          {MODES.map((m) => {
            const Icon = ICONS[m];
            const on = m === mode;
            return (
              <button
                key={m}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => {
                  change(false);
                  onPick(m);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-hover active:bg-active ${on ? "bg-accent/10" : ""}`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-lg border bg-ink ${on ? "border-accent/50 text-accent-text" : "border-edge text-muted"}`}>
                  <Icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-tight text-fg">{LABEL[m]()}</span>
                  <span className="block text-[11px] text-muted">{HINT[m]()}</span>
                </span>
                {on && (
                  <span className="text-accent-text">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
