import { useEffect, useState, type CSSProperties } from "react";
import { api, errText, type TrafficDeparture, type TrafficTrip } from "../lib/api";
import { LEVEL_COLOR, bestDeparture, tripLevel } from "../lib/traffic";
import { fetchedClock } from "../lib/weather";
import { t } from "../i18n";

/** Travel time leaving now and every 15 min for two hours: the shortest bar is when to go. */
export default function MapLeave({ trip, free, stamp }: { trip: TrafficTrip; free: number; stamp: number }) {
  const [list, setList] = useState<TrafficDeparture[] | null>(null);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState(0);

  useEffect(() => {
    let alive = true;
    setList(null);
    setPicked(0);
    api
      .trafficDepartures(trip.id)
      .then((l) => alive && (setList(l), setError("")))
      .catch((e) => alive && setError(errText(e)));
    return () => {
      alive = false;
    };
  }, [trip.id, stamp]);

  const best = list ? bestDeparture(list) : -1;
  const max = list ? Math.max(1, ...list.map((d) => d.minutes)) : 1;
  const when = (i: number) => (i === 0 ? t("map.leave.now") : t("map.leave.at", { time: fetchedClock(list![i].at) }));
  return (
    <section data-map-leave aria-label={t("map.leave.title", { name: trip.name })} className="wx-glass wx-rise flex shrink-0 flex-col gap-1.5 p-3" style={{ "--i": 3 } as CSSProperties}>
      <h3 className="text-[11px] font-medium text-faint">{t("map.leave.title", { name: trip.name })}</h3>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {!list && !error && (
        <p role="status" className="text-[11px] text-faint motion-safe:animate-pulse">
          {t("map.leave.loading")}
        </p>
      )}
      {list && list.length > 0 && (
        <>
          <div className="grid h-[54px] items-end gap-1" style={{ gridTemplateColumns: `repeat(${list.length}, 1fr)` }}>
            {list.map((d, i) => {
              const c = LEVEL_COLOR[tripLevel(d.minutes, free || d.minutes)];
              return (
                <button
                  key={d.at}
                  type="button"
                  aria-pressed={picked === i}
                  aria-label={t("map.leave.bar", { when: when(i), n: d.minutes })}
                  title={t("map.leave.bar", { when: when(i), n: d.minutes })}
                  onClick={() => setPicked(i)}
                  className="wx-bar canto-hit rounded-t-[4px] rounded-b-[2px] opacity-75 aria-pressed:opacity-100 aria-pressed:ring-2 aria-pressed:ring-offset-2 aria-pressed:ring-offset-panel"
                  style={{ height: `${Math.max(12, (d.minutes / max) * 100)}%`, background: c, "--tw-ring-color": c } as CSSProperties}
                />
              );
            })}
          </div>
          <div className="grid gap-1 text-center text-[9px] text-faint" style={{ gridTemplateColumns: `repeat(${list.length}, 1fr)` }}>
            {list.map((d, i) => (
              <span key={d.at}>{i % 2 ? "" : i === 0 ? t("map.leave.now") : fetchedClock(d.at)}</span>
            ))}
          </div>
          <p data-map-leave-text className="text-xs text-muted">
            {picked === best || best < 0
              ? t("map.leave.best", { when: when(picked), n: list[picked].minutes })
              : t("map.leave.better", { when: when(picked), n: list[picked].minutes, best: fetchedClock(list[best].at), m: list[best].minutes })}
          </p>
        </>
      )}
    </section>
  );
}
