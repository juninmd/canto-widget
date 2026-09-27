import { dndEndLabel, useDoNotDisturb } from "../lib/doNotDisturb";
import { MoonIcon } from "./Icons";
import { t } from "../i18n";

/** Visible whenever alerts are being silenced, so a missed meeting is never a mystery; one click ends it. */
export default function DndIndicator({ onError }: { onError: (m: string) => void }) {
  const { state, stop } = useDoNotDisturb(onError);
  if (!state.active) return null;
  const end = state.untilMs === null ? null : dndEndLabel(state.untilMs);
  return (
    <button
      type="button"
      onClick={() => void stop()}
      aria-label={t("app.dnd.turnOff")}
      title={end === null ? t("app.dnd.titleForever") : t("app.dnd.title", { time: end })}
      className="flex min-h-6 items-center gap-1 rounded px-1.5 text-accent hover:text-fg"
    >
      <MoonIcon />
      {end !== null && <span>{t("app.dnd.until", { time: end })}</span>}
    </button>
  );
}
