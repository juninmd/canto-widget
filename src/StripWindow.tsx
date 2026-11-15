import { useCallback, useEffect, useRef, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { api, type StripConfig, type StripItem, type StripSnapshot } from "./lib/api";
import { useWindowVisible } from "./lib/useWindowVisible";
import { OPEN_TAB_EVENT } from "./features/alerts/alertEvents";
import StripPill from "./features/strip/StripPill";
import StripDetails from "./features/strip/StripDetails";
import { ITEM_TAB } from "./features/strip/stripModel";

const POLL_MS = 2000;
/** Leaving the pill for the card is not leaving: a short grace keeps it from flickering shut on the way. */
const CLOSE_MS = 250;

/** The mini-dashboard's own window: a pill on the screen edge, with the details a hover or a click away. */
export default function StripWindow() {
  const [cfg, setCfg] = useState<StripConfig | null>(null);
  const [snap, setSnap] = useState<StripSnapshot | null>(null);
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const shown = useWindowVisible();
  const content = useRef<HTMLDivElement>(null);
  const closing = useRef<ReturnType<typeof setTimeout>>(undefined);
  const open = hover || pinned;

  // Hidden (option off, full-screen app in front) means no polling: nobody is looking.
  useEffect(() => {
    if (!shown) return;
    let alive = true;
    const load = () =>
      void Promise.all([api.stripConfigGet(), api.stripSnapshot()]).then(
        ([c, s]) => {
          if (!alive) return;
          setCfg(c);
          setSnap(s);
        },
        () => {},
      );
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [shown]);

  // The window is exactly as big as its content, so the transparent rest never eats clicks on the screen edge.
  useEffect(() => {
    const el = content.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let last = "";
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      const key = `${Math.ceil(width)}x${Math.ceil(height)}`;
      if (key === last || width === 0) return;
      last = key;
      void api.stripResize(Math.ceil(width), Math.ceil(height)).catch(() => {});
    };
    const watcher = new ResizeObserver(fit);
    watcher.observe(el);
    fit();
    return () => watcher.disconnect();
  }, []);

  const enter = useCallback(() => {
    clearTimeout(closing.current);
    setHover(true);
  }, []);
  const leave = useCallback(() => {
    clearTimeout(closing.current);
    closing.current = setTimeout(() => setHover(false), CLOSE_MS);
  }, []);
  useEffect(() => () => clearTimeout(closing.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPinned(false);
      setHover(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openItem = (item: StripItem) => {
    void emit(OPEN_TAB_EVENT, ITEM_TAB[item]);
    void api.mainShow();
  };

  const bottom = cfg?.edge === "bottom";
  const items = cfg?.items ?? [];
  return (
    <div className={`flex h-screen justify-center ${bottom ? "items-end" : "items-start"}`}>
      <div
        ref={content}
        onMouseEnter={enter}
        onMouseLeave={leave}
        className={`flex w-max flex-col items-center gap-1.5 p-0.5 ${bottom ? "flex-col-reverse" : ""}`}
      >
        <StripPill items={items} snap={snap} open={open} onToggle={() => setPinned((p) => !p)} />
        {open && snap && <StripDetails items={items} snap={snap} onOpen={openItem} />}
      </div>
    </div>
  );
}
