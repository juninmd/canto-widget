/** The sky behind the Clima card, painted on a canvas: rain with wind and splashes, lightning, sun rays, clouds, snow, stars. */
import type { WeatherCondition } from "./api";

type Drop = { x: number; y: number; len: number; speed: number; alpha: number };
type Cloud = { x: number; y: number; scale: number; speed: number; alpha: number };
type Star = { x: number; y: number; r: number; phase: number; rate: number };
type Splash = { x: number; life: number };
type Bolt = { main: [number, number][]; branches: [number, number][][]; born: number };

export type SkyLook = { drops: number; wind: number; clouds: number; cloudAlpha: number; dark: boolean; snow: boolean; fog: boolean };

/** How much of each element a condition shows; night only adds stars when the sky is clear enough to see them. */
export function skyLook(condition: WeatherCondition): SkyLook {
  const base = { drops: 0, wind: 0, clouds: 2, cloudAlpha: 0.14, dark: false, snow: false, fog: false };
  switch (condition) {
    case "clear":
      return { ...base, clouds: 1, cloudAlpha: 0.1 };
    case "cloudy":
      return { ...base, clouds: 6, cloudAlpha: 0.2 };
    case "fog":
      return { ...base, clouds: 0, fog: true };
    case "drizzle":
      return { ...base, drops: 60, wind: 0.6, clouds: 5, cloudAlpha: 0.18, dark: true };
    case "rain":
      return { ...base, drops: 150, wind: 1.6, clouds: 6, cloudAlpha: 0.2, dark: true };
    case "storm":
      return { ...base, drops: 240, wind: 3.2, clouds: 7, cloudAlpha: 0.24, dark: true };
    case "snow":
      return { ...base, drops: 90, wind: 0.4, clouds: 4, cloudAlpha: 0.18, snow: true };
  }
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export class Sky {
  private width = 0;
  private height = 0;
  private look: SkyLook = skyLook("clear");
  private condition: WeatherCondition = "clear";
  private night = false;
  private drops: Drop[] = [];
  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  private splashes: Splash[] = [];
  private bolt: Bolt | null = null;
  private nextBolt = 0;
  private shooting: { x: number; y: number; life: number } | null = null;

  constructor(
    private ctx: CanvasRenderingContext2D,
    /** Fired with each lightning strike, so the card can flash. */
    private onStrike: () => void = () => {},
  ) {}

  resize(width: number, height: number, ratio: number) {
    this.width = width;
    this.height = height;
    this.ctx.canvas.width = Math.round(width * ratio);
    this.ctx.canvas.height = Math.round(height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.seed();
  }

  set(condition: WeatherCondition, night: boolean) {
    this.condition = condition;
    this.night = night;
    this.look = skyLook(condition);
    this.seed();
  }

  private seed() {
    const { width: w, height: h, look } = this;
    this.drops = Array.from({ length: look.drops }, () => ({
      x: rnd(-40, w + 40),
      y: rnd(-h, h),
      len: look.snow ? rnd(1.5, 3.5) : rnd(10, 22),
      speed: look.snow ? rnd(0.6, 1.4) : rnd(9, 15),
      alpha: rnd(0.4, 0.9),
    }));
    this.clouds = Array.from({ length: look.clouds }, (_, i) => ({
      x: rnd(-80, w),
      y: rnd(-10, h * 0.55),
      scale: rnd(0.7, 1.5),
      speed: rnd(0.08, 0.3) * (i % 2 ? 1 : 0.6),
      alpha: look.cloudAlpha * rnd(0.6, 1.1),
    }));
    const starry = this.night && !look.dark && !look.fog;
    this.stars = starry
      ? Array.from({ length: 60 }, () => ({ x: rnd(0, w), y: rnd(0, h * 0.8), r: rnd(0.4, 1.4), phase: rnd(0, 6.28), rate: rnd(0.8, 2.5) }))
      : [];
    this.splashes = [];
    this.bolt = null;
    this.nextBolt = 0;
  }

  /** One frame at `now` (ms). With `still`, only what does not move: no lightning, no shooting star. */
  draw(now: number, still = false) {
    const { ctx, width: w, height: h, look } = this;
    const t = now / 1000;
    ctx.clearRect(0, 0, w, h);
    if (this.condition === "clear" && !this.night) this.sun(t);
    for (const s of this.stars) {
      ctx.globalAlpha = still ? 0.8 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.rate + s.phase));
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (this.stars.length && !still) this.shootingStar();
    for (const c of this.clouds) {
      if (!still) c.x += c.speed + look.wind * 0.05;
      if (c.x > w + 40) c.x = -160 * c.scale;
      this.cloud(c);
    }
    if (look.fog) this.fog(t);
    if (look.snow) this.snow(still);
    else if (look.drops) this.rain(still);
    if (this.condition === "storm" && !still) this.lightning(now);
  }

  private sun(t: number) {
    const { ctx, width: w, height: h } = this;
    const x = w - 46;
    const y = 34;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 150);
    glow.addColorStop(0, "rgba(253,224,71,.5)");
    glow.addColorStop(0.25, "rgba(253,224,71,.14)");
    glow.addColorStop(1, "rgba(253,224,71,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.08);
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      const len = 200 + 30 * Math.sin(t * 1.3 + i);
      const ray = ctx.createLinearGradient(0, 0, len, 0);
      ray.addColorStop(0, "rgba(255,247,200,.2)");
      ray.addColorStop(1, "rgba(255,247,200,0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, -10);
      ctx.lineTo(len, 10);
      ctx.fill();
    }
    ctx.restore();
  }

  private cloud(c: Cloud) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle = this.look.dark ? "#94a3b8" : "#fff";
    ctx.filter = "blur(10px)";
    for (const [dx, dy, r] of [[0, 18, 34], [32, 4, 40], [70, 16, 32], [36, 26, 46]]) {
      ctx.beginPath();
      ctx.ellipse(c.x + dx * c.scale, c.y + dy * c.scale, r * c.scale * 1.2, r * c.scale * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private fog(t: number) {
    const { ctx, width: w, height: h } = this;
    ctx.save();
    ctx.filter = "blur(14px)";
    ctx.fillStyle = "rgba(226,232,240,.16)";
    for (let i = 0; i < 3; i++) {
      const y = h * (0.2 + i * 0.28);
      ctx.beginPath();
      ctx.ellipse(w / 2 + Math.sin(t * 0.3 + i) * w * 0.08, y, w * 0.7, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private rain(still: boolean) {
    const { ctx, width: w, height: h, look } = this;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.5;
    for (const d of this.drops) {
      if (!still) {
        d.y += d.speed;
        d.x += look.wind;
        if (d.y > h - 4) {
          if (Math.random() < 0.5) this.splashes.push({ x: d.x, life: 0 });
          d.y = rnd(-40, -10);
          d.x = rnd(-60, w);
        }
      }
      ctx.strokeStyle = `rgba(186,230,253,${d.alpha})`;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - (look.wind * d.len) / d.speed, d.y - d.len);
      ctx.stroke();
    }
    this.splashes = this.splashes.filter((s) => (s.life += 0.08) < 1);
    ctx.lineWidth = 1;
    for (const s of this.splashes) {
      ctx.strokeStyle = `rgba(186,230,253,${0.6 * (1 - s.life)})`;
      ctx.beginPath();
      ctx.ellipse(s.x, h - 2, 2 + s.life * 7, 1 + s.life * 2, 0, Math.PI, 0);
      ctx.stroke();
    }
  }

  private snow(still: boolean) {
    const { ctx, width: w, height: h } = this;
    ctx.fillStyle = "#fff";
    for (const d of this.drops) {
      if (!still) {
        d.y += d.speed;
        d.x += Math.sin(d.y / 30) * 0.5 + this.look.wind;
        if (d.y > h + 4) {
          d.y = -4;
          d.x = rnd(0, w);
        }
      }
      ctx.globalAlpha = d.alpha;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.len, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private lightning(now: number) {
    const { ctx, width: w, height: h } = this;
    if (!this.nextBolt) this.nextBolt = now + 1500;
    if (now > this.nextBolt) {
      const main: [number, number][] = [[rnd(w * 0.25, w * 0.75), 0]];
      const branches: [number, number][][] = [];
      let [x, y] = main[0];
      while (y < h * rnd(0.75, 1)) {
        x += rnd(-22, 22);
        y += rnd(12, 26);
        main.push([x, y]);
        if (Math.random() < 0.22) {
          const dir = Math.random() < 0.5 ? -1 : 1;
          const branch: [number, number][] = [[x, y]];
          for (let k = 0, bx = x, by = y; k < 4; k++) branch.push([(bx += dir * rnd(8, 20)), (by += rnd(8, 18))]);
          branches.push(branch);
        }
      }
      this.bolt = { main, branches, born: now };
      this.nextBolt = now + rnd(2800, 6500);
      this.onStrike();
    }
    if (!this.bolt) return;
    const age = now - this.bolt.born;
    // Two flickers and a fade, the way a real strike reads.
    const alpha = age < 120 ? 1 : age < 260 ? 0.2 : age < 380 ? 0.9 : Math.max(0, 1 - (age - 380) / 300);
    if (alpha <= 0) {
      this.bolt = null;
      return;
    }
    ctx.save();
    ctx.shadowColor = "#c7d2fe";
    ctx.shadowBlur = 18;
    const stroke = (points: [number, number][], width: number, a: number) => {
      ctx.beginPath();
      points.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.lineWidth = width;
      ctx.strokeStyle = `rgba(237,233,254,${a})`;
      ctx.stroke();
    };
    stroke(this.bolt.main, 2.6, alpha);
    for (const b of this.bolt.branches) stroke(b, 1.2, alpha * 0.7);
    ctx.restore();
  }

  private shootingStar() {
    const { ctx, width: w, height: h } = this;
    if (!this.shooting && Math.random() < 0.003) this.shooting = { x: rnd(w * 0.1, w * 0.6), y: rnd(10, h * 0.3), life: 0 };
    const s = this.shooting;
    if (!s) return;
    s.life += 0.025;
    const x = s.x + s.life * 160;
    const y = s.y + s.life * 70;
    const tail = ctx.createLinearGradient(x - 70, y - 31, x, y);
    tail.addColorStop(0, "rgba(255,255,255,0)");
    tail.addColorStop(1, `rgba(255,255,255,${1 - s.life})`);
    ctx.strokeStyle = tail;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - 70, y - 31);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (s.life >= 1) this.shooting = null;
  }
}
