import { useEffect, useState } from "react";
import { backupAge, markExported, readLastExport } from "./backupReminder";
import { api, type BackupCopy } from "../../lib/api";
import { LOCALE } from "../../i18n";
import { useSectionError } from "./useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "./SettingsSection";

export default function BackupSection({ onError }: { onError: (m: string) => void }) {
  const [busy, setBusy] = useState("");
  const [info, setInfo] = useState("");
  const { error, fail, clear } = useSectionError(onError);
  const [lastExport, setLastExport] = useState(readLastExport);
  const age = backupAge(lastExport);
  const [copies, setCopies] = useState<BackupCopy[]>([]);
  const reloadCopies = () =>
    api
      .backupList()
      .then((c) => setCopies(c ?? []))
      .catch(() => setCopies([]));
  useEffect(() => {
    void reloadCopies();
  }, []);

  // `fn` returns "" when the user cancels the dialog: cancelling is neither error nor success.
  async function run(label: string, fn: () => Promise<string>) {
    setBusy(label);
    setInfo("");
    clear();
    try {
      setInfo(await fn());
    } catch (e) {
      fail(e);
    } finally {
      setBusy("");
    }
  }

  const doExport = async () => {
    const where = await api.backupExport();
    if (where) {
      markExported();
      setLastExport(readLastExport());
    }
    return where ? t("settings.backup.saved", { path: where }) : "";
  };

  const doImport = async () => {
    const r = await api.backupImport();
    void reloadCopies();
    return r ? t("settings.backup.merged", { tasks: r.tasks, notes: r.notes }) : "";
  };

  const doRestore = (name: string) => async () => {
    const r = await api.backupRestore(name);
    void reloadCopies();
    return t("settings.backup.restored", { tasks: r.tasks, notes: r.notes });
  };

  const copyLabel = (c: BackupCopy) =>
    c.kind === "daily"
      ? t("settings.backup.copyDaily", { day: c.day })
      : t("settings.backup.copyImport", { when: new Date(c.at ?? 0).toLocaleString(LOCALE) });

  return (
    <SettingsSection title={t("settings.backup.title")} error={error}>
      <p className="text-xs text-muted">
        {t("settings.backup.hint.before")} <code>.canto</code> {t("settings.backup.hint.middle")}{" "}
        <span className="text-fg">{t("settings.backup.hint.emphasis")}</span> {t("settings.backup.hint.after")}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy !== ""}
          onClick={() => run("exp", doExport)}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40"
        >
          {busy === "exp" ? t("settings.backup.exporting") : t("settings.backup.export")}
        </button>
        <button
          type="button"
          disabled={busy !== ""}
          onClick={() => run("imp", doImport)}
          className="flex-1 rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
        >
          {busy === "imp" ? t("settings.backup.importing") : t("settings.backup.import")}
        </button>
      </div>
      <p role={age.kind === "ok" ? undefined : "status"} className={`text-[11px] ${age.kind === "ok" ? "text-faint" : "text-warn"}`}>
        {age.kind === "never" ? t("settings.backup.never") : t(age.kind === "stale" ? "settings.backup.stale" : "settings.backup.last", { days: age.days })}
      </p>
      <p className="text-[11px] text-faint">{t("settings.backup.auto")}</p>
      {copies.length > 0 && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer">{t("settings.backup.copies")}</summary>
          <ul className="mt-1 flex flex-col gap-1">
            {copies.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-[11px] text-faint">
                <span className="flex-1">{copyLabel(c)}</span>
                <button
                  type="button"
                  disabled={busy !== ""}
                  aria-label={`${t("settings.backup.restore")} — ${copyLabel(c)}`}
                  onClick={() => run("res", doRestore(c.name))}
                  className="rounded bg-edge px-2 py-0.5 text-fg disabled:opacity-40"
                >
                  {t("settings.backup.restore")}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-faint">{t("settings.backup.restoreHint")}</p>
        </details>
      )}
      {info && <p className="break-all text-[11px] text-accent-text">{info}</p>}
    </SettingsSection>
  );
}
