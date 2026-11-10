import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * The actions of a Status sub-tab. Under `StatusTab` they are portaled into the row that holds the sub-tabs
 * (`host` is that element, or null for the one render before it exists); alone, they get a row of their own.
 */
export default function StatusToolbar({ host, children }: { host?: HTMLElement | null; children: ReactNode }) {
  if (host === undefined) return <div className="flex items-center justify-end gap-2 text-[11px] text-faint">{children}</div>;
  return host ? createPortal(children, host) : null;
}
