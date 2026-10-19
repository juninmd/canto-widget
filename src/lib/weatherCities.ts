/** One-click cities and the ones picked before: coordinates are fixed here, so choosing needs no search at all. */
import { LOCALE } from "../i18n";
import type { WeatherPlace } from "./api";

type Popular = { city: string; admin1: string; code: string; lat: number; lon: number };

const POPULAR: Popular[] = [
  { city: "São Paulo", admin1: "SP", code: "BR", lat: -23.5475, lon: -46.6361 },
  { city: "Rio de Janeiro", admin1: "RJ", code: "BR", lat: -22.9068, lon: -43.1729 },
  { city: "Brasília", admin1: "DF", code: "BR", lat: -15.7939, lon: -47.8828 },
  { city: "Belo Horizonte", admin1: "MG", code: "BR", lat: -19.9167, lon: -43.9345 },
  { city: "Salvador", admin1: "BA", code: "BR", lat: -12.9714, lon: -38.5124 },
  { city: "Curitiba", admin1: "PR", code: "BR", lat: -25.4284, lon: -49.2733 },
  { city: "Porto Alegre", admin1: "RS", code: "BR", lat: -30.0346, lon: -51.2177 },
  { city: "Recife", admin1: "PE", code: "BR", lat: -8.0476, lon: -34.877 },
  { city: "Fortaleza", admin1: "CE", code: "BR", lat: -3.7319, lon: -38.5267 },
  { city: "Lisboa", admin1: "", code: "PT", lat: 38.7223, lon: -9.1393 },
  { city: "New York", admin1: "NY", code: "US", lat: 40.7128, lon: -74.006 },
  { city: "London", admin1: "England", code: "GB", lat: 51.5074, lon: -0.1278 },
  { city: "Madrid", admin1: "", code: "ES", lat: 40.4168, lon: -3.7038 },
  { city: "Tokyo", admin1: "", code: "JP", lat: 35.6762, lon: 139.6503 },
];

/** The country in the user's language; the code itself if the runtime has no name for it. */
function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(LOCALE, { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function popularCities(): WeatherPlace[] {
  return POPULAR.map(({ code, ...place }) => ({ ...place, country: countryName(code) }));
}

const KEY = "canto.weather.recent";
const MAX_RECENT = 4;

/** Two spellings of one city share a point on the map; a tenth of a degree is a few kilometres. */
function same(a: WeatherPlace, b: WeatherPlace): boolean {
  return Math.abs(a.lat - b.lat) < 0.1 && Math.abs(a.lon - b.lon) < 0.1;
}

function isPlace(value: unknown): value is WeatherPlace {
  const p = value as WeatherPlace;
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.city === "string" &&
    typeof p.admin1 === "string" &&
    typeof p.country === "string" &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lon)
  );
}

/** Per-viewer convenience: a blocked or cleared storage just means no recents. */
export function recentCities(): WeatherPlace[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isPlace).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function rememberCity(place: WeatherPlace) {
  try {
    const next = [place, ...recentCities().filter((p) => !same(p, place))].slice(0, MAX_RECENT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private window, cleared data): the picker still works without it.
  }
}
