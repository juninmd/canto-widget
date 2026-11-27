import { Button } from "@juninmd/sonido";
import { t } from "../../i18n";
import { ClockIcon } from "../../components/Icons";
import EmptyState from "../../components/EmptyState";

type Props = { notConnected: boolean; isToday: boolean; onOpenSettings?: () => void };

/** Tells "no Google account yet" (with the way to fix it) apart from "nothing scheduled". */
export default function AgendaEmpty({ notConnected, isToday, onOpenSettings }: Props) {
  return (
    <ul>
      <EmptyState
        icon={<ClockIcon />}
        title={notConnected ? t("agenda.notConnected") : t(isToday ? "agenda.empty" : "agenda.emptyDay")}
        action={
          notConnected && onOpenSettings ? (
            <Button size="sm" onClick={onOpenSettings}>
              {t("agenda.openSettings")}
            </Button>
          ) : undefined
        }
      />
    </ul>
  );
}
