/** The day pinned in the agenda; App remounts tabs on every switch, so it lives here instead of in state. */
let picked: string | null = null;

export const readPicked = () => picked;
export const savePicked = (day: string | null) => {
  picked = day;
};
