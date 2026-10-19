import type { CSSProperties } from "react";
import type { WeatherPlace } from "../lib/api";
import { t } from "../i18n";

/** A row of one-click cities under a heading; the country rides in the tooltip so the chip stays short. */
export default function WeatherChips({
  title,
  places,
  disabled,
  onPick,
  index,
}: {
  title: string;
  places: WeatherPlace[];
  disabled: boolean;
  onPick: (place: WeatherPlace) => void;
  index: number;
}) {
  if (places.length === 0) return null;
  return (
    <section aria-label={title} className="wx-rise flex flex-col gap-1.5" style={{ "--i": index } as CSSProperties}>
      <h3 className="text-[11px] text-faint">{title}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {places.map((place) => (
          <li key={`${place.lat},${place.lon}`}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(place)}
              title={[place.admin1, place.country].filter(Boolean).join(", ") || t("weather.change")}
              className="canto-hit wx-pick min-h-[28px] rounded-full border border-edge bg-ink/60 px-2.5 text-xs text-fg hover:border-accent hover:bg-hover active:bg-active disabled:opacity-60"
            >
              {place.city}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
