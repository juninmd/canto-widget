import { useCallback, useEffect, useRef, useState } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { api, type StripConfig, type StripItem, type StripSnapshot } from "./lib/api";
import { useWindowVisible } from "./lib/useWindowVisible";
import { OPEN_TAB_EVENT } from "./features/alerts/alertEvents";
import StripPill from "./features/strip/StripPill";
import StripDetails from "./features/strip/StripDetails";
import { ITEM_TAB } from "./features/strip/stripModel";
import { nextFocus } from "./features/strip/stripKeys";
import { createPillDrag } from "./features/strip/stripDrag";

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
  const open = (hover && cfg?.hover !== false) || pinned;
  const pollMs = Math.max(1, Math.min(30, cfg?.refresh ?? 2)) * 1000;

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
    const timer = setInterval(load, pollMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [shown, pollMs]);

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

  // Dragging the pill along the edge keeps it off whatever it covers; the app moves the window with the real cursor.
  const dragger = useRef(createPillDrag((grab, commit) => api.stripDrag(grab, commit)));
  const dragProps = {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      const box = content.current?.getBoundingClientRect();
      dragger.current.down(e.clientX, box ? box.left + box.width / 2 : e.clientX);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (dragger.current.move(e.clientX) && !e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    },
    onPointerUp: () => dragger.current.up(),
    onPointerCancel: () => dragger.current.up(),
  };
  const toggle = () => {
    if (!dragger.current.moved()) setPinned((p) => !p);
  };

  const enter = useCallback(() => {
    clearTimeout(closing.current);
    setHover(true);
  }, []);
  const leave = useCallback(() => {
    clearTimeout(closing.current);
    closing.current = setTimeout(() => setHover(false), CLOSE_MS);
  }, []);
  useEffect(() => () => clearTimeout(closing.current), []);

  // On macOS the app answers where the cursor is (an inactive window never gets mouseenter/leave, and a stale
  // "enter" kept the details open for good); once it speaks, the page's own events stop counting.
  const native = useRef(false);
  useEffect(() => {
    const off = listen<boolean>("strip-hover", (e) => {
      native.current = true;
      if (e.payload) enter();
      else leave();
    });
    return () => void off.then((fn) => fn(), () => {});
  }, [enter, leave]);

  // Clicking away from a pinned pill lets it go.
  useEffect(() => {
    const unpin = () => setPinned(false);
    window.addEventListener("blur", unpin);
    return () => window.removeEventListener("blur", unpin);
  }, []);

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

  const customize = () => {
    void emit(OPEN_TAB_EVENT, "settings");
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
        onMouseEnter={() => native.current || enter()}
        onMouseLeave={() => native.current || leave()}
        style={{ opacity, zoom: (cfg?.scale ?? 100) / 100 }}
        className={`flex w-max flex-col items-center gap-1.5 p-0.5 transition-opacity duration-200 ${bottom ? "flex-col-reverse" : ""}`}
      >
        <StripPill items={items} snap={snap} look={cfg ?? LOOK} open={open} onToggle={toggle} drag={dragProps} />
        {open && snap && cfg && <StripDetails cfg={cfg} snap={snap} onOpen={openItem} onCustomize={customize} onHide={hide} />}
      </div>
    </div>
  );
}
