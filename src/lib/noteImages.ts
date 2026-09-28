import { api } from "./api";
import { t } from "../i18n";

// Mirrors MAX_BYTES in note_images.rs; the backend is the real guard.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const IMAGE_REF = /!\[([^\]]*)\]\(canto-img:([0-9a-f]{1,64})\)/g;
const SAFE_DATA_URL = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;

export function imageMarkdown(id: string): string {
  return `![](canto-img:${id})`;
}

/** Only a base64 `data:` URL of the four accepted types ever reaches an <img>; never http or file. */
export function isSafeImageUrl(url: unknown): url is string {
  return typeof url === "string" && SAFE_DATA_URL.test(url);
}

/** Card previews drop the raw `![](canto-img:...)` markup; the images show as thumbnails instead. */
export function stripImageRefs(body: string): string {
  return body
    .replace(IMAGE_REF, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Ids of the images a note references, in order, each once. */
export function imageIds(body: string): string[] {
  return [...new Set([...body.matchAll(IMAGE_REF)].map((m) => m[2]))];
}

export function imageFiles(list: FileList | File[] | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  // Chunked: spreading a 2 MB array into one call overflows the argument stack.
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Checks type and size before the round trip, then stores the image and returns its markdown reference. */
export async function attachImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error(t("notes.imageType"));
  if (file.size > MAX_IMAGE_BYTES) throw new Error(t("notes.imageTooBig"));
  return imageMarkdown(await api.noteImageSave(await toBase64(file)));
}

/** Puts `snippet` on its own line at the caret, so it never glues onto a word. */
export function insertAt(body: string, caret: number, snippet: string): { body: string; caret: number } {
  const before = body.slice(0, caret);
  const after = body.slice(caret);
  const lead = before === "" || before.endsWith("\n") ? "" : "\n";
  const trail = after.startsWith("\n") ? "" : "\n";
  const inserted = `${lead}${snippet}${trail}`;
  return { body: before + inserted + after, caret: caret + inserted.length };
}
