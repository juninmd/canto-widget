import { useEffect, useState } from "react";
import { api, type MyPrAlerts } from "../lib/api";
import { useGithubConnected } from "../lib/useGithubConnected";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

const HOURS = [24, 48, 72];

/** Switches for the pop-ups Rust rings about the user's own PRs: failing CI and PRs nobody reviewed. */
export default function MyPrAlertsSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<MyPrAlerts | null>(null);
  const connected = useGithubConnected();
  const { error, fail, clear } = useSectionError(onError);

  const load = () => api.myPrAlertsGet().then(setCfg, fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function change(patch: Partial<MyPrAlerts>) {
    if (!cfg) return;
    clear();
    try {
      setCfg(await api.myPrAlertsSet({ ...cfg, ...patch }));
    } catch (e) {
      fail(e);
      await load();
    }
  }

  const box = "canto-box";
  const own = [
    ["reviews", "settings.myPrAlerts.reviews"],
    ["merge_state", "settings.myPrAlerts.mergeState"],
    ["comments", "settings.myPrAlerts.comments"],
    ["assigned", "settings.myPrAlerts.assigned"],
    ["replies", "settings.myPrAlerts.replies"],
  ] as const;
  return (
    <SettingsSection title={t("settings.myPrAlerts.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg?.ci ?? false} disabled={!cfg} onChange={(e) => void change({ ci: e.target.checked })} className={box} />
        {t("settings.myPrAlerts.ci")}
      </label>
      <label className="flex min-h-[24px] flex-wrap items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.stalled ?? false}
          disabled={!cfg}
          onChange={(e) => void change({ stalled: e.target.checked })}
          className={box}
        />
        {t("settings.myPrAlerts.stalled")}
        <select
          aria-label={t("settings.myPrAlerts.stalled")}
          value={cfg?.stalled_hours ?? 48}
          disabled={!cfg?.stalled}
          onChange={(e) => void change({ stalled_hours: Number(e.target.value) })}
          className="rounded border border-edge bg-ink px-1.5 py-0.5 text-xs text-fg"
        >
          {(cfg && !HOURS.includes(cfg.stalled_hours) ? [...HOURS, cfg.stalled_hours] : HOURS).map((h) => (
            <option key={h} value={h}>
              {t("settings.myPrAlerts.hours", { h })}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[11px] text-faint">{t("settings.myPrAlerts.hint")}</p>
      {own.map(([key, label]) => (
        <label key={key} className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={cfg?.[key] ?? false} disabled={!cfg} onChange={(e) => void change({ [key]: e.target.checked })} className={box} />
          {t(label)}
        </label>
      ))}
      <p className="text-[11px] text-faint">{t("settings.myPrAlerts.ownHint")}</p>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.mentions ?? false}
          disabled={!cfg}
          onChange={(e) => void change({ mentions: e.target.checked })}
          className={box}
        />
        {t("settings.myPrAlerts.mentions")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.myPrAlerts.mentionsHint")}</p>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.team_mentions ?? false}
          disabled={!cfg}
          onChange={(e) => void change({ team_mentions: e.target.checked })}
          className={box}
        />
        {t("settings.myPrAlerts.teamMentions")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.myPrAlerts.teamMentionsHint")}</p>
      {connected === false && (
        <p role="status" className="text-[11px] text-accent-text">
          {t("settings.githubHint")}
        </p>
      )}
    </SettingsSection>
  );
}
