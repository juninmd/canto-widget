import { useEffect, useRef } from "react";
import type { WeatherCondition } from "../lib/api";
import { Sky } from "../lib/sky";

const moving = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: no-preference)").matches;

/** The weather behind the card's text, on a canvas. Still when the system asks for less motion or the window hides. */
export default function WeatherSky({ condition, night }: { condition: WeatherCondition; night: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const sky = new Sky(ctx, () =>
      flash.current?.animate?.([{ opacity: 0.75 }, { opacity: 0 }, { opacity: 0.45 }, { opacity: 0 }], { duration: 650, easing: "ease-out" }),
    );
    sky.set(condition, night);
    let frame = 0;
    const loop = (now: number) => {
      sky.draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (moving() && !document.hidden) frame = requestAnimationFrame(loop);
      else sky.draw(performance.now(), true);
    };
    const fit = () => {
      const box = el.getBoundingClientRect();
      sky.resize(box.width, box.height, Math.min(2, window.devicePixelRatio || 1));
      sky.set(condition, night);
      start();
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    observer?.observe(el);
    fit();
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [condition, night]);

  return (
    <div className="wx-layer" aria-hidden="true">
      <canvas ref={canvas} className="wx-canvas" />
      <span ref={flash} className="wx-flash" />
    </div>
  );
}
