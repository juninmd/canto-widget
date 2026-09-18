import { useState } from "react";
import { applySkin, loadSkin, SKINS, type SkinId } from "../lib/theme";

/** Lives in Settings: name visible next to the swatch, instead of loose dots in the header. */
export default function SkinPicker() {
  const [skin, setSkin] = useState<SkinId>(loadSkin);

  return (
    <section className="flex flex-col gap-2">
      <h3 id="appearance-title" className="text-xs font-semibold text-fg">
        Aparência
      </h3>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby="appearance-title">
        {SKINS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={skin === s.id}
            onClick={() => {
              setSkin(s.id);
              applySkin(s.id);
            }}
            className={`flex min-h-7 items-center gap-2 rounded-lg border px-2.5 text-xs ${
              skin === s.id ? "border-accent text-fg" : "border-edge text-muted hover:text-fg"
            }`}
          >
            <span className="size-3 shrink-0 rounded-full border border-edge" style={{ background: s.sample }} />
            {s.name}
          </button>
        ))}
      </div>
    </section>
  );
}
