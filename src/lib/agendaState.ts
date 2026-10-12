/** Rust's own wording when there is no Google account yet; the empty state offers Settings instead of an error. */
export const notConnected = (error: string) => /entre com o google/i.test(error);
