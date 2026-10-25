import { LOCALE, t } from "../i18n";

/** "HH:MM" of a timestamp in ms, for the "updated at" indicators. */
export const clockLabel = (ms: number) => new Date(ms).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

/** A whole hour of the day ("14h", "14:00"), for titles and tiles. */
export const hourLabel = (h: number) => t("time.hourOfDay", { h });

/** The shorter form under a chart axis, where every tick repeats the unit. */
export const hourTick = (h: number) => t("time.hourTick", { h });

/** Hours and minutes in the language's short form ("1h05"); the minutes always take two digits. */
export const hoursMinutes = (h: number, m: number) => t("time.hMin", { h, mm: String(m).padStart(2, "0") });
