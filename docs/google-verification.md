# Google OAuth verification: answers to paste in the Console

Project `canto-widget-dgti8e`. Fill **Google Auth Platform → Branding / Data access / Verification Center** with the
text below. English, because the reviewers read English.

## App information

- **App name:** Canto
- **User type:** External · **Publishing status:** In production
- **Application home page:** https://juninmd.github.io/canto-widget/
- **Privacy policy link:** https://juninmd.github.io/canto-widget/privacy/
- **Authorized domain:** `juninmd.github.io`. Google asks you to prove ownership: in Search Console add the URL-prefix
  property `https://juninmd.github.io/canto-widget/` and verify it with the HTML file or meta tag method (commit the
  file under `docs/`). If the Console refuses the domain, use a custom domain on the Pages site instead.

## Scope justifications

Canto is a desktop widget. All Google API calls are made from the user's computer. The developer has no server and
receives no user data.

| Scope | Classification | Justification |
|---|---|---|
| `calendar.events.readonly` | Sensitive | Shows the user's upcoming events in the agenda and rings an alert before meetings. Read-only; no event is created or changed. |
| `directory.readonly` | Sensitive | Fetches profile photos of meeting guests from the user's Workspace directory, to show them next to each event. |
| `gmail.modify` | Restricted | The Gmail tab shows the unread count and the important messages (sender, subject, snippet) and lets the user mark as read, archive or trash a message with one click. These actions need modify; `gmail.readonly` cannot perform them. Canto does not send mail, does not permanently delete, and does not read message bodies or attachments. |
| `tasks` | Sensitive | Lists the user's Google Tasks, and creates and completes tasks when the user captures or finishes one in the widget. |
| `drive.metadata.readonly` | Sensitive | Lists recent file names, types and modification dates, and shows meeting notes documents attached to events. File contents are never requested. |
| `contacts.readonly` | Sensitive | Fills the Contacts tab with the user's address book. Read-only. |
| `openid email profile` | Non-sensitive | Shows which account is connected (name, email, photo). |

## Limited Use disclosure

"Canto's use and transfer to any other app of information received from Google APIs will adhere to the Google API
Services User Data Policy, including the Limited Use requirements."

## Demo video checklist (YouTube, unlisted)

1. Show the OAuth consent screen with the app name and the full list of scopes, with the browser address bar visible and
   the client ID in the URL.
2. Complete sign-in and show the connected account card.
3. Show each feature that uses a scope: Agenda (Calendar + guest photos), Gmail tab (count, mark as read, archive),
   Tasks, Drive tab, Contacts tab.
4. Show **Sign out** revoking access.
5. Narrate in English that data is stored encrypted on the user's disk and never sent to the developer.

## Restricted scope (`gmail.modify`)

Google requires a CASA security assessment for restricted scopes when the app stores or transmits data on a server. Canto
keeps all data on the user's device, so ask in the verification form for the **local-only / no server-side storage**
path; the reviewer decides whether the assessment is still required.
