import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

/** A game's art in any shape (header, cover, banner). Rust hands it over as a `data:` URL, since the
 *  CSP allows no remote image; only what is about to be seen is asked for. While it loads, or when
 *  Steam has none, the title's initials keep the shape. */
export default function SteamArt({ art, name, className = "" }: { art: string; name: string; className?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState("");
  const [near, setNear] = useState(false);

  useEffect(() => {
    setSrc("");
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
        if (live && data.startsWith("data:image/")) setSrc(data);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [art, near]);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return (
    <span ref={box} aria-hidden="true" className={`steam-art relative block overflow-hidden bg-raised ${className}`}>
      {src ? (
        <img src={src} alt="" className="canto-cover h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center bg-gradient-to-br from-edge to-ink text-sm font-extrabold tracking-wide text-faint">
          {initials || "?"}
        </span>
      )}
    </span>
  );
}
