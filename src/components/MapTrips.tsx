import { useState, type CSSProperties } from "react";
import { api, errText, type TrafficRoute, type TrafficStatus, type TrafficTrip } from "../lib/api";
import { LEVEL_COLOR, TRIP_ICONS, tripLevel } from "../lib/traffic";
import { LOCALE, t } from "../i18n";
import MapPlacePicker from "./MapPlacePicker";
import MapTripIcon from "./MapTripIcon";

type Props = {
  status: TrafficStatus;
  routes: TrafficRoute[];
  selected: string | null;
  onSelect: (id: string) => void;
  onChanged: (status: TrafficStatus) => void;
  live: boolean;
};

const ROW = "canto-hit grid w-full grid-cols-[30px_1fr_auto] items-center gap-x-2.5 gap-y-1 rounded-xl px-2 py-1.5 text-left hover:bg-hover";

/** Each saved destination with the time it takes now, the extra minutes and a bar split into free flow and delay. */
export default function MapTrips({ status, routes, selected, onSelect, onChanged, live }: Props) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const byId = new Map(routes.map((r) => [r.trip, r]));
  const longest = Math.max(1, ...routes.map((r) => r.minutes));

  async function remove(trip: TrafficTrip) {
    try {
      onChanged(await api.trafficRemoveTrip(trip.id));
    } catch (e) {
      setError(errText(e));
    }
  }

  return (
    <section data-map-trips aria-labelledby="map-trips-title" className="wx-glass wx-rise flex shrink-0 flex-col gap-1.5 p-3" style={{ "--i": 2 } as CSSProperties}>
      <h3 id="map-trips-title" className="flex items-center justify-between text-[11px] font-medium text-faint">
        {t("map.trips.title")}
        {!adding && status.trips.length < 6 && (
          <button type="button" onClick={() => setAdding(true)} className="canto-hit min-h-[24px] rounded-full border border-edge px-2.5 text-[11px] text-muted hover:bg-hover hover:text-fg">
            {t("map.trips.add")}
          </button>
        )}
      </h3>
      {status.trips.length === 0 && !adding && <p className="text-xs text-faint">{t("map.trips.empty")}</p>}
      {status.trips.map((trip) => {
        const r = byId.get(trip.id);
        const ok = live && r && !r.error;
        const color = ok ? LEVEL_COLOR[tripLevel(r.minutes, r.free_minutes)] : "var(--color-faint)";
        const extra = ok ? r.minutes - r.free_minutes : 0;
        return (
          <div key={trip.id} className="group relative">
            <button type="button" aria-pressed={selected === trip.id} onClick={() => onSelect(trip.id)} className={`${ROW} aria-pressed:bg-accent/10`} data-map-trip>
              <span className="row-span-2 flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-accent/15 text-accent-text">
                <MapTripIcon icon={trip.icon} />
              </span>
              <span className="min-w-0 truncate text-[13px] font-semibold text-fg">{trip.name}</span>
              <span className="row-span-2 text-right">
                <b className="block text-lg font-bold tabular-nums text-fg">{ok ? t("map.trips.minutes", { n: r.minutes }) : "–"}</b>
                <small className="text-[10px] font-semibold" style={{ color }}>
                  {!ok ? (r?.error ? t("map.trips.failed") : t("map.trips.noData")) : extra > 1 ? t("map.trips.extra", { n: extra }) : t("map.trips.normal")}
                </small>
              </span>
              <span className="col-start-2 min-w-0 truncate text-[11px] text-faint">
                {ok ? `${t("map.trips.km", { km: r.km.toLocaleString(LOCALE) })} · ${trip.to.name}` : trip.to.name}
              </span>
              {ok && (
                <span className="col-span-2 col-start-2 flex h-1 overflow-hidden rounded-full bg-edge" aria-hidden="true">
                  <i className="block h-full" style={{ width: `${(r.free_minutes / longest) * 100}%`, background: "var(--color-traffic-free)" }} />
                  <i className="block h-full" style={{ width: `${(Math.max(0, extra) / longest) * 100}%`, background: color }} />
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label={t("map.trips.remove", { name: trip.name })}
              onClick={() => void remove(trip)}
              className="canto-hit absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full border border-edge bg-panel text-[10px] text-faint hover:text-danger group-hover:flex group-focus-within:flex"
            >
              ✕
            </button>
          </div>
        );
      })}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {adding && (
        <TripForm
          onCancel={() => setAdding(false)}
          onSaved={(s) => {
            setAdding(false);
            onChanged(s);
          }}
        />
      )}
    </section>
  );
}

function TripForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: (s: TrafficStatus) => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("work");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-edge p-2.5">
      <input aria-label={t("map.trips.name")} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("map.trips.namePlaceholder")} className="canto-field px-2.5 py-2 text-sm" maxLength={48} />
      <div role="radiogroup" aria-label={t("map.trips.icon")} className="flex gap-1">
        {TRIP_ICONS.map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={icon === i}
            aria-label={t(`map.icon.${i}`)}
            onClick={() => setIcon(i)}
            className="canto-hit flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted aria-checked:border-accent aria-checked:text-accent-text"
          >
            <MapTripIcon icon={i} />
          </button>
        ))}
      </div>
      <MapPlacePicker
        label={t("map.trips.destination")}
        disabled={saving || !name.trim()}
        onPick={async (spot) => {
          setSaving(true);
          try {
            onSaved(await api.trafficAddTrip(name.trim(), icon, spot));
          } catch (e) {
            setError(errText(e));
          } finally {
            setSaving(false);
          }
        }}
      />
      {!name.trim() && <p className="text-[11px] text-faint">{t("map.trips.nameFirst")}</p>}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <button type="button" onClick={onCancel} className="canto-hit min-h-[28px] self-start rounded-md px-2 text-[11px] text-faint hover:bg-hover hover:text-fg">
        {t("map.cancel")}
      </button>
    </div>
  );
}
