import type { ReactNode } from "react";
import { api, type AgendaItem } from "../lib/api";
import { hour, people, status as agendaStatus, tally } from "../lib/agenda";
import { kindOf, levelLabel, prLabel, senderName, toneOf } from "../lib/alerts";
import { block, inlineMarkdown, type Render } from "../lib/markdown";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import AlertGuests from "./AlertGuests";
import AlertJobs from "./AlertJobs";
import AlertPrep from "./AlertPrep";
import Avatar from "./Avatar";
import { CalendarIcon, CheckIcon, ClockIcon, PullIcon, PulseIcon } from "./Icons";
import { TONE } from "./AlertStrip";

/** A labeled box under the title; it scrolls on its own past `max-h-56`, so a long one never pushes the actions off. */
function Box({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="max-h-56 min-w-0 overflow-y-auto rounded-lg border border-edge bg-ink px-2.5 py-2">
      <p className="mb-1 flex justify-between gap-2 text-[10px] font-semibold uppercase tracking-widest text-faint">
        <span>{label}</span>
        {aside}
      </p>
      {children}
    </div>
  );
}

function Chip({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`rounded-full bg-edge px-2 py-0.5 text-[11px] ${tone ?? "text-fg"}`}>{children}</span>;
}

const KIND_ICON: Record<string, ReactNode> = {
  pr: <PullIcon />,
  meeting: <CalendarIcon />,
  task: <CheckIcon />,
  status: <PulseIcon size={18} />,
  digest: <ClockIcon />,
  model: <PulseIcon size={18} />,
  mention: <span className="text-base font-semibold leading-none">@</span>,
};

/** Who sent it (photo or initials) or what kind it is, in the alert's tone, on the left of the card. */
function Badge({ event, kind, tone }: { event: AgendaItem; kind: string; tone: (typeof TONE)[keyof typeof TONE] }) {
  if (event.sender) {
    return (
      <span className="relative row-span-2 self-start">
        <Avatar name={senderName(event)} email={event.sender.login} photo={event.sender.avatar} size="lg" />
        <span
          aria-hidden="true"
          className={`absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full ring-2 ring-panel [&_svg]:size-2.5 ${tone.dot} text-on-accent`}
        >
          {KIND_ICON[kind]}
        </span>
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`row-span-2 grid size-9 place-items-center self-start rounded-xl border [&_svg]:size-[18px] ${tone.card} ${tone.text}`}
    >
      {KIND_ICON[kind]}
    </span>
  );
}

/** Why the alert rang, in its tone, ahead of everything else it says. */
function Reason({ tone, children }: { tone: (typeof TONE)[keyof typeof TONE]; children: ReactNode }) {
  return (
    <span
      data-reason
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone.card} ${tone.text}`}
    >
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
      <button
        key={key}
        type="button"
        onClick={() => void api.openLink(href)}
        className="break-all text-left text-accent-text underline decoration-dotted"
      >
        {children}
      </button>
    ),
  };
  return (
    <div className="space-y-1 break-words text-xs text-fg">
      {inlineMarkdown
        .lexer(text)
        .filter((tok) => tok.type !== "space")
        .map((tok, i) => block(tok, render, `d${i}`))}
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
  const detailed =
    kind === "meeting" || !!event.description || !!event.location || (event.attachments ?? []).length > 0;

  const sender = event.sender;
  const name = sender ? sender.name || sender.login : "";
  return (
    // The card's grid: badge on the left, everything else in one column that the actions line up with.
    <div
      data-sender={sender ? "" : undefined}
      className="grid min-h-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-1.5"
    >
      <Badge event={event} kind={kind} tone={tone} />
      <p data-eyebrow className="flex min-w-0 items-center gap-1.5 pr-7 font-mono text-[10.5px] leading-4 text-muted">
        <span className={`shrink-0 uppercase tracking-widest ${tone.text}`}>{t(`alert.kind.${kind}`)}</span>
        {forge &&
          [event.organizer, event.start && timeAgo(event.start)].filter(Boolean).map((part, i, all) => (
            <span
              key={part}
              className={`${i === all.length - 1 && all.length > 1 ? "shrink-0" : "truncate"} before:mr-1.5 before:text-faint before:content-['·']`}
            >
              {part}
            </span>
          ))}
      </p>
      <h1 className="col-start-2 line-clamp-2 text-[15px] font-semibold leading-snug [text-wrap:balance]">
        {event.title}
      </h1>
      <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
        {forge && (
          <Reason tone={tone}>
            {kind === "pr" ? prLabel(event.tag) : event.tag === "gitlab" ? "GitLab" : "GitHub"}
          </Reason>
        )}
        {forge && sender && (
          <span className="flex min-w-0 items-baseline gap-1">
            <b className="truncate font-semibold text-fg">{name}</b>
            {sender.name && <span className="truncate">@{sender.login}</span>}
          </span>
        )}
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
      {detailed && (
        <div className="col-start-2">
          <Box label={kind === "status" ? t("alert.nowSituation") : t("alert.details")}>
            {event.description && <Description text={event.description} />}
            {event.location && <p className="mt-1 break-words text-xs text-muted">{event.location}</p>}
            {kind === "meeting" && people(event) && <p className="mt-1 text-xs text-muted">{people(event)}</p>}
            {kind === "meeting" && <AlertPrep event={event} onOpenNotes={onOpenNotes} />}
            {kind === "pr" && <AlertJobs jobs={event.attachments ?? []} />}
          </Box>
        </div>
      )}
      {kind === "meeting" && (attendees.length > 0 || (event.attachments ?? []).length > 0) && (
        <div className="col-start-2">
          <Box
            label={t("alert.guests")}
            aside={
              attendees.length > 0 && (
                <span className="font-mono normal-case tracking-normal">
                  ✔ {guests.yes} · ? {guests.maybe + guests.pending} · ✖ {guests.no}
                </span>
              )
            }
          >
            {attendees.length > 0 && <AlertGuests guests={attendees} total={event.guests ?? 0} />}
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
        </div>
      )}
    </div>
  );
}
