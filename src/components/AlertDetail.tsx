import type { ReactNode } from "react";
import { api, type AgendaItem } from "../lib/api";
import { hour, people, status as agendaStatus, tally } from "../lib/agenda";
import { kindOf, levelLabel, prLabel, toneOf } from "../lib/alerts";
import { block, inlineMarkdown, type Render } from "../lib/markdown";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import AlertGuests from "./AlertGuests";
import AlertJobs from "./AlertJobs";
import AlertPrep from "./AlertPrep";
import SenderLine from "./SenderLine";
import { TONE } from "./AlertStrip";

function Box({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-h-0 overflow-y-auto rounded-lg border border-edge bg-ink px-2.5 py-2">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-faint">{label}</p>
      {children}
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`rounded-full bg-edge px-2 py-0.5 text-[11px] ${tone ?? "text-fg"}`}>{children}</span>;
}

/** Why the alert rang, in its tone, ahead of everything else it says. */
function Reason({ tone, children }: { tone: (typeof TONE)[keyof typeof TONE]; children: ReactNode }) {
  return (
    <span data-reason className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.card} ${tone.text}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${tone.dot}`} />
      {children}
    </span>
  );
}

/** What a mention or a service writes: rendered as markdown (bold, lists, code) with its links openable. */
function Description({ text }: { text: string }) {
  const render: Render = {
    text: (plain) => plain,
    link: (href, children, key) => (
      <button key={key} type="button" onClick={() => void api.openLink(href)} className="break-all text-left text-accent-text underline decoration-dotted">
        {children}
      </button>
    ),
  };
  return (
    <div className="space-y-1 break-words text-xs text-fg">
      {inlineMarkdown.lexer(text).filter((tok) => tok.type !== "space").map((tok, i) => block(tok, render, `d${i}`))}
    </div>
  );
}

/** What the selected alert says, laid out for a wide, short card: heading, chips, then up to two boxes. */
export default function AlertDetail({ event, onOpenNotes }: { event: AgendaItem; onOpenNotes?: () => void }) {
  const kind = kindOf(event);
  const tone = TONE[toneOf(event)];
  const attendees = event.attendees ?? [];
  const guests = tally(attendees);
  const soon = agendaStatus(event).label;
  const forge = kind === "pr" || kind === "mention";
  // A box that would only hold its label is noise; meetings always keep theirs for the prep notes.
  const detailed = kind === "meeting" || !!event.description || !!event.location || (event.attachments ?? []).length > 0;

  return (
    <>
      {forge ? (
        <>
          <p data-eyebrow className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] text-muted">
            <span className={`shrink-0 uppercase tracking-widest ${tone.text}`}>{t(`alert.kind.${kind}`)}</span>
            {[event.organizer, event.start && timeAgo(event.start)].filter(Boolean).map((part) => (
              <span key={part} className="truncate before:mr-1.5 before:text-faint before:content-['·']">
                {part}
              </span>
            ))}
          </p>
          <div>
            <Reason tone={tone}>
              {kind === "pr" ? prLabel(event.tag) : event.tag === "gitlab" ? "GitLab" : "GitHub"}
            </Reason>
          </div>
        </>
      ) : (
        <p className={`text-[11px] uppercase tracking-widest ${tone.text}`}>{t(`alert.kind.${kind}`)}</p>
      )}
      <h1 className="line-clamp-2 text-xl font-semibold leading-tight">{event.title}</h1>
      {forge && event.sender && <SenderLine sender={event.sender} />}
      {!forge && (
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
      )}
      <div className={`grid min-h-0 flex-1 content-start gap-2.5 ${kind === "meeting" ? "grid-cols-[1.25fr_1fr] grid-rows-[minmax(0,1fr)]" : "grid-cols-1 grid-rows-[minmax(0,auto)]"}`}>
        {detailed && (
          <Box label={kind === "status" ? t("alert.nowSituation") : t("alert.details")}>
            {event.description && <Description text={event.description} />}
            {event.location && <p className="mt-1 break-words text-xs text-muted">{event.location}</p>}
            {kind === "meeting" && people(event) && <p className="mt-1 text-xs text-muted">{people(event)}</p>}
            {kind === "meeting" && <AlertPrep event={event} onOpenNotes={onOpenNotes} />}
            {kind === "pr" && <AlertJobs jobs={event.attachments ?? []} />}
          </Box>
        )}
        {kind === "meeting" && (
          <Box label={t("alert.guests")}>
            {attendees.length > 0 && (
              <>
                <p className="text-xs text-muted">
                  ✔ {guests.yes} · ? {guests.maybe + guests.pending} · ✖ {guests.no}
                </p>
                <AlertGuests guests={attendees} total={event.guests ?? 0} />
              </>
            )}
            {(event.attachments ?? []).map((a) => (
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
