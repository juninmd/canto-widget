import { useEffect, useState } from "react";
import { api } from "../lib/api";

/** The capsule of one row. Rust hands it over as a `data:` URL, since the CSP allows no remote
 *  image; while it loads, or when Steam has no art, the initial keeps the row aligned. */
export default function SteamThumb({ art, name }: { art: string; name: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!art) return;
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
  }, [art]);

  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-edge bg-raised"
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-faint">{(name.trim()[0] ?? "?").toUpperCase()}</span>
      )}
    </span>
  );
}
