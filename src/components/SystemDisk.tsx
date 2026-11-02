import { bytes, fixed, level, percent, rate, systemDisk } from "../lib/system";
import type { SystemSnapshot } from "../lib/systemTypes";
import { t } from "../i18n";
import { Big, Card, Foot, Meter, lastMinute } from "./SystemBits";
import SystemSpark from "./SystemSpark";

/** The system volume, read and write over the last minute, and every other volume with its free space. */
export default function SystemDisk({ snap }: { snap: SystemSnapshot }) {
  const main = systemDisk(snap.disks);
  const others = snap.disks.filter((d) => d !== main);
  const used = main ? percent(main.total - main.available, main.total) : 0;
  const io = snap.disk_io;
  return (
    <div className="flex flex-col gap-2" data-system-disk>
      {main && (
        <Card
          index={0}
          title={
            <>
              {t("system.sub.disk")} <span className="font-normal text-muted">{main.system ? t("system.disk.system") : main.mount}</span>
            </>
          }
          aside={<Big value={fixed(used)} unit="%" level={level(used, 90, 95)} />}
        >
          <Meter value={used} level={level(used, 90, 95)} label={t("system.sub.disk")} />
          <Foot left={t("system.disk.free", { free: bytes(main.available), total: bytes(main.total) })} right={[main.mount, main.fs].filter(Boolean).join(" · ")} />
        </Card>
      )}
      <Card index={1} title={t("system.disk.activity")} aside={<span className="text-[10.5px] text-muted">{`${t("system.disk.allDisks")} · ${lastMinute()}`}</span>}>
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-cat-meet">{t("system.disk.read")}</p>
            <p className="text-[17px] font-semibold tabular-nums text-fg">{rate(io.down_bps)}</p>
            <p className="truncate text-[10px] text-muted">{t("system.disk.readTotal", { n: bytes(io.down_total) })}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-danger">{t("system.disk.write")}</p>
            <p className="text-[17px] font-semibold tabular-nums text-fg">{rate(io.up_bps)}</p>
            <p className="truncate text-[10px] text-muted">{t("system.disk.writeTotal", { n: bytes(io.up_total) })}</p>
          </div>
        </div>
        <SystemSpark values={snap.history.disk_write} under={snap.history.disk_read} tone="var(--color-danger)" height={32} />
      </Card>
      {others.length > 0 && (
        <Card index={2} title={t("system.disk.volumes")}>
          <ul className="flex flex-col gap-2.5">
            {others.map((d) => {
              const share = percent(d.total - d.available, d.total);
              const tags = [d.fs, d.ssd === true ? "SSD" : d.ssd === false ? t("system.disk.hdd") : "", d.removable ? t("system.disk.removable") : ""].filter(Boolean);
              return (
                <li key={`${d.mount}|${d.name}`} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
                    <span className="min-w-0 truncate text-fg">
                      {d.mount}
                      {tags.length > 0 && <span className="ml-1.5 text-[10px] text-faint">{tags.join(" · ")}</span>}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">{fixed(share)}%</span>
                  </div>
                  <Meter value={share} level={level(share, 90, 95)} label={d.mount} />
                  <span className="text-[10px] text-muted">{t("system.disk.free", { free: bytes(d.available), total: bytes(d.total) })}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
