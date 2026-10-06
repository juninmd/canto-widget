import { api, type AgendaItem } from "../lib/api";
import { duration } from "../lib/agendaFree";
import { hour, status } from "../lib/agenda";
import { heroOf } from "../lib/agendaRail";
import { t } from "../i18n";

type Props = { items: AgendaItem[]; now: Date; clashes: Map<string, string[]>; onDetails: (id: string) => void };

/** The one thing to look at: the meeting in progress, else the next one, else how the day went. */
export default function AgendaHero({ items, now, clashes, onDetails }: Props) {
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
  return (
    <section aria-label={live ? t("agenda.hero.now") : t("agenda.hero.next")} className={`rounded-2xl border p-3 ${live ? "border-accent bg-accent/10" : "border-edge bg-ink/60"}`}>
      <p className={`flex justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide ${live ? "text-accent-text" : "text-muted"}`}>
        <span>{live ? t("agenda.hero.now") : t("agenda.hero.next")}</span>
        <span>{live ? t("agenda.hero.endsIn", { duration: duration(hero.left) }) : status(e, now).label}</span>
      </p>
      <h2 className="mt-1 text-base font-semibold leading-tight text-fg">{e.title}</h2>
      <p className="flex flex-wrap gap-x-2 text-xs text-muted">
        <span className="font-mono tabular-nums">{hour(e)}</span>
        {e.location && <span className="truncate">{e.location}</span>}
      </p>
      {live && (
        <div role="progressbar" aria-label={t("agenda.hero.progress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hero.pct * 100)} className="mt-2 h-1.5 overflow-hidden rounded-full bg-edge">
          <div className="h-full rounded-full bg-accent" style={{ width: `${hero.pct * 100}%` }} />
        </div>
      )}
      {other && (
        <p role="alert" className="mt-2 rounded-lg bg-danger/15 px-2 py-1 text-xs text-danger">
          ⚠ {t("agenda.conflictWith", { titles: other })}
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
