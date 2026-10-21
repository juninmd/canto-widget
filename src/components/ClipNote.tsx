import { useState } from "react";
import { t } from "../i18n";
import { CrossIcon, LockIcon } from "./Icons";

const KEY = "canto.clipNoteDismissed";

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** The privacy reminder about the history as a one-line lock badge, shown until the person dismisses it once. */
export default function ClipNote() {
  const [hidden, setHidden] = useState(wasDismissed);
  if (hidden) return null;
  return (
    <p
      title={`${t("clipboard.historyNote")} ${t("clipboard.historyNoteEmphasis")}`}
      className="flex min-w-0 max-w-full items-center self-start gap-1.5 rounded-full border border-edge bg-ink/60 py-0.5 pl-2.5 pr-0.5 text-[11px] text-muted"
    >
      <span aria-hidden="true" className="shrink-0 text-accent-text">
        <LockIcon />
      </span>
      <span className="min-w-0 truncate">{t("clipui.lockBadge")}</span>
      <button
        type="button"
        aria-label={t("clipboard.noteDismiss")}
        title={t("clipboard.noteDismiss")}
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(KEY, "1");
          } catch {
            // Private window or blocked storage: the note just comes back next time.
          }
        }}
        className="canto-hit grid size-6 shrink-0 place-items-center rounded-full text-faint hover:bg-hover hover:text-fg"
      >
        <CrossIcon />
      </button>
    </p>
  );
}
