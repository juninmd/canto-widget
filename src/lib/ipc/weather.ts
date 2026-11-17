import { invoke } from "@tauri-apps/api/core";

/** The WMO groups the Clima tab knows; the catalogue turns each one into a sentence. */
export type WeatherCondition = "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm";
export type WeatherPlace = { city: string; admin1: string; country: string; lat: number; lon: number };
export type WeatherNow = {
  temp: number;
  feels: number;
  condition: WeatherCondition;
  /** Percent. */
  humidity: number;
  /** km/h, and the direction it blows from in degrees. */
  wind: number;
  wind_dir: number;
  is_day: boolean;
  /** Gusts in km/h, pressure in hPa, visibility in km, dew point in °C; null when the API omits them. */
  gusts?: number | null;
  pressure?: number | null;
  visibility?: number | null;
  dew_point?: number | null;
};
/** Times and dates come already local to the city (`timezone=auto` on the API call). Seven days of hours. */
export type WeatherHour = {
  at: string;
  temp: number;
  rain: number;
  condition: WeatherCondition;
  /** Apparent temperature, wind in km/h with the direction it blows from, precipitation in mm. */
  feels?: number;
  wind?: number;
  wind_dir?: number;
  precip?: number;
};
export type WeatherDay = {
  date: string;
  min: number;
  max: number;
  rain: number;
  condition: WeatherCondition;
  /** ISO local times; empty when the sun does not rise or set that day. */
  sunrise: string;
  sunset: string;
  uv: number;
};
export type WeatherForecast = {
  now: WeatherNow;
  hours: WeatherHour[];
  days: WeatherDay[];
  rain_from: string | null;
  /** mm in each of the next quarters of an hour (two hours); empty when the API sends none. */
  next_rain?: number[];
  /** US AQI; null when the air-quality call failed. */
  air?: number | null;
};
/** Same order as `KINDS` in `weather_hints.rs`. */
export const WEATHER_ALERT_KINDS = ["storm", "rain", "heat", "cold", "wind", "uv", "air", "fog", "dry", "snow", "swing"] as const;
export type WeatherAlertKind = (typeof WEATHER_ALERT_KINDS)[number];
export type WeatherView = {
  place: WeatherPlace | null;
  forecast: WeatherForecast | null;
  fetched_at: number;
  /** pt-BR text when the reading failed; a saved city still comes through with it. */
  error: string | null;
};

export const weatherApi = {
  /** Clima: the saved city plus the Open-Meteo forecast; Rust keeps it for 30 min. */
  weatherGet: (force = false) => invoke<WeatherView>("weather_get", { force }),
  /** Every candidate Open-Meteo returns, so the user picks the city instead of trusting the first match. */
  weatherSearch: (query: string) => invoke<WeatherPlace[]>("weather_search", { query }),
  /** Saves the chosen coordinates; the names come along as display text. */
  weatherSetPlace: (place: WeatherPlace) => invoke<WeatherView>("weather_set_place", { place }),
  weatherClear: () => invoke<WeatherView>("weather_clear"),
  /** The weather alert kinds switched on (`WEATHER_ALERT_KINDS`); Rust rings them for the saved city. */
  weatherAlertsGet: () => invoke<string[]>("weather_alerts_get"),
  weatherAlertsSet: (kinds: string[]) => invoke<string[]>("weather_alerts_set", { kinds }),
};
