import { act } from "react";
import { jest } from "bun:test";

/** Moves fake timers forward in small steps, flushing promises between ticks, so polling tests never sleep for real. */
export async function advance(ms: number, step = 50) {
  for (let t = 0; t < ms; t += step) {
    await act(async () => {
      jest.advanceTimersByTime(Math.min(step, ms - t));
    });
  }
}
