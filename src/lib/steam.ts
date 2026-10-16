/** Steam helpers that don't need the network: the store link and a readable playtime. */

/** Where a row opens: the store page of the game. */
export function steamUrl(appid: number): string {
  return `https://store.steampowered.com/app/${Math.trunc(appid)}/`;
}

/** Minutes as Steam reports them, written the short way ("2 h 15 min"); under an hour stays in minutes. */
export function playtime(minutes: number): string {
  const total = Math.max(0, Math.trunc(minutes));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
