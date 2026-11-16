import { invoke } from "@tauri-apps/api/core";

/** Gmail: the inbox's unread count and the newest mail of one view (`date` in ms). */
export type GmailMail = { id: string; from: string; subject: string; snippet: string; date: number; link: string; unread: boolean; starred: boolean };
export type GmailSummary = { unread: number; important: GmailMail[] };
export type GmailView = "important" | "unread" | "starred" | "inbox";
export type GmailAction = "read" | "unread" | "star" | "unstar" | "archive" | "trash";
/** An open Google Tasks task; `due` is `YYYY-MM-DD` or empty. */
export type GTask = { id: string; title: string; due: string };
export type DriveFilter = "all" | "recent" | "starred" | "shared" | "mine";
/** Empty for any kind. */
export type DriveKind = "" | "doc" | "sheet" | "slide" | "pdf";
/** Bytes; `limit` is 0 when the plan is unlimited. */
export type DriveQuota = { used: number; limit: number };
/** A Drive file's metadata; `editor` is empty when the user changed it last, `link` empty when not Google's. */
export type DriveFile = {
  id: string;
  name: string;
  kind: "folder" | "doc" | "sheet" | "slide" | "pdf" | "other";
  link: string;
  modified: string;
  starred: boolean;
  editor: string;
  /** The parent folder on drive.google.com, or empty. */
  folder: string;
  /** Bytes; 0 for Google's own documents. */
  size: number;
};
/** One page of files; `next` is the token for the following page, empty on the last one. */
export type DrivePage = { files: DriveFile[]; next: string };
/** One Google contact; `link` is empty when the id isn't one Google would hand out. */
export type Contact = {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  org: string;
  title: string;
  starred: boolean;
  link: string;
  nickname: string;
  department: string;
  /** Google lets the year out. */
  birthday: { day: number; month: number; year: number | null } | null;
  addresses: string[];
  urls: string[];
  /** "Name (relation)". */
  relations: string[];
  note: string;
  /** The contact's own photo on Google's CDN (never Google's placeholder); `contactPhotos` turns it into a `data:` URL. */
  photo?: string;
};
/** `total` is the whole address book; `items` is capped, so the two can differ. */
export type ContactsView = { total: number; items: Contact[] };

export const googleApi = {
  /** Gmail, Google Tasks and Drive reuse the Agenda's Google login; Rust holds the token. */
  gmailSummary: (view: GmailView, search: string) => invoke<GmailSummary>("gmail_summary", { view, search }),
  gmailModify: (ids: string[], action: GmailAction) => invoke<void>("gmail_modify", { ids, action }),
  gmailAlertsGet: () => invoke<boolean>("gmail_alerts_get"),
  gmailAlertsSet: (on: boolean) => invoke<boolean>("gmail_alerts_set", { on }),
  gtasksList: () => invoke<GTask[]>("gtasks_list"),
  gtasksAdd: (title: string) => invoke<GTask>("gtasks_add", { title }),
  gtasksComplete: (id: string) => invoke<void>("gtasks_complete", { id }),
  /** `folder` empty lists by filter (`all` is My Drive's root); `page` empty asks for the first page. */
  gdriveList: (filter: DriveFilter, kind: DriveKind, search: string, folder = "", page = "") =>
    invoke<DrivePage>("gdrive_list", { filter, kind, search, folder, page }),
  gdriveQuota: () => invoke<DriveQuota>("gdrive_quota"),
  contactsList: () => invoke<ContactsView>("contacts_list"),
  /** `data:` URLs by photo URL, at most 60 per call; one that failed to download is left out. */
  contactPhotos: (urls: string[]) => invoke<Record<string, string>>("contact_photos", { urls }),
};
