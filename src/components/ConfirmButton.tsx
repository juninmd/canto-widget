import type { ReactNode } from "react";
import { ConfirmButton as SonidoConfirmButton } from "@juninmd/sonido";
import { t } from "../i18n";

type Props = {
  ask: string;
  yes: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

/**
 * A button whose action is hard to undo: the first click only asks, inline; cancel or Esc brings focus back.
 * `appearance="inline"` is the original canto-widget look: the trigger keeps the app's className and the
 * question is a compact row with text actions (Sonido closes it when `disabled` flips).
 */
export default function ConfirmButton({ ask, yes, onConfirm, disabled, className, ariaLabel, children }: Props) {
  return (
    <SonidoConfirmButton
      appearance="inline"
      ask={ask}
      confirmLabel={yes}
      cancelLabel={t("common.cancel")}
      onConfirm={onConfirm}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </SonidoConfirmButton>
  );
}
