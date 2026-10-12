import { DND_CHOICES, useDoNotDisturb } from "../lib/doNotDisturb";
import { useSectionError } from "../lib/useSectionError";
import { t, LOCALE } from "../i18n";
import { SettingsSection } from "./SettingsSection";

export default function DoNotDisturbSection({ onError }: { onError: (m: string) => void }) {
  const { error, fail, clear } = useSectionError(onError);
  const { state, start, stop } = useDoNotDisturb(fail);

  return (
    <SettingsSection id="dnd-title" title={t("settings.dnd.title")} error={error}>
      <p className="text-xs text-muted">{t("settings.dnd.hint")}</p>
      {state.active ? (
        <div className="flex min-h-7 items-center gap-2 text-xs">
          <span className="text-accent-text" role="status">
            {state.untilMs === null
              ? t("settings.dnd.activeForever")
              : t("settings.dnd.activeUntil", {
                  time: new Date(state.untilMs).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }),
                })}
          </span>
          <button
            type="button"
            onClick={() => {
              clear();
              void stop();
            }}
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
              onClick={() => {
                clear();
                void start(choice);
              }}
              className="min-h-7 rounded-lg border border-edge px-2.5 text-xs text-muted hover:text-fg"
            >
              {t(`settings.dnd.${choice}`)}
            </button>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
