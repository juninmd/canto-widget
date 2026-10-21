import { useState } from "react";
import { api, errText } from "../lib/api";
import { t } from "../i18n";

type Props = { kind: "connect" | "reconnect"; onConnected: () => void };

/** The Google tabs' empty state: one button runs the same login the Agenda uses, with every scope at once. */
export default function GoogleGate({ kind, onConnected }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const connect = async () => {
    setBusy(true);
    setError("");
    try {
      await api.driveConnect();
      onConnected();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="wx-glass wx-rise flex flex-col gap-2 bg-gradient-to-b from-accent/10 to-transparent p-4 text-xs">
      <h3 className="text-sm font-semibold text-fg">{t(kind === "connect" ? "google.connect.title" : "google.reconnect.title")}</h3>
      <p className="text-muted">{t(kind === "connect" ? "google.connect.hint" : "google.reconnect.hint")}</p>
      <button
        type="button"
        onClick={() => void connect()}
        disabled={busy}
        className="canto-hit mt-1 min-h-8 rounded-lg bg-accent px-3 font-semibold text-on-accent disabled:opacity-70"
      >
        {busy ? t("google.connect.busy") : t(kind === "connect" ? "google.connect.button" : "google.reconnect.button")}
      </button>
      {error && <p role="alert" className="text-danger">{error}</p>}
    </section>
  );
}
