import { useState } from "react";
import { t } from "../i18n";
import HealthTab from "./HealthTab";
import StatusServices from "./StatusServices";
import SubTabs from "./SubTabs";

type Sub = "services" | "mine";

/** Two views of "is it up": other people's services (public status pages) and the user's own endpoints. */
export default function StatusTab() {
  const [sub, setSub] = useState<Sub>("services");
  const [toolbar, setToolbar] = useState<HTMLElement | null>(null);
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <SubTabs
          label={t("health.sub.label")}
          value={sub}
          onChange={setSub}
          tabs={[
            { key: "services", label: t("health.sub.services") },
            { key: "mine", label: t("health.sub.mine") },
          ]}
        />
        <div ref={setToolbar} className="ml-auto flex items-center gap-2 text-[11px] text-faint" />
      </div>
      <div className="min-h-0 flex-1">{sub === "services" ? <StatusServices toolbar={toolbar} /> : <HealthTab toolbar={toolbar} />}</div>
    </div>
  );
}
