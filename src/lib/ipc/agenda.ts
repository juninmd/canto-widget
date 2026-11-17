import { invoke } from "@tauri-apps/api/core";
import type { Sender } from "./github";

export type TranscriptMeta = { name: string; modified_at: number; size: number; preview: string };
export type AgendaItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  all_day: boolean;
  location: string;
  meet: string;
  link: string;
  // Only Google Calendar events carry these; task reminders leave them out.
  organizer?: string;
  creator?: string;
  description?: string;
  guests?: number;
  attachments?: Attachment[];
  response?: Rsvp | "";
  attendees?: Guest[];
  /** Short state for alerts that aren't calendar events: a Status API indicator or a model's rank. */
  tag?: string;
  /** Who mentioned the user (GitHub/GitLab); `avatar` is a `data:` URL or empty. */
  sender?: Sender | null;
};
export type Rsvp = "accepted" | "declined" | "tentative" | "needsAction";
export type Guest = { name: string; email: string; response: Rsvp | ""; organizer: boolean; optional: boolean; me: boolean };
export type Attachment = { title: string; url: string; mime: string };
export type GuestPhotos = { photos: Record<string, string>; needs_consent: boolean };
export type GeminiDoc = { meeting: string; start: string; title: string; url: string };

export const agendaApi = {
  transcriptsDir: () => invoke<string>("transcripts_dir"),
  transcriptsSetDir: (dir: string) => invoke<void>("transcripts_set_dir", { dir }),
  transcriptsList: (query: string) => invoke<TranscriptMeta[]>("transcripts_list", { query }),
  transcriptRead: (name: string) => invoke<string>("transcript_read", { name }),
  agendaToday: (timeMin: string, timeMax: string) =>
    invoke<AgendaItem[]>("agenda_today", { timeMin, timeMax }),
  geminiDocs: (timeMin: string, timeMax: string) => invoke<GeminiDoc[]>("gemini_docs", { timeMin, timeMax }),
  guestPhotos: (emails: string[]) => invoke<GuestPhotos>("guest_photos", { emails }),
};
