import { useEffect, useState } from "react";
import { t, type MessageKey } from "../../i18n";
import type { PrFile } from "../../lib/api";
import type { PrBackend } from "./prApi";
import { Lightbox } from "./PrImage";

type Mode = "side" | "before" | "after" | "blend";
const MODES: Mode[] = ["side", "before", "after", "blend"];

/** What a picture looked like at a branch: `null` while it loads, `false` when the forge has none to give. */
function useBlob(back: PrBackend, path: string, gitRef: string, wanted: boolean): string | null | false {
  const [got, setGot] = useState<string | null | false>(wanted ? null : false);
  useEffect(() => {
    if (!wanted) return setGot(false);
    let live = true;
    setGot(null);
    back.blob(path, gitRef).then(
      (d) => live && setGot(d),
      () => live && setGot(false),
    );
    return () => {
      live = false;
    };
  }, [back, path, gitRef, wanted]);
  return got;
}

/** A changed picture: before and after side by side, one at a time, or blended with a slider. A zoom opens on click. */
export default function PrImageDiff({ back, file, base, head }: { back: PrBackend; file: PrFile; base: string; head: string }) {
  const [mode, setMode] = useState<Mode>("side");
  const [mix, setMix] = useState(50);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  // A renamed file has no old path here, so only its new picture is shown.
  const removed = file.status === "removed";
  const before = useBlob(back, file.name, base, file.status === "modified" || removed);
  const after = useBlob(back, file.name, head, !removed);
  const both = typeof before === "string" && typeof after === "string";
  const modes = both ? MODES : (["side"] as Mode[]);
  const shown = modes.includes(mode) ? mode : "side";
  const pic = (src: string | null | false, alt: string) =>
    src === null ? (
      <span role="img" aria-label={alt} className="block h-20 w-full animate-pulse rounded-lg bg-edge" />
    ) : src === false ? (
      <span className="block rounded-lg border border-dashed border-edge p-2 text-[11px] text-faint">{t("forge.pr.imageGone")}</span>
    ) : (
      <button type="button" onClick={() => setZoom({ src, alt })} aria-label={t("forge.pr.imageOpen", { alt })} className="block w-full cursor-zoom-in">
        <img src={src} alt={alt} className="block max-h-64 w-full rounded-lg border border-edge object-contain" />
      </button>
    );
  const a = t("forge.pr.img.before");
  const b = t("forge.pr.img.after");
  return (
    <div className="space-y-2 p-2.5">
      {modes.length > 1 && (
        <div role="group" aria-label={t("forge.pr.img.mode")} className="flex gap-1 rounded-lg bg-edge/50 p-0.5">
          {modes.map((m) => (
            <button key={m} type="button" aria-pressed={shown === m} onClick={() => setMode(m)} className="canto-hit min-h-[24px] flex-1 rounded-md px-1 text-[11px] text-muted aria-pressed:bg-panel aria-pressed:font-semibold aria-pressed:text-accent-text">
              {t(`forge.pr.img.${m}` as MessageKey)}
            </button>
          ))}
        </div>
      )}
      {shown === "side" && (
        <div className={`grid gap-2 ${file.status === "modified" ? "grid-cols-2" : ""}`}>
          {(file.status === "modified" || removed) && (
            <figure className="m-0 space-y-1">
              <figcaption className="text-[10.5px] uppercase text-faint">{a}</figcaption>
              {pic(before, a)}
            </figure>
          )}
          {!removed && (
            <figure className="m-0 space-y-1">
              <figcaption className="text-[10.5px] uppercase text-faint">{b}</figcaption>
              {pic(after, b)}
            </figure>
          )}
        </div>
      )}
      {shown === "before" && pic(before, a)}
      {shown === "after" && pic(after, b)}
      {shown === "blend" && both && (
        <div className="space-y-1.5">
          <div className="relative overflow-hidden rounded-lg border border-edge">
            <img src={before} alt={a} className="block max-h-64 w-full object-contain" />
            <img src={after} alt={b} style={{ opacity: mix / 100 }} className="absolute inset-0 size-full object-contain" />
          </div>
          <input type="range" min={0} max={100} value={mix} aria-label={t("forge.pr.img.mixLabel")} onChange={(e) => setMix(Number(e.target.value))} className="w-full" />
        </div>
      )}
      {zoom && <Lightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />}
    </div>
  );
}
