import { useEffect, useState } from "react";
import { api, type Contact } from "./api";
import { isPhoto } from "./useGuestPhotos";

/** Rust refuses longer lists. */
export const PHOTO_BATCH = 60;

/** Contacts' own Google photos as `data:` URLs by photo URL, fetched in batches once the list is in; any failure keeps the initials. */
export function useContactPhotos(items: Contact[]) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const key = [...new Set(items.map((c) => c.photo ?? "").filter((u) => u.startsWith("https://")))].join("\n");

  useEffect(() => {
    if (key === "") return;
    let alive = true;
    const urls = key.split("\n");
    void (async () => {
      for (let i = 0; i < urls.length && alive; i += PHOTO_BATCH) {
        try {
          const found = await api.contactPhotos(urls.slice(i, i + PHOTO_BATCH));
          const valid = Object.entries(found ?? {}).filter(([, v]) => isPhoto(v));
          if (alive && valid.length > 0) setPhotos((prev) => ({ ...prev, ...Object.fromEntries(valid) }));
        } catch {
          return;
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [key]);

  return photos;
}
