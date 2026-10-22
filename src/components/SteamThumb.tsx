import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

/** The capsule of one row. Rust hands it over as a `data:` URL, since the CSP allows no remote image.
 *  A long catalog only asks for the covers it is about to show; while the art loads, or when Steam has
 *  none, the initial keeps the row aligned. */
export default function SteamThumb({ art, name }: { art: string; name: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState("");
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!art) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [art]);

  useEffect(() => {
    if (!art || !near) return;
    let live = true;
    api
      .steamImage(art)
      .then((data) => {
        // Defense in depth: Rust only ever returns a small raster, but the prefix is checked here too.
        if (live && data.startsWith("data:image/")) setSrc(data);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [art, near]);

  return (
    <span
      ref={box}
      aria-hidden="true"
      className="canto-thumb flex h-9 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-edge bg-raised"
    >
      {src ? (
        <img src={src} alt="" className="canto-cover h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-faint">{(name.trim()[0] ?? "?").toUpperCase()}</span>
      )}
    </span>
  );
}
