import { useState, type CSSProperties } from "react";
import { api, errText, type TrafficSpot } from "../lib/api";
import { t } from "../i18n";

const ROW = "canto-hit wx-rise flex min-h-[40px] w-full items-center gap-2 rounded-xl border border-transparent px-2.5 text-left hover:border-edge hover:bg-hover";

type Props = {
  label: string;
  onPick: (spot: TrafficSpot) => void;
  disabled?: boolean;
  /** Offered before any search, like the Clima tab's city as a starting point. */
  shortcut?: { spot: TrafficSpot; label: string } | null;
};

/** Searches only on Enter or the button: each search spends the user's TomTom quota, so typing doesn't. */
export default function MapPlacePicker({ label, onPick, disabled = false, shortcut = null }: Props) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<TrafficSpot[] | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    const q = query.trim();
    if (!q) return;
    setWorking(true);
    try {
      setFound(await api.trafficSearch(q));
      setError("");
    } catch (e) {
      setError(errText(e));
      setFound(null);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <input
          aria-label={label}
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("map.search.placeholder")}
          className="canto-field min-w-0 flex-1 px-2.5 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={working || disabled || !query.trim()}
          className="canto-hit min-h-[36px] shrink-0 rounded-xl bg-accent/15 px-3 text-xs font-semibold text-accent-text hover:bg-accent/25 disabled:opacity-60"
        >
          {t("map.search.go")}
        </button>
      </form>
      {working && (
        <p role="status" className="text-[11px] text-faint motion-safe:animate-pulse">
          {t("map.search.working")}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {found !== null && !working && found.length === 0 && <p className="text-[11px] text-faint">{t("map.search.none")}</p>}
      {found !== null && found.length > 0 && (
        <ul aria-label={t("map.search.results")} className="flex flex-col gap-1">
          {found.map((spot, i) => (
            <li key={`${spot.lat},${spot.lon},${i}`}>
              <button type="button" disabled={disabled} onClick={() => onPick(spot)} className={ROW} style={{ "--i": i } as CSSProperties}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">{spot.name}</span>
                  {spot.detail && <span className="block truncate text-[11px] text-faint">{spot.detail}</span>}
                </span>
                <span aria-hidden="true" className="text-faint">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {shortcut && found === null && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPick(shortcut.spot)}
          className="canto-hit min-h-[32px] self-start rounded-full border border-edge px-3 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-60"
        >
          {shortcut.label}
        </button>
      )}
    </div>
  );
}
