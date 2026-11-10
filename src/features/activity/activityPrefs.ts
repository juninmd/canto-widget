import { CATEGORIES, type Category } from "./activity";

const GOAL_KEY = "canto.activity.goalMin";
const CATS_KEY = "canto.activity.categories";

/** Daily focus-in-code goals on offer, in minutes; 0 turns the goal off. */
export const GOALS = [0, 60, 120, 180, 240, 360, 480] as const;
const DEFAULT_GOAL = 240;

export function readGoal(): number {
  const raw = localStorage.getItem(GOAL_KEY);
  const n = raw === null ? DEFAULT_GOAL : Number(raw);
  return (GOALS as readonly number[]).includes(n) ? n : DEFAULT_GOAL;
}

export const saveGoal = (min: number) => localStorage.setItem(GOAL_KEY, String(min));

export function readOverrides(): Record<string, Category> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(CATS_KEY) ?? "{}");
    if (typeof raw !== "object" || raw === null) return {};
    return Object.fromEntries(Object.entries(raw).filter(([, c]) => (CATEGORIES as readonly string[]).includes(c as string))) as Record<string, Category>;
  } catch {
    return {};
  }
}

export const saveOverrides = (o: Record<string, Category>) => localStorage.setItem(CATS_KEY, JSON.stringify(o));
