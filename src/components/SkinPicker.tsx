import { useEffect, useState } from "react";
import { applySkin, loadSkin, SKINS, type SkinId } from "../lib/theme";

export default function SkinPicker() {
  const [skin, setSkin] = useState<SkinId>("padrao");

  useEffect(() => {
    const inicial = loadSkin();
    setSkin(inicial);
    applySkin(inicial);
  }, []);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="skin do widget">
      {SKINS.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={skin === s.id}
          title={s.nome}
          onClick={() => {
            setSkin(s.id);
            applySkin(s.id);
          }}
          className={`size-3 rounded-full border transition ${
            skin === s.id ? "border-fg scale-110" : "border-edge opacity-60 hover:opacity-100"
          }`}
          style={{ backgroundColor: s.amostra }}
        />
      ))}
    </div>
  );
}
