import { useState } from "react";
import { applyDensity, loadDensity, DENSITIES, type DensityId } from "../lib/density";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

/** Lives next to the skin picker: both are "how the widget looks", not vault state. */
export default function DensityPicker() {
  const [density, setDensity] = useState<DensityId>(loadDensity);

  return (
    <SettingsSection id="density-title" title={t("settings.density.title")}>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="density-title">
        {DENSITIES.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={density === d.id}
            onClick={() => {
              setDensity(d.id);
              applyDensity(d.id);
            }}
            className={`min-h-7 rounded-lg border px-2.5 text-xs ${
              density === d.id ? "border-accent text-fg" : "border-edge text-muted hover:text-fg"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>
    </SettingsSection>
  );
}
