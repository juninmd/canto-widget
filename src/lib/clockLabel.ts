import { LOCALE } from "../i18n";

/** "HH:MM" of a timestamp in ms, for the "updated at" indicators. */
export const clockLabel = (ms: number) => new Date(ms).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
