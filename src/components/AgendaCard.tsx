import { useId } from "react";
import { api, type AgendaItem } from "../lib/api";
import { hour, people, status } from "../lib/agenda";
import { t } from "../i18n";
import AgendaGuests from "./AgendaGuests";
import Avatar from "./Avatar";
import RsvpBadge from "./RsvpBadge";

type Props = { event: AgendaItem; open: boolean; onToggle: () => void };

export default function AgendaCard({ event: e, open, onToggle }: Props) {
  const { label, now } = status(e);
  const detailsId = useId();
  const attachments = e.attachments ?? [];
  const attendees = e.attendees ?? [];
  const host = attendees.find((g) => g.organizer);

  return (
    <li className={`rounded-lg border p-2 ${now ? "border-accent bg-accent/10" : "border-edge bg-ink/60"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailsId}
        className="block w-full text-left"
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-fg">{e.title}</span>
          <span className="shrink-0 text-[11px] text-muted">
            {hour(e)} <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </span>
        </span>
        {(label || e.response) && (
          <span className="flex flex-wrap items-center gap-1.5">
            {label && <span className={`text-[11px] font-semibold ${now ? "text-fg" : "text-muted"}`}>{label}</span>}
            {e.response && <RsvpBadge response={e.response} />}
          </span>
        )}
        {e.location && <span className="block truncate text-[11px] text-faint">{e.location}</span>}
      </button>

      {open && (
        <div id={detailsId} className="mt-2 space-y-1.5 border-t border-edge pt-2 text-[11px] text-muted">
          {people(e) && (
            <p className="flex items-center gap-1.5">
              {e.organizer && <Avatar name={host?.name ?? e.organizer} email={host?.email} size="md" />}
              <span>{people(e)}</span>
            </p>
          )}
          {e.description && <p className="max-h-32 overflow-y-auto whitespace-pre-line text-faint">{e.description}</p>}
          <AgendaGuests guests={attendees} total={e.guests ?? attendees.length} />
          {attachments.length > 0 && (
            <ul aria-label={t("agenda.attachments")} className="space-y-1">
              {attachments.map((a) => (
                <li key={a.url}>
                  <button
                    type="button"
                    onClick={() => void api.openLink(a.url)}
                    title={a.url}
                    className="w-full truncate rounded bg-edge px-2 py-1 text-left text-fg hover:bg-line"
                  >
                    📄 {a.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {e.link && (
            <button type="button" onClick={() => void api.openLink(e.link)} className="min-h-6 underline decoration-dotted hover:text-fg">
              {t("agenda.openInCalendar")}
            </button>
          )}
        </div>
      )}

      {e.meet && (
        <button
          type="button"
          onClick={() => void api.openLink(e.meet)}
          className={`mt-1.5 min-h-7 rounded px-2.5 text-xs font-semibold ${now ? "bg-accent text-on-accent" : "bg-edge text-fg"}`}
        >
          {t("agenda.joinMeet")}
        </button>
      )}
    </li>
  );
}
