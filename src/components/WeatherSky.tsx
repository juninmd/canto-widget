import type { CSSProperties } from "react";
import type { WeatherCondition } from "../lib/api";

const COUNT: Partial<Record<WeatherCondition, number>> = { drizzle: 10, rain: 22, storm: 28, snow: 22 };

/** Deterministic spread: the same card draws the same sky on every render, with no random state to keep. */
const spread = (i: number, mul: number, mod: number) => (i * mul + 11) % mod;
const vars = (v: Record<string, string>) => v as CSSProperties;

/** The weather behind the card's text: falling rain or snow, drifting clouds and fog, stars at night, lightning. */
export default function WeatherSky({ condition, night }: { condition: WeatherCondition; night: boolean }) {
  const falling = COUNT[condition] ?? 0;
  const clouds = condition === "clear" ? 0 : condition === "fog" ? 0 : 2;
  return (
    <div className="wx-layer" aria-hidden="true">
      {night && condition !== "storm" && condition !== "rain" &&
        Array.from({ length: 16 }, (_, i) => (
          <span key={`s${i}`} className="wx-star" style={vars({ "--x": `${spread(i, 41, 100)}%`, "--y": `${spread(i, 23, 70)}%`, "--d": `${-(i % 5) * 0.6}s` })} />
        ))}
      {Array.from({ length: clouds }, (_, i) => (
        <span key={`c${i}`} className="wx-cloud" style={vars({ "--x": `${i * 45 - 20}%`, "--y": `${8 + i * 34}%`, "--d": `${-i * 11}s` })} />
      ))}
      {condition === "fog" &&
        [0, 1, 2].map((i) => (
          <span key={`f${i}`} className="wx-fog" style={vars({ "--y": `${12 + i * 30}%`, "--d": `${-i * 4}s` })} />
        ))}
      {condition === "snow"
        ? Array.from({ length: falling }, (_, i) => (
            <span
              key={`n${i}`}
              className="wx-flake"
              style={vars({ "--x": `${spread(i, 37, 100)}%`, "--s": `${2 + (i % 3)}px`, "--d": `${-(i % 7)}s` })}
            />
          ))
        : Array.from({ length: falling }, (_, i) => (
            <span key={`r${i}`} className="wx-drop" style={vars({ "--x": `${spread(i, 37, 100)}%`, "--d": `${-(i % 9) * 0.1}s` })} />
          ))}
      {condition === "storm" && <span className="wx-flash" />}
    </div>
  );
}
