import { api, type StripConfig, type StripItem, type StripSnapshot } from "../../lib/api";
import { t } from "../../i18n";
import type { Tab } from "../../shell/TabBar";
import StripCard from "./StripCard";
import StripLauncher from "./StripLauncher";
import { lines } from "./stripLines";
import { levelOf, WIDE } from "./stripModel";

type Props = {
  cfg: StripConfig;
  snap: StripSnapshot;
  onOpen: (item: StripItem) => void;
  onLaunch: (tab: Tab) => void;
  onHide: () => void;
  now?: Date;
};

/** Two columns of cards in the user's order; a click opens that item's tab in the widget. */
export default function StripDetails({ cfg, snap, onOpen, onLaunch, onHide, now }: Props) {
  const one = cfg.columns === 1;
  const view = cfg.charts ? snap : { ...snap, history: null };
  return (
    <div className={`flex ${one ? "w-[220px]" : "w-[340px]"} flex-col gap-2 rounded-2xl border border-edge bg-panel p-2 shadow-2xl`}>
      {cfg.items.length > 0 ? (
        <div className={`grid grid-flow-row-dense gap-1.5 ${one ? "grid-cols-1" : "grid-cols-2"}`}>
          {cfg.items.map((item) => (
            <StripCard
              key={item}
              item={item}
              lines={lines(item, view, now)}
              level={levelOf(item, snap)}
              wide={!one && WIDE.has(item)}
              onOpen={() => onOpen(item)}
              action={
                item === "event" && snap.event?.meet ? (
                  <button
                    type="button"
                    data-nav
                    onClick={() => void api.stripJoin()}
                    className="canto-hit shrink-0 self-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent"
                  >
                    {t("strip.join")}
                  </button>
                ) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <p className="px-2 py-1 text-xs text-muted">{t("strip.noItems")}</p>
      )}
      {cfg.launcher && <StripLauncher onOpen={onLaunch} />}
      <div className="flex items-center gap-1 px-1 text-[10px] text-faint">
        <span className="min-w-0 flex-1 truncate">{t("strip.keys")}</span>
        <button type="button" data-nav onClick={() => onLaunch("settings")} className="canto-hit rounded-md px-1.5 py-0.5 text-muted hover:text-fg">
          {t("strip.customize")}
        </button>
        <button type="button" data-nav onClick={onHide} className="canto-hit rounded-md px-1.5 py-0.5 text-muted hover:text-fg">
          {t("strip.hide")}
        </button>
      </div>
    </div>
  );
}
