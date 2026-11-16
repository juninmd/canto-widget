import { api, type StripItem, type StripSnapshot } from "../../lib/api";
import { t } from "../../i18n";
import { conditionKey, degrees } from "../weather/weather";
import StripLauncher from "./StripLauncher";
import type { Tab } from "../../shell/TabBar";
import { inLabel, levelOf, type Level } from "./stripModel";

const TONE: Record<Level, string> = { "": "text-fg", warn: "text-warn", danger: "text-danger" };

function lines(item: StripItem, s: StripSnapshot): { big: string; sub: string } {
  switch (item) {
    case "cpu":
      return { big: `${Math.round(s.cpu)}%`, sub: "" };
    case "memory":
      return { big: `${Math.round(s.memory)}%`, sub: "" };
    case "battery":
      return s.battery
        ? { big: `${Math.round(s.battery[0])}%`, sub: t(s.battery[1] ? "strip.batteryCharging" : "strip.batteryOn") }
        : { big: "—", sub: t("strip.noBattery") };
    case "tasks":
      return s.tasks ? { big: String(s.tasks), sub: t("strip.tasks") } : { big: "—", sub: t("strip.empty") };
    case "weather":
      return s.weather
        ? { big: `${degrees(s.weather.temp)}°`, sub: t(conditionKey(s.weather.condition)) }
        : { big: "—", sub: t("strip.noWeather") };
    case "event":
      return s.event ? { big: s.event.title, sub: inLabel(s.event.in_min) } : { big: "—", sub: t("strip.noEvent") };
    case "reviews":
      return s.reviews ? { big: String(s.reviews), sub: t("strip.reviews") } : { big: "—", sub: t("strip.empty") };
    case "notices":
      return s.notices ? { big: String(s.notices), sub: t("strip.notices") } : { big: "—", sub: t("strip.empty") };
  }
}

type Props = { items: StripItem[]; snap: StripSnapshot; onOpen: (item: StripItem) => void; onLaunch: (tab: Tab) => void };

/** One card per switched-on item; a click opens that item's tab in the widget. */
export default function StripDetails({ items, snap, onOpen, onLaunch }: Props) {
  return (
    <div className="flex w-[300px] flex-col gap-1.5 rounded-2xl border border-edge bg-panel p-2 shadow-2xl">
      {items.map((item) => {
        const { big, sub } = lines(item, snap);
        return (
          <div key={item} className="flex items-center gap-2 rounded-xl border border-edge bg-ink/60 px-3 py-2">
            <button type="button" data-nav onClick={() => onOpen(item)} className="canto-hit min-w-0 flex-1 text-left">
              <span className="block text-[11px] text-faint">{t(`strip.item.${item}`)}</span>
              <span className={`tnum block truncate text-base font-semibold ${TONE[levelOf(item, snap)]}`}>{big}</span>
              {sub && <span className="block truncate text-[11px] text-muted">{sub}</span>}
            </button>
            {item === "event" && snap.event?.meet && (
              <button
                type="button"
                data-nav
                onClick={() => void api.stripJoin()}
                className="canto-hit shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent"
              >
                {t("strip.join")}
              </button>
            )}
          </div>
        );
      })}
      <StripLauncher onOpen={onLaunch} />
      <p className="px-1 text-[10px] text-faint">{t("strip.keys")}</p>
      {items.length === 0 && <p className="px-2 py-1 text-xs text-muted">{t("strip.noItems")}</p>}
    </div>
  );
}
