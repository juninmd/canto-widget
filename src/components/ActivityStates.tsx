import { t } from "../i18n";
import { CheckIcon, CrossIcon, LockIcon, PulseIcon } from "./Icons";
import { COLUMN, LAYOUT } from "./activityLayout";

const ORB = "grid h-14 w-14 place-items-center rounded-2xl border border-edge bg-panel text-accent-text";

/** Shown while the first answer from Rust is on its way, shaped like the cards it stands for. */
export function ActivityLoading() {
  return (
    <div role="status" aria-busy="true" aria-label={t("activity.loading")} className={LAYOUT}>
      {[176, 110, 66, 200, 220].map((h, i) => (
        <div key={i} aria-hidden="true" className="rounded-2xl bg-panel motion-safe:animate-pulse" style={{ height: h }} />
      ))}
    </div>
  );
}

export function ActivityUnsupported() {
  return (
    <div className="grid min-h-[22rem] place-content-center justify-items-center gap-3.5 p-6 text-center">
      <span className={ORB}><PulseIcon size={26} /></span>
      <h2 className="text-[17px] font-semibold text-fg">{t("activity.unsupportedTitle")}</h2>
      <p className="max-w-[34ch] text-[12.5px] text-muted">{t("activity.unsupported")}</p>
    </div>
  );
}

/** Turning tracking on is the user's call, so this says what is kept and what never is. */
export function ActivityOff({ onEnable }: { onEnable: () => void }) {
  const rows = [
    { yes: true, label: "activity.keep1", body: "activity.keep1Body" },
    { yes: true, label: "activity.keep2", body: "activity.keep2Body" },
    { yes: false, label: "activity.keep3", body: "activity.keep3Body" },
    { yes: false, label: "activity.keep4", body: "activity.keep4Body" },
  ] as const;
  return (
    <div className="grid min-h-[22rem] place-content-center justify-items-center gap-3.5 p-6 text-center">
      <span className={ORB}><PulseIcon size={26} /></span>
      <h2 className="text-[17px] font-semibold text-fg">{t("activity.off")}</h2>
      <p className="max-w-[34ch] text-[12.5px] text-muted">{t("activity.offBody")}</p>
      <ul className="grid w-full max-w-[19.5rem] gap-2 rounded-xl border border-edge bg-panel p-3.5 text-left text-xs">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-2 text-muted">
            <span className={`mt-px ${r.yes ? "text-ok" : "text-danger"}`}>{r.yes ? <CheckIcon /> : <CrossIcon />}</span>
            <span>
              <b className="font-semibold text-fg">{t(r.label)}</b> {t(r.body)}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onEnable} className="canto-hit min-h-[36px] rounded-xl bg-accent px-5 text-[13px] font-bold text-on-accent hover:brightness-110 active:brightness-95">
        {t("activity.enable")}
      </button>
    </div>
  );
}

/** A day with nothing in it: the empty donut and a faint outline of what will fill the page. */
export function ActivityEmpty() {
  return (
    <div className={LAYOUT}>
      <div className={COLUMN}>
        <section className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-2xl border border-edge bg-panel p-3.5">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 128 128" aria-hidden="true" className="h-full w-full -rotate-90">
              <circle cx="64" cy="64" r="52" fill="none" strokeWidth="14" className="stroke-edge" />
            </svg>
            <div className="absolute inset-0 grid place-content-center text-center">
              <b className="font-mono text-[1.45rem] font-bold leading-none text-fg">0</b>
              <span className="mt-1 text-[10.5px] text-faint">{t("activity.activeWord")}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">{t("activity.emptyTitle")}</p>
            <p className="mt-1.5 text-xs text-muted">{t("activity.empty")}</p>
          </div>
        </section>
      </div>
      <div className={COLUMN} aria-hidden="true">
        {(["activity.timeline", "activity.listLabel"] as const).map((k) => (
          <div key={k} className="grid gap-2.5 rounded-2xl border-[1.5px] border-dashed border-edge p-3.5 text-xs text-faint">
            <span>{t(k)}</span>
            <span className="h-[22px] rounded-lg bg-edge/60" />
            <span className="h-3 w-[70%] rounded-md bg-edge/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const ActivityFooter = () => (
  <p className="flex items-center justify-center gap-1.5 px-2 pb-3 pt-3 text-center text-[11px] text-faint">
    <LockIcon />
    <span>{t("activity.footer")}</span>
  </p>
);
