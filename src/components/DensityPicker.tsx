import { useState } from "react";
import { applyDensity, loadDensity, DENSITIES, type DensityId } from "../lib/density";
import { t } from "../i18n";

/** Lives next to the skin picker: both are "how the widget looks", not vault state. */
export default function DensityPicker() {
  const [density, setDensity] = useState<DensityId>(loadDensity);

  return (
    <section className="flex flex-col gap-2">
      <h3 id="density-title" className="text-xs font-semibold text-fg">
        {t("settings.density.title")}
      </h3>
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
    </section>
  );
}
