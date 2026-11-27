import type { ReactNode } from "react";
import { Button } from "@juninmd/sonido";
import { t } from "../i18n";
import EmptyState from "./EmptyState";

type Props = { icon: ReactNode; message: string; onRetry: () => void; busy?: boolean };

/** A load that came back with nothing says so and offers another try, instead of a skeleton that never ends. */
export default function EmptyRetry({ icon, message, onRetry, busy = false }: Props) {
  return (
    <ul>
      <EmptyState
        icon={icon}
        title={message}
        action={
          <Button size="sm" onClick={onRetry} loading={busy}>
            {t("common.retry")}
          </Button>
        }
      />
    </ul>
  );
}
