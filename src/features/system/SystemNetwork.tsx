import { bytes, rate } from "./system";
import type { SystemSnapshot } from "./systemTypes";
import { t } from "../../i18n";
import { Card, Foot, Row, lastMinute } from "./SystemBits";
import SystemSpark from "./SystemSpark";
import { SubIcon } from "./SystemIcons";

/** Download and upload now and over the last minute, plus what went through since the computer was turned on. */
export default function SystemNetwork({ snap }: { snap: SystemSnapshot }) {
  const n = snap.network;
  return (
    <div className="flex flex-col gap-2" data-system-network>
      <Card index={0} icon={<SubIcon sub="network" />} title={t("system.sub.network")} aside={<span className="text-[10.5px] text-muted">{lastMinute()}</span>}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[11px] text-accent-text">↓ {t("system.net.down")}</p>
            <p className="text-[20px] font-semibold tabular-nums text-fg">{rate(n.down_bps)}</p>
          </div>
          <div>
            <p className="text-[11px] text-cat-meet">↑ {t("system.net.up")}</p>
            <p className="text-[20px] font-semibold tabular-nums text-fg">{rate(n.up_bps)}</p>
          </div>
        </div>
        <SystemSpark values={snap.history.net_down} under={snap.history.net_up} height={48} label={t("system.sub.network")} />
        <Foot left={snap.interface || t("system.net.none")} />
      </Card>
      <Card index={1} icon={<SubIcon sub="network" />} title={t("system.net.interface")}>
        <dl>
          <Row label={t("system.net.interface")} value={snap.interface || "–"} />
          <Row label={t("system.net.down")} value={t("system.net.received", { n: bytes(n.down_total) })} />
          <Row label={t("system.net.up")} value={t("system.net.sent", { n: bytes(n.up_total) })} />
        </dl>
      </Card>
    </div>
  );
}
