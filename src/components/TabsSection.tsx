import type { Tab } from "./TabBar";
import { HIDEABLE } from "../lib/tabs";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";
import TabLayoutPicker from "./TabLayoutPicker";
import type { TabLayout } from "../lib/tabLayout";

type Props = {
  hidden: Tab[];
  onChange: (hidden: Tab[]) => void;
  layout: TabLayout;
  onLayout: (layout: TabLayout) => void;
  pinned: boolean;
  onPinned: (pinned: boolean) => void;
};

/** Hiding a tab only takes it off the bar; its data stays in the vault. */
export default function TabsSection({ hidden, onChange, layout, onLayout, pinned, onPinned }: Props) {
  const shown = HIDEABLE.filter((t) => !hidden.includes(t.id)).length;
  return (
    <>
      <SettingsSection title={t("settings.tabs.layout")}>
        <TabLayoutPicker layout={layout} onLayout={onLayout} pinned={pinned} onPinned={onPinned} />
      </SettingsSection>
      <SettingsSection title={t("settings.tabs.title")}>
        <div className="grid grid-cols-2 gap-1">
          {HIDEABLE.map((tab) => {
            const on = !hidden.includes(tab.id);
            // At least one tab besides Ajustes stays, or the widget turns into a settings screen.
            const last = on && shown === 1;
            return (
              <label key={tab.id} className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={on}
                  disabled={last}
                  onChange={(e) => onChange(e.target.checked ? hidden.filter((h) => h !== tab.id) : [...hidden, tab.id])}
                  className="canto-box"
                />
                {tab.label}
              </label>
            );
          })}
        </div>
        <p className="text-[11px] text-faint">{t("settings.tabs.hint")}</p>
      </SettingsSection>
    </>
  );
}
