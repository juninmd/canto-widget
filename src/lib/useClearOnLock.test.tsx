import { describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { readPicked, savePicked } from "./agendaPicked";
import { clearForgeCache } from "./forgeCache";
import { useClearOnLock } from "./useClearOnLock";

describe("useClearOnLock", () => {
  test("forgets the picked day when the vault locks, keeps it while unlocked", () => {
    clearForgeCache();
    savePicked("2026-10-20");
    const { rerender } = renderHook(({ unlocked }) => useClearOnLock(unlocked), { initialProps: { unlocked: true } });
    expect(readPicked()).toBe("2026-10-20");
    rerender({ unlocked: false });
    expect(readPicked()).toBeNull();
  });
});
