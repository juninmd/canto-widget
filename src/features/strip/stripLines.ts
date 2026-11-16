import { t, LOCALE } from "../../i18n";
import { conditionKey, degrees } from "../weather/weather";
import { rate } from "../system/system";
import { currencySign, quoteLabel, signedPercent } from "../market/market";
import { clock, inLabel } from "./stripModel";
import type { StripItem, StripSnapshot } from "../../lib/api";

export type Lines = {
  big: string;
  sub: string;
  /** The last minute, when the item has one and the charts are on. */
  spark?: { values: number[]; max?: number };
};

const pct = (v: number) => `${Math.round(v)}%`;
const none = (sub: string): Lines => ({ big: "—", sub });

/** What a card says: the number big, one line of context under it. */
export function lines(item: StripItem, s: StripSnapshot, now = new Date()): Lines {
  const h = s.history;
  switch (item) {
    case "clock":
      return { big: clock(now), sub: now.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" }) };
    case "cpu":
      return { big: pct(s.cpu), sub: t("strip.lastMinute"), spark: h ? { values: h.cpu, max: 100 } : undefined };
    case "memory":
      return { big: pct(s.memory), sub: t("strip.inUse"), spark: h ? { values: h.memory, max: 100 } : undefined };
    case "gpu":
      return s.gpu === null ? none(t("strip.noGpu")) : { big: pct(s.gpu), sub: t("strip.inUse") };
    case "temp":
      return s.temp === null ? none(t("strip.noSensor")) : { big: `${Math.round(s.temp)}°C`, sub: t("strip.item.temp") };
    case "disk":
      return s.disk === null ? none(t("strip.noDisk")) : { big: pct(s.disk), sub: t("strip.diskUsed") };
    case "network":
      return {
        big: `↓ ${rate(s.network[0])}`,
        sub: `↑ ${rate(s.network[1])}`,
        spark: h ? { values: h.net_down } : undefined,
      };
    case "battery":
      return s.battery
        ? { big: pct(s.battery[0]), sub: t(s.battery[1] ? "strip.batteryCharging" : "strip.batteryOn") }
        : none(t("strip.noBattery"));
    case "tasks":
      return s.tasks ? { big: String(s.tasks), sub: t("strip.tasks") } : none(t("strip.empty"));
    case "weather":
      return s.weather
        ? { big: `${degrees(s.weather.temp)}°`, sub: t(conditionKey(s.weather.condition)) }
        : none(t("strip.noWeather"));
    case "event":
      return s.event ? { big: s.event.title, sub: inLabel(s.event.in_min) } : none(t("strip.noEvent"));
    case "reviews":
      return s.reviews ? { big: String(s.reviews), sub: t("strip.reviews") } : none(t("strip.empty"));
    case "notices":
      return s.notices ? { big: String(s.notices), sub: t("strip.notices") } : none(t("strip.empty"));
    case "health":
      if (!s.health.total) return none(t("strip.noHealth"));
      return {
        big: `${s.health.total - s.health.down}/${s.health.total}`,
        sub: s.health.down ? t("strip.healthDown", { n: String(s.health.down) }) : t("strip.healthOk"),
      };
    case "market": {
      const m = s.market;
      if (!m) return none(t("strip.noMarket"));
      const sign = m.currency ? currencySign(m.currency) : "";
      const price = m.price.toLocaleString(LOCALE, { maximumFractionDigits: 2 });
      return { big: `${sign} ${price}`.trim(), sub: `${quoteLabel(m.symbol)} · ${signedPercent(m.change)}%` };
    }
  }
}
