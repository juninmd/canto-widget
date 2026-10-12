import { t } from "../i18n";
import { ClockIcon } from "./Icons";
import EmptyState from "./EmptyState";

type Props = { notConnected: boolean; isToday: boolean; onOpenSettings?: () => void };

/** Tells "no Google account yet" (with the way to fix it) apart from "nothing scheduled". */
export default function AgendaEmpty({ notConnected, isToday, onOpenSettings }: Props) {
  return (
    <ul>
      <EmptyState icon={<ClockIcon />}>
        {notConnected ? (
          <>
            <span className="block">{t("agenda.notConnected")}</span>
            {onOpenSettings && (
              <button type="button" onClick={onOpenSettings} className="canto-hit mt-2 min-h-7 rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent">
                {t("agenda.openSettings")}
              </button>
            )}
          </>
        ) : (
          t(isToday ? "agenda.empty" : "agenda.emptyDay")
        )}
      </EmptyState>
    </ul>
  );
}
