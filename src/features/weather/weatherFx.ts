import { WEATHER_ALERT_KINDS } from "../../lib/api";

export type WeatherFxKind = (typeof WEATHER_ALERT_KINDS)[number] | "cold";

/** `weather:<kind>` → the kind; anything unknown reads as rain, the plainest sky. */
export function weatherAlertKind(id: string): WeatherFxKind {
  const kind = id.slice(id.indexOf(":") + 1);
  return (WEATHER_ALERT_KINDS as readonly string[]).includes(kind) ? (kind as WeatherFxKind) : "rain";
}

/** How the card arrives (classes in weather.css): rain drops in, a storm shakes, the heat rises, the cold freezes... */
const ENTER: Record<WeatherFxKind, string> = {
  rain: "drop", storm: "shake", heat: "rise", cold: "frost", wind: "gust", uv: "glow", air: "mist", fog: "mist", dry: "rise", snow: "drop", swing: "gust",
};

/** The sky tint behind the card, per kind. */
const SKY: Record<WeatherFxKind, string> = {
  rain: "#1e3a5f", storm: "#2e1f4a", heat: "#5a2a12", cold: "#123a52", wind: "#1f3b3a", uv: "#4a2a5e", air: "#3b3424", fog: "#2a3340", dry: "#4a3418", snow: "#25384f", swing: "#1d3354",
};

export const weatherEnter = (id: string) => `wx-enter-${ENTER[weatherAlertKind(id)]}`;
export const weatherSky = (id: string) => SKY[weatherAlertKind(id)];
