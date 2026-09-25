import { useEffect, useRef } from "react";
import { MOD_KEY, TOGGLE_LABEL } from "../lib/platform";
import { t } from "../i18n";

const TIPS = [
  [TOGGLE_LABEL, t("onboarding.tip.toggle")],
  ["Alt+1…Alt+9", t("onboarding.tip.tabs")],
  [`${MOD_KEY}+K`, t("onboarding.tip.search")],
  ["N", t("onboarding.tip.new")],
  ["Alt+L", t("onboarding.tip.lock")],
  ["?", t("onboarding.tip.help")],
];

/** Shown once, right after the vault is created — never on a plain unlock. */
export default function Onboarding({ onClose }: { onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => closeButton.current?.focus(), []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-titulo"
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          closeButton.current?.focus();
        }
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      className="absolute inset-0 z-40 flex flex-col gap-3 rounded-2xl bg-panel p-4 text-fg motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <header>
        <h2 id="onboarding-titulo" className="text-sm font-semibold">
          {t("onboarding.title")}
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          {t("onboarding.intro")}
        </p>
      </header>

      <ul className="-mx-1 min-h-0 flex-1 divide-y divide-edge overflow-y-auto rounded-lg border border-edge bg-ink/40 px-1">
        {TIPS.map(([keys, text]) => (
          <li key={text} className="flex items-center gap-3 px-2.5 py-2">
            <kbd className="shrink-0 rounded-md border border-b-2 border-line bg-ink px-1.5 py-0.5 font-sans text-[11px] leading-none text-fg">
              {keys}
            </kbd>
            <span className="text-xs text-muted">{text}</span>
          </li>
        ))}
      </ul>

      <button ref={closeButton} type="button" onClick={onClose} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent">
        {t("onboarding.close")}
      </button>
    </div>
  );
}
