import { useState } from "react";
import { t } from "../i18n";
import { CrossIcon } from "./Icons";

const KEY = "canto.clipNoteDismissed";

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** The privacy reminder about the history, shown until the person dismisses it once. */
export default function ClipNote() {
  const [hidden, setHidden] = useState(wasDismissed);
  if (hidden) return null;
  return (
    <p className="flex items-start gap-1 text-[11px] text-faint">
      <span className="min-w-0 flex-1">
        {t("clipboard.historyNote")} <span className="text-muted">{t("clipboard.historyNoteEmphasis")}</span>.
      </span>
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
        className="canto-hit grid size-5 shrink-0 place-items-center rounded hover:bg-hover hover:text-fg"
      >
        <CrossIcon />
      </button>
    </p>
  );
}
