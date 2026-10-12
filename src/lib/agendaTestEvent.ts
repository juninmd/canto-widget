import type { AgendaItem } from "./api";
import { t } from "../i18n";

/** Synthetic event so the user can check the pop-up and sound without waiting for a meeting. */
export function testEvent(): AgendaItem {
  const now = new Date();
  return {
    id: `teste-${now.getTime()}`,
    title: t("agenda.test.title"),
    start: now.toISOString(),
    end: new Date(now.getTime() + 30 * 60_000).toISOString(),
    all_day: false,
    location: t("agenda.test.location"),
    meet: "https://meet.google.com/abc-defg-hij",
    link: "",
    organizer: t("agenda.test.organizer"),
    guests: 3,
    description: t("agenda.test.description"),
  };
}
