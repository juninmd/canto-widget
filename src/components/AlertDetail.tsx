import type { ReactNode } from "react";
import { api, type AgendaItem } from "../lib/api";
import { hour, people, status as agendaStatus, tally } from "../lib/agenda";
import { kindOf, levelLabel, toneOf } from "../lib/alerts";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import { TONE } from "./AlertStrip";

function Box({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-h-0 overflow-hidden rounded-lg border border-edge bg-ink px-2.5 py-2">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-faint">{label}</p>
      {children}
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`rounded-full bg-edge px-2 py-0.5 text-[11px] ${tone ?? "text-fg"}`}>{children}</span>;
}

/** What the selected alert says, laid out for a wide, short card: heading, chips, then up to two boxes. */
export default function AlertDetail({ event }: { event: AgendaItem }) {
  const kind = kindOf(event);
  const tone = TONE[toneOf(event)];
  const guests = tally(event.attendees ?? []);
  const soon = agendaStatus(event).label;

  return (
    <>
      <p className={`text-[11px] uppercase tracking-widest ${tone.text}`}>{t(`alert.kind.${kind}`)}</p>
      <h1 className="line-clamp-2 text-xl font-semibold leading-tight">{event.title}</h1>
      <div className="flex flex-wrap gap-1.5">
        {kind === "status" && (
          <>
            <Chip tone={tone.text}>{levelLabel(event.tag)}</Chip>
            {event.start && <Chip>{t("alert.since", { time: hour(event) })}</Chip>}
            {event.start && <Chip>{timeAgo(event.start)}</Chip>}
          </>
        )}
        {kind === "model" && (
          <>
            {event.tag && <Chip tone={tone.text}>{event.tag}</Chip>}
            {event.organizer && <Chip>{event.organizer}</Chip>}
          </>
        )}
        {(kind === "meeting" || kind === "task") && (
          <>
            <Chip tone={tone.text}>{hour(event)}</Chip>
            {kind === "meeting" && soon && <Chip>{soon}</Chip>}
            {event.meet && <Chip>Meet</Chip>}
          </>
        )}
      </div>
      <div className={`grid min-h-0 flex-1 gap-2.5 ${kind === "meeting" ? "grid-cols-[1.25fr_1fr]" : "grid-cols-1"}`}>
        <Box label={kind === "status" ? t("alert.nowSituation") : t("alert.details")}>
          {event.description && <p className="line-clamp-4 whitespace-pre-line text-xs text-fg">{event.description}</p>}
          {event.location && <p className="mt-1 line-clamp-2 text-xs text-muted">{event.location}</p>}
          {kind === "meeting" && people(event) && <p className="mt-1 text-xs text-muted">{people(event)}</p>}
        </Box>
        {kind === "meeting" && (
          <Box label={t("alert.guests")}>
            {(event.attendees ?? []).length > 0 && (
              <p className="text-xs text-muted">
                ✔ {guests.yes} · ? {guests.maybe + guests.pending} · ✖ {guests.no}
              </p>
            )}
            {(event.attachments ?? []).slice(0, 2).map((a) => (
              <button
                key={a.url}
                type="button"
                onClick={() => void api.openLink(a.url)}
                title={a.url}
                className="mt-1 block w-full truncate rounded bg-edge px-2 py-1 text-left text-xs text-fg"
              >
                📄 {a.title}
              </button>
            ))}
          </Box>
        )}
      </div>
    </>
  );
}
