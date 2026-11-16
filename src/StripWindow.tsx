import { useCallback, useEffect, useRef, useState } from "react";
import { emit } from "@tauri-apps/api/event";
import { api, type StripConfig, type StripItem, type StripSnapshot } from "./lib/api";
import { useWindowVisible } from "./lib/useWindowVisible";
import { OPEN_TAB_EVENT } from "./features/alerts/alertEvents";
import StripPill from "./features/strip/StripPill";
import StripDetails from "./features/strip/StripDetails";
import { ITEM_TAB } from "./features/strip/stripModel";
import { nextFocus } from "./features/strip/stripKeys";
import type { Tab } from "./shell/TabBar";

const POLL_MS = 2000;
const LOOK = { density: "comfortable", icons: true, labels: false } as const;
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

  // Only a pinned pill takes focus: hovering must never steal the keyboard from the app in front.
  useEffect(() => {
    void api.stripFocus(pinned).catch(() => {});
  }, [pinned]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        setHover(false);
        return;
      }
      const navs = Array.from(content.current?.querySelectorAll<HTMLElement>("[data-nav]") ?? []);
      const at = navs.indexOf(document.activeElement as HTMLElement);
      const to = nextFocus(e.key, at, navs.length);
      if (to === null) return;
      e.preventDefault();
      navs[to]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openItem = (item: StripItem) => {
    void emit(OPEN_TAB_EVENT, ITEM_TAB[item]);
    void api.mainShow();
  };

  const launch = (tab: Tab) => {
    void emit(OPEN_TAB_EVENT, tab);
    void api.mainShow();
  };

  const hide = () => {
    if (!cfg) return;
    setPinned(false);
    void api.stripConfigSet({ ...cfg, enabled: false }).catch(() => {});
  };

  const bottom = cfg?.edge === "bottom";
  const items = cfg?.items ?? [];
  // Faded while nobody looks; a hover or a pin brings it to full strength.
  const opacity = open || !cfg ? 1 : cfg.opacity / 100;
  return (
    <div className={`flex h-screen justify-center ${bottom ? "items-end" : "items-start"}`}>
      <div
        ref={content}
        onMouseEnter={enter}
        onMouseLeave={leave}
        style={{ opacity }}
        className={`flex w-max flex-col items-center gap-1.5 p-0.5 transition-opacity duration-200 ${bottom ? "flex-col-reverse" : ""}`}
      >
        <StripPill items={items} snap={snap} look={cfg ?? LOOK} open={open} onToggle={() => setPinned((p) => !p)} />
        {open && snap && cfg && <StripDetails cfg={cfg} snap={snap} onOpen={openItem} onLaunch={launch} onHide={hide} />}
      </div>
    </div>
  );
}
