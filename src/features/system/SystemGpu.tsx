import { bytes, fixed, level, percent } from "./system";
import type { SystemSnapshot } from "./systemTypes";
import { t } from "../../i18n";
import { Big, Card, Foot, Meter } from "./SystemBits";
import { SubIcon } from "./SystemIcons";

/** Each graphics card: how busy it is and how much of its video memory is taken. */
export default function SystemGpu({ snap }: { snap: SystemSnapshot }) {
  return (
    <div className="flex flex-col gap-2" data-system-gpu>
      {snap.gpus.map((g, i) => {
        const mem = g.mem_used !== null && g.mem_total ? percent(g.mem_used, g.mem_total) : null;
        return (
          <Card
            key={`${g.name}-${i}`}
            index={i}
            icon={<SubIcon sub="gpu" />}
            level={g.usage !== null ? level(g.usage, 85, 97) : "ok"}
            title={g.name}
            aside={
              g.usage !== null ? (
                <Big value={fixed(g.usage)} unit="%" level={level(g.usage, 85, 97)} />
              ) : (
                <span className="text-[11px] text-muted">{t("system.gpu.noUsage")}</span>
              )
            }
          >
            {g.usage !== null && <Meter value={g.usage} level={level(g.usage, 85, 97)} label={g.name} />}
            {mem !== null && (
              <>
                <Foot left={t("system.gpu.memory")} right={`${bytes(g.mem_used ?? 0)} / ${bytes(g.mem_total ?? 0)}`} />
                <Meter value={mem} level={level(mem, 90, 97)} label={t("system.gpu.memory")} />
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
