import type { AgendaItem } from "../lib/api";
import { t } from "../i18n";
import AlertCard from "./AlertCard";

type Props = {
  event: AgendaItem;
  /** Rust drops the alert as well: closing here must not leave it ringing in the dock. */
  onGone: (id: string) => void;
  onCompleted: () => void;
  onOpenModels: () => void;
  onSettled?: () => void;
};

/** The alert the user came for, on top of the normal window. */
export default function FocusedAlert(props: Props) {
  return (
    <section aria-label={t("app.focus.label")} className="mx-3 mt-2 shrink-0 motion-safe:animate-surgir motion-reduce:animate-fade">
      <AlertCard {...props} />
    </section>
  );
}
