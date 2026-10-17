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
