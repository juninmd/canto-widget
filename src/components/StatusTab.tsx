import { useState } from "react";
import { t } from "../i18n";
import HealthTab from "./HealthTab";
import StatusServices from "./StatusServices";
import SubTabs from "./SubTabs";

type Sub = "services" | "mine";

/** Two views of "is it up": other people's services (public status pages) and the user's own endpoints. */
export default function StatusTab() {
  const [sub, setSub] = useState<Sub>("services");
  return (
    <div className="flex h-full flex-col gap-2">
      <SubTabs
        label={t("health.sub.label")}
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "services", label: t("health.sub.services") },
          { key: "mine", label: t("health.sub.mine") },
        ]}
      />
      <div className="min-h-0 flex-1">{sub === "services" ? <StatusServices /> : <HealthTab />}</div>
    </div>
  );
}
