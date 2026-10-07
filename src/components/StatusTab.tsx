import { useState } from "react";
import { t } from "../i18n";
import HealthTab from "./HealthTab";
import StatusServices from "./StatusServices";

type Sub = "services" | "mine";

/** Two views of "is it up": other people's services (public status pages) and the user's own endpoints. */
export default function StatusTab() {
  const [sub, setSub] = useState<Sub>("services");
  return (
    <div className="flex h-full flex-col gap-2">
      <div role="tablist" aria-label={t("health.sub.label")} className="flex gap-0.5 self-start rounded-xl border border-edge bg-ink/60 p-0.5 text-xs">
        {(["services", "mine"] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={sub === s}
            onClick={() => setSub(s)}
            className={`canto-hit min-h-7 rounded-lg px-3 transition-colors ${sub === s ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"}`}
          >
            {t(s === "services" ? "health.sub.services" : "health.sub.mine")}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">{sub === "services" ? <StatusServices /> : <HealthTab />}</div>
    </div>
  );
}
