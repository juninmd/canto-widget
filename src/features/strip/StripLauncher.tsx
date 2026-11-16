import { useMemo } from "react";
import { TABS, type Tab } from "../../shell/TabBar";
import { parseHidden } from "../../shell/tabs";
import { t } from "../../i18n";

/** The tabs the user keeps on their bar: the strip never offers one they hid. */
export function launchTabs(raw: string | null): Tab[] {
  const hidden = parseHidden(raw);
  return TABS.filter((tab) => !hidden.includes(tab.id)).map((tab) => tab.id);
}

function saved(): string | null {
  try {
    return localStorage.getItem("canto.hiddenTabs");
  } catch {
    return null;
  }
}

/** One button per visible tab, so every tab is one click (or one arrow key) from the pill. */
export default function StripLauncher({ onOpen }: { onOpen: (tab: Tab) => void }) {
  const tabs = useMemo(() => {
    const ids = launchTabs(saved());
    return TABS.filter((tab) => ids.includes(tab.id));
  }, []);
  return (
    <div className="rounded-xl border border-edge bg-ink/60 p-2">
      <span className="block px-1 pb-1 text-[11px] text-faint">{t("strip.launch")}</span>
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-nav
            onClick={() => onOpen(tab.id)}
            className="canto-hit rounded-lg border border-edge px-2 py-1 text-[11px] text-muted hover:text-fg"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
