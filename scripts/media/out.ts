import type { Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const OUT = "docs/prints/readme";

const ffmpeg = (...args: string[]) => execFileSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: ["ignore", "pipe", "inherit"] });

/** The window is rounded in the app; a transparent page background keeps those corners transparent in the image. */
async function clearBackground(page: Page) {
  const done = await page.evaluate(() => document.documentElement.dataset.backdrop !== undefined || document.getElementById("media-clear") !== null);
  if (done) return;
  await page.addStyleTag({ content: "html,body{background:transparent!important}" }).then((tag) => tag.evaluate((el) => (el.id = "media-clear")));
}

/** Paints a backdrop behind the window (a faux desktop) and keeps `clearBackground` from removing it. */
export async function backdrop(page: Page, css: string) {
  await page.evaluate(() => (document.documentElement.dataset.backdrop = "1"));
  await page.addStyleTag({ content: `html,body{background:${css}!important}` });
}

/** The tab bar keeps an invisible measuring node wider than the window; a click can scroll the root sideways. */
async function recenter(page: Page) {
  await page.evaluate(() => document.querySelectorAll("*").forEach((el) => void (el.scrollLeft = 0)));
}

async function png(page: Page): Promise<Buffer> {
  await clearBackground(page);
  await recenter(page);
  return page.screenshot({ omitBackground: true, animations: "disabled", caret: "initial" });
}

/** Lossless WebP: a third of the PNG for flat UI colors, and it keeps the alpha of the rounded corners. */
export async function shoot(page: Page, name: string) {
  const dir = mkdtempSync(join(tmpdir(), "canto-shot-"));
  try {
    const source = join(dir, "in.png");
    writeFileSync(source, await png(page));
    mkdirSync(OUT, { recursive: true });
    ffmpeg("-i", source, "-c:v", "libwebp", "-lossless", "1", "-compression_level", "6", join(OUT, `${name}.webp`));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Lossy WebP with alpha, for the banner: a photo-like composition where lossless would be several times larger. */
export async function shootLossy(page: Page, name: string, quality = 90) {
  const dir = mkdtempSync(join(tmpdir(), "canto-shot-"));
  try {
    const source = join(dir, "in.png");
    writeFileSync(source, await png(page));
    mkdirSync(OUT, { recursive: true });
    ffmpeg("-i", source, "-c:v", "libwebp", "-quality", String(quality), "-compression_level", "6", join(OUT, `${name}.webp`));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Collects frames with how long each one stays, then writes one looping GIF. */
export class Reel {
  private frames: { data: Buffer; ms: number }[] = [];

  async frame(page: Page, holdMs: number) {
    this.frames.push({ data: await png(page), ms: holdMs });
  }

  save(name: string, width = 420) {
    const dir = mkdtempSync(join(tmpdir(), "canto-reel-"));
    try {
      const lines: string[] = [];
      this.frames.forEach((f, i) => {
        const file = `f${String(i).padStart(4, "0")}.png`;
        writeFileSync(join(dir, file), f.data);
        lines.push(`file '${file}'`, `duration ${(f.ms / 1000).toFixed(3)}`);
      });
      lines.push(`file 'f${String(this.frames.length - 1).padStart(4, "0")}.png'`);
      writeFileSync(join(dir, "list.txt"), lines.join("\n"));
      mkdirSync(OUT, { recursive: true });
      const filter =
        `scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=reserve_transparent=1:stats_mode=diff[p];` +
        "[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle:alpha_threshold=128";
      ffmpeg("-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"), "-vf", filter, "-loop", "0", join(OUT, `${name}.gif`));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}
