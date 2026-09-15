import { useEffect, useState } from "react";
import { applySkin, loadSkin, seguirSistema, SKINS, type SkinId } from "../lib/theme";

export default function SkinPicker() {
  const [skin, setSkin] = useState<SkinId>("padrao");

  useEffect(() => {
    const inicial = loadSkin();
    setSkin(inicial);
    applySkin(inicial);
  }, []);

  useEffect(() => {
    if (skin !== "sistema") return;
    return seguirSistema(() => applySkin("sistema"));
  }, [skin]);

  return (
    <div className="flex items-center" role="radiogroup" aria-label="skin do widget">
      {SKINS.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={skin === s.id}
          title={s.nome}
          aria-label={s.nome}
          onClick={() => {
            setSkin(s.id);
            applySkin(s.id);
          }}
          // Area de clique de 24px (WCAG 2.5.8) com a bolinha visual de 12px.
          className="group/skin grid size-6 place-items-center rounded-full"
        >
          <span
            className={`size-3 rounded-full border transition ${
              skin === s.id ? "border-fg scale-110" : "border-edge opacity-60 group-hover/skin:opacity-100"
            }`}
            style={{ background: s.amostra }}
          />
        </button>
      ))}
    </div>
  );
}
