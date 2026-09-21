// Only the order of magnitude matters in a list, so minutes, hours and days are enough.
export function timeAgo(at: string | number, now = new Date()): string {
  const min = Math.floor((now.getTime() - new Date(at).getTime()) / 60_000);
  if (!Number.isFinite(min) || min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 24 * 60) return `há ${Math.floor(min / 60)} h`;
  return `há ${Math.floor(min / (24 * 60))} d`;
}

export function daysSince(at: string, now = new Date()): number {
  return Math.floor((now.getTime() - new Date(at).getTime()) / 86_400_000);
}
