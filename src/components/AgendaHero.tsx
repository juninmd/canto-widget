import { api, type AgendaItem } from "../lib/api";
import { duration } from "../lib/agendaFree";
import { hour, status } from "../lib/agenda";
import { heroOf } from "../lib/agendaRail";
import { t } from "../i18n";
import AgendaRing from "./AgendaRing";

type Props = { items: AgendaItem[]; now: Date; /** False on other days: "in 1h30" would be measured from a made-up clock. */ relative?: boolean; clashes: Map<string, string[]>; onDetails: (id: string) => void };

/** The one thing to look at: the meeting in progress, else the next one, else how the day went. */
export default function AgendaHero({ items, now, relative = true, clashes, onDetails }: Props) {
  const hero = heroOf(items, now);
  if (!hero) return null;
  if (hero.kind === "done") {
    return (
      <section aria-label={t("agenda.hero.done")} className="rounded-2xl border border-edge bg-ink/60 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{t("agenda.hero.done")}</p>
        <h2 className="mt-1 text-base font-semibold text-fg">{t("agenda.hero.doneTitle", { count: hero.count, duration: duration(hero.minutes) })}</h2>
        <p className="text-xs text-muted">{t("agenda.hero.doneBody")}</p>
      </section>
    );
  }
  const e = hero.item;
  const live = hero.kind === "now";
  const other = clashes.get(e.id)?.[0];
  const endsIn = live ? t("agenda.hero.endsIn", { duration: duration(hero.left) }) : "";
  const guests = e.guests ?? 0;
  return (
    <section aria-label={live ? t("agenda.hero.now") : t("agenda.hero.next")} className={`rounded-2xl border p-3 ${live ? "border-accent bg-accent/10" : "border-edge bg-ink/60"}`}>
      <div className="flex items-start gap-3">
        {live && <AgendaRing left={hero.left} pct={hero.pct} label={endsIn} />}
        <div className="min-w-0 flex-1">
          <p className={`flex justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide ${live ? "text-accent-text" : "text-muted"}`}>
            <span>{live ? t("agenda.hero.now") : t("agenda.hero.next")}</span>
            <span>{live ? endsIn : relative ? status(e, now).label : ""}</span>
          </p>
          <h2 className="mt-1 text-base font-semibold leading-tight text-fg">{e.title}</h2>
          <p className="flex flex-wrap gap-x-2 text-xs text-muted">
            <span className="font-mono tabular-nums">{hour(e)}</span>
            {e.location && <span className="truncate">{e.location}</span>}
            {guests > 0 && <span>{guests === 1 ? t("agenda.guests.one") : t("agenda.guests.other", { n: guests })}</span>}
          </p>
        </div>
      </div>
      {other && (
        <p role="alert" className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-danger/15 px-2.5 py-0.5 text-xs text-danger">
          <span aria-hidden="true">⚠</span>
          <span className="truncate">{t("agenda.conflictWith", { titles: other })}</span>
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {e.meet && (
          <button type="button" onClick={() => void api.openLink(e.meet)} className={`canto-hit min-h-7 rounded-lg px-3 text-xs font-bold ${live ? "bg-accent text-on-accent" : "bg-edge text-fg"}`}>
            {t("agenda.joinMeet")}
          </button>
        )}
        <button type="button" onClick={() => onDetails(e.id)} className="canto-hit min-h-7 rounded-lg border border-edge px-3 text-xs text-muted hover:bg-hover hover:text-fg">
          {t("agenda.hero.details")}
        </button>
      </div>
    </section>
  );
}
