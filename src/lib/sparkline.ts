/** Points for an SVG polyline: x spread across `width`, y scaled between the smallest and the largest value. */
export function sparkline(values: number[], width: number, height: number): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max === min;
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((value, index) => {
      const ratio = flat ? 0.5 : (value - min) / (max - min);
      return `${(index * step).toFixed(1)},${(height - ratio * height).toFixed(1)}`;
    })
    .join(" ");
}

/**
 * A smooth curve through the values (Catmull-Rom as cubic Béziers) plus the closed area under it, for a filled
 * chart. `xs` are the column centers, so the points line up with the labels laid out below them.
 */
export function smoothCurve(values: number[], xs: number[], height: number, pad = 6): { line: string; area: string } {
  if (values.length === 0 || xs.length !== values.length) return { line: "", area: "" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max === min ? 1 : max - min;
  const pts = values.map((v, i) => ({
    x: xs[i],
    y: max === min ? height / 2 : height - pad - ((v - min) / span) * (height - pad * 2),
  }));
  let line = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    line += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return { line, area: `${line} L${last.x.toFixed(1)},${height} L${pts[0].x.toFixed(1)},${height} Z` };
}
