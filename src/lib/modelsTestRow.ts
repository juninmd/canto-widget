import type { ModelRow } from "./api";
import { withSheet } from "./models";

/** A ranked model with an empty sheet, for tests: override only what the test is about. */
export function modelRow(over: Partial<ModelRow> & Pick<ModelRow, "id">): ModelRow {
  return withSheet({ name: over.id, creator: "", score: 50, price: null, speed: null, rank: 1, badge: null, ...over });
}
