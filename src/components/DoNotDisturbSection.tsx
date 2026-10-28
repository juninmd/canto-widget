import { useState } from "react";
import { DND_CHOICES, useDoNotDisturb } from "../lib/doNotDisturb";
import { useSectionError } from "../lib/useSectionError";
import { t, LOCALE } from "../i18n";
import { SettingsSection } from "./SettingsSection";

export default function DoNotDisturbSection({ onError }: { onError: (m: string) => void }) {
  const { error, fail, clear } = useSectionError(onError);
  const { state, start, stop } = useDoNotDisturb(fail);
  const [busy, setBusy] = useState(false);

  // One request at a time: a double click would otherwise send two `dnd_set` and flash the state.
  async function send(call: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    clear();
    try {
      await call();
    } finally {
      setBusy(false);
    }
  }

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
            disabled={busy}
            onClick={() => void send(stop)}
            className="min-h-7 rounded-lg border border-edge px-2.5 text-muted hover:text-fg disabled:opacity-40"
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
              disabled={busy}
              onClick={() => void send(() => start(choice))}
              className="min-h-7 rounded-lg border border-edge px-2.5 text-xs text-muted hover:text-fg disabled:opacity-40"
            >
              {t(`settings.dnd.${choice}`)}
            </button>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}
