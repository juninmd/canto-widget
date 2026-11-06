/**
 * Backing-store scale for the animated canvases. Past 2× the extra pixels are invisible in these soft, blurred
 * effects (rain, sparks, rings) and only cost VRAM and fill rate; the same cap already applied to the weather sky.
 */
export function canvasDpr(raw: number): number {
  return Math.min(2, Number.isFinite(raw) && raw > 0 ? raw : 1);
}
