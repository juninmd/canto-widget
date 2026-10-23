import { useState, type CSSProperties } from "react";
import type { IncidentKind, TrafficIncident } from "../lib/api";
import { INCIDENT_KINDS, KIND_LEVEL, LEVEL_COLOR, filterIncidents } from "../lib/traffic";
import { LOCALE, t } from "../i18n";
import MapIncidentIcon from "./MapIncidentIcon";

type Props = { incidents: TrafficIncident[]; focused: number | null; onFocus: (index: number) => void };

/** Accidents, jams, works and closures within 5 km, nearest first; picking one lights its pin on the map. */
export default function MapIncidents({ incidents, focused, onFocus }: Props) {
  const [kind, setKind] = useState<IncidentKind | "all">("all");
  const present = INCIDENT_KINDS.filter((k) => incidents.some((i) => i.kind === k));
  const shown = filterIncidents(incidents, kind);
  return (
    <section data-map-incidents aria-labelledby="map-inc-title" className="wx-glass wx-rise flex shrink-0 flex-col gap-1.5 p-3" style={{ "--i": 4 } as CSSProperties}>
      <h3 id="map-inc-title" className="flex items-center justify-between gap-2 text-[11px] font-medium text-faint">
        <span>
          {t("map.inc.title")} · {t("map.inc.count", { n: incidents.length })}
        </span>
        <span>{t("map.inc.radius")}</span>
      </h3>
      {present.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {(["all", ...present] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className="canto-hit min-h-[26px] rounded-full border border-edge px-2.5 text-[11px] text-muted aria-pressed:border-accent/60 aria-pressed:bg-accent/15 aria-pressed:text-fg"
            >
              {k === "all" ? t("map.inc.all") : t(`map.filter.${k}`)}
            </button>
          ))}
        </div>
      )}
      {incidents.length === 0 && <p className="py-2 text-center text-xs text-faint">{t("map.inc.empty")}</p>}
      {shown.map((inc) => {
        const index = incidents.indexOf(inc);
        const color = LEVEL_COLOR[KIND_LEVEL[inc.kind]];
        return (
          <button
            key={index}
            type="button"
            data-map-incident
            aria-pressed={focused === index}
            onClick={() => onFocus(index)}
            className="canto-hit grid w-full grid-cols-[28px_1fr_auto] items-center gap-x-2.5 rounded-xl px-2 py-1.5 text-left hover:bg-hover aria-pressed:bg-hover"
          >
            <span className="row-span-2 flex h-7 w-7 items-center justify-center rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
              <MapIncidentIcon kind={inc.kind} className="h-[15px] w-[15px]" />
            </span>
            <b className="min-w-0 truncate text-[12.5px] font-semibold text-fg">{inc.text || t(`map.kind.${inc.kind}`)}</b>
            <span className="row-span-2 text-right text-[11px] font-semibold" style={{ color }}>
              {inc.delay_s >= 60 && t("map.inc.delay", { n: Math.round(inc.delay_s / 60) })}
              <small className="block font-normal text-faint">{t("map.trips.km", { km: inc.km.toLocaleString(LOCALE) })}</small>
            </span>
            <span className="col-start-2 min-w-0 truncate text-[11px] text-faint">{inc.road || t(`map.kind.${inc.kind}`)}</span>
          </button>
        );
      })}
    </section>
  );
}
