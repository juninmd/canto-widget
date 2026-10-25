import type { ReactNode } from "react";
import { t } from "../i18n";
import EmptyState from "./EmptyState";

type Props = { icon: ReactNode; message: string; onRetry: () => void; busy?: boolean };

/** A load that came back with nothing says so and offers another try, instead of a skeleton that never ends. */
export default function EmptyRetry({ icon, message, onRetry, busy = false }: Props) {
  return (
    <ul>
      <EmptyState icon={icon}>
        <span className="block">{message}</span>
        <button
          type="button"
          onClick={onRetry}
          disabled={busy}
          className="canto-hit mt-2 min-h-7 rounded-lg bg-accent px-3 text-xs font-semibold text-on-accent disabled:opacity-60"
        >
          {t("common.retry")}
        </button>
      </EmptyState>
    </ul>
  );
}
