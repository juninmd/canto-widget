import { useState } from "react";
import { api, errText, type WeatherPlace, type WeatherView } from "../lib/api";
import { t } from "../i18n";

/**
 * The first screen: the typed name goes to Open-Meteo in Rust, which answers with several candidates. Picking
 * one saves only its coordinates, so a rename upstream never moves the card to another city.
 */
export default function WeatherCity({ onSaved }: { onSaved: (view: WeatherView) => void }) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<WeatherPlace[] | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function pick(place: WeatherPlace) {
    setWorking(true);
    try {
      onSaved(await api.weatherSetPlace(place));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setWorking(false);
    }
  }

  async function search() {
    setWorking(true);
    try {
      const places = await api.weatherSearch(query);
      setError("");
      setFound(places);
      // One match is the answer: no reason to make the user click a list of one.
      if (places.length === 1) await pick(places[0]);
    } catch (e) {
      setError(errText(e));
      setFound(null);
    } finally {
      setWorking(false);
    }
  }

  return (
    <form
      className="flex h-full flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void search();
      }}
    >
      <h2 className="text-xs font-semibold text-fg">{t("weather.ask.title")}</h2>
      <p className="text-[11px] leading-snug text-faint">{t("weather.ask.hint")}</p>
      <label className="flex flex-col gap-1 text-[11px] text-muted">
        {t("weather.city.label")}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("weather.city.placeholder")}
          className="canto-field w-full px-2 py-1 text-xs"
        />
      </label>
      <button
        type="submit"
        disabled={working || query.trim() === ""}
        className="canto-hit min-h-[28px] shrink-0 rounded-md bg-accent/15 px-2 text-xs font-semibold text-accent-text hover:bg-accent/25 disabled:opacity-60"
      >
        {working ? t("weather.searching") : t("weather.search")}
      </button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {found !== null &&
        (found.length === 0 ? (
          <p className="text-[11px] text-faint">{t("search.empty")}</p>
        ) : (
          <ul className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
            {found.map((place) => (
              <li key={`${place.city}-${place.lat}-${place.lon}`}>
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void pick(place)}
                  className="canto-hit flex min-h-[28px] w-full items-center rounded-md px-1.5 text-left text-xs text-fg hover:bg-hover active:bg-active"
                >
                  <span className="min-w-0 truncate">{label(place)}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
    </form>
  );
}

/** "Londres · Inglaterra, Reino Unido": the state is what tells two cities with the same name apart. */
function label(place: WeatherPlace): string {
  const where = [place.admin1, place.country].filter(Boolean).join(", ");
  return where ? `${place.city} · ${where}` : place.city;
}
