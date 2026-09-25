import type { Tab } from "./TabBar";
import { HIDEABLE } from "../lib/tabs";
import { t } from "../i18n";

type Props = { hidden: Tab[]; onChange: (hidden: Tab[]) => void };

/** Hiding a tab only takes it off the bar; its data stays in the vault. */
export default function TabsSection({ hidden, onChange }: Props) {
  const shown = HIDEABLE.filter((t) => !hidden.includes(t.id)).length;
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">{t("settings.tabs.title")}</legend>
      <div className="grid grid-cols-2 gap-1">
        {HIDEABLE.map((tab) => {
          const on = !hidden.includes(tab.id);
          // At least one tab besides Ajustes stays, or the widget turns into a settings screen.
          const last = on && shown === 1;
          return (
            <label key={tab.id} className="flex min-h-6 items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={on}
                disabled={last}
                onChange={(e) => onChange(e.target.checked ? hidden.filter((h) => h !== tab.id) : [...hidden, tab.id])}
                className="size-4 accent-[var(--color-accent)]"
              />
              {tab.label}
            </label>
          );
        })}
      </div>
      <p className="text-[11px] text-faint">{t("settings.tabs.hint")}</p>
    </fieldset>
  );
}
