import { useEffect, useRef } from "react";
import { TONE_RGB, type FxScene } from "../lib/alertFx";
import type { Tone } from "../lib/alerts";

type P = { x: number; y: number; v: number; r: number; a: number; s: number };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const COUNT: Record<FxScene, number> = { rings: 0, ticks: 16, sparks: 34, bugs: 40, branches: 3, bubbles: 18, rays: 30, pulse: 0 };

type Ctx = CanvasRenderingContext2D;
type Frame = { ctx: Ctx; w: number; h: number; t: number; p: P[]; rgb: string; hot: boolean };

const draw: Record<FxScene, (f: Frame) => void> = {
  // Rings leave the icon like a ping; an imminent meeting or a critical outage pings faster and thicker.
  rings({ ctx, w, t, rgb, hot, h }) {
    const period = hot ? 38 : 90;
    for (let i = 0; i < 3; i++) {
      const k = ((t + i * (period / 3)) % period) / period;
      ctx.strokeStyle = `rgba(${rgb},${(1 - k) * (hot ? 0.55 : 0.3)})`;
      ctx.lineWidth = hot ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(30, h * 0.5, 10 + k * Math.max(w, h) * 0.75, 0, 7);
      ctx.stroke();
    }
  },
  ticks({ ctx, w, h, p, t }) {
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    for (const q of p) {
      q.y -= 0.35 * q.v;
      if (q.y < -12) {
        q.y = h + 8;
        q.x = rnd(0, w);
      }
      ctx.strokeStyle = `rgba(74,222,128,${0.14 + 0.18 * Math.sin(t / 30 + q.a) ** 2})`;
      ctx.beginPath();
      ctx.moveTo(q.x - 4 * q.s - 2, q.y);
      ctx.lineTo(q.x - 1, q.y + 4 * q.s + 1);
      ctx.lineTo(q.x + 5 * q.s + 2, q.y - 4 * q.s - 1);
      ctx.stroke();
    }
  },
  // Four-point stars twinkling: approvals, a model entering the top 10.
  sparks({ ctx, w, h, p, t, hot }) {
    for (const q of p) {
      q.y -= 0.25 * q.v * (hot ? 2 : 1);
      if (q.y < -8) {
        q.y = h + 8;
        q.x = rnd(0, w);
      }
      const k = 0.5 + 0.5 * Math.sin(t / 14 + q.a);
      const r = q.r * (1 + 2 * k);
      ctx.fillStyle = `rgba(${q.s > 0.66 ? "253,224,71" : q.s > 0.33 ? "244,114,182" : "125,211,252"},${0.15 + 0.5 * k})`;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y - r * 2);
      ctx.quadraticCurveTo(q.x, q.y, q.x + r * 2, q.y);
      ctx.quadraticCurveTo(q.x, q.y, q.x, q.y + r * 2);
      ctx.quadraticCurveTo(q.x, q.y, q.x - r * 2, q.y);
      ctx.quadraticCurveTo(q.x, q.y, q.x, q.y - r * 2);
      ctx.fill();
    }
    void w;
  },
  // A failing build: red blocks fall like dropped frames and a scan band flickers across.
  bugs({ ctx, w, h, p, t }) {
    for (const q of p) {
      q.y += 1.1 * q.v;
      if (q.y > h) {
        q.y = -6;
        q.x = rnd(0, w);
      }
      ctx.fillStyle = `rgba(251,113,133,${0.12 + 0.2 * q.s})`;
      ctx.fillRect(q.x, q.y, q.r * 2.5, q.r);
    }
    if (t % 70 < 6) {
      const y = rnd(0, h);
      ctx.fillStyle = "rgba(251,113,133,.14)";
      ctx.fillRect(0, y, w, rnd(3, 9));
    }
  },
  // Two branches leaving the same commit; dots travel along them.
  branches({ ctx, w, h, t, rgb }) {
    const y0 = h * 0.5;
    for (const dir of [-1, 1]) {
      ctx.strokeStyle = `rgba(${rgb},.22)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.bezierCurveTo(w * 0.3, y0, w * 0.35, y0 + dir * h * 0.28, w * 0.6, y0 + dir * h * 0.28);
      ctx.lineTo(w, y0 + dir * h * 0.28);
      ctx.stroke();
      const k = ((t / 120 + (dir > 0 ? 0.5 : 0)) % 1) * w;
      const y = k < w * 0.6 ? y0 + dir * h * 0.28 * Math.min(1, Math.max(0, (k - w * 0.1) / (w * 0.35))) : y0 + dir * h * 0.28;
      ctx.fillStyle = `rgba(${rgb},.7)`;
      ctx.beginPath();
      ctx.arc(k, y, 3, 0, 7);
      ctx.fill();
    }
  },
  bubbles({ ctx, w, h, p, t, rgb }) {
    ctx.lineWidth = 1.2;
    for (const q of p) {
      q.y -= 0.4 * q.v;
      q.x += Math.sin(t / 50 + q.a) * 0.3;
      if (q.y < -10) {
        q.y = h + 10;
        q.x = rnd(0, w);
      }
      ctx.strokeStyle = `rgba(${rgb},${0.12 + 0.18 * q.s})`;
      ctx.beginPath();
      ctx.arc(q.x, q.y, 3 + q.r * 2.5, 0, 7);
      ctx.stroke();
    }
  },
  // The morning summary: a low sun with slow rays and drifting dust.
  rays({ ctx, w, h, p, t }) {
    ctx.save();
    ctx.translate(30, h + 10);
    ctx.rotate(-Math.PI / 2 + Math.sin(t / 200) * 0.15);
    for (let i = 0; i < 9; i++) {
      ctx.rotate(Math.PI / 12);
      ctx.fillStyle = "rgba(251,191,36,.07)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 1.2, -24);
      ctx.lineTo(w * 1.2, 24);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "rgba(253,230,138,.45)";
    for (const q of p) {
      q.x += 0.2 * q.v;
      q.y += Math.sin(t / 40 + q.a) * 0.15;
      if (q.x > w) q.x = -3;
      ctx.fillRect(q.x, q.y, q.r * 0.7, q.r * 0.7);
    }
  },
  // A service heartbeat scrolling past; it races when the service is down.
  pulse({ ctx, w, h, t, rgb, hot }) {
    const base = h * 0.82;
    const beat = hot ? 70 : 120;
    ctx.strokeStyle = `rgba(${rgb},${hot ? 0.45 : 0.28})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const u = (((x - t * (hot ? 2.2 : 1.4)) % beat) + beat) % beat;
      const y = u < 6 ? -6 * Math.sin((u / 6) * Math.PI) : u < 12 ? 20 * Math.sin(((u - 6) / 6) * Math.PI) * -1 + 8 * Math.sin(((u - 6) / 6) * Math.PI) : 0;
      x ? ctx.lineTo(x, base + y) : ctx.moveTo(x, base + y);
    }
    ctx.stroke();
  },
};

/** The animated backdrop behind an alert card. Stops for "reduce motion" and while the window is hidden. */
export default function AlertFx({ scene, tone, intense }: { scene: FxScene; tone: Tone; intense: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext?.("2d");
    if (!cv || !ctx || typeof requestAnimationFrame === "undefined") return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    const size = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(size);
    observer?.observe(cv);
    const p: P[] = Array.from({ length: COUNT[scene] }, () => ({ x: rnd(0, w || 400), y: rnd(0, h || 200), v: rnd(0.6, 1.4), r: rnd(1, 3), a: rnd(0, 6.28), s: rnd(0.2, 1) }));
    let t = 0;
    let raf = 0;
    const frame = () => {
      t++;
      ctx.clearRect(0, 0, w, h);
      draw[scene]({ ctx, w, h, t, p, rgb: TONE_RGB[tone], hot: intense });
      raf = requestAnimationFrame(frame);
    };
    const visibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) frame();
    };
    document.addEventListener("visibilitychange", visibility);
    frame();
    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [scene, tone, intense]);

  return <canvas ref={canvas} aria-hidden="true" data-alert-fx={scene} className="pointer-events-none absolute inset-0 -z-10 size-full" />;
}
