import { useEffect, useRef, useState, type ReactNode } from "react";
import { t } from "../i18n";

type Props = {
  ask: string;
  yes: string;
  onConfirm: () => void;
  disabled?: boolean;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
};

const BTN = "canto-hit min-h-[24px] rounded-md px-2 text-xs";

/** A button whose action is hard to undo: the first click only asks, inline; cancel or Esc brings focus back. */
export default function ConfirmButton({ ask, yes, onConfirm, disabled, className, ariaLabel, children }: Props) {
  const [asking, setAsking] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const was = useRef(false);

  // Another action started meanwhile: the question no longer holds, so it closes instead of firing alongside it.
  useEffect(() => {
    if (!disabled) return;
    was.current = false;
    setAsking(false);
  }, [disabled]);

  useEffect(() => {
    if (was.current && !asking) trigger.current?.focus();
    was.current = asking;
  }, [asking]);

  if (!asking || disabled) {
    return (
      <button ref={trigger} type="button" disabled={disabled} aria-label={ariaLabel} onClick={() => setAsking(true)} className={className}>
        {children}
      </button>
    );
  }
  return (
    <div
      role="group"
      aria-label={ask}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setAsking(false);
        }
      }}
      className="flex basis-full flex-wrap items-center gap-2 rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs"
    >
      <span className="min-w-0 flex-1 font-medium text-fg">{ask}</span>
      <button type="button" autoFocus onClick={() => setAsking(false)} className={`${BTN} bg-edge text-fg hover:bg-active`}>
        {t("common.cancel")}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          was.current = false;
          setAsking(false);
          onConfirm();
        }}
        className={`${BTN} border border-danger/60 font-semibold text-danger hover:bg-danger/10`}
      >
        {yes}
      </button>
    </div>
  );
}
