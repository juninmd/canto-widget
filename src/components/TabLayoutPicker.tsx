import type { TabLayout } from "../lib/tabLayout";
import { t } from "../i18n";

type Props = {
  layout: TabLayout;
  onLayout: (layout: TabLayout) => void;
  pinned: boolean;
  onPinned: (pinned: boolean) => void;
};

const OPTIONS: TabLayout[] = ["horizontal", "vertical"];

/** Two small previews of the window, so the choice reads without trying it first. */
export default function TabLayoutPicker({ layout, onLayout, pinned, onPinned }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label={t("settings.tabs.layout")} className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={layout === option}
            onClick={() => onLayout(option)}
            className={`flex flex-col gap-1.5 rounded-xl border p-2 text-left transition-colors hover:bg-hover ${
              layout === option ? "border-accent bg-accent/5" : "border-edge bg-ink"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-12 gap-1 rounded-md border border-edge bg-panel p-1 ${option === "horizontal" ? "flex-col" : ""}`}
            >
              <span className={`rounded-sm bg-edge ${option === "horizontal" ? "h-2" : "w-2"}`} />
              <span className="flex-1 rounded-sm bg-edge/50" />
            </span>
            <span className="text-xs font-semibold text-fg">{t(`settings.tabs.${option}`)}</span>
            <span className="text-[11px] leading-snug text-faint">{t(`settings.tabs.${option}Hint`)}</span>
          </button>
        ))}
      </div>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={pinned}
          disabled={layout !== "vertical"}
          onChange={(e) => onPinned(e.target.checked)}
          className="canto-box"
        />
        {t("settings.tabs.pin")}
      </label>
    </div>
  );
}
