import { api, type ModelRow } from "../lib/api";
import { formatContext, formatPrice, formatReleased, formatScore, formatSeconds, formatSpeed, modelUrl, placeBy } from "../lib/models";
import { t } from "../i18n";

const usd = (v: number | null) => (v === null ? "—" : t("models.usd", { price: formatPrice(v) }));
const yesNo = (v: boolean | null) => (v === null ? "—" : v ? t("models.yes") : t("models.no"));

function Fact({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9.5px] tracking-wide text-faint uppercase">{label}</dt>
      <dd className="truncate text-xs font-semibold text-fg tabular-nums">
        {value}
        {unit && value !== "—" && <span className="ml-0.5 text-[10px] font-normal text-faint">{unit}</span>}
      </dd>
    </div>
  );
}

/** The sheet under an opened model: every field the leaderboard page carried, "—" for the rest. */
export default function ModelDetails({ row, rows, picked, onPick }: { row: ModelRow; rows: readonly ModelRow[]; picked: boolean; onPick: () => void }) {
  const weights = row.open_weights === null ? "—" : row.open_weights ? t("models.weightsOpen") : t("models.weightsClosed");
  const indexes = [
    { label: t("models.sheet.intelligence"), v: row.score, place: placeBy(rows, row.id, "score") },
    { label: t("models.sheet.coding"), v: row.coding, place: placeBy(rows, row.id, "coding") },
    { label: t("models.sheet.math"), v: row.math, place: placeBy(rows, row.id, "math") },
  ].filter((i) => i.v !== null);
  return (
    <div className="canto-unfold mx-2.5 flex flex-col gap-2.5 border-t border-dashed border-edge pt-2.5 pb-2.5">
      <dl className="grid grid-cols-3 gap-x-2.5 gap-y-2">
        <Fact label={t("models.sheet.released")} value={row.released ? formatReleased(row.released) : "—"} />
        <Fact label={t("models.sheet.context")} value={row.context === null ? "—" : formatContext(row.context)} unit={t("models.tokens")} />
        <Fact label={t("models.sheet.weights")} value={weights} />
        <Fact label={t("models.sheet.input")} value={usd(row.input_price)} unit={t("models.perM")} />
        <Fact label={t("models.sheet.output")} value={usd(row.output_price)} unit={t("models.perM")} />
        <Fact label={t("models.sheet.blended")} value={usd(row.price)} unit={t("models.perM")} />
        <Fact label={t("models.sheet.speed")} value={row.speed === null ? "—" : formatSpeed(row.speed)} unit="tok/s" />
        <Fact label={t("models.sheet.ttft")} value={row.ttft === null ? "—" : t("models.seconds", { n: formatSeconds(row.ttft) })} />
        <Fact label={t("models.sheet.reasoning")} value={yesNo(row.reasoning)} />
      </dl>
      <div className="flex flex-col gap-1.5">
        {indexes.map((i) => (
          <div key={i.label} className="grid grid-cols-[5rem_1fr_3.25rem] items-center gap-2 text-[10.5px] text-muted">
            <span>{i.label}</span>
            <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-edge">
              <div className="canto-grow-x h-full rounded-full bg-accent" style={{ width: `${Math.min(100, i.v!)}%` }} />
            </div>
            <span className="text-right font-semibold text-fg tabular-nums">
              {formatScore(i.v!)} {i.place !== null && <span className="text-[9.5px] font-normal text-faint">{t("models.place", { n: i.place })}</span>}
            </span>
          </div>
        ))}
      </div>
      {row.inputs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted">
          <span className="mr-0.5 text-faint">{t("models.sheet.inputs")}</span>
          {row.inputs.map((m) => (
            <span key={m} className="rounded-md border border-edge bg-ink px-1.5 py-px">
              {t(`models.mod.${m}` as "models.mod.text")}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5 text-[11px]">
        <button
          type="button"
          onClick={onPick}
          className={`canto-hit min-h-7 flex-1 rounded-lg border ${picked ? "border-edge text-muted hover:bg-hover hover:text-fg" : "border-accent bg-accent font-semibold text-on-accent"}`}
        >
          {picked ? t("models.compareRemoveLong") : t("models.compareAddLong")}
        </button>
        <button
          type="button"
          onClick={() => void api.openLink(modelUrl(row.id)).catch(() => {})}
          title={t("models.openTitle", { name: row.name })}
          className="canto-hit min-h-7 flex-1 rounded-lg border border-edge text-muted hover:bg-hover hover:text-fg"
        >
          {t("models.openSite")} ↗
        </button>
      </div>
    </div>
  );
}
