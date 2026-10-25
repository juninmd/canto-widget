import { t } from "../i18n";
import { hoursMinutes } from "./clockLabel";

/** What fits inside the countdown ring: minutes up to 99, then "2h05"; the unit rides under the number. */
export function ringText(left: number): { value: string; unit: string } {
  const total = Math.max(0, Math.round(left));
  if (total < 100) return { value: String(total), unit: t("agenda.free.min", { n: "" }).trim() };
  return { value: hoursMinutes(Math.floor(total / 60), total % 60), unit: "" };
}
