import { useState } from "react";
import { api, errText, type TrafficStatus } from "../lib/api";
import { t } from "../i18n";

const SIGNUP = "https://developer.tomtom.com/user/register";

/** Without a key the map has no traffic; the key is checked against TomTom before it is sealed. */
export default function MapKey({ onSaved }: { onSaved: (s: TrafficStatus) => void }) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    try {
      onSaved(await api.trafficSetKey(key));
      setKey("");
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section data-map-key aria-labelledby="map-key-title" className="wx-rise flex shrink-0 flex-col gap-2 rounded-2xl border border-dashed border-accent/50 p-3">
      <h3 id="map-key-title" className="text-sm font-semibold text-fg">
        {t("map.key.title")}
      </h3>
      <p className="text-xs leading-snug text-muted">{t("map.key.hint")}</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (key.trim()) void save();
        }}
      >
        <input
          aria-label={t("map.key.label")}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="canto-field min-w-0 flex-1 px-2.5 py-2 font-mono text-xs"
        />
        <button type="submit" disabled={saving || !key.trim()} className="canto-hit min-h-[34px] shrink-0 rounded-xl bg-accent px-3 text-xs font-semibold text-on-accent disabled:opacity-60">
          {saving ? t("map.key.saving") : t("map.key.save")}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <button type="button" onClick={() => void api.openLink(SIGNUP)} className="canto-hit min-h-[24px] self-start text-[11px] text-accent-text underline-offset-2 hover:underline">
        {t("map.key.howto")}
      </button>
    </section>
  );
}
