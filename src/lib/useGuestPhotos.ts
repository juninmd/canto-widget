import { useEffect, useState } from "react";
import { api } from "./api";

/** Only `data:` images get through: the CSP blocks remote ones, and Rust already embeds them this way. */
export const isPhoto = (value: string | undefined): value is string => !!value && value.startsWith("data:image/");

/** Guests' directory photos, fetched only once the details are open; any failure keeps the initials. */
export function useGuestPhotos(open: boolean, emails: string[]) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [needsConsent, setNeedsConsent] = useState(false);
  const key = emails.join(",");

  useEffect(() => {
    if (!open || key === "") return;
    let alive = true;
    api
      .guestPhotos(key.split(","))
      .then((r) => {
        if (!alive || !r) return;
        setPhotos(Object.fromEntries(Object.entries(r.photos ?? {}).filter(([, v]) => isPhoto(v))));
        setNeedsConsent(r.needs_consent);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [open, key]);

  return { photos, needsConsent };
}
