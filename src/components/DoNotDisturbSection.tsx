import { DND_CHOICES, dndEndLabel, useDoNotDisturb } from "../lib/doNotDisturb";
import { t } from "../i18n";

export default function DoNotDisturbSection({ onError }: { onError: (m: string) => void }) {
  const { state, start, stop } = useDoNotDisturb(onError);

  return (
    <section className="flex flex-col gap-2">
      <h3 id="dnd-title" className="text-xs font-semibold text-fg">
        {t("settings.dnd.title")}
      </h3>
      <p className="text-xs text-muted">{t("settings.dnd.hint")}</p>
      {state.active ? (
        <div className="flex min-h-7 items-center gap-2 text-xs">
          <span className="text-accent" role="status">
            {state.untilMs === null
              ? t("settings.dnd.activeForever")
              : t("settings.dnd.activeUntil", { time: dndEndLabel(state.untilMs) })}
          </span>
          <button
            type="button"
            onClick={() => void stop()}
            className="min-h-7 rounded-lg border border-edge px-2.5 text-muted hover:text-fg"
          >
            {t("settings.dnd.turnOff")}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="dnd-title">
          {DND_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => void start(choice)}
              className="min-h-7 rounded-lg border border-edge px-2.5 text-xs text-muted hover:text-fg"
            >
              {t(`settings.dnd.${choice}`)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
