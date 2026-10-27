import type { CSSProperties } from "react";
import type { GmailAction, GmailMail } from "../lib/api";
import { initials, shortWhen } from "../lib/google";
import { avatarTone } from "../lib/agenda";
import { t } from "../i18n";

export const MINI = "canto-hit rounded-md px-2 py-0.5 text-[11px] aria-disabled:opacity-60";
/** How a row leaves, so the motion says where the mail went. */
const EXIT: Partial<Record<GmailAction, string>> = { archive: "canto-archive", trash: "canto-trash" };

type Props = {
  mail: GmailMail;
  index: number;
  now: Date;
  selected: boolean;
  /** A request for this mail is on its way: the actions wait for it. */
  busy: boolean;
  leaving: GmailAction | null;
  onSelect: () => void;
  onAct: (action: GmailAction) => void;
  onTask: () => void;
  onOpen: () => void;
};

/** One mail: tap the avatar to select it, the star toggles in place, and the actions sit under the snippet. */
export default function GmailRow({ mail, index, now, selected, busy, leaving, onSelect, onAct, onTask, onOpen }: Props) {
  const exit = leaving ? (EXIT[leaving] ?? "canto-swipe") : "";
  const label = mail.subject || mail.from;
  // aria-disabled rather than disabled: a disabled button drops the keyboard focus, and with it the list's shortcuts.
  const fire = (action: GmailAction) => {
    if (!busy) onAct(action);
  };
  return (
    <li
      data-gmail-mail={mail.id}
      data-flip={mail.id}
      data-selected={selected || undefined}
      aria-busy={busy || undefined}
      className={`wx-rise grid ${exit ? `${exit} pointer-events-none` : ""} grid-cols-[2rem_1fr_auto] gap-x-2 p-2.5 transition-colors ${selected ? "bg-accent/10" : ""}`}
      style={{ "--i": Math.min(index + 1, 12) } as CSSProperties}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-label={t("gmail.select", { subject: label })}
        aria-keyshortcuts="J K X S U E # O"
        data-gmail-focus
        onClick={onSelect}
        className={`canto-hit row-span-3 grid size-8 place-items-center rounded-full text-[11px] font-bold text-fg transition-transform ${selected ? "bg-accent text-ink" : avatarTone(mail.from)}`}
      >
        {selected ? <span key="on" className="canto-pop">✓</span> : initials(mail.from)}
      </button>
      <span className={`flex min-w-0 items-center gap-1.5 text-xs text-fg ${mail.unread ? "font-semibold" : ""}`}>
        {mail.unread && <span role="img" aria-label={t("gmail.unreadDot")} className="canto-ping relative size-1.5 shrink-0 rounded-full bg-accent" />}
        <span title={mail.from} className="truncate">{mail.from}</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="text-[10px] tabular-nums text-faint">{shortWhen(new Date(mail.date), now)}</span>
        <button
          type="button"
          aria-pressed={mail.starred}
          aria-label={t(mail.starred ? "gmail.unstar" : "gmail.star", { subject: label })}
          onClick={() => fire(mail.starred ? "unstar" : "star")}
          aria-disabled={busy || undefined}
          className={`canto-hit grid size-5 place-items-center rounded text-sm leading-none ${mail.starred ? "text-warn" : "text-faint hover:text-warn"}`}
        >
          <span key={String(mail.starred)} aria-hidden="true" className={mail.starred ? "canto-star inline-block" : "inline-block"}>
            {mail.starred ? "★" : "☆"}
          </span>
        </button>
      </span>
      <span title={mail.subject || undefined} className={`col-span-2 truncate text-xs ${mail.unread ? "text-fg" : "text-muted"}`}>{mail.subject}</span>
      <span className="col-span-2 truncate text-[11px] text-muted">{mail.snippet}</span>
      <span role="group" aria-label={label} className="col-span-2 col-start-2 mt-1 flex flex-wrap gap-1">
        {mail.link && (
          <button type="button" className={`${MINI} bg-accent/15 text-accent-text hover:bg-accent/25`} onClick={onOpen}>
            {t("gmail.open")}
          </button>
        )}
        <button type="button" className={`${MINI} bg-edge/60 hover:bg-hover`} onClick={() => fire(mail.unread ? "read" : "unread")} aria-disabled={busy || undefined}>
          {t(mail.unread ? "gmail.markRead" : "gmail.markUnread")}
        </button>
        <button type="button" className={`${MINI} bg-edge/60 hover:bg-hover`} onClick={() => fire("archive")} aria-disabled={busy || undefined}>
          {t("gmail.archive")}
        </button>
        <button type="button" className={`${MINI} bg-edge/60 hover:bg-danger/20 hover:text-danger`} onClick={() => fire("trash")} aria-disabled={busy || undefined}>
          {t("gmail.trash")}
        </button>
        <button type="button" className={`${MINI} bg-edge/60 hover:bg-hover`} onClick={onTask}>
          {t("gmail.toTask")}
        </button>
      </span>
    </li>
  );
}
