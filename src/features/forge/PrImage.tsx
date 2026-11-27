import { useEffect, useState } from "react";
import { t } from "../../i18n";
import { api } from "../../lib/api";
import type { PrBackend } from "./prApi";

/** Pictures Rust already embedded, by source URL: a description is read again after every action. */
const have = new Map<string, string>();
const failed = new Set<string>();

export const clearPrImages = () => {
  have.clear();
  failed.clear();
};

/** Esc closes only the picture, not the view under it. */
function useEscape(onClose: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
}

export function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEscape(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-label={alt || t("forge.pr.image")} onClick={onClose} className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/80 p-3">
      <img src={src} alt={alt} className="max-h-full max-w-full rounded-lg" />
      <button type="button" aria-label={t("forge.pr.imageClose")} onClick={onClose} className="canto-hit absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-panel text-fg">
        ✕
      </button>
    </div>
  );
}

/** A picture of a description or comment. The CSP blocks remote images, so Rust downloads it from the forge's own hosts. */
export default function PrImage({ back, src, alt }: { back: PrBackend; src: string; alt: string }) {
  const [url, setUrl] = useState(have.get(src) ?? "");
  const [bad, setBad] = useState(failed.has(src));
  const [big, setBig] = useState(false);
  useEffect(() => {
    if (have.has(src) || failed.has(src)) return;
    let live = true;
    back.image(src).then(
      (data) => {
        have.set(src, data);
        if (live) setUrl(data);
      },
      () => {
        failed.add(src);
        if (live) setBad(true);
      },
    );
    return () => {
      live = false;
    };
  }, [src, back]);
  if (bad)
    return (
      <button type="button" onClick={() => void api.openLink(/^https?:\/\//i.test(src) ? src : back.url).catch(() => {})} className="canto-hit inline-flex items-center gap-1 rounded-md border border-edge px-1.5 py-0.5 text-[11px] text-muted hover:text-fg">
        🖼 {alt ? t("forge.pr.imageFail", { alt }) : t("forge.pr.imageFailBare")}
      </button>
    );
  if (!url) return <span role="img" aria-label={alt || t("forge.pr.image")} className="my-1 block h-16 w-full animate-pulse rounded-lg bg-edge" />;
  return (
    <>
      <button type="button" onClick={() => setBig(true)} aria-label={t("forge.pr.imageOpen", { alt: alt || t("forge.pr.image") })} className="my-1 block max-w-full cursor-zoom-in rounded-lg border border-edge">
        <img src={url} alt={alt} loading="lazy" className="block max-h-72 max-w-full rounded-lg" />
      </button>
      {big && <Lightbox src={url} alt={alt} onClose={() => setBig(false)} />}
    </>
  );
}
