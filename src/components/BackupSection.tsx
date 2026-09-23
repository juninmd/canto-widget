import { useState } from "react";
import { api, errText } from "../lib/api";
import { t } from "../i18n";

export default function BackupSection({ onError }: { onError: (m: string) => void }) {
  const [busy, setBusy] = useState("");
  const [info, setInfo] = useState("");

  // `fn` returns "" when the user cancels the dialog: cancelling is neither error nor success.
  async function run(label: string, fn: () => Promise<string>) {
    setBusy(label);
    setInfo("");
    try {
      setInfo(await fn());
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy("");
    }
  }

  const doExport = async () => {
    const where = await api.backupExport();
    return where ? t("settings.backup.saved", { path: where }) : "";
  };

  const doImport = async () => {
    const r = await api.backupImport();
    return r ? t("settings.backup.merged", { tasks: r.tasks, notes: r.notes }) : "";
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-fg">{t("settings.backup.title")}</h2>
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
      <p className="text-[11px] text-faint">{t("settings.backup.auto")}</p>
      {info && <p className="break-all text-[11px] text-accent">{info}</p>}
    </section>
  );
}
