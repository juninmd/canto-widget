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
 * The two-step flow, focus handling and Esc are Sonido's; the app keeps only its labels.
 * `key` remounts the button when `disabled` flips, so a pending question closes instead of firing alongside
 * whatever started (the behaviour the old local implementation got from a `useEffect`).
 */
export default function ConfirmButton({ ask, yes, onConfirm, disabled, className, ariaLabel, children }: Props) {
  return (
    <SonidoConfirmButton
      key={disabled ? "disabled" : "ready"}
      ask={ask}
      confirmLabel={yes}
      cancelLabel={t("common.cancel")}
      onConfirm={onConfirm}
      disabled={disabled}
      size="sm"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </SonidoConfirmButton>
  );
}
