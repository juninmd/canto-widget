import { useEffect, useRef } from "react";
import { weatherAlertKind, type WeatherFxKind } from "./weatherFx";
import { subscribeWindowShown, windowShown } from "../../lib/windowShown";
import { canvasDpr } from "../../lib/canvasDpr";

type Particle = { x: number; y: number; v: number; r: number; a: number; s: number };

const COUNT: Record<WeatherFxKind, number> = { rain: 70, storm: 110, snow: 50, cold: 26, heat: 14, wind: 26, uv: 1, air: 60, fog: 7, dry: 40, swing: 18 };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** The sky behind a weather alert: rain, flood, lightning, snow, heat haze, wind, UV rays, smoke. Severe alerts get more of it. */
export default function WeatherAlertFx({ id, severe }: { id: string; severe: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const kind = weatherAlertKind(id);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext?.("2d");
    if (!cv || !ctx || typeof requestAnimationFrame === "undefined") return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dpr = canvasDpr(window.devicePixelRatio || 1);
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
    const mult = severe ? 3.2 : 1;
    const parts: Particle[] = Array.from({ length: Math.floor(COUNT[kind] * mult) }, () => ({
      x: rnd(0, w || 400), y: rnd(0, h || 200), v: rnd(0.6, 1.4), r: rnd(1, 3), a: rnd(0, 6.28), s: rnd(0.2, 1),
    }));
    const ripples: { x: number; r: number; a: number }[] = [];
    let t = 0;
    let nextBolt = 60;
    let bolt: { life: number; pts: [number, number][] } | null = null;
    let raf = 0;

    const flood = () => {
      // The water rises to about 40% of the card, with two waves and rings where the rain lands.
      const level = h * (1 - (0.08 + 0.34 * (1 - Math.exp(-t / 220))));
      if (t % 3 === 0) ripples.push({ x: rnd(0, w), r: 1, a: 0.6 });
      const wave = (off: number, amp: number, spd: number, color: string) => {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) ctx.lineTo(x, level + off + Math.sin(x / 26 + t / spd) * amp + Math.sin(x / 11 - t / (spd * 0.7)) * amp * 0.4);
        ctx.lineTo(w, h);
        ctx.fillStyle = color;
        ctx.fill();
      };
      wave(4, 4, 14, "rgba(37,99,235,.22)");
      wave(0, 3, 10, "rgba(56,189,248,.28)");
      ctx.strokeStyle = "rgba(186,230,253,.55)";
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]!;
        rp.r += 0.9;
        rp.a -= 0.018;
        if (rp.a <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = rp.a;
        ctx.beginPath();
        ctx.ellipse(rp.x, level + 6, rp.r * 2.2, rp.r * 0.6, 0, 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    const lightning = () => {
      if (--nextBolt <= 0) {
        const pts: [number, number][] = [];
        let x = rnd(w * 0.3, w);
        let y = 0;
        while (y < h * 0.7) {
          pts.push([x, y]);
          x += rnd(-18, 18);
          y += rnd(10, 26);
        }
        bolt = { life: 10, pts };
        nextBolt = rnd(severe ? 30 : 80, severe ? 80 : 260);
        cv.animate?.([{ filter: "brightness(1.9)" }, { filter: "none" }, { filter: "brightness(1.4)" }, { filter: "none" }], { duration: 420 });
      }
      if (bolt && bolt.life-- > 0) {
        ctx.strokeStyle = `rgba(253,224,71,${bolt.life / 10})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        bolt.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      }
    };

    const frame = () => {
      t++;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      if (kind === "rain" || kind === "storm") {
        ctx.strokeStyle = kind === "storm" ? "rgba(165,180,252,.5)" : "rgba(96,165,250,.5)";
        ctx.lineWidth = severe ? 1.6 : 1.2;
        ctx.beginPath();
        for (const p of parts) {
          const sp = (kind === "storm" ? 9 : 6) * p.v * (severe ? 1.5 : 1);
          p.y += sp;
          p.x -= sp * 0.25;
          if (p.y > h) {
            p.y = -10;
            p.x = rnd(0, w + 60);
          }
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 3, p.y - 12 * p.v);
        }
        ctx.stroke();
        if (kind === "rain" && severe) flood();
        if (kind === "storm") lightning();
      } else if (kind === "snow" || kind === "cold") {
        ctx.fillStyle = "rgba(224,242,254,.75)";
        for (const p of parts) {
          p.y += (severe ? 1.6 : 0.5) * p.v;
          p.x += Math.sin(t / 40 + p.a) * 0.5 + (severe ? -1.4 : 0);
          if (p.y > h) {
            p.y = -5;
            p.x = rnd(0, w + 60);
          }
          if (p.x < -5) p.x = w + 5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (kind === "cold" ? 0.7 : 1), 0, 7);
          ctx.fill();
        }
        if (kind === "cold") {
          const frost = Math.min(1, t / 100);
          for (const [x, y] of [[0, 0], [w, h]] as const) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, 130 * frost);
            g.addColorStop(0, "rgba(186,230,253,.33)");
            g.addColorStop(1, "rgba(186,230,253,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
          }
        }
      } else if (kind === "heat" || kind === "dry") {
        const sun = ctx.createRadialGradient(w - 40, 20, 0, w - 40, 20, 160);
        sun.addColorStop(0, kind === "heat" ? "rgba(251,191,36,.35)" : "rgba(253,186,116,.25)");
        sun.addColorStop(1, "rgba(251,191,36,0)");
        ctx.fillStyle = sun;
        ctx.fillRect(0, 0, w, h);
        if (kind === "heat" && severe) {
          const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.75);
          v.addColorStop(0, "rgba(239,68,68,0)");
          v.addColorStop(1, `rgba(239,68,68,${0.22 + Math.sin(t / 25) * 0.08})`);
          ctx.fillStyle = v;
          ctx.fillRect(0, 0, w, h);
        }
        if (kind === "heat") {
          ctx.lineWidth = 1.5;
          for (const p of parts) {
            p.y -= 0.6 * p.v;
            if (p.y < -20) {
              p.y = h + 10;
              p.x = rnd(0, w);
            }
            ctx.strokeStyle = `rgba(251,146,60,${0.25 * p.s})`;
            ctx.beginPath();
            for (let i = 0; i < 30; i++) ctx.lineTo(p.x + Math.sin((p.y + i * 2) / 8 + t / 10) * 4, p.y + i * 2);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = "rgba(214,170,110,.45)";
          for (const p of parts) {
            p.x += (severe ? 3.5 : 1.2) * p.v;
            p.y += Math.sin(t / 30 + p.a) * 0.3;
            if (p.x > w) {
              p.x = -4;
              p.y = rnd(0, h);
            }
            ctx.fillRect(p.x, p.y, p.r * 0.8, p.r * 0.8);
          }
        }
      } else if (kind === "wind" || kind === "swing") {
        for (const p of parts) {
          p.x += (kind === "wind" ? (severe ? 15 : 8) : 3) * p.v;
          if (p.x > w + 80) {
            p.x = -80;
            p.y = rnd(0, h);
          }
          ctx.strokeStyle = kind === "wind" ? `rgba(167,243,208,${0.35 * p.s})` : `rgba(147,197,253,${0.3 * p.s})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.quadraticCurveTo(p.x - 30, p.y + Math.sin(t / 12 + p.a) * 6, p.x - 70 * p.v, p.y);
          ctx.stroke();
        }
        if (kind === "wind" && severe) {
          for (let i = 0; i < 9; i++) {
            const q = parts[i]!;
            ctx.save();
            ctx.translate(((q.x * 1.3 + t * 7) % (w + 40)) - 20, q.y + Math.sin(t / 10 + q.a) * 14);
            ctx.rotate(t / 6 + q.a);
            ctx.fillStyle = i % 3 ? "rgba(134,239,172,.6)" : "rgba(250,204,21,.55)";
            ctx.beginPath();
            ctx.ellipse(0, 0, 5, 2.4, 0, 0, 7);
            ctx.fill();
            ctx.restore();
          }
        }
      } else if (kind === "uv") {
        ctx.save();
        ctx.translate(w - 30, 10);
        ctx.rotate(t / 300);
        for (let i = 0; i < 14; i++) {
          ctx.rotate(Math.PI / 7);
          ctx.fillStyle = `rgba(244,114,182,${severe ? 0.26 + Math.sin(t / 15) * 0.08 : 0.1})`;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w, -26);
          ctx.lineTo(w, 26);
          ctx.fill();
        }
        ctx.restore();
      } else {
        for (const p of parts) {
          p.x += (kind === "fog" ? 0.25 : 0.4) * p.v;
          if (p.x - 140 > w) p.x = -140;
          const radius = kind === "fog" ? 90 + p.r * 30 : p.r * 2;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
          g.addColorStop(0, kind === "fog" ? `rgba(203,213,225,${severe ? 0.3 : 0.12})` : severe ? "rgba(239,68,68,.28)" : "rgba(168,162,158,.35)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      if (windowShown()) frame();
    };
    const stopWatching = subscribeWindowShown(restart);
    frame();
    return () => {
      stopWatching();
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [kind, severe]);

  return <canvas ref={canvas} aria-hidden="true" data-weather-fx className="pointer-events-none absolute inset-0 -z-10 size-full" />;
}
