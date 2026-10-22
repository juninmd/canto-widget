import { useRef, type ReactNode } from "react";
import type { ChecksStatus } from "../lib/api";
import { t, type MessageKey } from "../i18n";

export type PillTone = "ok" | "bad" | "warn" | "info" | "neutral";

const TONE: Record<PillTone, string> = {
  ok: "bg-ok/15 text-ok",
  bad: "bg-danger/15 text-danger",
  warn: "bg-warn/15 text-warn",
  info: "bg-cat-meet/15 text-cat-meet",
  neutral: "bg-edge text-muted",
};

/** A small rounded label: the word carries the meaning, the tone only reinforces it. */
export function Pill({ tone, title, children }: { tone: PillTone; title?: string; children: ReactNode }) {
  return (
    <span title={title} className={`shrink-0 whitespace-nowrap rounded-full px-1.5 text-[10.5px] font-medium leading-[18px] ${TONE[tone]}`}>
      {children}
    </span>
  );
}

const CI: Record<ChecksStatus, { label: MessageKey; tone: PillTone }> = {
  success: { label: "forge.checks.success", tone: "ok" },
  failure: { label: "forge.checks.failure", tone: "bad" },
  running: { label: "forge.checks.running", tone: "info" },
  none: { label: "forge.checks.none", tone: "neutral" },
};

/** The glyph in the wording keeps the state readable without color. */
export function CiPill({ status }: { status: ChecksStatus }) {
  const { label, tone } = CI[status];
  const text = t(label);
  // Only a result that arrives while the row is on screen gets the one-shot pulse or shake.
  const first = useRef(status);
  const settled = first.current !== status && (status === "success" || status === "failure");
  return (
    <span
      role="img"
      aria-label={text}
      title={text}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-1.5 text-[10.5px] font-medium leading-[18px] ${TONE[tone]}`}
    >
      {status === "running" && <i aria-hidden="true" data-ci-spin className="canto-ci-spin size-2 rounded-full border-[1.5px] border-current border-t-transparent" />}
      {settled && <i key={status} aria-hidden="true" data-ci-settled={status} className={`size-1.5 rounded-full bg-current ${status === "success" ? "canto-ci-pass" : "canto-ci-fail"}`} />}
      {text}
    </span>
  );
}
