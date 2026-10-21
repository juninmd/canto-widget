import { t } from "../i18n";

/** What fits inside the countdown ring: minutes up to 99, then "2h05"; the unit rides under the number. */
export function ringText(left: number): { value: string; unit: string } {
  const total = Math.max(0, Math.round(left));
  if (total < 100) return { value: String(total), unit: t("agenda.free.min", { n: "" }).trim() };
  return { value: `${Math.floor(total / 60)}h${String(total % 60).padStart(2, "0")}`, unit: "" };
}
