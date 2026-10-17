import type { ReactNode } from "react";
import { t } from "../i18n";

/** A prototype tab: a static mockup of the idea, with the badge and the honest note of what it would still need. */
export default function ProtoFrame({ needs, children }: { needs: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-dashed border-edge px-1.5 text-[9px] uppercase tracking-wide text-faint">
          {t("protos.badge")}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">{children}</div>
      <p className="text-[10px] leading-snug text-faint">{t("protos.needs", { text: needs })}</p>
    </div>
  );
}
