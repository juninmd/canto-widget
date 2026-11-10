import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { t } from "../i18n";
import { panelId, tabId, type Tab, type TABS } from "./TabBar";

type Props = {
  current: Tab;
  onChange: (tab: Tab) => void;
  tabs: typeof TABS;
};

/** Slots on the bar besides "mais": the thumb reaches five targets, and the rest wait in the sheet. */
const SLOTS = 4;

const ITEM = "canto-hit flex min-h-12 flex-1 items-center justify-center rounded-xl px-1 text-xs transition-colors active:bg-active";

/** The phone's tab bar: it sits at the bottom, where a thumb reaches, and the other tabs open in a sheet.
 *  The sheet opens on the current tab, keeps Tab inside it, and closing hands focus back to "mais". */
export default function MobileNav({ current, onChange, tabs }: Props) {
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const onBar = tabs.slice(0, SLOTS);
  const inSheet = !onBar.some((tab) => tab.id === current);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const buttons = sheet.current?.querySelectorAll<HTMLElement>("button");
    (sheet.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? buttons?.[0])?.focus();
    const onEsc = (e: globalThis.KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const buttons = [...e.currentTarget.querySelectorAll<HTMLElement>("button")];
    const edge = e.shiftKey ? buttons[0] : buttons[buttons.length - 1];
    if (document.activeElement !== edge) return;
    e.preventDefault();
    (e.shiftKey ? buttons[buttons.length - 1] : buttons[0])?.focus();
  };

  const pick = (id: Tab) => {
    close();
    onChange(id);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-black/50" onClick={close}>
          <div
            ref={sheet}
            role="dialog"
            aria-modal="true"
            aria-label={t("tabs.label")}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={trapTab}
            className="grid max-h-[70dvh] grid-cols-3 gap-2 overflow-y-auto rounded-t-2xl border-t border-edge bg-panel p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-current={current === tab.id ? "page" : undefined}
                onClick={() => pick(tab.id)}
                className={`canto-hit min-h-12 rounded-xl border px-2 text-sm active:bg-active ${
                  current === tab.id ? "border-accent font-semibold text-fg" : "border-edge text-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav role="tablist" aria-label={t("tabs.label")} className="flex shrink-0 gap-1 border-t border-edge px-2 py-1.5">
        {onBar.map((tab) => (
          <button
            key={tab.id}
            id={tabId(tab.id)}
            type="button"
            role="tab"
            aria-selected={current === tab.id}
            aria-controls={current === tab.id ? panelId(tab.id) : undefined}
            onClick={() => pick(tab.id)}
            className={`${ITEM} ${current === tab.id ? "bg-active font-semibold text-fg" : "text-muted"}`}
          >
            {tab.label}
          </button>
        ))}
        <button
          ref={trigger}
          id={inSheet ? tabId(current) : undefined}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className={`${ITEM} ${inSheet ? "bg-active font-semibold text-fg" : "text-muted"}`}
        >
          {inSheet ? (tabs.find((tab) => tab.id === current)?.label ?? t("tabs.more")) : t("tabs.more")}
          <span aria-hidden="true" className="ml-1 text-[9px]">
            ▴
          </span>
        </button>
      </nav>
    </>
  );
}
