/** The moon's phase from the date alone, and the SVG of its lit part as seen from the city's hemisphere. */

const SYNODIC = 29.530588853;
/** A known new moon: 2000-01-06 18:14 UTC. */
const EPOCH = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

export const PHASES = [
  "new",
  "waxingCrescent",
  "firstQuarter",
  "waxingGibbous",
  "full",
  "waningGibbous",
  "lastQuarter",
  "waningCrescent",
] as const;
export type MoonPhase = (typeof PHASES)[number];

export type Moon = { phase: MoonPhase; /** 0..1 */ lit: number; waxing: boolean; /** whole days to the next full moon */ toFull: number };

export function moon(ms: number): Moon {
  const age = ((((ms - EPOCH) / DAY_MS) % SYNODIC) + SYNODIC) % SYNODIC;
  const turn = age / SYNODIC;
  const toFull = (SYNODIC / 2 - age + SYNODIC) % SYNODIC;
  return {
    phase: PHASES[Math.floor(turn * 8 + 0.5) % 8],
    lit: (1 - Math.cos(2 * Math.PI * turn)) / 2,
    waxing: turn < 0.5,
    toFull: Math.round(toFull),
  };
}

/**
 * The lit part of a moon of radius `r` centred at (`c`, `c`). A waxing moon is lit on the right in the north and on
 * the left in the south, which is how it looks from Brazil.
 */
export function moonPath({ lit, waxing }: Moon, south: boolean, c: number, r: number): string {
  const right = waxing !== south;
  const outer = right ? 1 : 0;
  const crescent = lit < 0.5;
  const inner = right === crescent ? 0 : 1;
  const rx = (r * Math.abs(1 - 2 * lit)).toFixed(2);
  return `M${c} ${c - r} A${r} ${r} 0 0 ${outer} ${c} ${c + r} A${rx} ${r} 0 0 ${inner} ${c} ${c - r}Z`;
}
