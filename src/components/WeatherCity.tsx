import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { api, errText, type WeatherPlace, type WeatherView } from "../lib/api";
import { popularCities, recentCities, rememberCity } from "../lib/weatherCities";
import { t } from "../i18n";
import WeatherChips from "./WeatherChips";

/** Typing pauses this long before the name goes to Open-Meteo: one request per word, not per key. */
const DEBOUNCE_MS = 350;
const MIN_CHARS = 2;
const ROW = "canto-hit flex min-h-[40px] w-full items-center gap-2 rounded-xl px-2.5 text-left";

type Props = {
  onSaved: (view: WeatherView) => void;
  /** Present when a city is already saved: the picker then offers a way back and a way to forget it. */
  onBack?: () => void;
  onForgotten?: (view: WeatherView) => void;
};

/**
 * Picking the city: results appear while typing (arrow keys and Enter work), the cities picked before and a
 * few popular ones are one click away, and choosing saves only the coordinates, so a rename upstream never
 * moves the card to another city.
 */
export default function WeatherCity({ onSaved, onBack, onForgotten }: Props) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<WeatherPlace[] | null>(null);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const latest = useRef(0);
  const [recent] = useState(recentCities);
  const [popular] = useState(popularCities);

  async function pick(place: WeatherPlace) {
    setSaving(true);
    try {
      const view = await api.weatherSetPlace(place);
      rememberCity(place);
      setError("");
      onSaved(view);
    } catch (e) {
      setError(errText(e));
    } finally {
      setSaving(false);
    }
  }

  /** Answers that arrive after a newer request started are dropped, so a slow reply never overwrites a fresh one. */
  async function search(name: string, solo: boolean) {
    const id = ++latest.current;
    setWorking(true);
    try {
      const places = await api.weatherSearch(name);
      if (id !== latest.current) return;
      setError("");
      setFound(places);
      setActive(places.length > 0 ? 0 : -1);
      // One match is the answer to an explicit search; while typing it would jump on a half-written name.
      if (solo && places.length === 1) await pick(places[0]);
    } catch (e) {
      if (id !== latest.current) return;
      setError(errText(e));
      setFound(null);
    } finally {
      if (id === latest.current) setWorking(false);
    }
  }

  useEffect(() => {
    const name = query.trim();
    if ([...name].length < MIN_CHARS) {
      latest.current++;
      setFound(null);
      setWorking(false);
      return;
    }
    const timer = setTimeout(() => void search(name, false), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `search` only reads setters and a ref: the query is the one input that restarts the timer.
  }, [query]);

  function onKey(e: KeyboardEvent) {
    if (!found || found.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + found.length) % found.length);
    } else if (e.key === "Enter" && active >= 0 && !working) {
      e.preventDefault();
      void pick(found[active]);
    }
  }

  const typing = query.trim() !== "";
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-0.5">
      <header className="wx-rise flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">{t("weather.ask.title")}</h2>
          {onBack && (
            <button type="button" onClick={onBack} className="canto-hit min-h-[28px] rounded-full px-2.5 text-xs text-muted hover:bg-hover hover:text-fg active:bg-active">
              ← {t("weather.back")}
            </button>
          )}
        </div>
        <p className="text-[11px] leading-snug text-faint">{t("weather.ask.hint")}</p>
      </header>

      <form
        role="search"
        className="wx-rise flex gap-2"
        style={{ "--i": 1 } as CSSProperties}
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) void search(query.trim(), true);
        }}
      >
        <div className="relative min-w-0 flex-1">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" />
          </svg>
          <input
            role="combobox"
            aria-label={t("weather.city.label")}
            aria-expanded={!!found?.length}
            aria-controls="wx-results"
            aria-activedescendant={active >= 0 && found?.length ? `wx-opt-${active}` : undefined}
            aria-autocomplete="list"
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder={t("weather.city.placeholder")}
            className="canto-field w-full py-2 pl-8 pr-8 text-sm"
          />
          {typing && (
            <button
              type="button"
              aria-label={t("weather.clearSearch")}
              onClick={() => setQuery("")}
              className="canto-hit absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-xs text-faint hover:bg-hover hover:text-fg"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={working || saving || !typing}
          className="canto-hit min-h-[36px] shrink-0 rounded-xl bg-accent/15 px-3 text-xs font-semibold text-accent-text hover:bg-accent/25 disabled:opacity-60"
        >
          {t("weather.search")}
        </button>
      </form>

      {working && (
        <p role="status" className="text-[11px] text-faint motion-safe:animate-pulse">
          {t("weather.searching")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}

      {found !== null && !working && found.length === 0 && <p className="text-[11px] text-faint">{t("search.empty")}</p>}
      {found !== null && found.length > 0 && (
        <ul id="wx-results" role="listbox" aria-label={t("weather.results")} className="flex min-h-0 flex-col gap-1">
          {found.map((place, i) => (
            <li
              key={`${place.lat},${place.lon}`}
              id={`wx-opt-${i}`}
              role="option"
              aria-selected={i === active}
              aria-disabled={saving}
              tabIndex={-1}
              onMouseEnter={() => setActive(i)}
              onClick={() => !saving && void pick(place)}
              style={{ "--i": i } as CSSProperties}
              className={`${ROW} wx-rise cursor-pointer border ${i === active ? "border-accent bg-hover" : "border-transparent hover:bg-hover"}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">{place.city}</span>
                <span className="block truncate text-[11px] text-faint">{[place.admin1, place.country].filter(Boolean).join(", ")}</span>
              </span>
              <span aria-hidden="true" className="text-faint">
                ›
              </span>
            </li>
          ))}
        </ul>
      )}

      {!typing && (
        <>
          <WeatherChips title={t("weather.recent")} places={recent} disabled={saving} onPick={(p) => void pick(p)} index={2} />
          <WeatherChips title={t("weather.popular")} places={popular} disabled={saving} onPick={(p) => void pick(p)} index={3} />
        </>
      )}

      {onForgotten && onBack && (
        <button
          type="button"
          disabled={saving}
          onClick={() => void api.weatherClear().then(onForgotten)}
          className="canto-hit mt-auto min-h-[28px] self-start rounded-md px-2 text-[11px] text-faint hover:bg-hover hover:text-fg active:bg-active"
        >
          {t("weather.forget")}
        </button>
      )}
    </div>
  );
}
